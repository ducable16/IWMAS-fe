import { useQuery } from '@tanstack/react-query'
import { workloadService } from '../services/workforceService'
import type { BurnoutRisk, Id, WorkloadMember } from '@/types'

interface WorkloadTeamView {
  id: Id
  name: string
  role: string
  score: number
  tasksActive: number
  hoursThisWeek: number
  skills: string[]
}

interface WorkloadKpis {
  avgWorkload: number
  overloaded: number
  underutilized: number
}

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

type WorkloadTeamResponse = WorkloadMember[] | { items?: WorkloadMember[]; kpis?: WorkloadKpis }
type BurnoutResponse = BurnoutRisk[] | { items?: BurnoutRisk[] }

function itemsFrom<T>(raw: T[] | { items?: T[] } | null | undefined): T[] {
  if (Array.isArray(raw)) return raw
  return Array.isArray(raw?.items) ? raw.items : []
}

export function useWorkloadTeam(enabled = true) {
  return useQuery<WorkloadTeamView[]>({
    queryKey: ['workload', 'team'],
    queryFn: async () => {
      const res = await workloadService.getTeam()
      const items = itemsFrom((res.data ?? []) as WorkloadTeamResponse)
      return items.map((m) => ({
        id: m.userId || m.id || '',
        name: m.fullName || m.name || '',
        role: m.role || m.title || 'Member',
        score: m.score ?? m.workloadScore ?? 0,
        tasksActive: m.activeTasks ?? 0,
        hoursThisWeek: m.hoursThisWeek ?? 0,
        skills: m.skills || [],
      }))
    },
    enabled,
  })
}

export function useBurnoutAtRisk() {
  return useQuery({
    queryKey: ['workload', 'burnout'],
    queryFn: async () => {
      const res = await workloadService.getBurnout()
      const items = itemsFrom((res.data ?? []) as BurnoutResponse)
      return items.map((m) => ({
        id: m.userId || m.id || '',
        name: m.fullName || m.name || '',
        score: m.score ?? m.workloadScore ?? 0,
      }))
    },
  })
}

export function useWorkloadKpis() {
  return useQuery<WorkloadKpis>({
    queryKey: ['workload', 'kpis'],
    queryFn: async () => {
      const res = await workloadService.getTeam()
      const raw = res.data as WorkloadTeamResponse | null | undefined
      return !Array.isArray(raw) && raw?.kpis
        ? raw.kpis
        : { avgWorkload: 0, overloaded: 0, underutilized: 0 }
    },
  })
}

export function useVelocityData() {
  return useQuery<VelocityPoint[]>({
    queryKey: ['workload', 'velocity'],
    queryFn: async () => [],
  })
}

export function useSprintRisks() {
  return useQuery<SprintRiskItem[]>({
    queryKey: ['workload', 'risks'],
    queryFn: async () => [],
  })
}

export function useProjectWorkload(
  projectId: Id | null | undefined,
  weekStart?: string,
  weekEnd?: string,
) {
  return useQuery({
    queryKey: ['workload', 'project', projectId, weekStart, weekEnd],
    queryFn: async () => {
      const res = await workloadService.getProjectMembers(projectId as Id, { weekStart, weekEnd })
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

export function useUserWorkloadDetail(
  userId: Id | null | undefined,
  weekStart?: string,
  weekEnd?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['workload', 'user', userId, weekStart, weekEnd],
    queryFn: async () => {
      const res = await workloadService.getUserRealtime(userId as Id, { weekStart, weekEnd })
      return res.data ?? null
    },
    enabled: !!userId && enabled,
    staleTime: 30_000,
  })
}

export function useMyWorkload(weekStart?: string, weekEnd?: string) {
  return useQuery({
    queryKey: ['workload', 'me', weekStart, weekEnd],
    queryFn: async () => {
      const res = await workloadService.getMyRealtime({ weekStart, weekEnd })
      return res.data ?? null
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchInterval: 300_000,
  })
}
