import api from '@/lib/axios'
import type { Id, QueryParams, TimeLogRequest } from '@/types'

export const timeLogService = {
  getMine: (params?: QueryParams) => api.get('/time-logs/my', { params }),
  getByTask: (taskId: Id) => api.get(`/time-logs/task/${taskId}`),
  create: (data: TimeLogRequest) => api.post('/time-logs', data),
  update: (id: Id, data: TimeLogRequest) => api.put(`/time-logs/${id}`, data),
  remove: (id: Id) => api.delete(`/time-logs/${id}`),
}
