import type { Id } from './api'

export interface ArrangeTaskItem {
  taskId: Id
  title: string
  position: number
  priority: string
  slackHours: number
  projectedStart: string | null
  projectedFinish: string | null
  projectedTardinessHours: number
  lateByWorkdays: number
  willSlip: boolean
  estimateDefaulted: boolean
}

export interface ArrangeResponse {
  projectId: Id
  assigneeId: Id
  allocatedEffortPercent: number | null
  dailyCapacityHours: number | null
  tasks: ArrangeTaskItem[]
}

export interface NextTaskResponse {
  projectId: Id
  assigneeId: Id
  queueEmpty: boolean
  taskId: Id | null
  title: string | null
  priority: string | null
}
