import api from '@/lib/axios'

export const timeLogService = {
  getMine: (params) => api.get('/time-logs/my', { params }),
  getByTask: (taskId) => api.get(`/time-logs/task/${taskId}`),
  create: (data) => api.post('/time-logs', data),
  update: (id, data) => api.post(`/time-logs/${id}/update`, data),
  remove: (id) => api.post(`/time-logs/${id}/delete`),
}
