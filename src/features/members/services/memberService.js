import api from '@/lib/axios'

export const userService = {
  getMe: () => api.get('/users/me'),
  // §2.2: body key is `name` (not `fullName`)
  updateMe: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.patch('/users/me/password', data),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/users/me/avatar', formData)
  },

  /**
   * §2.6 GET /api/users — paginated with full filter/sort/page support.
   * Params: search, role, position, active, verified, sortBy, sortDirection, page, size
   */
  getAll: (params = {}) => {
    const qs = new URLSearchParams()
    const append = (k, v) => { if (v !== undefined && v !== null && v !== '') qs.append(k, v) }
    append('search',        params.search)
    append('role',          params.role)
    append('position',      params.position)
    append('active',        params.active)
    append('verified',      params.verified)
    append('sortBy',        params.sortBy)
    append('sortDirection', params.sortDirection)
    append('page',          params.page ?? 0)
    append('size',          params.size ?? 20)
    const q = qs.toString()
    return api.get(q ? `/users?${q}` : '/users')
  },

  getById:    (id)       => api.get(`/users/${id}`),
  create:     (data)     => api.post('/users', data),
  update:     (id, data) => api.patch(`/users/${id}`, data),
  activate:   (id)       => api.patch(`/users/${id}/activate`),
  deactivate: (id)       => api.patch(`/users/${id}/deactivate`),

  /**
   * §2.10 GET /api/users/{userId}/projects
   * Projects the target user participates in (as manager or active member).
   * Access: ADMIN sees all; PM/TM sees only shared projects.
   * Same query params as §3.1.
   */
  getUserProjects: (userId, params = {}) => {
    const qs = new URLSearchParams()
    const append = (k, v) => { if (v !== undefined && v !== null && v !== '') qs.append(k, v) }
    append('search',        params.search)
    append('managerId',     params.managerId)
    append('startDateFrom', params.startDateFrom)
    append('startDateTo',   params.startDateTo)
    append('endDateFrom',   params.endDateFrom)
    append('endDateTo',     params.endDateTo)
    append('sortBy',        params.sortBy)
    append('sortDirection', params.sortDirection)
    append('page',          params.page ?? 0)
    append('size',          params.size ?? 20)
    ;(params.statuses || []).forEach((v) => qs.append('statuses', v))
    const q = qs.toString()
    return api.get(q ? `/users/${userId}/projects?${q}` : `/users/${userId}/projects`)
  },

  /**
   * §2.11 GET /api/users/{userId}/tasks/assigned
   * Tasks where assigneeId = userId. `assigneeId` is fixed server-side.
   * Access: ADMIN sees all; PM/TM sees only tasks in shared projects.
   */
  getUserAssignedTasks: (userId, params = {}) => {
    const qs = new URLSearchParams()
    const append = (k, v) => { if (v !== undefined && v !== null && v !== '') qs.append(k, v) }
    append('search',        params.search)
    append('sprint',        params.sprint)
    append('dueDateFrom',   params.dueDateFrom)
    append('dueDateTo',     params.dueDateTo)
    append('sortBy',        params.sortBy    ?? 'updatedAt')
    append('sortDirection', params.sortDirection ?? 'DESC')
    append('page',          params.page ?? 0)
    append('size',          params.size ?? 20)
    ;(params.statuses   || []).forEach((v) => qs.append('statuses',   v))
    ;(params.priorities || []).forEach((v) => qs.append('priorities', v))
    ;(params.types      || []).forEach((v) => qs.append('types',      v))
    ;(params.labels     || []).forEach((v) => qs.append('labels',     v))
    return api.get(`/users/${userId}/tasks/assigned?${qs.toString()}`)
  },

  /**
   * §2.12 GET /api/users/{userId}/tasks/reported
   * Tasks where reporterId = userId. `reporterId` is fixed server-side.
   * Access: same as §2.11.
   */
  getUserReportedTasks: (userId, params = {}) => {
    const qs = new URLSearchParams()
    const append = (k, v) => { if (v !== undefined && v !== null && v !== '') qs.append(k, v) }
    append('search',        params.search)
    append('sprint',        params.sprint)
    append('dueDateFrom',   params.dueDateFrom)
    append('dueDateTo',     params.dueDateTo)
    append('sortBy',        params.sortBy    ?? 'updatedAt')
    append('sortDirection', params.sortDirection ?? 'DESC')
    append('page',          params.page ?? 0)
    append('size',          params.size ?? 20)
    ;(params.statuses   || []).forEach((v) => qs.append('statuses',   v))
    ;(params.priorities || []).forEach((v) => qs.append('priorities', v))
    ;(params.types      || []).forEach((v) => qs.append('types',      v))
    ;(params.labels     || []).forEach((v) => qs.append('labels',     v))
    return api.get(`/users/${userId}/tasks/reported?${qs.toString()}`)
  },
}

export const employeeSkillService = {
  getMine: () => api.get('/users/me/skills'),
  addMine: (data) => api.post('/users/me/skills', data),
  updateMine: (skillId, data) => api.put(`/users/me/skills/${skillId}`, data),
  removeMine: (skillId) => api.delete(`/users/me/skills/${skillId}`),

  getByUser: (userId) => api.get(`/users/${userId}/skills`),
  addForUser: (userId, data) => api.post(`/users/${userId}/skills`, data),
}
