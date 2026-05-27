import api from '@/lib/axios'
import type { Id, TimeLogRequest, TimeLogResponse } from '@/types'

export type TimeLogRangeParams = {
  from?: string | undefined
  to?: string | undefined
}

export const timeLogService = {
  getMine: (params?: TimeLogRangeParams) => api.get<TimeLogResponse[]>('/time-logs/my', { params }),
  getByTask: (taskId: Id) => api.get<TimeLogResponse[]>(`/time-logs/task/${taskId}`),
  create: (data: TimeLogRequest) => api.post<TimeLogResponse>('/time-logs', data),
  update: (id: Id, data: TimeLogRequest) => api.put<TimeLogResponse>(`/time-logs/${id}`, data),
  remove: (id: Id) => api.delete(`/time-logs/${id}`),
}
