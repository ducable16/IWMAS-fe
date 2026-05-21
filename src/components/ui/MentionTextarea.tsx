import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { useMentionAutocomplete } from '@/features/tasks/hooks/useMentionAutocomplete'
import type { CSSProperties, Dispatch, SetStateAction, KeyboardEvent, ChangeEvent, ReactNode } from 'react'
import type { Id } from '@/types'

interface CaretPosition {
  x: number
  y: number
  lineHeight: number
}

interface MentionSuggestion {
  id?: Id | undefined
  fullName: string
}

interface MentionTextareaProps {
  value: string
  onChange: (newValue: string) => void
  onSubmit?: (() => void) | undefined
  projectId?: Id | null | undefined
  placeholder?: string | undefined
  rows?: number | undefined
  disabled?: boolean | undefined
  className?: string | undefined
}

interface MentionPopupProps {
  popupPos: CaretPosition
  suggestions: MentionSuggestion[]
  isFetching: boolean
  selectedIdx: number
  setSelectedIdx: Dispatch<SetStateAction<number>>
  mentionQuery: string
  insertMention: (fullName: string) => void
  dropdownRef: React.RefObject<HTMLDivElement>
}

const MIRROR_STYLES = [
  'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
  'fontSizeAdjust', 'lineHeight', 'fontFamily',
  'textAlign', 'textTransform', 'textIndent', 'textDecoration',
  'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize',
  'whiteSpace', 'wordBreak', 'wordWrap',
] as const

function getCaretPixelPos(textarea: HTMLTextAreaElement, caretIndex: number): CaretPosition {
  const computed = window.getComputedStyle(textarea)
  const mirror = document.createElement('div')
  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.overflow = 'hidden'
  mirror.style.top = '-9999px'
  mirror.style.left = '-9999px'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.wordWrap = 'break-word'

  MIRROR_STYLES.forEach((prop) => {
    mirror.style.setProperty(prop, computed.getPropertyValue(prop))
  })

  mirror.appendChild(document.createTextNode(textarea.value.slice(0, caretIndex)))
  const caret = document.createElement('span')
  caret.textContent = '\u200b'
  mirror.appendChild(caret)
  document.body.appendChild(mirror)

  const taRect = textarea.getBoundingClientRect()
  const caretRect = caret.getBoundingClientRect()
  const mirrorRect = mirror.getBoundingClientRect()
  const x = taRect.left + (caretRect.left - mirrorRect.left) - textarea.scrollLeft
  const y = taRect.top + (caretRect.top - mirrorRect.top) - textarea.scrollTop
  const lineHeight = parseInt(computed.lineHeight, 10) || 18

  document.body.removeChild(mirror)
  return { x, y, lineHeight }
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
    left: Math.max(8, Math.min(popupPos.x, window.innerWidth - 240)),
    zIndex: 9999,
    minWidth: 220,
    maxWidth: 320,
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
          {mentionQuery ? <> for <span className="font-mono text-accent">&ldquo;{mentionQuery}&rdquo;</span></> : ''}
        </div>
      ) : (
        <ul className="py-1 max-h-[200px] overflow-y-auto">
          {suggestions.map((s, idx) => {
            const initials = s.fullName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
            const isActive = idx === selectedIdx

            return (
              <li key={String(s.id ?? s.fullName)}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(s.fullName)
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
                  <span className="text-[13px] font-medium truncate flex-1">
                    {mentionQuery ? highlightMatch(s.fullName, mentionQuery) : s.fullName}
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
  placeholder = 'Add a comment...',
  rows = 2,
  disabled = false,
  className,
}: MentionTextareaProps) {
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionActive, setMentionActive] = useState(false)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [popupPos, setPopupPos] = useState<CaretPosition | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: suggestions = [], isFetching } = useMentionAutocomplete(
    mentionQuery,
    projectId,
    mentionActive,
  )

  useEffect(() => { setSelectedIdx(0) }, [suggestions])

  const updatePopupPos = useCallback((caretIndex: number) => {
    const ta = textareaRef.current
    if (!ta) return
    setPopupPos(getCaretPixelPos(ta, caretIndex))
  }, [])

  const detectMention = useCallback((text: string, cursor: number) => {
    let i = cursor - 1
    while (i >= 0 && text[i] !== '@' && text[i] !== ' ' && text[i] !== '\n') i--

    if (i >= 0 && text[i] === '@') {
      const before = i === 0 || text[i - 1] === ' ' || text[i - 1] === '\n'
      if (before) {
        const query = text.slice(i + 1, cursor)
        setMentionActive(true)
        setMentionStart(i)
        setMentionQuery(query)
        updatePopupPos(i)
        return
      }
    }
    setMentionActive(false)
    setMentionQuery('')
    setMentionStart(null)
    setPopupPos(null)
  }, [updatePopupPos])

  const insertMention = useCallback((fullName: string) => {
    if (mentionStart === null) return
    const before = value.slice(0, mentionStart)
    const cursor = textareaRef.current?.selectionStart ?? (mentionStart + mentionQuery.length + 1)
    const after = value.slice(cursor)
    const newText = `${before}@${fullName} ${after}`

    onChange(newText)
    setMentionActive(false)
    setMentionQuery('')
    setMentionStart(null)
    setPopupPos(null)

    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (ta) {
        ta.focus()
        const pos = before.length + fullName.length + 2
        ta.setSelectionRange(pos, pos)
      }
    })
  }, [mentionStart, mentionQuery, value, onChange])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        if (selected) insertMention(selected.fullName)
        return
      }
    }

    if (e.key === 'Escape' && mentionActive) {
      setMentionActive(false)
      setMentionQuery('')
      setPopupPos(null)
      return
    }

    if (e.key === 'Enter' && !e.shiftKey && !mentionActive) {
      e.preventDefault()
      onSubmit?.()
    }
  }, [mentionActive, suggestions, selectedIdx, insertMention, onSubmit])

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const cursor = e.target.selectionStart
    onChange(text)
    detectMention(text, cursor)
  }, [onChange, detectMention])

  const handleSelect = useCallback(() => {
    const ta = textareaRef.current
    if (ta) detectMention(ta.value, ta.selectionStart)
  }, [detectMention])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        textareaRef.current && !textareaRef.current.contains(target)
      ) {
        setMentionActive(false)
        setPopupPos(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showPopup = mentionActive && popupPos && (suggestions.length > 0 || isFetching)

  return (
    <div className={clsx('relative', className)}>
      <div className={clsx(
        'border border-border rounded-lg bg-bg-surface transition-colors overflow-hidden',
        'focus-within:border-border-strong focus-within:ring-2 focus-within:ring-accent/10',
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="w-full bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none p-3 resize-none leading-relaxed"
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
