import { useQuery } from '@tanstack/react-query'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => ({
      activeProjects: 0,
      tasksCompleted: 0,
      teamMembers: 0,
      upcomingDeadlines: 0
    }),
  })
}

export function useAiInsight() {
  return useQuery({
    queryKey: ['dashboard', 'ai-insight'],
    queryFn: async () => 'Your team is performing well. No critical sprint risks detected.',
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: async () => [],
  })
}

export function useSprintSummary() {
  return useQuery({
    queryKey: ['dashboard', 'sprint-summary'],
    queryFn: async () => [],
  })
}
