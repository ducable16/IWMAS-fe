import api from '@/lib/axios'
import type { Id } from '@/types'

interface DepartmentPayload {
  name: string
  description?: string
}

export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id: Id) => api.get(`/departments/${id}`),
  create: (data: DepartmentPayload) => api.post('/departments', data),
  update: (id: Id, data: DepartmentPayload) => api.post(`/departments/${id}/update`, data),
  remove: (id: Id) => api.post(`/departments/${id}/delete`),
}
