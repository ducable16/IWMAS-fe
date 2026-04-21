import { useModeData } from '@/lib/useModeData'
import { workloadService } from '../services/workforceService'
import {
  WORKLOAD_MEMBERS,
  WORKLOAD_AT_RISK,
  WORKLOAD_KPIS,
  VELOCITY_DATA,
  SPRINT_RISKS,
} from '@/mocks/workforce'

export function useWorkloadTeam() {
  return useModeData({
    key: ['workload', 'team'],
    mockData: WORKLOAD_MEMBERS,
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
  return useModeData({
    key: ['workload', 'burnout'],
    mockData: WORKLOAD_AT_RISK,
    queryFn: async () => {
      const res = await workloadService.getBurnout()
      const items = Array.isArray(res.data) ? res.data : res.data?.items || []
      return items.map((m) => ({
        name: m.fullName || m.name,
        score: m.score ?? m.workloadScore ?? 0,
      }))
    },
  })
}

export function useWorkloadKpis() {
  return useModeData({
    key: ['workload', 'kpis'],
    mockData: WORKLOAD_KPIS,
    queryFn: async () => {
      const res = await workloadService.getTeam()
      return res.data?.kpis || WORKLOAD_KPIS
    },
  })
}

export function useVelocityData() {
  return useModeData({
    key: ['workload', 'velocity'],
    mockData: VELOCITY_DATA,
    queryFn: async () => VELOCITY_DATA,
  })
}

export function useSprintRisks() {
  return useModeData({
    key: ['workload', 'risks'],
    mockData: SPRINT_RISKS,
    queryFn: async () => SPRINT_RISKS,
  })
}
