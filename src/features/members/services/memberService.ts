import api from '@/lib/axios'
import type {
  AdminResetPasswordRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  EmployeeSkillRequest,
  Id,
  PageResponse,
  Project,
  QueryValue,
  Task,
  UpdateOwnProfileRequest,
  UpdateUserRequest,
  User,
} from '@/types'

type QueryRecord = Record<string, QueryValue | QueryValue[]>

function append(qs: URLSearchParams, key: string, value: QueryValue) {
  if (value !== undefined && value !== null && value !== '') qs.append(key, String(value))
}

function appendArray(qs: URLSearchParams, key: string, values: QueryValue[] | undefined) {
  ;(values || []).forEach((value) => append(qs, key, value))
}

export const userService = {
  getMe: () => api.get<User>('/users/me'),
  // Section 2.2: body key is `name` (not `fullName`)
  updateMe: (data: UpdateOwnProfileRequest) => api.patch<User>('/users/me', data),
  changePassword: (data: ChangePasswordRequest) => api.patch('/users/me/password', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<User>('/users/me/avatar', formData)
  },

  getAll: (params: QueryRecord = {}) => {
    const qs = new URLSearchParams()
    append(qs, 'search', params.search as QueryValue)
    append(qs, 'role', params.role as QueryValue)
    append(qs, 'position', params.position as QueryValue)
    append(qs, 'active', params.active as QueryValue)
    append(qs, 'verified', params.verified as QueryValue)
    append(qs, 'sortBy', params.sortBy as QueryValue)
    append(qs, 'sortDirection', params.sortDirection as QueryValue)
    append(qs, 'page', (params.page as QueryValue) ?? 0)
    append(qs, 'size', (params.size as QueryValue) ?? 20)
    const q = qs.toString()
    return api.get<PageResponse<User>>(q ? `/users?${q}` : '/users')
  },

  getById: (id: Id) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserRequest) => api.post<User>('/users', data),
  update: (id: Id, data: UpdateUserRequest) => api.patch<User>(`/users/${id}`, data),
  activate:   (id: Id) => api.patch(`/users/${id}/activate`),
  deactivate: (id: Id) => api.patch(`/users/${id}/deactivate`),

  /**
   * §2.4 PATCH /api/users/{id}/password — ADMIN only
   * Forcefully resets a user's password without requiring the current password.
   */
  resetPassword: (id: Id, data: AdminResetPasswordRequest) =>
    api.patch<string>(`/users/${id}/password`, data),

  getUserProjects: (userId: Id, params: QueryRecord = {}) => {
    const qs = new URLSearchParams()
    append(qs, 'search', params.search as QueryValue)
    append(qs, 'managerId', params.managerId as QueryValue)
    append(qs, 'startDateFrom', params.startDateFrom as QueryValue)
    append(qs, 'startDateTo', params.startDateTo as QueryValue)
    append(qs, 'endDateFrom', params.endDateFrom as QueryValue)
    append(qs, 'endDateTo', params.endDateTo as QueryValue)
    append(qs, 'sortBy', params.sortBy as QueryValue)
    append(qs, 'sortDirection', params.sortDirection as QueryValue)
    append(qs, 'page', (params.page as QueryValue) ?? 0)
    append(qs, 'size', (params.size as QueryValue) ?? 20)
    appendArray(qs, 'statuses', params.statuses as QueryValue[] | undefined)
    const q = qs.toString()
    return api.get<PageResponse<Project>>(q ? `/users/${userId}/projects?${q}` : `/users/${userId}/projects`)
  },

  getUserAssignedTasks: (userId: Id, params: QueryRecord = {}) => {
    const qs = new URLSearchParams()
    append(qs, 'search', params.search as QueryValue)
    append(qs, 'sprint', params.sprint as QueryValue)
    append(qs, 'dueDateFrom', params.dueDateFrom as QueryValue)
    append(qs, 'dueDateTo', params.dueDateTo as QueryValue)
    append(qs, 'sortBy', (params.sortBy as QueryValue) ?? 'updatedAt')
    append(qs, 'sortDirection', (params.sortDirection as QueryValue) ?? 'DESC')
    append(qs, 'page', (params.page as QueryValue) ?? 0)
    append(qs, 'size', (params.size as QueryValue) ?? 20)
    appendArray(qs, 'statuses', params.statuses as QueryValue[] | undefined)
    appendArray(qs, 'priorities', params.priorities as QueryValue[] | undefined)
    appendArray(qs, 'types', params.types as QueryValue[] | undefined)
    appendArray(qs, 'labels', params.labels as QueryValue[] | undefined)
    return api.get<PageResponse<Task>>(`/users/${userId}/tasks/assigned?${qs.toString()}`)
  },

  getUserReportedTasks: (userId: Id, params: QueryRecord = {}) => {
    const qs = new URLSearchParams()
    append(qs, 'search', params.search as QueryValue)
    append(qs, 'sprint', params.sprint as QueryValue)
    append(qs, 'dueDateFrom', params.dueDateFrom as QueryValue)
    append(qs, 'dueDateTo', params.dueDateTo as QueryValue)
    append(qs, 'sortBy', (params.sortBy as QueryValue) ?? 'updatedAt')
    append(qs, 'sortDirection', (params.sortDirection as QueryValue) ?? 'DESC')
    append(qs, 'page', (params.page as QueryValue) ?? 0)
    append(qs, 'size', (params.size as QueryValue) ?? 20)
    appendArray(qs, 'statuses', params.statuses as QueryValue[] | undefined)
    appendArray(qs, 'priorities', params.priorities as QueryValue[] | undefined)
    appendArray(qs, 'types', params.types as QueryValue[] | undefined)
    appendArray(qs, 'labels', params.labels as QueryValue[] | undefined)
    return api.get<PageResponse<Task>>(`/users/${userId}/tasks/reported?${qs.toString()}`)
  },
}

export const employeeSkillService = {
  getMine: () => api.get('/users/me/skills'),
  addMine: (data: EmployeeSkillRequest) => api.post('/users/me/skills', data),
  updateMine: (skillId: Id, data: EmployeeSkillRequest) => api.put(`/users/me/skills/${skillId}`, data),
  removeMine: (skillId: Id) => api.delete(`/users/me/skills/${skillId}`),

  getByUser: (userId: Id) => api.get(`/users/${userId}/skills`),
  addForUser: (userId: Id, data: EmployeeSkillRequest) => api.post(`/users/${userId}/skills`, data),
}
