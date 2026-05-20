import api from '@/lib/axios'
import type { Id } from '@/types'

interface SkillPayload {
  name: string
  description?: string
}

export const skillService = {
  getAll: () => api.get('/skills'),
  getById: (id: Id) => api.get(`/skills/${id}`),
  create: (data: SkillPayload) => api.post('/skills', data),
  update: (id: Id, data: SkillPayload) => api.put(`/skills/${id}`, data),
  remove: (id: Id) => api.delete(`/skills/${id}`),
}
