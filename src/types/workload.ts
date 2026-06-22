import type { LoadLevel } from '@/constants/enums'
import type { Id } from './api'

export interface TaskWorkloadItem {
  taskId: Id
  projectId: Id
  title: string
  status: string
  priority: string
  startDate: string | null
  dueDate: string | null
  /** Mirrors estimatedHours in workload responses; null when the task is unestimated. */
  remainingHours: number | null
  executionSeq: number | null
  projectedStartDate: string | null
  projectedFinishDate: string | null
  willSlip: boolean
  lateByWorkdays: number
  overdue: boolean
  unestimated: boolean
}

export interface ProjectAllocationItem {
  projectId: Id
  projectName: string
  allocatedEffortPercent: number | null
  dailyCapacityHours: number | null
  backlogHours: number
  /** Null when the lane has no capacity (BLOCKED / UNDEFINED). */
  backlogDays: number | null
  loadLevel: LoadLevel | string
  overdueCount: number
  predictedLateTaskCount: number
}

export interface MemberWorkloadResponse {
  userId: Id
  userFullName: string
  email: string
  loadLevel: LoadLevel | string
  /** Workdays needed to clear the most-loaded lane; null when no lane has capacity. */
  worstBacklogDays: number | null
  atRiskCount: number
  activeTaskCount: number
  overdueTaskCount: number
  predictedLateTaskCount: number
  unestimatedTaskCount: number
  /** Always populated, including list responses where tasks is null. */
  unestimatedTasks: TaskWorkloadItem[]
  projectAllocations: ProjectAllocationItem[]
  /** Null in the project-member list; populated by user real-time endpoints. */
  tasks: TaskWorkloadItem[] | null
}

export interface ProjectScheduleResponse {
  projectId: Id
  projectName: string
  allocatedEffortPercent: number | null
  dailyCapacityHours: number | null
  backlogHours: number
  /** Null when the lane has no capacity (BLOCKED / UNDEFINED). */
  backlogDays: number | null
  loadLevel: LoadLevel | string
  overdueCount: number
  predictedLateTaskCount: number
  savedOrder: boolean
  tasks: TaskWorkloadItem[]
}

export interface SchedulePreviewRequest {
  projectId: Id
  /** Must be exactly the lane's schedulable task ids in the desired order. */
  orderedTaskIds: Id[]
}
