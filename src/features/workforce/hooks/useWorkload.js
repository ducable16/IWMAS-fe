import { useQuery } from '@tanstack/react-query'
import { workloadService } from '../services/workforceService'

// ── Snapshot-based hooks (existing) ───────────────────────────

export function useWorkloadTeam(enabled = true) {
  return useQuery({
    queryKey: ['workload', 'team'],
    queryFn: async () => {
      const res = await workloadService.getTeam()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map((m) => ({
        id: m.userId || m.id,
        name: m.fullName || m.name,
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
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map((m) => ({
        id: m.userId || m.id,
        name: m.fullName || m.name,
        score: m.score ?? m.workloadScore ?? 0,
      }))
    },
  })
}

export function useWorkloadKpis() {
  return useQuery({
    queryKey: ['workload', 'kpis'],
    queryFn: async () => {
      const res = await workloadService.getTeam()
      return res.data?.kpis || {
        avgWorkload: 0,
        overloaded: 0,
        underutilized: 0
      }
    },
  })
}

export function useVelocityData() {
  return useQuery({
    queryKey: ['workload', 'velocity'],
    queryFn: async () => []
  })
}

export function useSprintRisks() {
  return useQuery({
    queryKey: ['workload', 'risks'],
    queryFn: async () => []
  })
}

// ── Real-time hooks (§9.7–§9.9) ──────────────────────────────

/**
 * §9.7 GET /api/workload/projects/{projectId}/members
 * Returns team utilization for a specific project, sorted DESC by utilizationPercent.
 */
export function useProjectWorkload(projectId, weekStart, weekEnd) {
  return useQuery({
    queryKey: ['workload', 'project', projectId, weekStart, weekEnd],
    queryFn: async () => {
      const res = await workloadService.getProjectMembers(projectId, { weekStart, weekEnd })
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })
}

/**
 * §9.8 GET /api/workload/users/{userId}/realtime
 * Returns single user workload with task breakdown.
 */
export function useUserWorkloadDetail(userId, weekStart, weekEnd, enabled = true) {
  return useQuery({
    queryKey: ['workload', 'user', userId, weekStart, weekEnd],
    queryFn: async () => {
      const res = await workloadService.getUserRealtime(userId, { weekStart, weekEnd })
      return res.data ?? null
    },
    enabled: !!userId && enabled,
    staleTime: 30_000,
  })
}

/**
 * §9.9 GET /api/workload/me/realtime
 * Current user's own workload — auto-refreshes every 5 minutes + on window focus.
 */
export function useMyWorkload(weekStart, weekEnd) {
  return useQuery({
    queryKey: ['workload', 'me', weekStart, weekEnd],
    queryFn: async () => {
      const res = await workloadService.getMyRealtime({ weekStart, weekEnd })
      return res.data ?? null
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchInterval: 300_000, // 5 minutes
  })
}
