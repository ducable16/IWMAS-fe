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

  /** Null when the lane has no capacity. */
  backlogDays: number | null
  overdueCount: number
  predictedLateTaskCount: number
}


/** Project-scoped workload returned by API 9.1. */
export interface ProjectMemberWorkloadResponse {
  userId: Id
  userFullName: string
  email: string
  projectAllocation: ProjectAllocationItem
  activeTaskCount: number
  unestimatedTaskCount: number
  unestimatedTasks: TaskWorkloadItem[]
  tasks: TaskWorkloadItem[]
}

export interface MemberWorkloadResponse {
  userId: Id
  userFullName: string
  email: string

  /** Workdays needed to clear the most-loaded lane; null when no lane has capacity. */
  worstBacklogDays: number | null
  atRiskCount: number
  activeTaskCount: number
  overdueTaskCount: number
  predictedLateTaskCount: number
  unestimatedTaskCount: number

  /** Always populated. */
  unestimatedTasks: TaskWorkloadItem[]
  projectAllocations: ProjectAllocationItem[]

  /** Always populated by the user real-time endpoints. */
  tasks: TaskWorkloadItem[]
}

export interface ProjectScheduleResponse {
  projectId: Id
  projectName: string
  allocatedEffortPercent: number | null
  dailyCapacityHours: number | null
  backlogHours: number

  backlogDays: number | null
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
