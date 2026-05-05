import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { searchService } from '@/features/search/services/searchService'
import { useDebouncedValue, SEARCH_DEBOUNCE_MS } from '@/features/search/hooks/useSearch'

/**
 * Autocomplete for @mention in comments.
 *
 * Wraps §13.1 GET /api/autocomplete?q={q}&projectId={projectId}
 * — returns only participants of the given project (manager + active members).
 *
 * @param {string}  query     — raw mention prefix (without the leading '@')
 * @param {number}  projectId — scopes results to this project's participants
 * @param {boolean} [enabled] — set false to skip (e.g. when dropdown is closed)
 *
 * @returns {string[]} suggestions — array of fullName strings (ready to render)
 *          plus { entityId } via the raw data for keying
 */
export function useMentionAutocomplete(query, projectId, enabled = true) {
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)
  const trimmed   = (debounced ?? '').trim()

  return useQuery({
    queryKey: ['mention-autocomplete', trimmed, projectId],
    queryFn: async ({ signal }) => {
      const res = await searchService.autocomplete(trimmed, signal, projectId)
      // §13.1 response shape: { prefix, suggestions: [{term, entityId}], source, tookMs }
      const suggestions = res.data?.suggestions ?? []
      return suggestions.map((s) => ({ id: s.entityId, fullName: s.term }))
    },
    enabled: !!projectId && enabled && trimmed.length >= 1,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: false,
  })
}
