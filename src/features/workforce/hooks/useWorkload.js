import { useQuery } from '@tanstack/react-query'
import { workloadService } from '../services/workforceService'

export function useWorkloadTeam() {
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
