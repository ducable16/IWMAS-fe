import { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useProjectMemberSearch } from '@/features/projects/hooks/useProjects'
import { mentionDisplayName, mentionKey, mentionToken, parseMentionContent } from '@/utils/mentions'
import type { CSSProperties, Dispatch, SetStateAction, KeyboardEvent, ClipboardEvent, ReactNode } from 'react'
import type { Id, User, UserPublicView } from '@/types'
import type { MentionUserMap } from '@/utils/mentions'

interface CaretPosition {
  x: number
  y: number
  lineHeight: number
}

interface MentionTextareaProps {
  value: string
  onChange: (newValue: string) => void
  onSubmit?: (() => void) | undefined
  projectId?: Id | null | undefined
  mentions?: MentionUserMap | null | undefined
  placeholder?: string | undefined
  rows?: number | undefined
  disabled?: boolean | undefined
  className?: string | undefined
  autoFocus?: boolean | undefined
  submitOnEnter?: boolean | undefined
}

interface MentionPopupProps {
  popupPos: CaretPosition
  suggestions: User[]
  isFetching: boolean
  selectedIdx: number
  setSelectedIdx: Dispatch<SetStateAction<number>>
  mentionQuery: string
  insertMention: (user: User) => void
  dropdownRef: React.RefObject<HTMLDivElement>
}

const TOKEN_CLASS = [
  'inline text-accent font-semibold',
  'select-none whitespace-nowrap',
].join(' ')

function rawFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''

  if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    return ''
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    const token = el.dataset.mentionToken
    if (token) return token
    if (el.tagName === 'BR') return '\n'
  }

  let raw = ''
  node.childNodes.forEach((child) => {
    raw += rawFromNode(child)
  })
  return raw.replace(/\u200b/g, '')
}

function renderRawContent(root: HTMLElement, raw: string, mentions: MentionUserMap) {
  const fragment = document.createDocumentFragment()

  parseMentionContent(raw, mentions).forEach((part) => {
    if (part.type === 'text') {
      fragment.appendChild(document.createTextNode(part.value))
      return
    }

    if (!part.user) {
      fragment.appendChild(document.createTextNode(part.token))
      return
    }

    const span = document.createElement('span')
    span.dataset.mentionToken = part.token
    span.dataset.mentionId = part.id
    span.contentEditable = 'false'
    span.className = TOKEN_CLASS
    span.textContent = mentionDisplayName(part.user)
    fragment.appendChild(span)
  })

  root.replaceChildren(fragment)
}

function getRawBeforeCaret(root: HTMLElement): string | null {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !selection.focusNode || !root.contains(selection.focusNode)) {
    return null
  }

  const range = selection.getRangeAt(0).cloneRange()
  range.selectNodeContents(root)
  range.setEnd(selection.focusNode, selection.focusOffset)
  return rawFromNode(range.cloneContents())
}

function getCaretPosition(root: HTMLElement): CaretPosition | null {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !selection.focusNode || !root.contains(selection.focusNode)) {
    return null
  }

  const computed = window.getComputedStyle(root)
  const lineHeight = parseInt(computed.lineHeight, 10) || 18
  const range = selection.getRangeAt(0).cloneRange()
  range.collapse(false)

  let rect = range.getClientRects()[0]
  if (!rect) {
    const marker = document.createElement('span')
    marker.textContent = '\u200b'
    range.insertNode(marker)
    rect = marker.getBoundingClientRect()
    marker.remove()
  }

  return rect ? { x: rect.left, y: rect.top, lineHeight } : null
}

function setCaretAtRawOffset(root: HTMLElement, targetOffset: number) {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  let remaining = Math.max(0, targetOffset)
  let placed = false

  const placeAt = (node: Node, offset: number) => {
    range.setStart(node, offset)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    placed = true
  }

  const walk = (node: Node): boolean => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i]
      if (!child) continue

      if (child.nodeType === Node.TEXT_NODE) {
        const len = child.textContent?.length ?? 0
        if (remaining <= len) {
          placeAt(child, remaining)
          return true
        }
        remaining -= len
        continue
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        const token = el.dataset.mentionToken
        if (token) {
          if (remaining <= token.length) {
            placeAt(node, remaining <= 0 ? i : i + 1)
            return true
          }
          remaining -= token.length
          continue
        }

        if (el.tagName === 'BR') {
          if (remaining <= 1) {
            placeAt(node, i + 1)
            return true
          }
          remaining -= 1
          continue
        }
      }

      if (walk(child)) return true
    }
    return false
  }

  walk(root)
  if (!placed) placeAt(root, root.childNodes.length)
}

