import { useQuery } from '@tanstack/react-query'
import { useProjectAutocomplete } from '@/features/search/hooks/useSearch'
import { projectService } from '@/features/projects/services/projectService'
import type { Id, PageResponse, Project } from '@/types'
import type { SuggestionResult } from './taskCreateTypes'

function getPageItems<T>(raw: PageResponse<T> | T[] | null | undefined): T[] {
  if (Array.isArray(raw)) return raw
  return Array.isArray(raw?.content) ? raw.content : []
}

export function useProjectSuggestions(q: string) {
  const query = (q || '').trim()
  const isAuto = query.length >= 2
  const auto = useProjectAutocomplete(query)

  const all = useQuery<SuggestionResult>({
    queryKey: ['projects', 'suggestions', 'all'],
    queryFn: async () => {
      const res = await projectService.getAll({ size: 10 })
      const data = getPageItems<Project>(res.data)
      return { suggestions: data.map((project) => ({ entityId: project.id, term: project.name })) }
    },
    enabled: !isAuto,
    staleTime: 60000,
  })

  return isAuto ? auto : all
}

export type AssigneeSuggestionParams = {
  projectId?: Id | '' | null | undefined
  requiredSkills?: string | undefined
}

export function useAssigneeSuggestions(
  q: string,
  params: AssigneeSuggestionParams = {},
) {
  const query = (q || '').trim()
  const projectId = params.projectId || ''
  const requiredSkills = params.requiredSkills

  return useQuery<SuggestionResult>({
    queryKey: [
      'projects',
      projectId || null,
      'members',
      'assignee-suggestions',
      query,
      requiredSkills,
      'TEAM_MEMBER',
    ],
    queryFn: async () => {
      const res = await projectService.searchMembers(projectId, {
        q: query,
        size: 10,
        requiredSkills,
        role: 'TEAM_MEMBER',
      })
      const data = Array.isArray(res.data) ? res.data : []
      return {
        suggestions: data.map((member) => ({
          entityId: member.id,
          term: member.fullName || member.email || 'Unknown',
        })),
      }
    },
    enabled: !!projectId,
    staleTime: 60000,
  })
}
