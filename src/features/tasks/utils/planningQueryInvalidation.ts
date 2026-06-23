import type { QueryClient } from '@tanstack/react-query'

/** Task estimates, assignment and lifecycle now directly drive workload and ATC. */
export function invalidateTaskPlanningQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['tasks', 'unestimated'] })
  queryClient.invalidateQueries({ queryKey: ['tasks', 'unassigned'] })
  queryClient.invalidateQueries({ queryKey: ['workload'] })
  queryClient.invalidateQueries({ queryKey: ['arrangement'] })
}
