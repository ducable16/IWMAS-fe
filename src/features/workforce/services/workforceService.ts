import api from '@/lib/axios'
import type {
  ArrangementQueryParams,
  ArrangeResponse,
  Id,
  MemberWorkloadResponse,
  NextTaskResponse,
  ProjectScheduleResponse,
  SchedulePreviewRequest,
  WorkloadSnapshotResponse,
} from '@/types'

export const workloadService = {
  // ── Snapshot-based (§9.1–§9.4) ──────────────────────────────────────────

  /**
   * §9.1 GET /api/workload/team — ADMIN, HR, PROJECT_MANAGER
   * Returns saved workload snapshots for a given date (defaults today),
   * ordered by overallPercent descending.
   */
  getTeam: (params?: { date?: string }) =>
    api.get<WorkloadSnapshotResponse[]>('/workload/team', { params }),

  /**
   * §9.2 GET /api/workload/me
   * Current user's saved snapshot history, newest first.
   */
  getMine: () => api.get<WorkloadSnapshotResponse[]>('/workload/me'),

  /**
   * §9.3 GET /api/workload/users/{userId} — ADMIN, HR, PROJECT_MANAGER
   */
  getByUser: (userId: Id) =>
    api.get<WorkloadSnapshotResponse[]>(`/workload/users/${userId}`),

  /**
   * §9.4 POST /api/workload/snapshots?userId={userId} — ADMIN or HR
   * Computes and persists a snapshot for the user as of today.
   */
  takeSnapshot: (userId: Id) =>
    api.post<WorkloadSnapshotResponse>('/workload/snapshots', null, { params: { userId } }),

  // ── Burnout (§9.5–§9.6) ────────────────────────────────────────────────
  // Status: not yet implemented — returns empty array

  /** §9.5 GET /api/workload/burnout — ADMIN, HR, PROJECT_MANAGER */
  getBurnout: () => api.get('/workload/burnout'),

  /** §9.6 GET /api/workload/burnout/users/{userId} */
  getBurnoutByUser: (userId: Id) => api.get(`/workload/burnout/users/${userId}`),

  // ── Real-time (§9.7–§9.9) ─────────────────────────────────────────────

  /**
   * §9.7 GET /api/workload/projects/{projectId}/members — ADMIN, PROJECT_MANAGER
   * Real-time workload for every active participant of the project.
   * `tasks` is always null in this list view.
   */
  getProjectMembers: (projectId: Id) =>
    api.get<MemberWorkloadResponse[]>(`/workload/projects/${projectId}/members`),

  /**
   * §9.8 GET /api/workload/users/{userId}/realtime — ADMIN, HR, PROJECT_MANAGER
   * Real-time workload for one user with full task breakdown.
   */
  getUserRealtime: (userId: Id) =>
    api.get<MemberWorkloadResponse>(`/workload/users/${userId}/realtime`),

  /**
   * §9.9 GET /api/workload/me/realtime — any role
   * Same as §9.8, scoped to the authenticated user.
   */
  getMyRealtime: () =>
    api.get<MemberWorkloadResponse>('/workload/me/realtime'),

  // ── What-if scheduling (§9.10–§9.13) ─────────────────────────────────

  /**
   * §9.10 GET /api/workload/me/schedule?projectId={projectId}
   * Returns the member's lane simulated under their saved executionSeq
   * (or ATC when no order has been saved).
   */
  getMySchedule: (projectId: Id) =>
    api.get<ProjectScheduleResponse>('/workload/me/schedule', { params: { projectId } }),

  /**
   * §9.11 GET /api/workload/me/schedule/suggest?projectId={projectId}
   * Returns the lane simulated under the ATC suggested order — a preview, not persisted.
   * Response always has savedOrder: false.
   */
  suggestSchedule: (projectId: Id) =>
    api.get<ProjectScheduleResponse>('/workload/me/schedule/suggest', { params: { projectId } }),

  /**
   * §9.12 POST /api/workload/me/schedule/preview
   * Simulates a member-proposed order WITHOUT persisting it.
   * orderedTaskIds must be exactly the lane's schedulable task ids.
   */
  previewSchedule: (data: SchedulePreviewRequest) =>
    api.post<ProjectScheduleResponse>('/workload/me/schedule/preview', data),

  /**
   * §9.13 PUT /api/workload/me/schedule
   * Persists the member-proposed order as executionSeq, then returns simulation.
   * Response always has savedOrder: true.
   */
  saveSchedule: (data: SchedulePreviewRequest) =>
    api.put<ProjectScheduleResponse>('/workload/me/schedule', data),
}

export const arrangementService = {
  /** §16.1 GET /api/arrangement/lanes/{projectId}/{assigneeId} */
  arrangeLane: (projectId: Id, assigneeId: Id, params?: ArrangementQueryParams) =>
    api.get<ArrangeResponse>(`/arrangement/lanes/${projectId}/${assigneeId}`, { params }),

  /** §16.2 GET /api/arrangement/lanes/{projectId}/{assigneeId}/next */
  getLaneNextTask: (projectId: Id, assigneeId: Id, params?: Pick<ArrangementQueryParams, 'k'>) =>
    api.get<NextTaskResponse>(`/arrangement/lanes/${projectId}/${assigneeId}/next`, { params }),

  /** §16.3 GET /api/arrangement/me/lanes/{projectId} */
  arrangeMyLane: (projectId: Id, params?: ArrangementQueryParams) =>
    api.get<ArrangeResponse>(`/arrangement/me/lanes/${projectId}`, { params }),

  /** §16.4 GET /api/arrangement/me/lanes/{projectId}/next */
  getMyNextTask: (projectId: Id, params?: Pick<ArrangementQueryParams, 'k'>) =>
    api.get<NextTaskResponse>(`/arrangement/me/lanes/${projectId}/next`, { params }),
}
