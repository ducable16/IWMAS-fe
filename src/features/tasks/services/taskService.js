import api from '@/lib/axios'

export const taskService = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getMine: () => api.get('/tasks/my'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.patch(`/tasks/${id}/status`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
  getHistory: (id) => api.get(`/tasks/${id}/history`),

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

    return api.get(`/tasks?${qs.toString()}`)
  },

  // Comments
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  updateComment: (taskId, commentId, data) =>
    api.put(`/tasks/${taskId}/comments/${commentId}`, data),
  deleteComment: (taskId, commentId) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),
}
