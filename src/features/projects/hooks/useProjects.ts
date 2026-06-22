import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectService, type ProjectMemberSearchParams } from '../services/projectService'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getErrorMessage, getApiErrorCode } from '@/utils/apiError'
import {
  ERR_CREATE_PROJECT,
  ERR_UPDATE_PROJECT,
  ERR_DELETE_PROJECT,
  ERR_CHANGE_MANAGER,
  ERR_ADD_MEMBER,
  ERR_UPDATE_MEMBER,
  ERR_REMOVE_MEMBER,
  ERR_MANAGER_UNCHANGED,
  ERR_UPLOAD_DOCUMENT,
  ERR_DELETE_DOCUMENT,
  ERR_MEMBER_ALREADY_EXISTS,
  ERR_ALLOC_EXCEED_CREATE,
  ERR_ALLOC_EXCEED_ADD,
  ERR_ALLOC_EXCEED_UPDATE,
  ERR_ALLOC_REQUIRED_PM,
  ERR_ALLOC_REQUIRED_ADD,
  ERR_ALLOC_REQUIRED_UPDATE,
} from '@/utils/errorMessages'
import { ERROR_CODES } from '@/constants/errorCodes'
import type {
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
}

interface UpdateProjectVariables {
  id: Id
  data: UpdateProjectRequest
}

interface UpdateProjectMemberVariables {
  memberId: Id
  data: ProjectMemberRequest
}

interface ChangeManagerVariables {
  id: Id
  data: {
    newManagerId: Id
    managerAllocationPercent: number
  }
}

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

export function useMyManagedProjectMembers(enabled = true) {
  const user = useAuthStore((state) => state.user)

  return useQuery<User[]>({
    queryKey: ['projects', 'my', 'members', user?.id],
    queryFn: async () => {
      const res = await projectService.getMyManagedMembers()
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: user?.role === 'PROJECT_MANAGER' && enabled,
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

export function useProjectMemberSearch(
  projectId: Id | null | undefined,
  params: ProjectMemberSearchParams = {},
  enabled = true,
) {
  const q = params.q ?? ''
  const size = params.size ?? 10
  const requiredSkills = params.requiredSkills
  const role = params.role
  return useQuery<User[]>({
    queryKey: ['projects', projectId, 'members', 'search', q, size, requiredSkills, role],
    queryFn: async () => {
      const res = await projectService.searchMembers(projectId as Id, {
        q,
        size,
        requiredSkills,
        role,
      })
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
    onSuccess: () => {
      toast.success('Project created')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (err: unknown) => {
      const code = getApiErrorCode(err)
      if (code === ERROR_CODES.PROJECT_ALLOC_EXCEED)   toast.error(ERR_ALLOC_EXCEED_CREATE)
      else if (code === ERROR_CODES.PROJECT_EFFORT_REQUIRED) toast.error(ERR_ALLOC_REQUIRED_PM)
      else toast.error(getErrorMessage(err, ERR_CREATE_PROJECT))
    },
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPDATE_PROJECT)),
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_DELETE_PROJECT)),
  })
}

export function useChangeProjectManager() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: ChangeManagerVariables) => projectService.changeManager(id, data),
    onSuccess: (_res, { id }) => {
      toast.success('Project manager changed')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      queryClient.invalidateQueries({ queryKey: ['projects', id, 'members'] })
    },
    onError: (err: unknown) => {
      const code = getApiErrorCode(err)
      if (code === ERROR_CODES.PROJECT_MANAGER_UNCHANGED)    toast.error(ERR_MANAGER_UNCHANGED)
      else if (code === ERROR_CODES.PROJECT_MEMBER_EXISTS)   toast.error(ERR_MEMBER_ALREADY_EXISTS)
      else if (code === ERROR_CODES.PROJECT_ALLOC_EXCEED)    toast.error(ERR_ALLOC_EXCEED_UPDATE)
      else if (code === ERROR_CODES.PROJECT_EFFORT_REQUIRED) toast.error(ERR_ALLOC_REQUIRED_PM)
      else toast.error(getErrorMessage(err, ERR_CHANGE_MANAGER))
    },
  })
}

export function useAddProjectMember(projectId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectMemberRequest) => projectService.addMember(projectId as Id, data),
    onSuccess: () => {
      toast.success('Member added')
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['projects', 'my', 'members'] })
    },
    onError: (err: unknown) => {
      const code = getApiErrorCode(err)
      if (code === ERROR_CODES.PROJECT_MEMBER_EXISTS)      toast.error(ERR_MEMBER_ALREADY_EXISTS)
      else if (code === ERROR_CODES.PROJECT_ALLOC_EXCEED)  toast.error(ERR_ALLOC_EXCEED_ADD)
      else if (code === ERROR_CODES.PROJECT_EFFORT_REQUIRED) toast.error(ERR_ALLOC_REQUIRED_ADD)
      else toast.error(getErrorMessage(err, ERR_ADD_MEMBER))
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
      const code = getApiErrorCode(err)
      if (code === ERROR_CODES.PROJECT_ALLOC_EXCEED)         toast.error(ERR_ALLOC_EXCEED_UPDATE)
      else if (code === ERROR_CODES.PROJECT_EFFORT_REQUIRED) toast.error(ERR_ALLOC_REQUIRED_UPDATE)
      else toast.error(getErrorMessage(err, ERR_UPDATE_MEMBER))
    },
  })
}

export function useRemoveProjectMember(projectId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: Id) => projectService.removeMember(projectId as Id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['projects', 'my', 'members'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['workload'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_REMOVE_MEMBER)),
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPLOAD_DOCUMENT)),
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_DELETE_DOCUMENT)),
  })
}
