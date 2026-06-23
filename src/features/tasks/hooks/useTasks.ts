import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { formatEstimate } from '@/utils/date'
import type { Id, Task, TaskListItem, TaskListResult, TaskSearchParams } from '@/types'

function getTaskItems(raw: unknown): Task[] {
  if (Array.isArray(raw)) return raw as Task[]
  if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)) {
    return (raw as { items: Task[] }).items
  }
  if (raw && typeof raw === 'object' && Array.isArray((raw as { content?: unknown }).content)) {
    return (raw as { content: Task[] }).content
  }
  return []
}

function normaliseTask(t: Task): TaskListItem {
  const assigneeName = t.assignee?.fullName || t.assignee?.email || '?'
  const reporterName = t.reporter?.fullName || t.reporter?.email || '?'
  return {
    id: t.id,
    title: t.title || 'Untitled',
    status: t.status ? String(t.status).toUpperCase() : 'TODO',
    priority: t.priority ? String(t.priority).toUpperCase() : 'MEDIUM',
    type: String(t.type || 'FEATURE'),
    assignee: assigneeName.substring(0, 2).toUpperCase(),
    assigneeFull: assigneeName,
    assigneeEmail: t.assignee?.email || '-',
    assigneeId: t.assignee?.id ?? null,
    reporterFull: reporterName,
    reporterId: t.reporter?.id ?? null,
    due: t.dueDate || null,
    estimate: formatEstimate(t.estimatedHours),
    projectId: t.projectId,
    projectName: t.projectName ?? null,
    projectCode: t.projectCode ?? null,
    startDate: t.startDate || null,
    createdAt: t.createdAt || null,
  }
}

export function useSearchTasks(params: TaskSearchParams = {}, enabled = true) {
  return useQuery<TaskListResult>({
    queryKey: ['tasks', 'search', params],
    queryFn: async () => {
      const res = await taskService.search(params)
      const raw = res.data ?? {}
      const items = getTaskItems(raw)
      const pageRaw = raw as Partial<TaskListResult>
      return {
        tasks: items.map(normaliseTask),
        page: pageRaw.page ?? params.page ?? 0,
        size: pageRaw.size ?? params.size ?? 20,
        totalElements: pageRaw.totalElements ?? items.length,
        totalPages: pageRaw.totalPages ?? 1,
      }
    },
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

/** §4.20 — tasks without an estimate in projects managed by the current PM. */
export function useUnestimatedTasks(
  projectId?: Id | null,
  enabled = true,
) {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'unestimated', projectId ?? null],
    queryFn: async () => {
      const res = await taskService.getUnestimated(projectId)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

/** §4.21 — tasks without an assignee in projects managed by the current PM. */
export function useUnassignedTasks(
  projectId?: Id | null,
  enabled = true,
) {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'unassigned', projectId ?? null],
    queryFn: async () => {
      const res = await taskService.getUnassigned(projectId)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
