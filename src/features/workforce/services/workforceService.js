import api from '@/lib/axios'

export const workloadService = {
  getTeam: (params) => api.get('/workload/team', { params }),
  getMine: () => api.get('/workload/me'),
  getByUser: (userId) => api.get(`/workload/users/${userId}`),
  takeSnapshot: (userId) => api.post('/workload/snapshot', null, { params: { userId } }),

  getBurnout: () => api.get('/workload/burnout'),
  getBurnoutByUser: (userId) => api.get(`/workload/burnout/users/${userId}`),
}
