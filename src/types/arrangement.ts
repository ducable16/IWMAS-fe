import type { Id } from './api'

export interface ArrangementQueryParams {
  k?: number | undefined
  wCritical?: number | undefined
  wHigh?: number | undefined
  wMedium?: number | undefined
  wLow?: number | undefined
}

export interface ArrangeTaskItem {
  taskId: Id
  title: string
  position: number
  priority: string
  priorityIndex: number
  slackHours: number
  projectedStart: string | null
  projectedFinish: string | null
  projectedTardinessHours: number
  lateByWorkdays: number
  willSlip: boolean
  estimateDefaulted: boolean
  reason: string
}

export interface ArrangeResponse {
  projectId: Id
  assigneeId: Id
  allocatedEffortPercent: number | null
  dailyCapacityHours: number | null
  k: number
  tasks: ArrangeTaskItem[]
}

export interface NextTaskResponse {
  projectId: Id
  assigneeId: Id
  queueEmpty: boolean
  taskId: Id | null
  title: string | null
  priority: string | null
  priorityIndex: number | null
  reason: string | null
}
