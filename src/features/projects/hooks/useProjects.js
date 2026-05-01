import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService } from '../services/projectService'

/**
 * §3.1 GET /api/projects — all projects (ADMIN / PROJECT_MANAGER)
 * Returns paginated { content, page, size, totalElements, totalPages }
 *
 * Supported params: search, statuses[], priorities[], managerId,
 *   startDateFrom, startDateTo, endDateFrom, endDateTo,
 *   sortBy, sortDirection, page, size
 */
export function useProjects(params = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const res = await projectService.getAll(params)
      const raw = res.data ?? {}
      const items = Array.isArray(raw)
        ? raw                           // fallback if server returns plain array
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
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })
}

/**
 * §3.2 GET /api/projects/my — current user's projects (all roles)
 * Same paginated response shape and params as §3.1
 */
export function useMyProjects(params = {}) {
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

// ── Mutations ────────────────────────────────────────────────

/** §3.4 POST /api/projects */
export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => projectService.create(data),
    onSuccess: () => {
      toast.success('Project created')
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

/** §3.8 POST /api/projects/{id}/members */
export function useAddProjectMember(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => projectService.addMember(projectId, data),
    onSuccess: () => {
      toast.success('Member added')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to add member'),
  })
}

/** §3.9 PUT /api/projects/{id}/members/{memberId} */
export function useUpdateProjectMember(projectId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, data }) =>
      projectService.updateMember(projectId, memberId, data),
    onSuccess: () => {
      toast.success('Member updated')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to update member'),
  })
}

/** §3.10 DELETE /api/projects/{id}/members/{memberId} */
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
