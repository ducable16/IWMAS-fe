import api from '@/lib/axios'

export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),

  getMembers: (id) => api.get(`/projects/${id}/members`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  updateMember: (id, memberId, data) =>
    api.put(`/projects/${id}/members/${memberId}`, data),
  removeMember: (id, memberId) =>
    api.delete(`/projects/${id}/members/${memberId}`),

  getTasks: (id) => api.get(`/projects/${id}/tasks`),
}
