import type { Id } from './api'
import type { ProjectRole, ProjectStatus } from '@/constants/enums'

export interface Project {
  id: Id
  code?: string | undefined
  name: string
  description?: string | null
  status?: ProjectStatus | string | undefined
  startDate?: string | null
  endDate?: string | null
  actualEndDate?: string | null
  managerId?: Id | null | undefined
  managerName?: string | null | undefined
  createdAt?: string | null
}

export interface ProjectMember {
  id: Id
  projectId: Id
  userId: Id
  userFullName?: string | undefined
  roleInProject: ProjectRole | string
  allocatedEffortPercent?: number | null | undefined
  joinDate?: string | null
  leaveDate?: string | null
  note?: string | null
}


export interface ProjectListResult {
  projects: Project[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateProjectRequest {
  name: string
  code?: string | undefined
  description?: string | undefined
  status?: ProjectStatus | string | undefined
  startDate?: string | undefined
  endDate?: string | undefined
  managerId: Id
  managerAllocationPercent: number
}

export interface UpdateProjectRequest {
  name?: string | undefined
  code?: string | undefined
  description?: string | undefined
  status?: ProjectStatus | string | undefined
  startDate?: string | undefined
  endDate?: string | undefined
  managerId?: Id | undefined
}

export interface ProjectMemberRequest {
  userId: Id
  roleInProject?: ProjectRole | string | undefined
  allocatedEffortPercent: number
  joinDate?: string | undefined
  leaveDate?: string | null
  note?: string | undefined
}
