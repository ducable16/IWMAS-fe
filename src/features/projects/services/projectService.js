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
   *   statuses?: string[],      // repeatable: PLANNING|IN_PROGRESS|COMPLETED|CANCELLED
   *   managerId?: number,
   *   startDateFrom?: string,   // YYYY-MM-DD
   *   startDateTo?: string,
   *   endDateFrom?: string,
   *   endDateTo?: string,
   *   sortBy?: string,          // name|status|startDate|endDate|createdAt|updatedAt
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

    const q = qs.toString()
    return api.get(q ? `/projects?${q}` : '/projects')
  },

  /**
   * §3.2 GET /api/projects/my — all roles
   * Same params as §3.1 (search, statuses, sortBy, sortDirection, page, size,
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

    const q = qs.toString()
    return api.get(q ? `/projects/my?${q}` : '/projects/my')
  },

  /** §3.3 GET /api/projects/{id} */
  getById: (id) => api.get(`/projects/${id}`),

  /** §3.4 GET /api/projects/suggest-code — ADMIN or PROJECT_MANAGER
   * Derives a unique project code from a given name.
   * @param {string} name — the project name to derive a code from
   * @returns {{ code: string }}
   */
  suggestCode: (name) => api.get('/projects/suggest-code', { params: { name } }),

  /**
   * §3.5 POST /api/projects — ADMIN or PROJECT_MANAGER
   * @param {{ name, code?, description?, status?, startDate?, endDate?, managerId }} data
   */
  create: (data) => api.post('/projects', data),

  /** §3.6 PUT /api/projects/{id} — ADMIN or PROJECT_MANAGER */
  update: (id, data) => api.put(`/projects/${id}`, data),

  /** §3.7 DELETE /api/projects/{id} — ADMIN or PROJECT_MANAGER */
  remove: (id) => api.delete(`/projects/${id}`),

  // ── Members ────────────────────────────────────────────────

  /** §3.8 GET /api/projects/{id}/members → ProjectMemberResponse[] */
  getMembers: (id) => api.get(`/projects/${id}/members`),

  /**
   * §3.9 GET /api/projects/{id}/members/search — Assignee autocomplete
   * Returns users who can be assigned tasks in this project
   * (project manager + active members).
   *
   * @param {number} id        — project ID
   * @param {string} q         — keyword matched against fullName, email, position
   * @param {number} [size=10] — max results (capped at 20 by server)
   */
  searchMembers: (id, q = '', size = 10) =>
    api.get(`/projects/${id}/members/search`, { params: { q, size } }),

  /**
   * §3.10 POST /api/projects/{id}/members
   * Errors: 4004 (already member), 4005 (over 100% allocation)
   * @param {{ userId, roleInProject?, allocatedEffortPercent?, joinDate?, note? }} data
   */
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),

  /**
   * §3.11 PUT /api/projects/{id}/members/{memberId}
   * Errors: 4005 (over 100% allocation)
   */
  updateMember: (id, memberId, data) =>
    api.put(`/projects/${id}/members/${memberId}`, data),

  /** §3.12 DELETE /api/projects/{id}/members/{memberId} — soft-delete */
  removeMember: (id, memberId) =>
    api.delete(`/projects/${id}/members/${memberId}`),

  /**
   * §3.13 GET /api/projects/users/{userId}/effort-remaining
   * Returns remaining effort capacity for a user.
   *
   * @param {number} userId
   * @param {{
   *   startDate?: string,  // YYYY-MM-DD — start of proposed period
   *   endDate?:   string,  // YYYY-MM-DD — end of proposed period
   *   detail?:    boolean, // include allocationTimeline breakdown
   * }} params
   */
  getUserEffortRemaining: (userId, params = {}) => {
    const qs = new URLSearchParams()
    if (params.startDate) qs.append('startDate', params.startDate)
    if (params.endDate)   qs.append('endDate',   params.endDate)
    if (params.detail)    qs.append('detail',    'true')
    const q = qs.toString()
    return api.get(
      q
        ? `/projects/users/${userId}/effort-remaining?${q}`
        : `/projects/users/${userId}/effort-remaining`,
    )
  },

  // Convenience shortcut (used by sprint board)
  getTasks: (id) => api.get(`/projects/${id}/tasks`),
}
