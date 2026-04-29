import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService } from '../services/projectService'

/**
 * §3.1 GET /api/projects — all projects (ADMIN / PROJECT_MANAGER)
 * Supports optional status filter: PLANNING | IN_PROGRESS | ON_HOLD | COMPLETED | CANCELLED
 */
export function useProjects(params = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const res = await projectService.getAll(params)
      // §3.1: API returns a plain array
      return Array.isArray(res.data) ? res.data : []
    },
    staleTime: 60_000,
  })
}

/**
 * §3.2 GET /api/projects/my — projects the current user belongs to
 */
export function useMyProjects() {
  return useQuery({
    queryKey: ['projects', 'my'],
    queryFn: async () => {
      const res = await projectService.getMy()
      return Array.isArray(res.data) ? res.data : []
    },
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
 * Returns ProjectMemberResponse[] with shape:
 *   { id, projectId, userId, userFullName, roleInProject, allocatedEffortPercent, joinDate, leaveDate, note }
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
 * §3.4 POST /api/projects — create project
 */
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

/**
 * §3.5 PUT /api/projects/{id} — update project
 */
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

/**
 * §3.6 DELETE /api/projects/{id} — delete project
 */
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
 * §3.8 POST /api/projects/{id}/members — add member
 */
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

/**
 * §3.9 PUT /api/projects/{id}/members/{memberId} — update member
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
    onError: (err) => toast.error(err?.message || 'Failed to update member'),
  })
}

/**
 * §3.10 DELETE /api/projects/{id}/members/{memberId} — remove member
 */
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
