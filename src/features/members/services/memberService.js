import api from '@/lib/axios'

export const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.patch('/users/me/password', data),

  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  activate: (id) => api.patch(`/users/${id}/activate`),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
}

export const employeeSkillService = {
  getMine: () => api.get('/users/me/skills'),
  addMine: (data) => api.post('/users/me/skills', data),
  updateMine: (skillId, data) => api.put(`/users/me/skills/${skillId}`, data),
  removeMine: (skillId) => api.delete(`/users/me/skills/${skillId}`),

  getByUser: (userId) => api.get(`/users/${userId}/skills`),
  addForUser: (userId, data) => api.post(`/users/${userId}/skills`, data),
}
