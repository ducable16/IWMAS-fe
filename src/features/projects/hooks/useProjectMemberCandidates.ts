import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchService } from '@/features/search/services/searchService'
import { SEARCH_MIN_PREFIX } from '@/features/search/hooks/useSearch'
import type { Id } from '@/types'

/**
 * §3.11 / §13.1 — Search candidates for adding a member to a project.
 *
 * Uses `GET /api/autocomplete?q=…&excludeProjectId={id}&role=TEAM_MEMBER`
 * so only TEAM_MEMBER users who are NOT already in the project are returned.
 */
function useProjectCandidates(
  query: string,
  projectId?: Id | null,
  role: string = 'TEAM_MEMBER',
) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: ['projects', projectId, role === 'PROJECT_MANAGER' ? 'manager-candidates' : 'member-candidates', trimmed],
    enabled: !!projectId && trimmed.length >= SEARCH_MIN_PREFIX,
    queryFn: async ({ signal }) => {
      const res = await searchService.autocomplete(trimmed, signal, {
        excludeProjectId: projectId as Id,
        role,
      })
      return res.data ?? { suggestions: [] }
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

/**
 * §3.7 — Search PM candidates for the "Change Project Manager" modal.
 * Only returns PROJECT_MANAGER users not already in the project.
 */
export function useProjectManagerCandidates(query: string, projectId?: Id | null) {
  return useProjectCandidates(query, projectId, 'PROJECT_MANAGER')
}

/**
 * §3.11 — Search member candidates for the "Add Member" modal.
 * Only returns TEAM_MEMBER users not already in the project.
 */
export default function useProjectMemberCandidates(query: string, projectId?: Id | null) {
  return useProjectCandidates(query, projectId, 'TEAM_MEMBER')
}
