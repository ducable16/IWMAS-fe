import api from '@/lib/axios'

export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.post(`/projects/${id}/update`, data),
  remove: (id) => api.post(`/projects/${id}/delete`),

  getMembers: (id) => api.get(`/projects/${id}/members`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  updateMember: (id, memberId, data) =>
    api.post(`/projects/${id}/members/${memberId}/update`, data),
  removeMember: (id, memberId) =>
    api.post(`/projects/${id}/members/${memberId}/delete`),

  getTasks: (id) => api.get(`/projects/${id}/tasks`),
}
