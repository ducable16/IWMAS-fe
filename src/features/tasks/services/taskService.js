import api from '@/lib/axios'

export const taskService = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getMine:       ()          => api.get('/tasks/my'),
  getById:       (id)        => api.get(`/tasks/${id}`),
  create:        (data)      => api.post('/tasks', data),
  update:        (id, data)  => api.put(`/tasks/${id}`, data),
  updateStatus:  (id, data)  => api.patch(`/tasks/${id}/status`, data),
  updateDates:   (id, data)  => api.patch(`/tasks/${id}/dates`, data),
  remove:        (id)        => api.delete(`/tasks/${id}`),
  getHistory:    (id)        => api.get(`/tasks/${id}/history`),

  /**
   * §4.4 GET /api/tasks/board — Kanban grouped by status.
   * Requires projectId query param.
   */
  getBoard: (projectId) => api.get(`/tasks/board?projectId=${projectId}`),

  /**
   * §4.5 GET /api/tasks/calendar — Tasks grouped by dueDate.
   * Params: from (required), to (required), projectId (optional)
   */
  getCalendar: ({ from, to, projectId } = {}) => {
    const qs = new URLSearchParams({ from, to })
    if (projectId) qs.append('projectId', projectId)
    return api.get(`/tasks/calendar?${qs.toString()}`)
  },

  /**
   * Search & filter tasks — GET /api/tasks
   * Supported params:
   *   search, projectId, statuses[], priorities[], types[], labels[],
   *   sprint, assigneeId, reporterId, dueDateFrom, dueDateTo,
   *   sortBy, sortDirection, page, size
   */
  search: (params = {}) => {
    const qs = new URLSearchParams()
    const append = (key, val) => {
      if (val !== undefined && val !== null && val !== '') qs.append(key, val)
    }

    append('search', params.search)
    append('projectId', params.projectId)
    append('assigneeId', params.assigneeId)
    append('reporterId', params.reporterId)
    append('sprint', params.sprint)
    append('dueDateFrom', params.dueDateFrom)
    append('dueDateTo', params.dueDateTo)
    append('sortBy', params.sortBy)
    append('sortDirection', params.sortDirection)
    append('page', params.page ?? 0)
    append('size', params.size ?? 20)

    // Repeatable array params
    ;(params.statuses || []).forEach((v) => qs.append('statuses', v))
    ;(params.priorities || []).forEach((v) => qs.append('priorities', v))
    ;(params.types || []).forEach((v) => qs.append('types', v))
    ;(params.labels || []).forEach((v) => qs.append('labels', v))

    // Custom fields: forwarded as individual query params per §4.3
    Object.entries(params.customFields || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v)
    })

    return api.get(`/tasks?${qs.toString()}`)
  },

  // Comments
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  updateComment: (taskId, commentId, data) =>
    api.put(`/tasks/${taskId}/comments/${commentId}`, data),
  deleteComment: (taskId, commentId) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),

  // Attachments
  getAttachments: (taskId) =>
    api.get(`/tasks/${taskId}/attachments`),
  uploadAttachment: (taskId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/tasks/${taskId}/attachments`, formData)
  },
  deleteAttachment: (taskId, attachmentId) =>
    api.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
}
