import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import {
  useAutocomplete,
  useDebouncedValue,
  SEARCH_MIN_PREFIX,
} from '../hooks/useSearch'

/**
 * Global typeahead search (§13.1 /api/autocomplete).
 *
 * UX rules from the spec:
 *   • Trigger after >= SEARCH_MIN_PREFIX (2) chars
 *   • Debounce input ~220ms
 *   • Cancel in-flight requests on new input (handled by React Query signal)
 *   • If `source === 'database'` ⇒ degraded state — hide "Did you mean" hints
 *
 * Suggestion click and Enter both navigate to the full results page
 * (/search?q=…) since we don't yet have a per-user profile route.
 */
export default function GlobalSearchBar() {
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const debounced = useDebouncedValue(query)
  const { data, isFetching, isError } = useAutocomplete(debounced)

  const suggestions = data?.suggestions ?? []
  const source = data?.source

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Reset highlight when results change */
  useEffect(() => { setActiveIdx(-1) }, [debounced])

  const goTo = (q) => {
    if (!q.trim()) return
    setOpen(false)
    setActiveIdx(-1)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (open && activeIdx >= 0 && suggestions[activeIdx]) {
        goTo(suggestions[activeIdx].term)
      } else {
        goTo(query)
      }
      return
    }
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); return }
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    }
  }

  const showDropdown =
    open &&
    debounced.trim().length >= SEARCH_MIN_PREFIX &&
    (isFetching || suggestions.length > 0 || isError || source === 'database')

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[300px] hidden md:block">
      <div
        className={clsx(
          'flex items-center gap-2 bg-bg-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 transition-colors',
          open && 'border-border bg-bg-surface',
        )}
      >
        <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search users…"
          className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
          autoComplete="off"
          aria-label="Search users"
        />
        {isFetching && <Loader2 className="w-3 h-3 text-text-muted animate-spin shrink-0" />}
      </div>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 mt-1.5 z-40 bg-bg-surface border border-border rounded-lg overflow-hidden animate-fade-in"
          role="listbox"
        >
          {/* Degraded-state banner */}
          {source === 'database' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-subtle text-warning text-[11px] border-b border-border-subtle">
              <AlertTriangle className="w-3 h-3" strokeWidth={1.75} />
              Search index unavailable — showing limited results.
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="px-3 py-2 text-[12px] text-danger">
              Couldn't reach search service. Try again.
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length === 0 && !isFetching && !isError ? (
            <div className="px-3 py-2 text-[12px] text-text-muted italic">
              No matches for "{debounced}"
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((s, i) => {
                const active = i === activeIdx
                return (
                  <li
                    key={`${s.entityId}-${s.term}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseDown={(e) => {
                      // mousedown beats input blur so the click registers
                      e.preventDefault()
                      goTo(s.term)
                    }}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-1.5 cursor-pointer text-[12.5px] transition-colors',
                      active ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:bg-bg-hover',
                    )}
                  >
                    <span className="w-6 h-6 rounded-full bg-accent/10 border border-accent/15 text-accent text-[10px] font-semibold flex items-center justify-center shrink-0">
                      {s.term[0]?.toUpperCase() || '?'}
                    </span>
                    <span className="truncate flex-1">{s.term}</span>
                    <span className="text-[10px] text-text-muted">#{s.entityId}</span>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Footer hint + source diagnostic */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border-subtle bg-bg-subtle/60 text-[10.5px] text-text-muted">
            <span>
              <kbd className="kbd">↵</kbd> to view all results
            </span>
            {source && (
              <span title={`Server replied in ${data?.tookMs ?? 0}ms`}>
                via {source}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
