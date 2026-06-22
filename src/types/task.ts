import type { Id } from './api'
import type { SkillLevel, TaskActivityType, TaskPriority, TaskStatus, TaskType } from '@/constants/enums'
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
  dueDate?: string | null
  startDate?: string | null
  estimatedHours?: number | null
  comments?: TaskComment[] | undefined
  skillRequirements?: TaskSkillRequirement[] | undefined
  projectName?: string | null | undefined
  projectCode?: string | null | undefined
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
  due: string | null
  estimate: string
  projectId?: Id | undefined
  projectName?: string | null | undefined
  projectCode?: string | null | undefined
  startDate?: string | null | undefined
  createdAt?: string | null | undefined
}

export interface TaskSearchParams {
  search?: string | undefined
  projectId?: Id | null | undefined
  statuses?: string[] | undefined
  priorities?: string[] | undefined
  types?: string[] | undefined
  assigneeId?: Id | null | undefined
  reporterId?: Id | null | undefined
  dueDateFrom?: string | null | undefined
  dueDateTo?: string | null | undefined
  sortBy?: string | undefined
  sortDirection?: string | undefined
  page?: number | undefined
  size?: number | undefined
}

export interface TaskFilters {
  search: string
  projectId: Id | null
  statuses: string[]
  priorities: string[]
  types: string[]
  assigneeId: Id | null
  reporterId: Id | null
  dueDateFrom: string | null
  dueDateTo: string | null
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

export interface TaskBoardColumnResponse {
  status: TaskStatus | string
  displayName: string
  tasks: Task[]
  count: number
}

export interface TaskBoardResponse {
  projectId: Id
  columns: TaskBoardColumnResponse[]
}

export interface TaskComment {
  id: Id
  taskId?: Id | undefined
  content: string
  mentions?: Record<string, UserPublicView> | undefined
  author?: UserPublicView | undefined
  createdAt?: string | undefined
  updatedAt?: string | undefined
}

export interface TaskAttachment {
  id: Id
  taskId?: Id | undefined
  fileName?: string | undefined
  url?: string | undefined
  contentType?: string | undefined
  fileSize?: number | undefined
  size?: number | undefined
  uploadedBy?: UserPublicView | Id | undefined
  createdAt?: string | undefined
}

export interface TaskSkillRequirementRequest {
  skillId: Id
  minimumLevel?: SkillLevel | string | undefined
  isRequired?: boolean | undefined
}

export interface CreateTaskRequest {
  projectId: Id
  title: string
  description?: string | null | undefined
  priority?: TaskPriority | string | undefined
  type?: TaskType | string | undefined
  estimatedHours?: number | null | undefined
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
  assigneeId?: Id | null | undefined
  skillRequirements?: TaskSkillRequirementRequest[] | undefined
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>

export interface UpdateTaskStatusRequest {
  status: TaskStatus | string
}

export interface UpdateTaskDatesRequest {
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
}

export interface TaskCommentRequest {
  content: string
}

// Section 4.12 activity history returned by GET /api/tasks/{id}/history
export interface TaskActivityEntry {
  id: Id
  action: TaskActivityType | string
  oldValue?: string | null
  newValue?: string | null
  oldUser?: UserPublicView | null
  newUser?: UserPublicView | null
  actor?: UserPublicView | null
  note?: string | null
  createdAt: string
}
