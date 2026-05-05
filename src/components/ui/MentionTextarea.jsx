import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { Loader2, AtSign } from 'lucide-react'
import { useMentionAutocomplete } from '@/features/tasks/hooks/useMentionAutocomplete'

/* ─────────────────────────────────────────────────────────────────────────────
 * getCaretPixelPos
 * Returns { top, left, lineHeight } of the caret inside a textarea, in
 * viewport-relative coordinates (suitable for `position: fixed`).
 *
 * Technique: create an off-screen "mirror" div that replicates the textarea's
 * computed styles and text content up to the cursor, append a zero-width span
 * as the caret marker, then read its bounding rect.
 * ───────────────────────────────────────────────────────────────────────────*/
const MIRROR_STYLES = [
  'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
  'fontSizeAdjust', 'lineHeight', 'fontFamily',
  'textAlign', 'textTransform', 'textIndent', 'textDecoration',
  'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize',
  'whiteSpace', 'wordBreak', 'wordWrap',
]

function getCaretPixelPos(textarea, caretIndex) {
  const computed = window.getComputedStyle(textarea)

  const mirror = document.createElement('div')
  mirror.style.position    = 'absolute'
  mirror.style.visibility  = 'hidden'
  mirror.style.overflow    = 'hidden'
  mirror.style.top         = '-9999px'
  mirror.style.left        = '-9999px'
  mirror.style.whiteSpace  = 'pre-wrap'
  mirror.style.wordWrap    = 'break-word'

  MIRROR_STYLES.forEach((prop) => {
    mirror.style[prop] = computed[prop]
  })

  // Text before caret
  const textBefore = document.createTextNode(textarea.value.slice(0, caretIndex))
  mirror.appendChild(textBefore)

  // Caret marker span
  const caret = document.createElement('span')
  caret.textContent = '\u200b' // zero-width space
  mirror.appendChild(caret)

  document.body.appendChild(mirror)

  const taRect     = textarea.getBoundingClientRect()
  const caretRect  = caret.getBoundingClientRect()
  const mirrorRect = mirror.getBoundingClientRect()

  // Offset of caret span relative to mirror origin, then translate to textarea viewport pos.
  // Also subtract how much the textarea has scrolled.
  const x = taRect.left + (caretRect.left - mirrorRect.left) - textarea.scrollLeft
  const y = taRect.top  + (caretRect.top  - mirrorRect.top)  - textarea.scrollTop

  const lineHeight = parseInt(computed.lineHeight, 10) || 18

  document.body.removeChild(mirror)

  return { x, y, lineHeight }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MentionPopup — rendered via Portal at caret position
 * ───────────────────────────────────────────────────────────────────────────*/
function MentionPopup({
  popupPos,          // { x, y, lineHeight }
  suggestions,
  isFetching,
  selectedIdx,
  setSelectedIdx,
  mentionQuery,
  insertMention,
  dropdownRef,
}) {
  // Decide whether popup opens upward or downward based on viewport space
  const POPUP_HEIGHT = 260 // approximate max height
  const spaceBelow = window.innerHeight - (popupPos.y + popupPos.lineHeight)
  const openUp = spaceBelow < POPUP_HEIGHT && popupPos.y > POPUP_HEIGHT

  const style = {
    position:  'fixed',
    left:      Math.max(8, Math.min(popupPos.x, window.innerWidth - 240)),
    zIndex:    9999,
    minWidth:  220,
    maxWidth:  320,
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
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-bg-subtle/80">
        <div className="flex items-center gap-1.5">
          <AtSign className="w-3 h-3 text-accent" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            Mention
          </span>
          {mentionQuery && (
            <span className="text-[11px] text-accent font-mono">{mentionQuery}</span>
          )}
        </div>
        {isFetching && <Loader2 className="w-3 h-3 text-text-muted animate-spin" />}
      </div>

      {/* Body */}
      {suggestions.length === 0 && isFetching ? (
        <div className="px-3 py-4 text-[12px] text-text-muted text-center">
          Searching…
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-3 py-4 text-[12px] text-text-muted text-center">
          No members found
          {mentionQuery ? <> for <span className="font-mono text-accent">&ldquo;{mentionQuery}&rdquo;</span></> : ''}
        </div>
      ) : (
        <>
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
                <li key={s.id}>
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
                    {/* Avatar */}
                    <div className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors',
                      isActive ? 'bg-accent text-white' : 'bg-accent/15 text-accent',
                    )}>
                      {initials}
                    </div>

                    {/* Name with match highlight */}
                    <span className="text-[13px] font-medium truncate flex-1">
                      {mentionQuery ? highlightMatch(s.fullName, mentionQuery) : s.fullName}
                    </span>

                    {/* Keyboard hint on active row */}
                    {isActive && (
                      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono border border-accent/20 shrink-0">
                        ↵
                      </kbd>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-border-subtle bg-bg-subtle/60 flex items-center gap-3">
            <span className="text-[10px] text-text-muted">
              <kbd className="kbd text-[9px]">↑↓</kbd> navigate
            </span>
            <span className="text-[10px] text-text-muted">
              <kbd className="kbd text-[9px]">Enter</kbd> select
            </span>
            <span className="text-[10px] text-text-muted">
              <kbd className="kbd text-[9px]">Esc</kbd> close
            </span>
          </div>
        </>
      )}
    </div>,
    document.body,
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MentionTextarea — main export
 * ───────────────────────────────────────────────────────────────────────────*/
/**
 * Textarea with @mention autocomplete.
 *
 * Props:
 *   value       — controlled text value
 *   onChange    — (newValue: string) => void
 *   onSubmit    — () => void — called on Enter (without Shift)
 *   projectId   — number — scopes mention autocomplete to project participants
 *   placeholder — string
 *   rows        — number (default 2)
 *   disabled    — boolean
 *   className   — additional class for the outer wrapper
 */
export default function MentionTextarea({
  value,
  onChange,
  onSubmit,
  projectId,
  placeholder = 'Add a comment…',
  rows = 2,
  disabled = false,
  className,
}) {
  // ── Mention state ────────────────────────────────────────────
  const [mentionQuery,  setMentionQuery]  = useState('')
  const [mentionActive, setMentionActive] = useState(false)
  const [mentionStart,  setMentionStart]  = useState(null)
  const [selectedIdx,   setSelectedIdx]   = useState(0)
  const [popupPos,      setPopupPos]      = useState(null) // { x, y, lineHeight }

  const textareaRef = useRef(null)
  const dropdownRef = useRef(null)

  const { data: suggestions = [], isFetching } = useMentionAutocomplete(
    mentionQuery,
    projectId,
    mentionActive,
  )

  useEffect(() => { setSelectedIdx(0) }, [suggestions])

  // ── Calculate caret pixel position ──────────────────────────
  const updatePopupPos = useCallback((caretIndex) => {
    const ta = textareaRef.current
    if (!ta) return
    const pos = getCaretPixelPos(ta, caretIndex)
    setPopupPos(pos)
  }, [])

  // ── Detect @mention while typing ────────────────────────────
  const detectMention = useCallback((text, cursor) => {
    let i = cursor - 1
    while (i >= 0 && text[i] !== '@' && text[i] !== ' ' && text[i] !== '\n') i--

    if (i >= 0 && text[i] === '@') {
      const before = i === 0 || text[i - 1] === ' ' || text[i - 1] === '\n'
      if (before) {
        const query = text.slice(i + 1, cursor)
        setMentionActive(true)
        setMentionStart(i)
        setMentionQuery(query)
        // Position popup at the '@' character
        updatePopupPos(i)
        return
      }
    }
    setMentionActive(false)
    setMentionQuery('')
    setMentionStart(null)
    setPopupPos(null)
  }, [updatePopupPos])

  // ── Insert chosen mention ────────────────────────────────────
  const insertMention = useCallback((fullName) => {
    if (mentionStart === null) return
    const before   = value.slice(0, mentionStart)
    const cursor   = textareaRef.current?.selectionStart ?? (mentionStart + mentionQuery.length + 1)
    const after    = value.slice(cursor)
    const newText  = `${before}@${fullName} ${after}`

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

  // ── Keyboard handler ─────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
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
        insertMention(suggestions[selectedIdx].fullName)
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

  // ── Text change ──────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const text   = e.target.value
    const cursor = e.target.selectionStart
    onChange(text)
    detectMention(text, cursor)
  }, [onChange, detectMention])

  const handleSelect = useCallback(() => {
    const ta = textareaRef.current
    if (ta) detectMention(ta.value, ta.selectionStart)
  }, [detectMention])

  // ── Close popup when clicking outside ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        textareaRef.current && !textareaRef.current.contains(e.target)
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

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-bg-subtle/50 border-t border-border-subtle px-3 py-1.5">
          <span className="flex items-center gap-0.5 text-[11px] text-text-muted select-none">
            <AtSign className="w-3 h-3" strokeWidth={1.75} />
            to mention
          </span>
          <p className="text-[11px] text-text-muted">
            <kbd className="kbd">Enter</kbd> save · <kbd className="kbd">Shift+Enter</kbd> newline
          </p>
        </div>
      </div>

      {/* Popup rendered via Portal at caret position */}
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

/* ─────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────────────────────────────────────*/
function highlightMatch(fullName, query) {
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
