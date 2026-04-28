import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/memberService'

/**
 * Fetch all users and normalise into a flat shape for the table.
 * Maps backend UserMeResponse → UI-friendly object.
 */
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await userService.getAll()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map(normaliseUser)
    },
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
    position: u.position || u.title || '',
    role: u.role || 'TEAM_MEMBER',
    status: u.status || (u.active === false ? 'DISABLED' : 'ACTIVE'),
    lastActive: u.lastActive || u.lastLogin || null,
    createdAt: u.createdAt || null,
    workloadScore: u.workloadScore ?? 0,
  }
}
