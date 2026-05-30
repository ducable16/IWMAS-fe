import api from '@/lib/axios'
import type {
  Id,
  Skill,
  SkillCategory,
  SkillCategoryRequest,
  SkillMember,
  SkillMembersQuery,
  SkillQuery,
  SkillRequest,
  SkillStats,
} from '@/types'

export const skillService = {
  getAll: (params: SkillQuery = {}) => api.get<Skill[]>('/skills', { params }),
  getById: (id: Id) => api.get<Skill>(`/skills/${id}`),
  create: (data: SkillRequest) => api.post<Skill>('/skills', data),
  update: (id: Id, data: SkillRequest) => api.put<Skill>(`/skills/${id}`, data),
  remove: (id: Id) => api.delete(`/skills/${id}`),
  getMembers: (id: Id, params: SkillMembersQuery = {}) =>
    api.get<SkillMember[]>(`/skills/${id}/members`, { params }),
  getStats: (id: Id) => api.get<SkillStats>(`/skills/${id}/stats`),
}

export const skillCategoryService = {
  getAll: () => api.get<SkillCategory[]>('/skill-categories'),
  getById: (id: Id) => api.get<SkillCategory>(`/skill-categories/${id}`),
  create: (data: SkillCategoryRequest) => api.post<SkillCategory>('/skill-categories', data),
  update: (id: Id, data: SkillCategoryRequest) =>
    api.put<SkillCategory>(`/skill-categories/${id}`, data),
  remove: (id: Id) => api.delete(`/skill-categories/${id}`),
}
