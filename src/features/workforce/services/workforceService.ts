import api from '@/lib/axios'
import type {
  ArrangementQueryParams,
  ArrangeResponse,
  Id,
  MemberWorkloadResponse,
  NextTaskResponse,
  ProjectMemberWorkloadResponse,
  ProjectScheduleResponse,
  SchedulePreviewRequest,
} from '@/types'

export const workloadService = {
  // API 9.1: project members' real-time workload.
  getProjectMembers: (projectId: Id) =>
    api.get<ProjectMemberWorkloadResponse[]>(`/workload/projects/${projectId}/members`),

  // API 9.2: one user's real-time workload with task details.
  getUserRealtime: (userId: Id) =>
    api.get<MemberWorkloadResponse>(`/workload/users/${userId}/realtime`),

  // API 9.3: authenticated user's real-time workload.
  getMyRealtime: () =>
    api.get<MemberWorkloadResponse>('/workload/me/realtime'),

  // API 9.4: saved execution order, or ATC when no custom order exists.
  getMySchedule: (projectId: Id) =>
    api.get<ProjectScheduleResponse>('/workload/me/schedule', { params: { projectId } }),

  // API 9.5: current ATC suggestion without persistence.
  suggestSchedule: (projectId: Id) =>
    api.get<ProjectScheduleResponse>('/workload/me/schedule/suggest', { params: { projectId } }),

  // API 9.6: simulate a custom order without persistence.
  previewSchedule: (data: SchedulePreviewRequest) =>
    api.post<ProjectScheduleResponse>('/workload/me/schedule/preview', data),

  // API 9.7: persist a custom execution order.
  saveSchedule: (data: SchedulePreviewRequest) =>
    api.put<ProjectScheduleResponse>('/workload/me/schedule', data),

  // Reset: clear executionSeq and resume automatic ATC ordering.
  resetSchedule: (projectId: Id) =>
    api.delete<ProjectScheduleResponse>('/workload/me/schedule', { params: { projectId } }),
}

export const arrangementService = {
  // API 16.1: suggested order for a member's project lane.
  arrangeLane: (projectId: Id, assigneeId: Id, params?: ArrangementQueryParams) =>
    api.get<ArrangeResponse>(`/arrangement/lanes/${projectId}/${assigneeId}`, { params }),

  // API 16.2: suggested next task for a member's project lane.
  getLaneNextTask: (projectId: Id, assigneeId: Id, params?: Pick<ArrangementQueryParams, 'k'>) =>
    api.get<NextTaskResponse>(`/arrangement/lanes/${projectId}/${assigneeId}/next`, { params }),

  // API 16.3: suggested order for the authenticated user's project lane.
  arrangeMyLane: (projectId: Id, params?: ArrangementQueryParams) =>
    api.get<ArrangeResponse>(`/arrangement/me/lanes/${projectId}`, { params }),

  // API 16.4: suggested next task for the authenticated user.
  getMyNextTask: (projectId: Id, params?: Pick<ArrangementQueryParams, 'k'>) =>
    api.get<NextTaskResponse>(`/arrangement/me/lanes/${projectId}/next`, { params }),
}
