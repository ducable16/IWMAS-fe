import type { TaskStatus } from '@/constants/enums'
import type { Id, TaskListItem } from '@/types'

export const COLUMN_CONFIG = [
  { key: 'TODO', label: 'To Do', dot: 'bg-text-muted' },
  { key: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-accent' },
  { key: 'IN_REVIEW', label: 'In Review', dot: 'bg-info' },
  { key: 'DONE', label: 'Done', dot: 'bg-success' },
  { key: 'CANCELLED', label: 'Cancelled', dot: 'bg-danger' },
] as const

export type BoardStatus = typeof COLUMN_CONFIG[number]['key']
export type GroupedTasks = Record<TaskStatus, TaskListItem[]>

export interface DraggingTask {
  taskId: string
  fromCol: BoardStatus
}

export interface UpdateStatusVariables {
  taskId: Id
  status: BoardStatus
}
