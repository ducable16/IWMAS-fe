import type { Id } from './api'
import type { RiskLevel, WorkloadLevel } from '@/constants/enums'

export interface WorkloadTask {
  id: Id
  taskId?: Id
  title: string
  status?: string
  priority?: string
  estimatedHours?: number | null
  remainingHours?: number | null
  dueDate?: string | null
  overdue?: boolean
  projectId?: Id
  projectName?: string
}

export interface ProjectWorkloadAllocation {
  projectId?: Id
  projectName?: string
  workloadLevel?: WorkloadLevel | string
  utilizationPercent?: number | null
}

export interface WorkloadMember {
  userId: Id
  id?: Id
  fullName?: string
  userFullName?: string
  name?: string
  role?: string
  title?: string
  position?: string | null
  workloadLevel?: WorkloadLevel | string
  utilizationPercent?: number | null
  allocatedEffortPercent?: number | null
  score?: number
  workloadScore?: number
  activeTasks?: number
  activeTaskCount?: number
  overdueTaskCount?: number
  hoursThisWeek?: number
  weeklyRemainingHours?: number | null
  weeklyCapacityHours?: number | null
  skills?: string[]
  tasks?: WorkloadTask[] | null
  projectAllocations?: ProjectWorkloadAllocation[] | null
}

export interface BurnoutRisk {
  userId: Id
  id?: Id
  fullName?: string
  name?: string
  score?: number
  workloadScore?: number
  riskLevel?: RiskLevel | string
}
