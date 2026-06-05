import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { formatEstimate } from '@/utils/date'
import type { Task, TaskListItem, TaskListResult, TaskSearchParams } from '@/types'

export type SprintBoardColumnId = 'todo' | 'inprogress' | 'review' | 'done'

export interface SprintBoardTask {
  id: string
  title: string
  priority: string
  assignee: string
  tags: string[]
  comments: number
  estimate: string
  done: boolean
}

export interface SprintBoardColumn {
  id: SprintBoardColumnId
  label: string
  dot: string
  tasks: SprintBoardTask[]
}

export type SprintBoardColumns = Record<SprintBoardColumnId, SprintBoardColumn>

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
    sprint: t.sprint || '-',
    due: t.dueDate || null,
    estimate: formatEstimate(t.estimatedHours),
    labels: t.labels || [],
    projectId: t.projectId,
    projectName: t.projectName ?? null,
    projectCode: t.projectCode ?? null,
    customFields: t.customFields || {},
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

export function useTasks(enabled = true) {
  return useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: async () => {
      const res = await taskService.getMine()
      const items = getTaskItems(res.data)
      return items.map((t) => {
        const assigneeName = t.assignee?.fullName || '?'
        return {
          id: t.id,
          title: t.title || 'Untitled',
          status: t.status ? String(t.status).toLowerCase() : 'todo',
          priority: t.priority ? String(t.priority).toLowerCase() : 'medium',
          assignee: assigneeName.substring(0, 2).toUpperCase(),
          sprint: '-',
          due: t.dueDate || '-',
          estimate: formatEstimate(t.estimatedHours),
          estimatedHours: t.estimatedHours ?? null,
          actualHours: t.actualHours ?? null,
        }
      })
    },
    enabled,
  })
}

export function useSprintBoard() {
  return useQuery<SprintBoardColumns>({
    queryKey: ['sprint-board'],
    staleTime: 15_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await taskService.getMine()
      const items = getTaskItems(res.data)
      const cols: SprintBoardColumns = {
        todo: { id: 'todo', label: 'To do', dot: 'bg-text-muted', tasks: [] },
        inprogress: { id: 'inprogress', label: 'In progress', dot: 'bg-accent', tasks: [] },
        review: { id: 'review', label: 'In review', dot: 'bg-info', tasks: [] },
        done: { id: 'done', label: 'Done', dot: 'bg-success', tasks: [] },
      }
      for (const t of items) {
        const statusLower = t.status ? String(t.status).toLowerCase() : 'todo'
        const key =
          statusLower === 'in_progress' ? 'inprogress' :
          statusLower === 'in_review' ? 'review' :
          statusLower === 'done' ? 'done' : 'todo'

        const assigneeName = t.assignee?.fullName || '?'

        cols[key].tasks.push({
          id: String(t.id),
          title: t.title || 'Untitled',
          priority: t.priority ? String(t.priority).toLowerCase() : 'medium',
          assignee: assigneeName.substring(0, 2).toUpperCase(),
          tags: [],
          comments: 0,
          estimate: formatEstimate(t.estimatedHours),
          done: key === 'done',
        })
      }
      return cols
    },
  })
}
