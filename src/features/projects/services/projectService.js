import api from '@/lib/axios'

/**
 * §3. Project API — base path: /api/projects
 */
export const projectService = {
  /**
   * §3.1 GET /api/projects — ADMIN or PROJECT_MANAGER
   * @param {{ status?: string }} params
   */
  getAll: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.status) qs.append('status', params.status)
    const q = qs.toString()
    return api.get(q ? `/projects?${q}` : '/projects')
  },

  /**
   * §3.2 GET /api/projects/my — all roles
   * Returns projects the current user is an active member of.
   */
  getMy: () => api.get('/projects/my'),

  /** §3.3 GET /api/projects/{id} */
  getById: (id) => api.get(`/projects/${id}`),

  /**
   * §3.4 POST /api/projects — ADMIN or PROJECT_MANAGER
   * @param {{ name, code?, description?, status?, priority?, startDate?, endDate?, managerId }} data
   */
  create: (data) => api.post('/projects', data),

  /** §3.5 PUT /api/projects/{id} — ADMIN or PROJECT_MANAGER */
  update: (id, data) => api.put(`/projects/${id}`, data),

  /** §3.6 DELETE /api/projects/{id} — ADMIN or PROJECT_MANAGER */
  remove: (id) => api.delete(`/projects/${id}`),

  // ── Members ──────────────────────────────────────────────────────────────

  /** §3.7 GET /api/projects/{id}/members */
  getMembers: (id) => api.get(`/projects/${id}/members`),

  /**
   * §3.8 POST /api/projects/{id}/members — ADMIN or PROJECT_MANAGER
   * @param {{ userId, roleInProject?, allocatedEffortPercent?, joinDate?, note? }} data
   */
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),

  /** §3.9 PUT /api/projects/{id}/members/{memberId} — ADMIN or PROJECT_MANAGER */
  updateMember: (id, memberId, data) =>
    api.put(`/projects/${id}/members/${memberId}`, data),

  /** §3.10 DELETE /api/projects/{id}/members/{memberId} — ADMIN or PROJECT_MANAGER */
  removeMember: (id, memberId) =>
    api.delete(`/projects/${id}/members/${memberId}`),

  // Tasks (convenience shortcut used by sprint board)
  getTasks: (id) => api.get(`/projects/${id}/tasks`),
}
