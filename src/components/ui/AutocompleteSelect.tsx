import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Loader2, Search, X } from 'lucide-react'
import clsx from 'clsx'
import Field from './Field'
import { useDebouncedValue } from '@/utils/hooks'
import type { ReactNode, ChangeEvent, MouseEvent } from 'react'
import type { Id } from '@/types'

interface Suggestion {
  term: string
  entityId?: Id | undefined
  user?: unknown | undefined
}

interface SearchData {
  suggestions?: Suggestion[]
}

interface SearchResult {
  data?: SearchData | undefined
  isFetching?: boolean | undefined
}

interface AutocompleteSelectProps<TSearchParams = unknown> {
  label: ReactNode
  id: string
  required?: boolean
  error?: ReactNode
  placeholder?: string
  value?: Id | ''
  onChange: (id: Id | '') => void
  useSearchHook: (query: string, searchParams?: TSearchParams) => SearchResult
  searchParams?: TSearchParams
  noResultsText?: string | undefined
  showNoResultsOnOpen?: boolean | undefined
  initialDisplay?: string | undefined
  renderOption?: ((item: Suggestion) => ReactNode) | undefined
  disabled?: boolean
}

export default function AutocompleteSelect<TSearchParams = unknown>({
  label,
  id,
  required = false,
  error,
  placeholder = 'Search...',
  value,
  onChange,
  useSearchHook,
  searchParams,
  noResultsText = 'No results found',
  showNoResultsOnOpen = false,
  initialDisplay = '',
  renderOption,
  disabled = false,
}: AutocompleteSelectProps<TSearchParams>) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(initialDisplay)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const debouncedInput = useDebouncedValue(inputValue, 200)
  const query = isOpen ? debouncedInput : ''
  const { data, isFetching = false } = useSearchHook(query, searchParams)
  const suggestions = data?.suggestions ?? []

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!value) {
      setInputValue('')
    } else if (initialDisplay) {
      setInputValue(initialDisplay)
    }
  }, [value, initialDisplay])

  const handleSelect = (item: Suggestion) => {
    setInputValue(item.term)
    onChange(item.entityId ?? '')
    setIsOpen(false)
  }

  const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    e.stopPropagation()
    setInputValue('')
    onChange('')
    setIsOpen(false)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    setInputValue(e.target.value)
    if (!isOpen) setIsOpen(true)
    if (value) onChange('')
  }

  const hasSearchQuery = debouncedInput.trim().length >= 2
  const showSuggestions = !disabled
    && isOpen
    && (showNoResultsOnOpen || hasSearchQuery || suggestions.length > 0)

  return (
    <Field label={label} id={id} required={required} error={error}>
      <div className="relative" ref={containerRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
          <input
            id={id}
            type="text"
            className={clsx(
              'w-full bg-bg-surface border text-[13px] text-text-primary rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 transition-all',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/15'
                : 'border-border focus:border-accent focus:ring-accent/15',
            )}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onFocus={() => !disabled && setIsOpen(true)}
            autoComplete="off"
            disabled={disabled}
          />
          {!disabled && (value || inputValue) ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-0.5 text-text-muted hover:text-text-primary transition-colors bg-bg-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <ChevronDown
              className="absolute right-3 w-3.5 h-3.5 text-text-muted pointer-events-none"
              strokeWidth={1.75}
            />
          )}
        </div>

        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-surface border border-border shadow-popover rounded-lg overflow-hidden z-[100] max-h-60 overflow-y-auto">
            {isFetching && (
              <div className="px-3 py-2 text-[12px] text-text-muted flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching...
              </div>
            )}

            {!isFetching && suggestions.length === 0 && (showNoResultsOnOpen || hasSearchQuery) && (
              <div className="px-3 py-2 text-[12px] text-text-muted">
                {noResultsText}
              </div>
            )}

            {!isFetching && suggestions.length > 0 && (
              <ul className="py-1">
                {suggestions.map((item) => (
                  <li
                    key={String(item.entityId ?? item.term)}
                    onClick={() => handleSelect(item)}
                    className={clsx(
                      'px-3 py-1.5 text-[13px] cursor-pointer hover:bg-bg-subtle transition-colors',
                      value === item.entityId ? 'bg-accent/5 text-accent font-medium' : 'text-text-primary',
                    )}
                  >
                    {renderOption ? renderOption(item) : item.term}
                  </li>
                ))}
              </ul>
            )}

            {!isFetching && !showNoResultsOnOpen && !hasSearchQuery && suggestions.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-text-muted">
                Type at least 2 characters to search...
              </div>
            )}
          </div>
        )}
      </div>
    </Field>
  )
}
