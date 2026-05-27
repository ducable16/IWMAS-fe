import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService } from '../services/projectService'
import type {
  ApiError,
  CreateProjectRequest,
  Id,
  PageResponse,
  Project,
  ProjectDocument,
  ProjectMember,
  ProjectMemberRequest,
  UpdateProjectRequest,
  User,
} from '@/types'

interface ProjectQueryParams {
  search?: string
  statuses?: string[]
  managerId?: Id | null
  startDateFrom?: string | null
  startDateTo?: string | null
  endDateFrom?: string | null
  endDateTo?: string | null
  sortBy?: string
  sortDirection?: string
  page?: number
  size?: number
}

interface EffortRemainingParams {
  startDate?: string | undefined
  endDate?: string | undefined
  detail?: boolean | undefined
}

interface CreateProjectVariables {
  data: CreateProjectRequest
  managerEffortPercent?: number
}

interface UpdateProjectVariables {
  id: Id
  data: UpdateProjectRequest
}

interface UpdateProjectMemberVariables {
  memberId: Id
  data: ProjectMemberRequest
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

function pageItems<T>(raw: PageResponse<T> | T[] | null | undefined): T[] {
  if (Array.isArray(raw)) return raw
  return Array.isArray(raw?.content) ? raw.content : []
}

function pageMeta<T>(raw: PageResponse<T> | T[] | null | undefined, params: ProjectQueryParams, itemCount: number) {
  return {
    page: raw && !Array.isArray(raw) ? raw.page ?? params.page ?? 0 : params.page ?? 0,
    size: raw && !Array.isArray(raw) ? raw.size ?? params.size ?? 20 : params.size ?? 20,
    totalElements: raw && !Array.isArray(raw) ? raw.totalElements ?? itemCount : itemCount,
    totalPages: raw && !Array.isArray(raw) ? raw.totalPages ?? 1 : 1,
  }
}

export function useProjects(params: ProjectQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const res = await projectService.getAll(params)
      const raw = res.data
      const items = pageItems<Project>(raw)
      return {
        projects: items,
        ...pageMeta(raw, params, items.length),
      }
    },
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })
}

export function useMyProjects(params: ProjectQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['projects', 'my', params],
    queryFn: async () => {
      const res = await projectService.getMy(params)
      const raw = res.data
      const items = pageItems<Project>(raw)
      return {
        projects: items,
        ...pageMeta(raw, params, items.length),
      }
    },
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })
}

export function useProject(id: Id | null | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const res = await projectService.getById(id as Id)
      return res.data ?? null
    },
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useProjectMembers(projectId: Id | null | undefined) {
  return useQuery<ProjectMember[]>({
    queryKey: ['projects', projectId, 'members'],
    queryFn: async () => {
      const res = await projectService.getMembers(projectId as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

export function useProjectDocuments(projectId: Id | null | undefined) {
  return useQuery<ProjectDocument[]>({
    queryKey: ['projects', projectId, 'documents'],
    queryFn: async () => {
      const res = await projectService.getDocuments(projectId as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

export function useProjectMemberSearch(projectId: Id | null | undefined, q = '', size = 10, enabled = true) {
  return useQuery<User[]>({
    queryKey: ['projects', projectId, 'members', 'search', q, size],
    queryFn: async () => {
      const res = await projectService.searchMembers(projectId as Id, q, size)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useSuggestProjectCode(name: string | null | undefined, enabled = true) {
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

export function useUserEffortRemaining(
  userId: Id | null | undefined,
  params: EffortRemainingParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['projects', 'effort-remaining', userId, params],
    queryFn: async () => {
      const res = await projectService.getUserEffortRemaining(userId as Id, params)
      return res.data ?? null
    },
    enabled: !!userId && enabled,
    staleTime: 30_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data }: CreateProjectVariables) => projectService.create(data),
    onSuccess: async (res, variables) => {
      toast.success('Project created')
      const data = variables?.data
      const managerEffortPercent = Number(variables?.managerEffortPercent) || 0
      const projectId = res?.data?.id
      if (projectId && data?.managerId) {
        try {
          await projectService.addMember(projectId, {
            userId: data.managerId,
            roleInProject: 'LEAD',
            allocatedEffortPercent: managerEffortPercent,
            joinDate: data.startDate || undefined,
          })
        } catch (err) {
          const code = (err as ApiError | undefined)?.code
          if (code !== 4004) {
            toast.error(getErrorMessage(err, 'Failed to add manager as project member'))
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to create project')),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: UpdateProjectVariables) => projectService.update(id, data),
    onSuccess: (_res, { id }) => {
      toast.success('Project updated')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to update project')),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => projectService.remove(id),
    onSuccess: () => {
      toast.success('Project deleted')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to delete project')),
  })
}

export function useAddProjectMember(projectId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectMemberRequest) => projectService.addMember(projectId as Id, data),
    onSuccess: () => {
      toast.success('Member added')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err: unknown) => {
      const code = (err as ApiError | undefined)?.code
      if (code === 4004) toast.error('This user is already a member of this project.')
      else if (code === 4005) toast.error("Adding this allocation would push the user's total above 100%.")
      else if (code === 4008) toast.error('Effort allocation (%) is required when adding a member.')
      else toast.error(getErrorMessage(err, 'Failed to add member'))
    },
  })
}

export function useUpdateProjectMember(projectId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, data }: UpdateProjectMemberVariables) =>
      projectService.updateMember(projectId as Id, memberId, data),
    onSuccess: () => {
      toast.success('Member updated')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err: unknown) => {
      const code = (err as ApiError | undefined)?.code
      if (code === 4005) toast.error("Updated allocation would push the user's total above 100%.")
      else if (code === 4008) toast.error('Effort allocation (%) is required when updating a member.')
      else toast.error(getErrorMessage(err, 'Failed to update member'))
    },
  })
}

export function useRemoveProjectMember(projectId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: Id) => projectService.removeMember(projectId as Id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to remove member')),
  })
}

export function useUploadProjectDocument(projectId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => projectService.uploadDocument(projectId as Id, file),
    onSuccess: () => {
      toast.success('Document uploaded')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to upload document')),
  })
}

export function useDeleteProjectDocument(projectId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: Id) => projectService.deleteDocument(projectId as Id, documentId),
    onSuccess: () => {
      toast.success('Document deleted')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to delete document')),
  })
}
