import api from '@/lib/axios'

export const timeLogService = {
  getMine: (params) => api.get('/time-logs/my', { params }),
  getByTask: (taskId) => api.get(`/time-logs/task/${taskId}`),
  create: (data) => api.post('/time-logs', data),
  update: (id, data) => api.put(`/time-logs/${id}`, data),
  remove: (id) => api.delete(`/time-logs/${id}`),
}
