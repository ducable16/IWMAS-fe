import api from '@/lib/axios'
import type {
  CreateProjectRequest,
  Id,
  PageResponse,
  Project,
  ProjectDocument,
  ProjectMember,
  ProjectMemberRequest,
  QueryValue,
  UpdateProjectRequest,
  User,
} from '@/types'

interface ProjectQueryParams {
  search?: string
  statuses?: QueryValue[]
  managerId?: Id | null
  startDateFrom?: string | null
  startDateTo?: string | null
  endDateFrom?: string | null
  endDateTo?: string | null
  sortBy?: string
  sortDirection?: string
  page?: number
  size?: number
}

interface EffortRemainingParams {
  startDate?: string | undefined
  endDate?: string | undefined
  detail?: boolean | undefined
}

function append(qs: URLSearchParams, key: string, value: QueryValue) {
  if (value !== undefined && value !== null && value !== '') qs.append(key, String(value))
}

function projectQuery(params: ProjectQueryParams = {}) {
  const qs = new URLSearchParams()
  append(qs, 'search', params.search)
  append(qs, 'managerId', params.managerId)
  append(qs, 'startDateFrom', params.startDateFrom)
  append(qs, 'startDateTo', params.startDateTo)
  append(qs, 'endDateFrom', params.endDateFrom)
  append(qs, 'endDateTo', params.endDateTo)
  append(qs, 'sortBy', params.sortBy)
  append(qs, 'sortDirection', params.sortDirection)
  append(qs, 'page', params.page ?? 0)
  append(qs, 'size', params.size ?? 20)
  ;(params.statuses || []).forEach((value) => append(qs, 'statuses', value))
  return qs.toString()
}

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
  getAll: (params: ProjectQueryParams = {}) => {
    const q = projectQuery(params)
    return api.get<PageResponse<Project>>(q ? `/projects?${q}` : '/projects')
  },

  /**
   * §3.2 GET /api/projects/my — all roles
   * Same params as §3.1 (search, statuses, sortBy, sortDirection, page, size,
   * managerId, startDateFrom, startDateTo, endDateFrom, endDateTo)
   */
  getMy: (params: ProjectQueryParams = {}) => {
    const q = projectQuery(params)
    return api.get<PageResponse<Project>>(q ? `/projects/my?${q}` : '/projects/my')
  },

  /** §3.3 GET /api/projects/{id} */
  getById: (id: Id) => api.get<Project>(`/projects/${id}`),

  /** §3.4 GET /api/projects/suggest-code — ADMIN or PROJECT_MANAGER
   * Derives a unique project code from a given name.
   * @param {string} name — the project name to derive a code from
   * @returns {{ code: string }}
   */
  suggestCode: (name: string) => api.get<{ code: string }>('/projects/suggest-code', { params: { name } }),

  /**
   * §3.5 POST /api/projects — ADMIN or PROJECT_MANAGER
   * @param {{ name, code?, description?, status?, startDate?, endDate?, managerId }} data
   */
  create: (data: CreateProjectRequest) => api.post<Project>('/projects', data),

  /** §3.6 PUT /api/projects/{id} — ADMIN or PROJECT_MANAGER */
  update: (id: Id, data: UpdateProjectRequest) => api.put<Project>(`/projects/${id}`, data),

  /** §3.7 DELETE /api/projects/{id} — ADMIN or PROJECT_MANAGER */
  remove: (id: Id) => api.delete(`/projects/${id}`),

  // ── Members ────────────────────────────────────────────────

  /** §3.8 GET /api/projects/{id}/members → ProjectMemberResponse[] */
  getMembers: (id: Id) => api.get<ProjectMember[]>(`/projects/${id}/members`),

  /**
   * §3.9 GET /api/projects/{id}/members/search — Assignee autocomplete
   * Returns users who can be assigned tasks in this project
   * (project manager + active members).
   *
   * @param {number} id        — project ID
   * @param {string} q         — keyword matched against fullName, email, position
   * @param {number} [size=10] — max results (capped at 20 by server)
   */
  searchMembers: (id: Id, q = '', size = 10) =>
    api.get<User[]>(`/projects/${id}/members/search`, { params: { q, size } }),

  /**
   * §3.10 POST /api/projects/{id}/members
   * Errors: 4004 (already member), 4005 (over 100% allocation)
   * @param {{ userId, roleInProject?, allocatedEffortPercent?, joinDate?, note? }} data
   */
  addMember: (id: Id, data: ProjectMemberRequest) => api.post<ProjectMember>(`/projects/${id}/members`, data),

  /**
   * §3.11 PUT /api/projects/{id}/members/{memberId}
   * Errors: 4005 (over 100% allocation)
   */
  updateMember: (id: Id, memberId: Id, data: ProjectMemberRequest) =>
    api.put<ProjectMember>(`/projects/${id}/members/${memberId}`, data),

  /** §3.12 DELETE /api/projects/{id}/members/{memberId} — soft-delete */
  removeMember: (id: Id, memberId: Id) =>
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
  getUserEffortRemaining: (userId: Id, params: EffortRemainingParams = {}) => {
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
  getTasks: (id: Id) => api.get(`/projects/${id}/tasks`),

  // Documents
  getDocuments: (projectId: Id) =>
    api.get<ProjectDocument[]>(`/projects/${projectId}/documents`),
  uploadDocument: (projectId: Id, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ProjectDocument>(`/projects/${projectId}/documents`, formData)
  },
  deleteDocument: (projectId: Id, documentId: Id) =>
    api.delete(`/projects/${projectId}/documents/${documentId}`),
}
