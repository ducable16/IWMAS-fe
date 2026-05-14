import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'
import { useAuthStore } from '@/features/auth/store/authStore'

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

/**
 * §2.7 GET /api/users/{id} — fetch a single user by ID.
 * Response shape depends on caller's role (see §2.6 table).
 */
export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const res = await userService.getById(id)
      return normaliseUser(res.data ?? {})
    },
    enabled: !!id,
    staleTime: 60_000,
  })
}

/**
 * §2.10 GET /api/users/{userId}/projects — projects the target user participates in.
 * Access is enforced server-side per the caller's role.
 *
 * @param {number}  userId
 * @param {object}  params  — same filters as §3.1 (statuses, search, sortBy, page, size…)
 * @param {boolean} enabled
 */
export function useUserProjects(userId, params = {}, enabled = true) {
  return useQuery({
    queryKey: ['users', userId, 'projects', params],
    queryFn: async () => {
      const res = await userService.getUserProjects(userId, params)
      const raw = res.data ?? {}
      const items = Array.isArray(raw) ? raw : Array.isArray(raw.content) ? raw.content : []
      return {
        projects:      items,
        page:          raw.page          ?? params.page ?? 0,
        size:          raw.size          ?? params.size ?? 20,
        totalElements: raw.totalElements ?? items.length,
        totalPages:    raw.totalPages    ?? 1,
      }
    },
    enabled: !!userId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

/**
 * §2.11 GET /api/users/{userId}/tasks/assigned — tasks assigned to the target user.
 * Results are scoped to projects the **caller** can access.
 *
 * @param {number}  userId
 * @param {object}  params  — statuses, priorities, types, search, sortBy, page, size…
 * @param {boolean} enabled
 */
export function useUserAssignedTasks(userId, params = {}, enabled = true) {
  return useQuery({
    queryKey: ['users', userId, 'tasks', 'assigned', params],
    queryFn: async () => {
      const res = await userService.getUserAssignedTasks(userId, params)
      const raw = res.data ?? {}
      const items = Array.isArray(raw) ? raw : Array.isArray(raw.content) ? raw.content : []
      return {
        tasks:         items,
        page:          raw.page          ?? params.page ?? 0,
        size:          raw.size          ?? params.size ?? 20,
        totalElements: raw.totalElements ?? items.length,
        totalPages:    raw.totalPages    ?? 1,
      }
    },
    enabled: !!userId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

/**
 * §2.12 GET /api/users/{userId}/tasks/reported — tasks reported/created by the target user.
 * Results are scoped to projects the **caller** can access.
 *
 * @param {number}  userId
 * @param {object}  params  — same as §2.11
 * @param {boolean} enabled
 */
export function useUserReportedTasks(userId, params = {}, enabled = true) {
  return useQuery({
    queryKey: ['users', userId, 'tasks', 'reported', params],
    queryFn: async () => {
      const res = await userService.getUserReportedTasks(userId, params)
      const raw = res.data ?? {}
      const items = Array.isArray(raw) ? raw : Array.isArray(raw.content) ? raw.content : []
      return {
        tasks:         items,
        page:          raw.page          ?? params.page ?? 0,
        size:          raw.size          ?? params.size ?? 20,
        totalElements: raw.totalElements ?? items.length,
        totalPages:    raw.totalPages    ?? 1,
      }
    },
    enabled: !!userId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)
  const currentUser = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (file) => userService.uploadAvatar(file),
    onSuccess: (res) => {
      const updated = res?.data
      if (updated) updateUser(updated)
      else if (currentUser) updateUser(currentUser)

      toast.success('Avatar updated')
      if (updated?.id) {
        queryClient.invalidateQueries({ queryKey: ['users', updated.id] })
      }
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to upload avatar'),
  })
}
