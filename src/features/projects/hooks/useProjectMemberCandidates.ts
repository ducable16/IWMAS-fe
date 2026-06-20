import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { normaliseUser } from '@/features/members/hooks/useMembers'
import { userService } from '@/features/members/services/memberService'
import { projectService } from '@/features/projects/services/projectService'
import { canParticipateInDelivery } from '@/utils/permissions'
import type { Id, PageResponse, User } from '@/types'

function pageItems(raw: PageResponse<User> | User[] | null | undefined): User[] {
  if (Array.isArray(raw)) return raw
  return Array.isArray(raw?.content) ? raw.content : []
}

function useProjectCandidates(
  query: string,
  projectId?: Id | null,
  managerOnly = false,
) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: ['projects', projectId, managerOnly ? 'manager-candidates' : 'member-candidates', trimmed],
    enabled: !!projectId && trimmed.length >= 2,
    queryFn: async () => {
      const [usersResponse, membersResponse] = await Promise.all([
        userService.getAll({ search: trimmed, active: true, size: 100 }),
        projectService.getMembers(projectId as Id),
      ])
      const existingUserIds = new Set(
        (Array.isArray(membersResponse.data) ? membersResponse.data : [])
          .map((member) => String(member.userId)),
      )
      const candidates = pageItems(usersResponse.data)
        .map(normaliseUser)
        .filter((user) =>
          (managerOnly ? user.role === 'PROJECT_MANAGER' : canParticipateInDelivery(user.role))
          && !existingUserIds.has(String(user.id)),
        )

      return {
        suggestions: candidates.map((user) => ({
          term: user.fullName || user.email,
          entityId: user.id,
          user,
        })),
      }
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useProjectManagerCandidates(query: string, projectId?: Id | null) {
  return useProjectCandidates(query, projectId, true)
}

export default function useProjectMemberCandidates(query: string, projectId?: Id | null) {
  return useProjectCandidates(query, projectId)
}
