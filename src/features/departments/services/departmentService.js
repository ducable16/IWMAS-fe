import api from '@/lib/axios'

export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.post(`/departments/${id}/update`, data),
  remove: (id) => api.post(`/departments/${id}/delete`),
}
