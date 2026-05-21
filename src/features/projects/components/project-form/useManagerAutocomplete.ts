import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { normaliseUser } from '@/features/members/hooks/useMembers'
import { userService } from '@/features/members/services/memberService'
import type { Id, MemberView, PageResponse, User } from '@/types'

export type ManagerAutocompleteParams = {
  allowedIds?: Id[] | null | undefined
}

export type ManagerSuggestionItem = {
  term: string
  entityId: Id
  user: MemberView
}

export function useManagerAutocomplete(
  query: string,
  params: ManagerAutocompleteParams = {},
) {
  const trimmed = (query ?? '').trim()
  const enabled = trimmed.length >= 2
  const allowedIds = params.allowedIds

  return useQuery({
    queryKey: ['members', 'manager-autocomplete', trimmed, allowedIds],
    enabled,
    queryFn: async () => {
      const res = await userService.getAll({ search: trimmed, size: 10 })
      const raw = (res.data ?? {}) as PageResponse<User> | User[]
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.content)
          ? raw.content
          : []
      const users = items.map(normaliseUser)
      const filtered = users.filter(
        (u) => (u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN') &&
          (!allowedIds || allowedIds.includes(u.id)),
      )
      return {
        suggestions: filtered.map((u) => ({
          term: u.fullName,
          entityId: u.id,
          user: u,
        })),
      }
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
