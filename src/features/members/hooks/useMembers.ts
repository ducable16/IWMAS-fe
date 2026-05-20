import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { ApiError, Id, MemberView, PageResponse, Project, Task, User } from '@/types'

interface MemberQueryParams {
  [key: string]: string | number | boolean | string[] | undefined
  search?: string
  role?: string
  position?: string
  active?: boolean | string
  verified?: boolean
  sortBy?: string
  sortDirection?: string
  page?: number
  size?: number
}

type PagedParams = MemberQueryParams & {
  statuses?: string[]
  priorities?: string[]
  types?: string[]
  labels?: string[]
  sprint?: string
  dueDateFrom?: string
  dueDateTo?: string
  managerId?: Id
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

function pageItems<T>(raw: PageResponse<T> | T[] | null | undefined): T[] {
  if (Array.isArray(raw)) return raw
  return Array.isArray(raw?.content) ? raw.content : []
}

export function useMembers(params: MemberQueryParams = {}) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      const res = await userService.getAll(params)
      const raw = res.data
      const items = pageItems<User>(raw)
      return {
        members: items.map(normaliseUser),
        page: raw && !Array.isArray(raw) ? raw.page ?? params.page ?? 0 : params.page ?? 0,
        size: raw && !Array.isArray(raw) ? raw.size ?? params.size ?? 20 : params.size ?? 20,
        totalElements: raw && !Array.isArray(raw) ? raw.totalElements ?? items.length : items.length,
        totalPages: raw && !Array.isArray(raw) ? raw.totalPages ?? 1 : 1,
      }
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function normaliseUser(u: Partial<User> & { name?: string } = {}): MemberView {
  return {
    id: u.id ?? '',
    fullName: u.fullName || u.name || u.email || '',
    email: u.email || '',
    phone: u.phone || '',
    position: u.position || '',
    role: u.role || 'TEAM_MEMBER',
    status: u.active === false ? 'DISABLED' : 'ACTIVE',
    lastActive: u.lastLoginAt || null,
    createdAt: u.createdAt || null,
    verified: u.verified ?? null,
    avatarUrl: u.avatarUrl || null,
    workloadScore: u.workloadScore ?? 0,
  }
}

export function useUser(id: Id | null | undefined) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const res = await userService.getById(id as Id)
      return normaliseUser(res.data ?? {})
    },
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useUserProjects(userId: Id | null | undefined, params: PagedParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['users', userId, 'projects', params],
    queryFn: async () => {
      const res = await userService.getUserProjects(userId as Id, params)
      const raw = res.data
      const items = pageItems<Project>(raw)
      return {
        projects: items,
        page: raw && !Array.isArray(raw) ? raw.page ?? params.page ?? 0 : params.page ?? 0,
        size: raw && !Array.isArray(raw) ? raw.size ?? params.size ?? 20 : params.size ?? 20,
        totalElements: raw && !Array.isArray(raw) ? raw.totalElements ?? items.length : items.length,
        totalPages: raw && !Array.isArray(raw) ? raw.totalPages ?? 1 : 1,
      }
    },
    enabled: !!userId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useUserAssignedTasks(userId: Id | null | undefined, params: PagedParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['users', userId, 'tasks', 'assigned', params],
    queryFn: async () => {
      const res = await userService.getUserAssignedTasks(userId as Id, params)
      const raw = res.data
      const items = pageItems<Task>(raw)
      return {
        tasks: items,
        page: raw && !Array.isArray(raw) ? raw.page ?? params.page ?? 0 : params.page ?? 0,
        size: raw && !Array.isArray(raw) ? raw.size ?? params.size ?? 20 : params.size ?? 20,
        totalElements: raw && !Array.isArray(raw) ? raw.totalElements ?? items.length : items.length,
        totalPages: raw && !Array.isArray(raw) ? raw.totalPages ?? 1 : 1,
      }
    },
    enabled: !!userId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useUserReportedTasks(userId: Id | null | undefined, params: PagedParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['users', userId, 'tasks', 'reported', params],
    queryFn: async () => {
      const res = await userService.getUserReportedTasks(userId as Id, params)
      const raw = res.data
      const items = pageItems<Task>(raw)
      return {
        tasks: items,
        page: raw && !Array.isArray(raw) ? raw.page ?? params.page ?? 0 : params.page ?? 0,
        size: raw && !Array.isArray(raw) ? raw.size ?? params.size ?? 20 : params.size ?? 20,
        totalElements: raw && !Array.isArray(raw) ? raw.totalElements ?? items.length : items.length,
        totalPages: raw && !Array.isArray(raw) ? raw.totalPages ?? 1 : 1,
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
    mutationFn: (file: File) => userService.uploadAvatar(file),
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to upload avatar')),
  })
}
