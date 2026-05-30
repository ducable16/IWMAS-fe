import type { SkillLevel, UserRole } from '@/constants/enums'
import type { Id } from './api'

export interface Skill {
  id: Id
  name: string
  categoryId: Id
  categoryName: string
  description?: string | null | undefined
}

export interface SkillRequest {
  name: string
  categoryId: Id
  description?: string | null | undefined
}

export interface SkillQuery {
  keyword?: string | undefined
  categoryId?: Id | undefined
}

export interface SkillCategory {
  id: Id
  name: string
  description?: string | null | undefined
}

export interface SkillCategoryRequest {
  name: string
  description?: string | null | undefined
}

export interface SkillMembersQuery {
  minLevel?: SkillLevel | string | undefined
  excludeProjectId?: Id | undefined
}

export interface SkillMember {
  userId: Id
  email: string
  fullName: string
  avatarUrl?: string | null | undefined
  position?: string | null | undefined
  role?: UserRole | string | null | undefined
  level: SkillLevel | string
  note?: string | null | undefined
}

export interface SkillStats {
  skillId: Id
  skillName: string
  skillCategory?: string | null | undefined
  memberCount: number
  levelDistribution: Record<SkillLevel, number>
  openTaskRequirementCount: number
}

export interface EmployeeSkill {
  /** EmployeeSkill row PK. Use this for PUT/DELETE path params. */
  id: Id
  userId: Id
  /** Catalog Skill FK. Use this when adding a new employee skill. */
  skillId: Id
  skillName: string
  skillCategory?: string | null | undefined
  level: SkillLevel | string
  note?: string | null | undefined
}

export interface EmployeeSkillRequest {
  skillId: Id
  level: SkillLevel | string
  note?: string | null | undefined
}
