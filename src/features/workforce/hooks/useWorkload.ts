import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workloadService } from '../services/workforceService'
import type {
  BurnoutRisk,
  Id,
  MemberWorkloadResponse,
  ProjectScheduleResponse,
  SchedulePreviewRequest,
  WorkloadSnapshotResponse,
} from '@/types'

// ── §9.1 Team workload snapshots ──────────────────────────────────────────────

export function useWorkloadTeam(date?: string, enabled = true) {
  return useQuery<WorkloadSnapshotResponse[]>({
    queryKey: ['workload', 'team', date],
    queryFn: async () => {
      const res = await workloadService.getTeam(date ? { date } : undefined)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled,
  })
}

// ── §9.2–§9.3 Snapshot history ────────────────────────────────────────────────

export function useMyWorkloadHistory() {
  return useQuery<WorkloadSnapshotResponse[]>({
    queryKey: ['workload', 'me', 'history'],
    queryFn: async () => {
      const res = await workloadService.getMine()
      return Array.isArray(res.data) ? res.data : []
    },
  })
}

export function useUserWorkloadHistory(userId: Id | null | undefined, enabled = true) {
  return useQuery<WorkloadSnapshotResponse[]>({
    queryKey: ['workload', 'user', userId, 'history'],
    queryFn: async () => {
      const res = await workloadService.getByUser(userId as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!userId && enabled,
  })
}

// ── §9.5–§9.6 Burnout ────────────────────────────────────────────────────────

export function useBurnoutAtRisk() {
  return useQuery({
    queryKey: ['workload', 'burnout'],
    queryFn: async () => {
      const res = await workloadService.getBurnout()
      const items = Array.isArray(res.data) ? (res.data as BurnoutRisk[]) : []
      return items.map((m) => ({
        id: m.userId || m.id || '',
        name: m.fullName || m.name || '',
        score: m.score ?? m.workloadScore ?? 0,
        riskLevel: m.riskLevel,
      }))
    },
  })
}

// ── §9.7 Project members real-time workload ───────────────────────────────────

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

// ── §9.8 User real-time workload (with task breakdown) ────────────────────────

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

// ── §9.9 My real-time workload ────────────────────────────────────────────────

export function useMyWorkload() {
  return useQuery<MemberWorkloadResponse | null>({
    queryKey: ['workload', 'me', 'realtime'],
    queryFn: async () => {
      const res = await workloadService.getMyRealtime()
      return res.data ?? null
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchInterval: 300_000,
  })
}

// ── §9.10 My saved schedule for a project ────────────────────────────────────

export function useMySchedule(projectId: Id | null | undefined) {
  return useQuery<ProjectScheduleResponse | null>({
    queryKey: ['workload', 'schedule', 'me', projectId],
    queryFn: async () => {
      const res = await workloadService.getMySchedule(projectId as Id)
      return res.data ?? null
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

// ── §9.11 EDD-optimal schedule suggestion ────────────────────────────────────

export function useSuggestSchedule(projectId: Id | null | undefined) {
  return useQuery<ProjectScheduleResponse | null>({
    queryKey: ['workload', 'schedule', 'suggest', projectId],
    queryFn: async () => {
      const res = await workloadService.suggestSchedule(projectId as Id)
      return res.data ?? null
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

// ── §9.12 Preview custom order (no persist) ───────────────────────────────────

export function usePreviewSchedule() {
  return useMutation<ProjectScheduleResponse, unknown, SchedulePreviewRequest>({
    mutationFn: async (data) => {
      const res = await workloadService.previewSchedule(data)
      return res.data as ProjectScheduleResponse
    },
  })
}

// ── §9.13 Save schedule ───────────────────────────────────────────────────────

export function useSaveSchedule() {
  const queryClient = useQueryClient()
  return useMutation<ProjectScheduleResponse, unknown, SchedulePreviewRequest>({
    mutationFn: async (data) => {
      const res = await workloadService.saveSchedule(data)
      return res.data as ProjectScheduleResponse
    },
    onSuccess: (_, variables) => {
      // Invalidate the saved schedule query so it re-fetches with savedOrder: true
      queryClient.invalidateQueries({ queryKey: ['workload', 'schedule', 'me', variables.projectId] })
    },
  })
}

// ── Legacy stubs (kept for backward compat — data not yet available from API) ──

interface VelocityPoint {
  sprint: string
  planned?: number | undefined
  actual?: number | undefined
  forecast?: number | undefined
}

interface SprintRiskItem {
  level: 'critical' | 'high' | 'medium' | 'low'
  title: string
  desc: string
  impact: string
  effort: string
}

interface WorkloadKpis {
  avgWorkload: number
  overloaded: number
  underutilized: number
}

/** @deprecated Sprint velocity is not yet supported by the API — always returns []. */
export function useVelocityData() {
  return useQuery<VelocityPoint[]>({
    queryKey: ['workload', 'velocity'],
    queryFn: async () => [],
  })
}

/** @deprecated Sprint risks are not yet supported by the API — always returns []. */
export function useSprintRisks() {
  return useQuery<SprintRiskItem[]>({
    queryKey: ['workload', 'risks'],
    queryFn: async () => [],
  })
}

/** @deprecated Use useWorkloadTeam directly for snapshot data. */
export function useWorkloadKpis() {
  return useQuery<WorkloadKpis>({
    queryKey: ['workload', 'kpis'],
    queryFn: async () => ({ avgWorkload: 0, overloaded: 0, underutilized: 0 }),
  })
}
