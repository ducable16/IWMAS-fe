/**
 * Role-based permission helpers. Backend remains the source of truth;
 * these helpers only gate UI affordances.
 */

import { useAuthStore } from '@/features/auth/store/authStore'
import type { UserRole } from '@/constants/enums'

type MaybeRole = UserRole | string | null | undefined

const isAdmin = (r: MaybeRole): boolean => r === 'ADMIN'
const isHr = (r: MaybeRole): boolean => r === 'HR'
const isPm = (r: MaybeRole): boolean => r === 'PROJECT_MANAGER'
const isTm = (r: MaybeRole): boolean => r === 'TEAM_MEMBER'
const isAuth = (r: MaybeRole): boolean => isAdmin(r) || isHr(r) || isPm(r) || isTm(r)

export const canManageUsers = (r: MaybeRole): boolean => isAdmin(r) || isHr(r)
export const canChangeUserRole = (r: MaybeRole): boolean => isAdmin(r)
export const canActivateUser = (r: MaybeRole): boolean => isAdmin(r)
export const canViewSensitiveUserFields = (r: MaybeRole): boolean => isAdmin(r) || isHr(r)

export const canCreateProject = (r: MaybeRole): boolean => isAdmin(r) || isPm(r)
export const canEditProject = (r: MaybeRole): boolean => isAdmin(r) || isPm(r)
export const canDeleteProject = (r: MaybeRole): boolean => isAdmin(r) || isPm(r)
export const canViewProjectMembers = (r: MaybeRole): boolean => isAuth(r)
export const canManageProjectMembers = (r: MaybeRole): boolean => isAdmin(r) || isPm(r)

export const canCreateTask = (r: MaybeRole): boolean => isAdmin(r) || isPm(r)
export const canEditTask = (r: MaybeRole): boolean => isAdmin(r) || isPm(r)
export const canDeleteTask = (r: MaybeRole): boolean => isAdmin(r) || isPm(r)
export const canUpdateTaskStatus = (r: MaybeRole): boolean => isAuth(r)
export const canLogTime = (r: MaybeRole): boolean => isAuth(r)
export const canCommentOnTask = (r: MaybeRole): boolean => isAuth(r)
export const canModerateComments = (r: MaybeRole): boolean => isAdmin(r)

export const canManageSkillCatalog = (r: MaybeRole): boolean => isAdmin(r)
export const canViewSkillCatalog = (r: MaybeRole): boolean => isAuth(r)
export const canManageEmployeeSkills = (r: MaybeRole): boolean => isHr(r)
export const canManageOwnSkills = (r: MaybeRole): boolean => isHr(r)

export const canViewAllWorkload = (r: MaybeRole): boolean => isAdmin(r) || isHr(r) || isPm(r)
export const canViewOwnWorkload = (r: MaybeRole): boolean => isAuth(r)

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
    updateTaskStatus: canUpdateTaskStatus(role),
    logTime: canLogTime(role),
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
