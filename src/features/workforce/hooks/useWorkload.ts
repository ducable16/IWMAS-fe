import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { arrangementService, workloadService } from '../services/workforceService'
import { useAuthStore } from '@/features/auth/store/authStore'
import type {
  ArrangementQueryParams,
  ArrangeResponse,
  Id,
  MemberWorkloadResponse,
  NextTaskResponse,
  ProjectScheduleResponse,
  SchedulePreviewRequest,
} from '@/types'

// ── §9.1 Project members real-time workload ──────────────────────────────────

export function useProjectWorkload(
  projectId: Id | null | undefined,
) {
  return useQuery<MemberWorkloadResponse[]>({
    queryKey: ['workload', 'project', projectId],
    queryFn: async () => {
      const res = await workloadService.getProjectMembers(projectId as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

// ── §9.2 User real-time workload (with task breakdown) ──────────────────────

export function useUserWorkloadDetail(
  userId: Id | null | undefined,
  enabled = true,
) {
  return useQuery<MemberWorkloadResponse | null>({
    queryKey: ['workload', 'user', userId, 'realtime'],
    queryFn: async () => {
      const res = await workloadService.getUserRealtime(userId as Id)
      return res.data ?? null
    },
    enabled: !!userId && enabled,
    staleTime: 30_000,
  })
}

// ── §9.2.1 Current PM's team workload (with task breakdown) ─────────────────

export function useMyTeamWorkload() {
  const user = useAuthStore((state) => state.user)

  return useQuery<MemberWorkloadResponse[]>({
    queryKey: ['workload', 'my-team', 'realtime', user?.id],
    queryFn: async () => {
      const res = await workloadService.getMyTeamRealtime()
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: user?.role === 'PROJECT_MANAGER',
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

// ── §9.3 My real-time workload ──────────────────────────────────────────────

export function useMyWorkload() {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery<MemberWorkloadResponse | null>({
    queryKey: ['workload', 'me', 'realtime', userId],
    queryFn: async () => {
      const res = await workloadService.getMyRealtime()
      return res.data ?? null
    },
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchInterval: 300_000,
  })
}

// ── §9.4 My saved schedule for a project ────────────────────────────────────

export function useMySchedule(projectId: Id | null | undefined, enabled = true) {
  return useQuery<ProjectScheduleResponse | null>({
    queryKey: ['workload', 'schedule', 'me', projectId],
    queryFn: async () => {
      const res = await workloadService.getMySchedule(projectId as Id)
      return res.data ?? null
    },
    enabled: !!projectId && enabled,
    staleTime: 30_000,
  })
}

// ── §9.5 ATC schedule suggestion ────────────────────────────────────────────

export function useSuggestSchedule(projectId: Id | null | undefined, enabled = true) {
  return useQuery<ProjectScheduleResponse | null>({
    queryKey: ['workload', 'schedule', 'suggest', projectId],
    queryFn: async () => {
      const res = await workloadService.suggestSchedule(projectId as Id)
      return res.data ?? null
    },
    enabled: !!projectId && enabled,
    staleTime: 30_000,
  })
}

// ── §9.6 Preview custom order (no persist) ──────────────────────────────────

export function usePreviewSchedule() {
  return useMutation<ProjectScheduleResponse, unknown, SchedulePreviewRequest>({
    mutationFn: async (data) => {
      const res = await workloadService.previewSchedule(data)
      return res.data as ProjectScheduleResponse
    },
  })
}

// ── §9.7 Save schedule ───────────────────────────────────────────────────────

export function useSaveSchedule() {
  const queryClient = useQueryClient()
  return useMutation<ProjectScheduleResponse, unknown, SchedulePreviewRequest>({
    mutationFn: async (data) => {
      const res = await workloadService.saveSchedule(data)
      return res.data as ProjectScheduleResponse
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'schedule', 'me', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['workload', 'schedule', 'suggest', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['workload', 'me', 'realtime'] })
      queryClient.invalidateQueries({ queryKey: ['workload', 'project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['arrangement'] })
    },
  })
}

export function useResetSchedule() {
  const queryClient = useQueryClient()
  return useMutation<ProjectScheduleResponse, unknown, Id>({
    mutationFn: async (projectId) => {
      const res = await workloadService.resetSchedule(projectId)
      return res.data as ProjectScheduleResponse
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['workload', 'schedule', 'me', projectId] })
      queryClient.invalidateQueries({ queryKey: ['workload', 'schedule', 'suggest', projectId] })
      queryClient.invalidateQueries({ queryKey: ['workload', 'me', 'realtime'] })
      queryClient.invalidateQueries({ queryKey: ['workload', 'project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['arrangement'] })
    },
  })
}

// ── Task arrangement (§16) ───────────────────────────────────────────────────

export function useArrangeLane(
  projectId: Id | null | undefined,
  assigneeId: Id | null | undefined,
  params?: ArrangementQueryParams,
  enabled = true,
) {
  return useQuery<ArrangeResponse | null>({
    queryKey: ['arrangement', 'lane', projectId, assigneeId, params],
    queryFn: async () => {
      const res = await arrangementService.arrangeLane(projectId as Id, assigneeId as Id, params)
      return res.data ?? null
    },
    enabled: !!projectId && !!assigneeId && enabled,
    staleTime: 30_000,
  })
}

export function useLaneNextTask(
  projectId: Id | null | undefined,
  assigneeId: Id | null | undefined,
  k?: number,
  enabled = true,
) {
  return useQuery<NextTaskResponse | null>({
    queryKey: ['arrangement', 'lane', projectId, assigneeId, 'next', k],
    queryFn: async () => {
      const res = await arrangementService.getLaneNextTask(
        projectId as Id,
        assigneeId as Id,
        k == null ? undefined : { k },
      )
      return res.data ?? null
    },
    enabled: !!projectId && !!assigneeId && enabled,
    staleTime: 30_000,
  })
}

export function useArrangeMyLane(
  projectId: Id | null | undefined,
  params?: ArrangementQueryParams,
  enabled = true,
) {
  return useQuery<ArrangeResponse | null>({
    queryKey: ['arrangement', 'me', projectId, params],
    queryFn: async () => {
      const res = await arrangementService.arrangeMyLane(projectId as Id, params)
      return res.data ?? null
    },
    enabled: !!projectId && enabled,
    staleTime: 30_000,
  })
}

export function useMyNextTask(
  projectId: Id | null | undefined,
  k?: number,
  enabled = true,
) {
  return useQuery<NextTaskResponse | null>({
    queryKey: ['arrangement', 'me', projectId, 'next', k],
    queryFn: async () => {
      const res = await arrangementService.getMyNextTask(
        projectId as Id,
        k == null ? undefined : { k },
      )
      return res.data ?? null
    },
    enabled: !!projectId && enabled,
    staleTime: 30_000,
  })
}