function insertPlainTextAtSelection(root: HTMLElement, text: string) {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !selection.focusNode || !root.contains(selection.focusNode)) return

  const range = selection.getRangeAt(0)
  range.deleteContents()
  const node = document.createTextNode(text)
  range.insertNode(node)
  range.setStartAfter(node)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

function detectMentionTrigger(rawBeforeCaret: string) {
  const match = /(?:^|\s)@([^\s@\[]*)$/.exec(rawBeforeCaret)
  if (!match) return null

  const query = match[1] ?? ''
  return {
    query,
    start: rawBeforeCaret.length - query.length - 1,
  }
}

function MentionPopup({
  popupPos,
  suggestions,
  isFetching,
  selectedIdx,
  setSelectedIdx,
  mentionQuery,
  insertMention,
  dropdownRef,
}: MentionPopupProps) {
  const popupHeight = 260
  const spaceBelow = window.innerHeight - (popupPos.y + popupPos.lineHeight)
  const openUp = spaceBelow < popupHeight && popupPos.y > popupHeight

  const style: CSSProperties = {
    position: 'fixed',
    left: Math.max(8, Math.min(popupPos.x, window.innerWidth - 260)),
    zIndex: 9999,
    minWidth: 240,
    maxWidth: 340,
    ...(openUp
      ? { bottom: window.innerHeight - popupPos.y + 4 }
      : { top: popupPos.y + popupPos.lineHeight + 4 }),
  }

  return createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className="bg-bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden animate-fade-in"
    >
      {suggestions.length === 0 && isFetching ? (
        <div className="px-3 py-4 text-[12px] text-text-muted text-center">
          Searching...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-3 py-4 text-[12px] text-text-muted text-center">
          No members found
          {mentionQuery ? <> for <span className="font-mono text-accent">&quot;{mentionQuery}&quot;</span></> : ''}
        </div>
      ) : (
        <ul className="py-1 max-h-[220px] overflow-y-auto">
          {suggestions.map((s, idx) => {
            const name = mentionDisplayName(s, String(s.id))
            const initials = name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
            const isActive = idx === selectedIdx

            return (
              <li key={String(s.id)}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(s)
                  }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={clsx(
                    'flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors',
                    isActive ? 'bg-accent/12 text-accent' : 'text-text-secondary hover:bg-bg-subtle',
                  )}
                >
                  <div className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors',
                    isActive ? 'bg-accent text-white' : 'bg-accent/15 text-accent',
                  )}>
                    {initials}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium truncate">
                      {mentionQuery ? highlightMatch(name, mentionQuery) : name}
                    </span>
                    {s.email && (
                      <span className="block text-[11px] text-text-muted truncate">{s.email}</span>
                    )}
                  </span>
                  {isActive && (
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono border border-accent/20 shrink-0">
                      Enter
                    </kbd>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>,
    document.body,
  )
}

export default function MentionTextarea({
  value,
  onChange,
  onSubmit,
  projectId,
  mentions,
  placeholder = 'Add a comment...',
  rows = 2,
  disabled = false,
  className,
  autoFocus = false,
  submitOnEnter = true,
}: MentionTextareaProps) {
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionActive, setMentionActive] = useState(false)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [popupPos, setPopupPos] = useState<CaretPosition | null>(null)
  const [localMentions, setLocalMentions] = useState<MentionUserMap>({})

  const editorRef = useRef<HTMLDivElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const lastSyncedRawRef = useRef<string>('')
  const pendingCaretRawRef = useRef<number | null>(null)

  const mentionUsers = useMemo(
    () => ({ ...(mentions || {}), ...localMentions }),
    [mentions, localMentions],
  )

  const { data: suggestions = [], isFetching } = useProjectMemberSearch(
    projectId,
    { q: mentionQuery, size: 10 },
    mentionActive && !!projectId,
  )

  useEffect(() => { setSelectedIdx(0) }, [suggestions])

  useLayoutEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const shouldSkipFocusedRender = document.activeElement === editor && lastSyncedRawRef.current === value
    if (!shouldSkipFocusedRender || pendingCaretRawRef.current !== null) {
      renderRawContent(editor, value, mentionUsers)
      lastSyncedRawRef.current = value
    }

    if (pendingCaretRawRef.current !== null) {
      editor.focus()
      setCaretAtRawOffset(editor, pendingCaretRawRef.current)
      pendingCaretRawRef.current = null
    }
  }, [value, mentionUsers])

  useEffect(() => {
    if (!autoFocus) return
    requestAnimationFrame(() => {
      const editor = editorRef.current
      if (!editor) return
      editor.focus()
      setCaretAtRawOffset(editor, value.length)
    })
  }, [autoFocus, value.length])

  const closeMention = useCallback(() => {
    setMentionActive(false)
    setMentionQuery('')
    setMentionStart(null)
    setPopupPos(null)
  }, [])

  const detectMention = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    const rawBeforeCaret = getRawBeforeCaret(editor)
    if (rawBeforeCaret === null) {
      closeMention()
      return
    }

    const trigger = detectMentionTrigger(rawBeforeCaret)
    const caret = getCaretPosition(editor)
    if (!trigger || !caret) {
      closeMention()
      return
    }

    setMentionActive(true)
    setMentionStart(trigger.start)
    setMentionQuery(trigger.query)
    setPopupPos(caret)
  }, [closeMention])

  const syncFromDom = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const raw = rawFromNode(editor)
    lastSyncedRawRef.current = raw
    onChange(raw)
    detectMention()
  }, [detectMention, onChange])

  const insertMention = useCallback((user: UserPublicView) => {
    const editor = editorRef.current
    if (!editor || mentionStart === null) return

    const rawBeforeCaret = getRawBeforeCaret(editor)
    const cursor = rawBeforeCaret?.length ?? (mentionStart + mentionQuery.length + 1)
    const token = mentionToken(user.id)
    const currentRaw = rawFromNode(editor)
    const before = currentRaw.slice(0, mentionStart)
    const after = currentRaw.slice(cursor)
    const next = `${before}${token} ${after}`

    setLocalMentions((prev) => ({ ...prev, [mentionKey(user.id)]: user }))
    pendingCaretRawRef.current = before.length + token.length + 1
    closeMention()
    onChange(next)
  }, [closeMention, mentionQuery.length, mentionStart, onChange])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    if (mentionActive && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => (i + 1) % suggestions.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => (i - 1 + suggestions.length) % suggestions.length)
        return
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey) {
        e.preventDefault()
        const selected = suggestions[selectedIdx]
        if (selected) insertMention(selected)
        return
      }
    }

    if (e.key === 'Escape' && mentionActive) {
      e.preventDefault()
      closeMention()
      return
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      const editor = editorRef.current
      if (editor) {
        insertPlainTextAtSelection(editor, '\n')
        syncFromDom()
      }
      return
    }

    if (e.key === 'Enter' && !mentionActive) {
      if (submitOnEnter || e.ctrlKey || e.metaKey) {
        e.preventDefault()
        onSubmit?.()
      }
    }
  }, [
    closeMention,
    disabled,
    insertMention,
    mentionActive,
    onSubmit,
    selectedIdx,
    suggestions,
    submitOnEnter,
    syncFromDom,
  ])

  const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current
    if (!editor) return
    e.preventDefault()
    insertPlainTextAtSelection(editor, e.clipboardData.getData('text/plain'))
    syncFromDom()
  }, [syncFromDom])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        editorRef.current && !editorRef.current.contains(target)
      ) {
        closeMention()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [closeMention])

  const showPopup = mentionActive && popupPos && (suggestions.length > 0 || isFetching)
  const minHeight = `${Math.max(rows, 1) * 1.625 + 1.5}rem`

  return (
    <div className={clsx('relative', className)}>
      <div className={clsx(
        'relative border border-border rounded-lg bg-bg-surface transition-colors overflow-hidden',
        'focus-within:border-border-strong focus-within:ring-2 focus-within:ring-accent/10',
        disabled && 'opacity-60',
      )}>
        {!value && (
          <span className="pointer-events-none absolute left-3 top-3 text-[13px] text-text-muted">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={syncFromDom}
          onKeyDown={handleKeyDown}
          onKeyUp={detectMention}
          onMouseUp={detectMention}
          onFocus={detectMention}
          onPaste={handlePaste}
          className="w-full bg-transparent text-[13px] text-text-primary focus:outline-none p-3 resize-none leading-relaxed whitespace-pre-wrap break-words"
          style={{ minHeight }}
        />
      </div>

      {showPopup && (
        <MentionPopup
          popupPos={popupPos}
          suggestions={suggestions}
          isFetching={isFetching}
          selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx}
          mentionQuery={mentionQuery}
          insertMention={insertMention}
          dropdownRef={dropdownRef}
        />
      )}
    </div>
  )
}

function highlightMatch(fullName: string, query: string): ReactNode {
  const idx = fullName.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return fullName
  return (
    <>
      {fullName.slice(0, idx)}
      <mark className="bg-accent/20 text-accent rounded-sm not-italic font-semibold">
        {fullName.slice(idx, idx + query.length)}
      </mark>
      {fullName.slice(idx + query.length)}
    </>
  )
}
