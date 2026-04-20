import api from '@/lib/axios'

export const skillService = {
  getAll: () => api.get('/skills'),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.post(`/skills/${id}/update`, data),
  remove: (id) => api.post(`/skills/${id}/delete`),
}
