import type { Id } from './api'
import type { RiskLevel, WorkloadLevel } from '@/constants/enums'

// ── §9 WorkloadSnapshotResponse ───────────────────────────────────────────────
// Returned by §9.1–§9.4 (snapshot endpoints)
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
  nearTermPercent: number
  overallPercent: number
  workloadLevel: WorkloadLevel | string
}

// ── §9 TaskWorkloadItem ────────────────────────────────────────────────────────
// Embedded in MemberWorkloadResponse.tasks and ProjectScheduleResponse.tasks
export interface TaskWorkloadItem {
  taskId: Id
  projectId: Id
  title: string
  status: string
  priority: string
  startDate: string | null
  dueDate: string | null
  /** Outstanding effort fed to the simulation; null when unestimated */
  remainingHours: number | null
  /** Member's saved order within the lane; null → ATC fallback */
  executionSeq: number | null
  /** Simulated dates; null when the task cannot be scheduled (no lane capacity) */
  projectedStartDate: string | null
  projectedFinishDate: string | null
  /** true when projectedFinishDate is after dueDate */
  willSlip: boolean
  /** Workdays the projected finish runs past the due date (0 when not slipping) */
  lateByWorkdays: number
  /** dueDate is already in the past */
  overdue: boolean
  /** No usable estimate and no reported remaining */
  unestimated: boolean
}

// ── §9 ProjectAllocationItem ──────────────────────────────────────────────────
// One entry per project lane in MemberWorkloadResponse.projectAllocations
export interface ProjectAllocationItem {
  projectId: Id
  projectName: string
  /** null only for managers with no ProjectMember row; 0 is valid (observer) */
  allocatedEffortPercent: number | null
  /** 8h × alloc / 100; null when UNDEFINED; 0 when BLOCKED */
  dailyCapacityHours: number | null
  workloadLevel: WorkloadLevel | string
  /** null when the lane has no capacity (BLOCKED / UNDEFINED) */
  nearTermPercent: number | null
  overallPercent: number | null
  predictedLateTaskCount: number
}

// ── §9 MemberWorkloadResponse ─────────────────────────────────────────────────
// Returned by §9.7 (tasks = null), §9.8, §9.9 (tasks populated)
export interface MemberWorkloadResponse {
  userId: Id
  userFullName: string
  position: string | null
  /** Near-term window: today and today + 10 workdays */
  weekStart: string
  weekEnd: string
  workloadLevel: WorkloadLevel | string
  nearTermPercent: number
  overallPercent: number
  activeTaskCount: number
  overdueTaskCount: number
  predictedLateTaskCount: number
  unestimatedTaskCount: number
  projectAllocations: ProjectAllocationItem[]
  /** null in the project-member list view (§9.7); populated by §9.8 / §9.9 */
  tasks: TaskWorkloadItem[] | null
}

// ── §9.10–§9.13 ProjectScheduleResponse ──────────────────────────────────────
// Returned by all what-if schedule endpoints
export interface ProjectScheduleResponse {
  projectId: Id
  projectName: string
  allocatedEffortPercent: number | null
  dailyCapacityHours: number | null
  workloadLevel: WorkloadLevel | string
  nearTermPercent: number
  overallPercent: number
  predictedLateTaskCount: number
  /** true when the response reflects the member's persisted executionSeq */
  savedOrder: boolean
  tasks: TaskWorkloadItem[]
}

// ── §9.12–§9.13 SchedulePreviewRequest ───────────────────────────────────────
export interface SchedulePreviewRequest {
  projectId: Id
  /** Must be exactly the lane's schedulable task ids, in desired order */
  orderedTaskIds: Id[]
}

// ── Burnout ───────────────────────────────────────────────────────────────────
export interface BurnoutRisk {
  userId: Id
  id?: Id
  fullName?: string
  name?: string
  score?: number
  workloadScore?: number
  riskLevel?: RiskLevel | string
}

// ── Legacy aliases (kept for backward compat while components are migrated) ───
/** @deprecated Use MemberWorkloadResponse instead */
export type WorkloadMember = MemberWorkloadResponse & {
  id?: Id
  fullName?: string
  userFullName?: string
  name?: string
  role?: string
  title?: string
  utilizationPercent?: number | null
  score?: number
  workloadScore?: number
  activeTasks?: number
  hoursThisWeek?: number
  weeklyRemainingHours?: number | null
  weeklyCapacityHours?: number | null
  skills?: string[]
}

/** @deprecated Use ProjectAllocationItem instead */
export type ProjectWorkloadAllocation = ProjectAllocationItem

/** @deprecated Use TaskWorkloadItem instead */
export type WorkloadTask = TaskWorkloadItem & {
  id?: Id
  estimatedHours?: number | null
  projectName?: string
}
