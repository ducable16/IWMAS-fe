import { useQuery } from '@tanstack/react-query'
import { useAutocomplete, useProjectAutocomplete } from '@/features/search/hooks/useSearch'
import { projectService } from '@/features/projects/services/projectService'
import { userService } from '@/features/members/services/memberService'
import type { Id, PageResponse, Project, User } from '@/types'
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

export function useAssigneeSuggestions(q: string, projectId: Id | '' = '') {
  const query = (q || '').trim()
  const isAuto = query.length >= 2
  const auto = useAutocomplete(query, projectId || null)

  const all = useQuery<SuggestionResult>({
    queryKey: ['users', 'suggestions', projectId || 'global'],
    queryFn: async () => {
      if (projectId) {
        const res = await projectService.searchMembers(projectId, '', 10)
        const data = Array.isArray(res.data) ? res.data : []
        return {
          suggestions: data.map((member) => ({
            entityId: member.id,
            term: member.fullName || member.email || 'Unknown',
          })),
        }
      }

      const res = await userService.getAll({ size: 10 })
      const data = getPageItems<User>(res.data)
      return {
        suggestions: data.map((user) => ({
          entityId: user.id,
          term: user.fullName || user.email || 'Unknown',
        })),
      }
    },
    enabled: !isAuto,
    staleTime: 60000,
  })

  return isAuto ? auto : all
}
