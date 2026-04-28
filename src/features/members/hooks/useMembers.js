import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/memberService'

/**
 * Fetch all users and normalise into a flat shape for the table.
 *
 * §2.6: GET /api/users returns paginated { content, page, size, totalElements, totalPages }.
 * We fetch with a large size (default 200) so dropdowns/filters always get all users.
 *
 * Field mapping (per 02-users.md):
 *   lastLoginAt  — only ADMIN sees this field
 *   active       — only ADMIN/HR see this field
 *   createdAt    — only ADMIN/HR see this field
 *   phone        — only ADMIN/HR see this field
 */
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await userService.getAll()
      // Backend returns paginated { content: [...], totalElements, ... }
      const raw = res.data ?? {}
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.content)
        ? raw.content
        : []
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
    position: u.position || '',
    role: u.role || 'TEAM_MEMBER',
    // §2.6: active field (ADMIN/HR only) — fall back to ACTIVE if not present
    status: u.active === false ? 'DISABLED' : 'ACTIVE',
    // §2.6: lastLoginAt (ADMIN only) — the correct backend field name
    lastActive: u.lastLoginAt || null,
    createdAt: u.createdAt || null,
    verified: u.verified ?? null,
    avatarUrl: u.avatarUrl || null,
    workloadScore: u.workloadScore ?? 0,
  }
}
