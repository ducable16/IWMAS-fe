import api from '@/lib/axios'
import type {
  CreateTaskRequest,
  Id,
  PageResponse,
  QueryValue,
  Task,
  TaskAttachment,
  TaskComment,
  TaskCommentRequest,
  TaskSearchParams,
  UpdateTaskDatesRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@/types'

interface TaskCalendarParams {
  from?: string | undefined
  to?: string | undefined
  projectId?: Id | null | undefined
}

function append(qs: URLSearchParams, key: string, value: QueryValue) {
  if (value !== undefined && value !== null && value !== '') qs.append(key, String(value))
}

export const taskService = {
  getByProject: (projectId: Id) => api.get<Task[]>(`/projects/${projectId}/tasks`),
  getMine:       ()          => api.get<Task[]>('/tasks/my'),
  getById:       (id: Id)        => api.get<Task>(`/tasks/${id}`),
  create:        (data: CreateTaskRequest)      => api.post<Task>('/tasks', data),
  update:        (id: Id, data: UpdateTaskRequest)  => api.put<Task>(`/tasks/${id}`, data),
  updateStatus:  (id: Id, data: UpdateTaskStatusRequest)  => api.patch<Task>(`/tasks/${id}/status`, data),
  updateDates:   (id: Id, data: UpdateTaskDatesRequest)  => api.patch<Task>(`/tasks/${id}/dates`, data),
  remove:        (id: Id)        => api.delete(`/tasks/${id}`),
  getHistory:    (id: Id)        => api.get(`/tasks/${id}/history`),

  /**
   * §4.4 GET /api/tasks/board — Kanban grouped by status.
   * Requires projectId query param.
   */
  getBoard: (projectId: Id) => api.get(`/tasks/board?projectId=${projectId}`),

  /**
   * §4.5 GET /api/tasks/calendar — Tasks grouped by dueDate.
   * Params: from (required), to (required), projectId (optional)
   */
  getCalendar: ({ from, to, projectId }: TaskCalendarParams = {}) => {
    const qs = new URLSearchParams()
    append(qs, 'from', from)
    append(qs, 'to', to)
    append(qs, 'projectId', projectId)
    return api.get(`/tasks/calendar?${qs.toString()}`)
  },

  /**
   * Search & filter tasks — GET /api/tasks
   * Supported params:
   *   search, projectId, skillId, statuses[], priorities[], types[], labels[],
   *   sprint, assigneeId, reporterId, dueDateFrom, dueDateTo,
   *   sortBy, sortDirection, page, size
   */
  search: (params: TaskSearchParams = {}) => {
    const qs = new URLSearchParams()

    append(qs, 'search', params.search)
    append(qs, 'projectId', params.projectId)
    append(qs, 'skillId', params.skillId)
    append(qs, 'assigneeId', params.assigneeId)
    append(qs, 'reporterId', params.reporterId)
    append(qs, 'sprint', params.sprint)
    append(qs, 'dueDateFrom', params.dueDateFrom)
    append(qs, 'dueDateTo', params.dueDateTo)
    append(qs, 'sortBy', params.sortBy)
    append(qs, 'sortDirection', params.sortDirection)
    append(qs, 'page', params.page ?? 0)
    append(qs, 'size', params.size ?? 20)

    // Repeatable array params
    ;(params.statuses || []).forEach((v) => append(qs, 'statuses', v))
    ;(params.priorities || []).forEach((v) => append(qs, 'priorities', v))
    ;(params.types || []).forEach((v) => append(qs, 'types', v))
    ;(params.labels || []).forEach((v) => append(qs, 'labels', v))

    // Custom fields: forwarded as individual query params per §4.3
    Object.entries(params.customFields || {}).forEach(([k, v]) => {
      append(qs, k, v)
    })

    return api.get<PageResponse<Task>>(`/tasks?${qs.toString()}`)
  },

  // Comments
  getComments: (taskId: Id) => api.get<TaskComment[]>(`/tasks/${taskId}/comments`),
  addComment: (taskId: Id, data: TaskCommentRequest) => api.post<TaskComment>(`/tasks/${taskId}/comments`, data),
  updateComment: (taskId: Id, commentId: Id, data: TaskCommentRequest) =>
    api.put<TaskComment>(`/tasks/${taskId}/comments/${commentId}`, data),
  deleteComment: (taskId: Id, commentId: Id) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),

  // Attachments
  getAttachments: (taskId: Id) =>
    api.get<TaskAttachment[]>(`/tasks/${taskId}/attachments`),
  uploadAttachment: (taskId: Id, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<TaskAttachment>(`/tasks/${taskId}/attachments`, formData)
  },
  deleteAttachment: (taskId: Id, attachmentId: Id) =>
    api.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
}
