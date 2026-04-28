import api from '@/lib/axios'

export const userService = {
  getMe: () => api.get('/users/me'),
  // §2.2: body key is `name` (not `fullName`)
  updateMe: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.patch('/users/me/password', data),

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
    append('size',          params.size ?? 200) // large default so dropdowns get all users
    const q = qs.toString()
    return api.get(q ? `/users?${q}` : '/users')
  },

  getById:    (id)       => api.get(`/users/${id}`),
  create:     (data)     => api.post('/users', data),
  update:     (id, data) => api.patch(`/users/${id}`, data),
  activate:   (id)       => api.patch(`/users/${id}/activate`),
  deactivate: (id)       => api.patch(`/users/${id}/deactivate`),
}

export const employeeSkillService = {
  getMine: () => api.get('/users/me/skills'),
  addMine: (data) => api.post('/users/me/skills', data),
  updateMine: (skillId, data) => api.put(`/users/me/skills/${skillId}`, data),
  removeMine: (skillId) => api.delete(`/users/me/skills/${skillId}`),

  getByUser: (userId) => api.get(`/users/${userId}/skills`),
  addForUser: (userId, data) => api.post(`/users/${userId}/skills`, data),
}
