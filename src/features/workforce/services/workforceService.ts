import api from '@/lib/axios'
import type { Id, QueryParams, WorkloadMember } from '@/types'

interface WeekRange {
  weekStart?: string | undefined
  weekEnd?: string | undefined
}

export const workloadService = {
  // ── Snapshot-based (§9.1–§9.4) ──────────────────────────────
  getTeam: (params?: QueryParams) => api.get<WorkloadMember[]>('/workload/team', { params }),
  getMine: () => api.get<WorkloadMember>('/workload/me'),
  getByUser: (userId: Id) => api.get<WorkloadMember>(`/workload/users/${userId}`),
  takeSnapshot: (userId: Id) => api.post('/workload/snapshots', null, { params: { userId } }),

  // ── Burnout (§9.5–§9.6) ─────────────────────────────────────
  getBurnout: () => api.get('/workload/burnout'),
  getBurnoutByUser: (userId: Id) => api.get(`/workload/burnout/users/${userId}`),

  // ── Real-time (§9.7–§9.9) ───────────────────────────────────

  /**
   * §9.7 GET /api/workload/projects/{projectId}/members
   * Returns real-time utilization for every active participant of the project.
   * `tasks` is always null in this list view.
   */
  getProjectMembers: (projectId: Id, { weekStart, weekEnd }: WeekRange = {}) =>
    api.get(`/workload/projects/${projectId}/members`, {
      params: { weekStart, weekEnd },
    }),

  /**
   * §9.8 GET /api/workload/users/{userId}/realtime
   * Returns real-time utilization for a single user including full task breakdown.
   * Overdue tasks appear first in `tasks`.
   */
  getUserRealtime: (userId: Id, { weekStart, weekEnd }: WeekRange = {}) =>
    api.get(`/workload/users/${userId}/realtime`, {
      params: { weekStart, weekEnd },
    }),

  /**
   * §9.9 GET /api/workload/me/realtime
   * Same as §9.8 but scoped to the currently authenticated user.
   */
  getMyRealtime: ({ weekStart, weekEnd }: WeekRange = {}) =>
    api.get('/workload/me/realtime', {
      params: { weekStart, weekEnd },
    }),
}
