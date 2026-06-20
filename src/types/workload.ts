import type { WorkloadLevel } from '@/constants/enums'
import type { Id } from './api'

export interface WorkloadSnapshotResponse {
  id: Id
  userId: Id
  userFullName: string
  snapshotDate: string
  projectCount: number
  activeTaskCount: number
  overdueTaskCount: number
  predictedLateTaskCount: number
  unestimatedTaskCount: number
  workloadPercent: number
  workloadLevel: WorkloadLevel | string
}

export interface TaskWorkloadItem {
  taskId: Id
  projectId: Id
  title: string
  status: string
  priority: string
  startDate: string | null
  dueDate: string | null
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
  workloadLevel: WorkloadLevel | string
  /** Null when the lane has no capacity (BLOCKED / UNDEFINED). */
  workloadPercent: number | null
  predictedLateTaskCount: number
}

export interface MemberWorkloadResponse {
  userId: Id
  userFullName: string
  position: string | null
  workloadLevel: WorkloadLevel | string
  workloadPercent: number
  activeTaskCount: number
  overdueTaskCount: number
  predictedLateTaskCount: number
  unestimatedTaskCount: number
  projectAllocations: ProjectAllocationItem[]
  /** Null in the project-member list; populated by user real-time endpoints. */
  tasks: TaskWorkloadItem[] | null
}

export interface ProjectScheduleResponse {
  projectId: Id
  projectName: string
  allocatedEffortPercent: number | null
  dailyCapacityHours: number | null
  workloadLevel: WorkloadLevel | string
  workloadPercent: number
  predictedLateTaskCount: number
  savedOrder: boolean
  tasks: TaskWorkloadItem[]
}

export interface SchedulePreviewRequest {
  projectId: Id
  /** Must be exactly the lane's schedulable task ids in the desired order. */
  orderedTaskIds: Id[]
}
