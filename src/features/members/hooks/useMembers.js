import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/memberService'

/**
 * Server-side paginated user list — §2.6 GET /api/users
 *
 * Supported params:
 *   search, role, position, active, verified,
 *   sortBy, sortDirection, page, size
 *
 * Returns: { members, page, size, totalElements, totalPages }
 */
export function useMembers(params = {}) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      const res = await userService.getAll(params)
      const raw = res.data ?? {}

      // Backend returns paginated { content, page, size, totalElements, totalPages }
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.content)
        ? raw.content
        : []

      return {
        members: items.map(normaliseUser),
        page: raw.page ?? params.page ?? 0,
        size: raw.size ?? params.size ?? 20,
        totalElements: raw.totalElements ?? items.length,
        totalPages: raw.totalPages ?? 1,
      }
    },
    placeholderData: (prev) => prev, // keep previous data visible while re-fetching
    staleTime: 30_000,
  })
}

/** Normalise a raw UserMeResponse into the shape used by the UI */
export function normaliseUser(u) {
  return {
    id: u.id,
    fullName: u.fullName || u.name || u.email,
    email: u.email,
    phone: u.phone || '',
    position: u.position || '',
    role: u.role || 'TEAM_MEMBER',
    // §2.6: active field (ADMIN/HR only) — fall back to ACTIVE if not present
    status: u.active === false ? 'DISABLED' : 'ACTIVE',
    // §2.6: lastLoginAt (ADMIN only)
    lastActive: u.lastLoginAt || null,
    createdAt: u.createdAt || null,
    verified: u.verified ?? null,
    avatarUrl: u.avatarUrl || null,
    workloadScore: u.workloadScore ?? 0,
  }
}
