import { useModeData } from '@/lib/useModeData'
import {
  DASHBOARD_STATS,
  AI_INSIGHT,
  RECENT_ACTIVITIES,
  SPRINTS_OVERVIEW,
} from '@/mocks/dashboard'

export function useDashboardStats() {
  return useModeData({
    key: ['dashboard', 'stats'],
    mockData: DASHBOARD_STATS,
    queryFn: async () => DASHBOARD_STATS,
  })
}

export function useAiInsight() {
  return useModeData({
    key: ['dashboard', 'ai-insight'],
    mockData: AI_INSIGHT,
    queryFn: async () => AI_INSIGHT,
  })
}

export function useRecentActivity() {
  return useModeData({
    key: ['dashboard', 'recent-activity'],
    mockData: RECENT_ACTIVITIES,
    queryFn: async () => RECENT_ACTIVITIES,
  })
}

export function useSprintSummary() {
  return useModeData({
    key: ['dashboard', 'sprint-summary'],
    mockData: SPRINTS_OVERVIEW,
    queryFn: async () => SPRINTS_OVERVIEW,
  })
}
