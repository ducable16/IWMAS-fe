import type { Id, QueryValue } from './api'
import type { TaskPriority, TaskStatus, TaskType } from '@/constants/enums'
import type { UserPublicView } from './user'

export interface Task {
  id: Id
  title: string
  description?: string | null
  status?: TaskStatus | string | undefined
  priority?: TaskPriority | string | undefined
  type?: TaskType | string | undefined
  projectId?: Id | undefined
  assignee?: UserPublicView | null | undefined
  reporter?: UserPublicView | null | undefined
  assigneeId?: Id | null | undefined
  reporterId?: Id | null | undefined
  sprint?: string | null
  dueDate?: string | null
  startDate?: string | null
  estimatedHours?: number | null
  actualHours?: number | null
  labels?: string[] | undefined
  comments?: TaskComment[] | undefined
  skillRequirements?: TaskSkillRequirement[] | undefined
  customFields?: Record<string, unknown> | undefined
  projectName?: string | null | undefined
  createdAt?: string | null
  updatedAt?: string | null
  completedAt?: string | null
}

export interface TaskSkillRequirement {
  id: Id
  skillId: Id           // §4.6 — the skill being required
  skillName?: string | undefined
  minimumLevel?: string | undefined
  isRequired?: boolean | undefined
}

export interface TaskListItem {
  id: Id
  title: string
  status: string
  priority: string
  type: string
  assignee: string
  assigneeFull?: string | undefined
  assigneeEmail?: string | undefined
  assigneeId?: Id | null | undefined
  reporterFull?: string | undefined
  reporterId?: Id | null | undefined
  sprint: string
  due: string | null
  estimate: string
  labels: string[]
  projectId?: Id | undefined
  projectName?: string | null | undefined
  customFields?: Record<string, unknown> | undefined
  startDate?: string | null | undefined
  createdAt?: string | null | undefined
}

export interface TaskSearchParams {
  search?: string | undefined
  projectId?: Id | null | undefined
  skillId?: Id | null | undefined
  statuses?: string[] | undefined
  priorities?: string[] | undefined
  types?: string[] | undefined
  labels?: string[] | undefined
  sprint?: string | null | undefined
  assigneeId?: Id | null | undefined
  reporterId?: Id | null | undefined
  dueDateFrom?: string | null | undefined
  dueDateTo?: string | null | undefined
  sortBy?: string | undefined
  sortDirection?: string | undefined
  page?: number | undefined
  size?: number | undefined
  customFields?: Record<string, QueryValue> | undefined
}

export interface TaskFilters {
  search: string
  projectId: Id | null
  skillId: Id | null
  statuses: string[]
  priorities: string[]
  types: string[]
  assigneeId: Id | null
  reporterId: Id | null
  labels: string[]
  sprint: string | null
  dueDateFrom: string | null
  dueDateTo: string | null
  customFields: Record<string, QueryValue>
  sortBy: string
  sortDirection: 'ASC' | 'DESC'
  page: number
  size: number
}

export type TaskFilterKey = keyof TaskFilters
export type TaskFilterChange = <K extends TaskFilterKey>(key: K, value: TaskFilters[K]) => void

export interface TaskListResult {
  tasks: TaskListItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface TaskComment {
  id: Id
  content: string
  mentions?: Record<string, UserPublicView> | undefined
  author?: UserPublicView | undefined
  createdAt?: string | undefined
  updatedAt?: string | undefined
}

export interface TaskAttachment {
  id: Id
  fileName?: string | undefined
  url?: string | undefined
  contentType?: string | undefined
  size?: number | undefined
  uploadedBy?: UserPublicView | Id | undefined
  createdAt?: string | undefined
}

export interface TaskSkillRequirementRequest {
  skillId: Id
  minimumLevel?: string | undefined
  isRequired?: boolean | undefined
}

export interface CreateTaskRequest {
  projectId?: Id | null | undefined
  title: string
  description?: string | null | undefined
  status?: TaskStatus | string | undefined
  priority?: TaskPriority | string | undefined
  type?: TaskType | string | undefined
  estimatedHours?: number | null | undefined
  actualHours?: number | null | undefined
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
  assigneeId?: Id | null | undefined
  sprint?: string | null | undefined
  labels?: string[] | undefined
  skillRequirements?: TaskSkillRequirementRequest[] | undefined
  customFields?: Record<string, unknown> | undefined
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>

export interface UpdateTaskStatusRequest {
  status: TaskStatus | string
  note?: string | null | undefined
}

export interface UpdateTaskDatesRequest {
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
}

export interface TaskCommentRequest {
  content: string
}

export interface TimeLogRequest {
  taskId: Id
  logDate: string             // §5.3: YYYY-MM-DD
  hoursSpent: number          // §5.3: 0.1–24.0
  remainingHours?: number     // §5.3: member-reported remaining effort (feeds workload v3 simulation)
  description?: string        // §5.3: free text
}

// §5 TimeLogResponse — returned by GET/POST/PUT time-log endpoints
export interface TimeLogResponse {
  id: Id
  taskId: Id
  taskTitle?: string | null
  userId: Id
  logDate: string
  hoursSpent: number
  remainingHours?: number | null
  description?: string | null
  createdAt?: string
}

// §4.12 TaskStatusHistory — returned by GET /api/tasks/{id}/history
export interface TaskStatusHistory {
  id: Id
  oldStatus: string | null
  newStatus: string
  changedBy: Id
  note?: string | null
  changedAt: string
}
