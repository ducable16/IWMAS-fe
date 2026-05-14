import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchService } from '../services/searchService'

/**
 * §13.1 Min prefix length and debounce — match backend defaults.
 * Backend default app.search.autocomplete.min-prefix-length = 2.
 */
export const SEARCH_MIN_PREFIX = 2
export const SEARCH_DEBOUNCE_MS = 220

/** Returns `value` debounced by `delay` ms. */
export function useDebouncedValue(value, delay = SEARCH_DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * §13.1 Autocomplete — typeahead suggestions.
 *
 * Caller debounces the input (or wraps with useDebouncedValue).
 * React Query passes `signal` so in-flight requests are cancelled
 * when the query key changes (i.e. user keeps typing).
 *
 * Returns the raw §13.1 response shape (or undefined while loading):
 *   { prefix, suggestions: [{ term, entityId }], source, tookMs }
 *
 * @param {string} query
 * @param {number|string|null} [projectId] - Restrict to project participants
 */
export function useAutocomplete(query, projectId = null) {
  const trimmed = (query ?? '').trim()
  const enabled = trimmed.length >= SEARCH_MIN_PREFIX

  return useQuery({
    queryKey: ['search', 'autocomplete', trimmed, projectId],
    enabled,
    queryFn: async ({ signal }) => {
      const res = await searchService.autocomplete(
        trimmed,
        signal,
        projectId ? { projectId } : {},
      )
      return res.data
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: false, // user is still typing; don't waste retries
  })
}

/**
 * §13.1 Autocomplete with excludeProjectId — "Add Member" typeahead.
 *
 * Search global users but exclude existing participants of the given project.
 * Backend uses ES→DB fallback (Redis bypassed) when excludeProjectId is present.
 *
 * @param {string} query
 * @param {number|string|null} [excludeProjectId] - Exclude participants of this project
 */
export function useAutocompleteExcludeProject(query, excludeProjectId = null) {
  const trimmed = (query ?? '').trim()
  const enabled = trimmed.length >= SEARCH_MIN_PREFIX

  return useQuery({
    queryKey: ['search', 'autocomplete', trimmed, 'exclude', excludeProjectId],
    enabled,
    queryFn: async ({ signal }) => {
      const res = await searchService.autocomplete(
        trimmed,
        signal,
        excludeProjectId ? { excludeProjectId } : {},
      )
      return res.data
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

/**
 * §13.3 Project Autocomplete — typeahead suggestions.
 */
export function useProjectAutocomplete(query) {
  const trimmed = (query ?? '').trim()
  const enabled = trimmed.length >= SEARCH_MIN_PREFIX

  return useQuery({
    queryKey: ['search', 'autocomplete-projects', trimmed],
    enabled,
    queryFn: async ({ signal }) => {
      const res = await searchService.autocompleteProjects(trimmed, signal)
      return res.data
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

/**
 * §13.2 User search — full paginated result list.
 *
 * `params`: { q, page?, size?, sortBy?, sortDir? }
 * Returns the §13.2 response shape:
 *   { items, total, page, size, source, tookMs }
 */
export function useUserSearch(params = {}) {
  const q = (params.q ?? '').trim()
  const enabled = q.length > 0

  return useQuery({
    queryKey: ['search', 'users', { ...params, q }],
    enabled,
    queryFn: async ({ signal }) => {
      const res = await searchService.searchUsers({ ...params, q }, signal)
      return res.data
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
