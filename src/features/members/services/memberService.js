import api from '@/lib/axios'

export const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.post('/users/me/update', data),
  changePassword: (data) => api.post('/users/me/password', data),

  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.post(`/users/${id}/update`, data),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
}

export const employeeSkillService = {
  getMine: () => api.get('/users/me/skills'),
  addMine: (data) => api.post('/users/me/skills', data),
  updateMine: (skillId, data) => api.post(`/users/me/skills/${skillId}/update`, data),
  removeMine: (skillId) => api.post(`/users/me/skills/${skillId}/delete`),

  getByUser: (userId) => api.get(`/users/${userId}/skills`),
  addForUser: (userId, data) => api.post(`/users/${userId}/skills`, data),
}
