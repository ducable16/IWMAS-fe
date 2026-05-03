import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Loader2, Search, X } from 'lucide-react'
import clsx from 'clsx'
import Field from './Field'
import { useDebouncedValue } from '@/features/search/hooks/useSearch'

/**
 * AutocompleteSelect — A searchable select component
 * 
 * @param {string} label - Field label
 * @param {string} id - Input ID
 * @param {boolean} required - Is field required
 * @param {string} error - Error message
 * @param {string} placeholder - Input placeholder
 * @param {any} value - The selected ID
 * @param {Function} onChange - (id) => void
 * @param {Function} useSearchHook - The hook to fetch suggestions (e.g. useAutocomplete)
 * @param {string} noResultsText - Text to show when no results found
 * @param {string} initialDisplay - Initial text to show for the selected value (if value is present initially)
 */
export default function AutocompleteSelect({
  label,
  id,
  required,
  error,
  placeholder = 'Search...',
  value,
  onChange,
  useSearchHook,
  noResultsText = 'No results found',
  initialDisplay = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(initialDisplay)
  const containerRef = useRef(null)
  
  // Debounce the input for searching
  const debouncedInput = useDebouncedValue(inputValue, 200)
  
  // Only search if the dropdown is open and the input doesn't match the current selection perfectly
  // (We don't want to spam search API when the user just selected an item and it filled the input)
  const query = isOpen ? debouncedInput : ''
  const { data, isFetching } = useSearchHook(query)
  
  const suggestions = data?.suggestions ?? []

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        // If they clicked away and there's a selected value, revert the input text.
        // If there's no selected value, maybe clear the input?
        // It's tricky without knowing the selected label. We'll rely on the parent updating `initialDisplay` if needed,
        // or just leave the text as is.
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync initialDisplay if the parent forces a new value (e.g. reset form)
  useEffect(() => {
    if (!value) {
      setInputValue('')
    } else if (initialDisplay) {
      setInputValue(initialDisplay)
    }
  }, [value, initialDisplay])

  const handleSelect = (item) => {
    setInputValue(item.term)
    onChange(item.entityId)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setInputValue('')
    onChange('')
    setIsOpen(false)
  }

  const handleChange = (e) => {
    setInputValue(e.target.value)
    if (!isOpen) setIsOpen(true)
    if (value) onChange('') // Clear selection when user starts typing
  }

  const showSuggestions = isOpen && (debouncedInput.length >= 2 || suggestions.length > 0)

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
                : 'border-border focus:border-accent focus:ring-accent/15'
            )}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            autoComplete="off"
          />
          {value || inputValue ? (
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
            
            {!isFetching && suggestions.length === 0 && debouncedInput.length >= 2 && (
              <div className="px-3 py-2 text-[12px] text-text-muted">
                {noResultsText}
              </div>
            )}
            
            {!isFetching && suggestions.length > 0 && (
              <ul className="py-1">
                {suggestions.map((item) => (
                  <li
                    key={item.entityId}
                    onClick={() => handleSelect(item)}
                    className={clsx(
                      'px-3 py-1.5 text-[13px] cursor-pointer hover:bg-bg-subtle transition-colors',
                      value === item.entityId ? 'bg-accent/5 text-accent font-medium' : 'text-text-primary'
                    )}
                  >
                    {item.term}
                  </li>
                ))}
              </ul>
            )}
            
            {!isFetching && debouncedInput.length < 2 && suggestions.length === 0 && (
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
