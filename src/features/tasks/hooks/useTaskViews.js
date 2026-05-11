import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'

/**
 * §4.4 GET /api/tasks/board
 * Returns tasks grouped into Kanban columns by status.
 * Response: { projectId, columns: [{ status, displayName, tasks[], count }] }
 */
export function useTaskBoard(projectId) {
  return useQuery({
    queryKey: ['tasks', 'board', projectId],
    queryFn: async () => {
      const res = await taskService.getBoard(projectId)
      return res.data ?? {}
    },
    enabled: !!projectId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

/**
 * §4.5 GET /api/tasks/calendar
 * Returns tasks grouped by dueDate for a date range.
 * Response: [{ date, tasks[], count }]
 * @param {{ from: string, to: string, projectId?: number }} params
 */
export function useTaskCalendar({ from, to, projectId } = {}) {
  return useQuery({
    queryKey: ['tasks', 'calendar', { from, to, projectId }],
    queryFn: async () => {
      const res = await taskService.getCalendar({ from, to, projectId })
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!from && !!to,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
