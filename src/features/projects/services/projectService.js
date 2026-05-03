import api from '@/lib/axios'

/**
 * §3. Project API — base path: /api/projects
 */
export const projectService = {
  /**
   * §3.1 GET /api/projects — ADMIN or PROJECT_MANAGER
   * Returns paginated { content, page, size, totalElements, totalPages }
   *
   * @param {{
   *   search?: string,
   *   statuses?: string[],      // repeatable: PLANNING|IN_PROGRESS|ON_HOLD|COMPLETED|CANCELLED
   *   priorities?: string[],    // repeatable: LOW|MEDIUM|HIGH|CRITICAL
   *   managerId?: number,
   *   startDateFrom?: string,   // YYYY-MM-DD
   *   startDateTo?: string,
   *   endDateFrom?: string,
   *   endDateTo?: string,
   *   sortBy?: string,          // name|status|priority|startDate|endDate|createdAt|updatedAt
   *   sortDirection?: string,   // ASC|DESC
   *   page?: number,
   *   size?: number,
   * }} params
   */
  getAll: (params = {}) => {
    const qs = new URLSearchParams()
    const append = (k, v) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v)
    }
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
    // Repeatable params
    ;(params.statuses   || []).forEach((v) => qs.append('statuses',   v))
    ;(params.priorities || []).forEach((v) => qs.append('priorities', v))

    const q = qs.toString()
    return api.get(q ? `/projects?${q}` : '/projects')
  },

  /**
   * §3.2 GET /api/projects/my — all roles
   * Same params as §3.1 (search, statuses, priorities, sortBy, sortDirection, page, size,
   * managerId, startDateFrom, startDateTo, endDateFrom, endDateTo)
   */
  getMy: (params = {}) => {
    const qs = new URLSearchParams()
    const append = (k, v) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v)
    }
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
    ;(params.statuses   || []).forEach((v) => qs.append('statuses',   v))
    ;(params.priorities || []).forEach((v) => qs.append('priorities', v))

    const q = qs.toString()
    return api.get(q ? `/projects/my?${q}` : '/projects/my')
  },

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

  // ── Members ────────────────────────────────────────────────

  /** §3.7 GET /api/projects/{id}/members → ProjectMemberResponse[] */
  getMembers: (id) => api.get(`/projects/${id}/members`),

  /**
   * §3.8 POST /api/projects/{id}/members
   * @param {{ userId, roleInProject?, allocatedEffortPercent?, joinDate?, note? }} data
   */
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),

  /** §3.9 PUT /api/projects/{id}/members/{memberId} */
  updateMember: (id, memberId, data) =>
    api.put(`/projects/${id}/members/${memberId}`, data),

  /** §3.10 DELETE /api/projects/{id}/members/{memberId} */
  removeMember: (id, memberId) =>
    api.delete(`/projects/${id}/members/${memberId}`),

  // Convenience shortcut (used by sprint board)
  getTasks: (id) => api.get(`/projects/${id}/tasks`),
}
