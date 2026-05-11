import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService } from '../services/projectService'

/**
 * §3.1 GET /api/projects — all projects (ADMIN / PROJECT_MANAGER)
 * Returns paginated { content, page, size, totalElements, totalPages }
 *
 * Supported params: search, statuses[], managerId,
 *   startDateFrom, startDateTo, endDateFrom, endDateTo,
 *   sortBy, sortDirection, page, size
 */
export function useProjects(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const res = await projectService.getAll(params)
      const raw = res.data ?? {}
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.content)
        ? raw.content
        : []
      return {
        projects:      items,
        page:          raw.page          ?? params.page ?? 0,
        size:          raw.size          ?? params.size ?? 20,
        totalElements: raw.totalElements ?? items.length,
        totalPages:    raw.totalPages    ?? 1,
      }
    },
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })
}

/**
 * §3.2 GET /api/projects/my — current user's projects (all roles)
 * Same paginated response shape and params as §3.1
 */
export function useMyProjects(params = {}, enabled = true) {
  return useQuery({
    queryKey: ['projects', 'my', params],
    queryFn: async () => {
      const res = await projectService.getMy(params)
      const raw = res.data ?? {}
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.content)
        ? raw.content
        : []
      return {
        projects:      items,
        page:          raw.page          ?? params.page ?? 0,
        size:          raw.size          ?? params.size ?? 20,
        totalElements: raw.totalElements ?? items.length,
        totalPages:    raw.totalPages    ?? 1,
      }
    },
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })
}

/**
 * §3.3 GET /api/projects/{id}
 */
export function useProject(id) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const res = await projectService.getById(id)
      return res.data ?? null
    },
    enabled: !!id,
    staleTime: 60_000,
  })
}

/**
 * §3.7 GET /api/projects/{id}/members
 * Shape: { id, projectId, userId, userFullName, roleInProject, allocatedEffortPercent, joinDate, leaveDate, note }
 */
export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: async () => {
      const res = await projectService.getMembers(projectId)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

/**
 * §3.8 GET /api/projects/{id}/members/search — Assignee autocomplete
 * Returns users who can be assigned tasks in this project (manager + active members).
 *
 * @param {number}  projectId
 * @param {string}  q         — keyword (empty = all participants)
 * @param {number}  [size=10]
 * @param {boolean} [enabled=true]
 */
export function useProjectMemberSearch(projectId, q = '', size = 10, enabled = true) {
  return useQuery({
    queryKey: ['projects', projectId, 'members', 'search', q, size],
    queryFn: async () => {
      const res = await projectService.searchMembers(projectId, q, size)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

/**
 * §3.4 GET /api/projects/suggest-code — ADMIN or PROJECT_MANAGER
 * Derives a unique project code from a given name.
 * Caller should debounce `name` before passing it in.
 *
 * @param {string}  name
 * @param {boolean} [enabled=true]
 */
export function useSuggestProjectCode(name, enabled = true) {
  const trimmed = (name ?? '').trim()
  return useQuery({
    queryKey: ['projects', 'suggest-code', trimmed],
    queryFn: async () => {
      const res = await projectService.suggestCode(trimmed)
      return res.data?.code ?? null
    },
    enabled: trimmed.length >= 2 && enabled,
    staleTime: 10_000,
  })
}

/**
 * §3.13 GET /api/projects/users/{userId}/effort-remaining
 * Returns remaining effort capacity for a user within a period.
 *
 * Response: { userId, userName, queryStart, queryEnd,
 *             peakAllocatedPercent, remainingPercent,
 *             overlappingAllocations, futureAvailabilityNotes }
 *
 * @param {number}  userId
 * @param {{ startDate?, endDate?, detail? }} params
 * @param {boolean} [enabled=true]
 */
export function useUserEffortRemaining(userId, params = {}, enabled = true) {
  return useQuery({
    queryKey: ['projects', 'effort-remaining', userId, params],
    queryFn: async () => {
      const res = await projectService.getUserEffortRemaining(userId, params)
      return res.data ?? null
    },
    enabled: !!userId && enabled,
    staleTime: 30_000,
  })
}

// ── Mutations ────────────────────────────────────────────────

/** §3.5 POST /api/projects */
export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data }) => projectService.create(data),
    onSuccess: async (res, variables) => {
      toast.success('Project created')
      const data = variables?.data
      const managerEffortPercent = Number(variables?.managerEffortPercent) || 0
      // Axios interceptor unwraps the envelope → res is already the `data` payload
      const projectId = res?.id ?? res?.data?.id
      if (projectId && data?.managerId) {
        try {
          await projectService.addMember(projectId, {
            userId: data.managerId,
            roleInProject: 'LEAD',
            allocatedEffortPercent: managerEffortPercent,
            joinDate: data.startDate || undefined,
          })
        } catch (err) {
          // Interceptor rejects with { code, message } — not the raw axios error
          const code = err?.code
          if (code !== 4004) {
            toast.error(err?.message || 'Failed to add manager as project member')
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to create project'),
  })
}

/** §3.5 PUT /api/projects/{id} */
export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => projectService.update(id, data),
    onSuccess: (_res, { id }) => {
      toast.success('Project updated')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to update project'),
  })
}

/** §3.6 DELETE /api/projects/{id} */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => projectService.remove(id),
    onSuccess: () => {
      toast.success('Project deleted')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete project'),
  })
}

/**
 * §3.10 POST /api/projects/{id}/members
 * Error codes: 4004 = already a member, 4005 = over 100% allocation
 */
export function useAddProjectMember(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => projectService.addMember(projectId, data),
    onSuccess: () => {
      toast.success('Member added')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err) => {
      // Interceptor rejects with { code, message }
      const code = err?.code
      if (code === 4004) {
        toast.error('This user is already a member of this project.')
      } else if (code === 4005) {
        toast.error("Adding this allocation would push the user's total above 100%.")
      } else {
        toast.error(err?.message || 'Failed to add member')
      }
    },
  })
}

/**
 * §3.11 PUT /api/projects/{id}/members/{memberId}
 * Error codes: 4005 = over 100% allocation
 */
export function useUpdateProjectMember(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, data }) =>
      projectService.updateMember(projectId, memberId, data),
    onSuccess: () => {
      toast.success('Member updated')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err) => {
      // Interceptor rejects with { code, message }
      const code = err?.code
      if (code === 4005) {
        toast.error("Updated allocation would push the user's total above 100%.")
      } else {
        toast.error(err?.message || 'Failed to update member')
      }
    },
  })
}

/** §3.12 DELETE /api/projects/{id}/members/{memberId} */
export function useRemoveProjectMember(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId) =>
      projectService.removeMember(projectId, memberId),
    onSuccess: () => {
      toast.success('Member removed')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to remove member'),
  })
}
