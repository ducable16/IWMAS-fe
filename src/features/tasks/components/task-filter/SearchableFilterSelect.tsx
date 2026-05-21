import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import clsx from 'clsx'
import type { MouseEvent } from 'react'
import type { Id } from '@/types'

export type FilterSelectOption = {
  id: Id
  label: string
}

type SearchableFilterSelectProps = {
  selectedId: Id | null
  options: FilterSelectOption[]
  placeholder: string
  noResultsText: string
  onChange: (id: Id | null) => void
}

function initials(name: string) {
  return name.substring(0, 2).toUpperCase()
}

export default function SearchableFilterSelect({
  selectedId,
  options,
  placeholder,
  noResultsText,
  onChange,
}: SearchableFilterSelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const selected = useMemo(
    () => options.find((option) => option.id === selectedId) ?? null,
    [options, selectedId],
  )

  const filtered = useMemo(() => {
    const needle = query.toLowerCase()
    return options.filter((option) => option.label.toLowerCase().includes(needle))
  }, [options, query])

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (option: FilterSelectOption) => {
    onChange(selectedId === option.id ? null : option.id)
    setQuery('')
    setOpen(false)
  }

  const clear = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onChange(null)
    setQuery('')
  }

  return (
    <div ref={wrapRef} className="relative">
      {selected && !open ? (
        <div
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-accent bg-accent/10 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent text-accent text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
            {initials(selected.label)}
          </div>
          <span className="text-[12px] text-accent font-medium flex-1 truncate">
            {selected.label}
          </span>
          <button
            onClick={clear}
            className="text-accent/60 hover:text-danger transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            autoFocus={open}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="input-field w-full pl-7 text-[12.5px]"
          />
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          {selected && (
            <div className="p-2 border-b border-border-subtle relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="input-field w-full pl-7 text-[12.5px]"
              />
            </div>
          )}
          <ul className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-text-muted italic">
                {noResultsText}
              </li>
            ) : (
              filtered.map((option) => {
                const active = selectedId === option.id
                return (
                  <li
                    key={option.id}
                    onClick={() => select(option)}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-[12px]',
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-bg-hover text-text-primary',
                    )}
                  >
                    <div
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0',
                        active
                          ? 'bg-accent/20 text-accent border border-accent'
                          : 'bg-bg-subtle text-text-muted border border-border',
                      )}
                    >
                      {initials(option.label)}
                    </div>
                    <span className="truncate flex-1">{option.label}</span>
                    {active && (
                      <span className="text-[10px] text-accent font-medium">
                        Selected
                      </span>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
