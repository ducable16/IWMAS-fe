import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchService } from '@/features/search/services/searchService'
import { SEARCH_MIN_PREFIX } from '@/features/search/hooks/useSearch'
import type { Id, MemberView } from '@/types'

export type ManagerSuggestionItem = {
  term: string
  entityId: Id
  user?: MemberView | undefined
}
/**
 * §3.5 / §13.1 — Search PM candidates for the "Create / Edit project" form.
 *
 * Uses `GET /api/autocomplete?q=…&role=PROJECT_MANAGER` so only users
 * with the PROJECT_MANAGER system role are returned. No `excludeProjectId`
 * is needed because the project may not exist yet (create flow).
 */
export function useManagerAutocomplete(query: string) {
  const trimmed = (query ?? '').trim()
  const enabled = trimmed.length >= SEARCH_MIN_PREFIX

  return useQuery({
    queryKey: ['members', 'manager-autocomplete', trimmed],
    enabled,
    queryFn: async ({ signal }) => {
      const res = await searchService.autocomplete(trimmed, signal, {
        role: 'PROJECT_MANAGER',
      })
      return res.data ?? { suggestions: [] }
    },
    placeholderData: keepPreviousData,
  })
}
