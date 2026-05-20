import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import type { Id, TaskListItem } from '@/types'

interface TaskCalendarParams {
  from?: string | undefined
  to?: string | undefined
  projectId?: Id | null | undefined
}

export interface TaskCalendarEntry {
  date: string
  tasks: TaskListItem[]
}

export function useTaskBoard(projectId: Id | null | undefined) {
  return useQuery({
    queryKey: ['tasks', 'board', projectId],
    queryFn: async () => {
      const res = await taskService.getBoard(projectId as Id)
      return res.data ?? {}
    },
    enabled: !!projectId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useTaskCalendar({ from, to, projectId }: TaskCalendarParams = {}) {
  return useQuery<TaskCalendarEntry[]>({
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
