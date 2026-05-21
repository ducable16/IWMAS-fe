import { useState, useEffect } from 'react'

/**
 * Shared React hooks used across the application.
 * Import from here instead of defining locally in each component.
 */

/**
 * Debounces a value — delays updating the returned value until `delay` ms
 * after the input value stops changing.
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 400)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
