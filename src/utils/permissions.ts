/**
 * Role-based permission helpers. Backend remains the source of truth;
 * these helpers only gate UI affordances.
 */

import { useAuthStore } from '@/features/auth/store/authStore'
import type { UserRole } from '@/constants/enums'

type MaybeRole = UserRole | string | null | undefined

export type PageCapability =
  | 'projects'
  | 'tasks'
  | 'workload'
  | 'members'
  | 'settings'

const isAdmin = (r: MaybeRole): boolean => r === 'ADMIN'
const isHr = (r: MaybeRole): boolean => r === 'HR'
const isPm = (r: MaybeRole): boolean => r === 'PROJECT_MANAGER'
const isTm = (r: MaybeRole): boolean => r === 'TEAM_MEMBER'
const isAuth = (r: MaybeRole): boolean => isAdmin(r) || isHr(r) || isPm(r) || isTm(r)
const isDeliveryRole = (r: MaybeRole): boolean => isPm(r) || isTm(r)

export const canParticipateInDelivery = (r: MaybeRole): boolean => isDeliveryRole(r)

export const canAccessPage = (r: MaybeRole, capability: PageCapability): boolean => {
  if (!isAuth(r)) return false
  if (capability === 'members' || capability === 'settings') return true
  return isDeliveryRole(r)
}

export const canManageUsers = (r: MaybeRole): boolean => isAdmin(r) || isHr(r)
export const canChangeUserRole = (r: MaybeRole): boolean => isAdmin(r)
export const canActivateUser = (r: MaybeRole): boolean => isAdmin(r)
export const canViewSensitiveUserFields = (r: MaybeRole): boolean => isAdmin(r) || isHr(r)

export const canCreateProject = (r: MaybeRole): boolean => isPm(r)
export const canEditProject = (r: MaybeRole): boolean => isPm(r)
export const canDeleteProject = (r: MaybeRole): boolean => isPm(r)
export const canViewProjectMembers = (r: MaybeRole): boolean => isDeliveryRole(r)
export const canManageProjectMembers = (r: MaybeRole): boolean => isPm(r)

export const canCreateTask = (r: MaybeRole): boolean => isPm(r)
export const canEditTask = (r: MaybeRole): boolean => isPm(r)
export const canDeleteTask = (r: MaybeRole): boolean => isPm(r)

/** Contextual task mutation rule for update, status and date changes. */
export const canModifyTask = (
  r: MaybeRole,
  currentUserId: string | number | null | undefined,
  assigneeId: string | number | null | undefined,
): boolean => isPm(r) || (isTm(r) && currentUserId != null && assigneeId != null
  && String(currentUserId) === String(assigneeId))
export const canCommentOnTask = (r: MaybeRole): boolean => isDeliveryRole(r)
export const canModerateComments = (_r: MaybeRole): boolean => false

export const canManageSkillCatalog = (r: MaybeRole): boolean => isAdmin(r)
export const canViewSkillCatalog = (r: MaybeRole): boolean => isAuth(r)
export const canManageEmployeeSkills = (r: MaybeRole): boolean => isHr(r)
export const canManageOwnSkills = (r: MaybeRole): boolean => isHr(r)

export const canViewAllWorkload = (r: MaybeRole): boolean => isPm(r)
export const canViewOwnWorkload = (r: MaybeRole): boolean => isDeliveryRole(r)

export const canSearch = (r: MaybeRole): boolean => isAuth(r)

export function useCan() {
  const role = useAuthStore((s) => s.user?.role)
  return {
    role,
    isAdmin: isAdmin(role),
    isHr: isHr(role),
    isPm: isPm(role),
    isTm: isTm(role),

    manageUsers: canManageUsers(role),
    changeUserRole: canChangeUserRole(role),
    activateUser: canActivateUser(role),
    viewSensitiveUserFields: canViewSensitiveUserFields(role),

    createProject: canCreateProject(role),
    editProject: canEditProject(role),
    deleteProject: canDeleteProject(role),
    viewProjectMembers: canViewProjectMembers(role),
    manageProjectMembers: canManageProjectMembers(role),

    createTask: canCreateTask(role),
    editTask: canEditTask(role),
    deleteTask: canDeleteTask(role),
    commentOnTask: canCommentOnTask(role),
    moderateComments: canModerateComments(role),

    manageSkillCatalog: canManageSkillCatalog(role),
    viewSkillCatalog: canViewSkillCatalog(role),
    manageEmployeeSkills: canManageEmployeeSkills(role),
    manageOwnSkills: canManageOwnSkills(role),

    viewAllWorkload: canViewAllWorkload(role),
    viewOwnWorkload: canViewOwnWorkload(role),

    search: canSearch(role),
  }
}
