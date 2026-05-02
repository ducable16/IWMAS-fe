/**
 * Role-based permission helpers — mirrors §12 permission matrix
 * (api-docs/12-response-and-permissions.md).
 *
 * UI ẨN nút thay vì cố gọi rồi nhận 403. Backend vẫn là nguồn xác thực
 * cuối cùng — đây chỉ là UX gating.
 *
 *   const can = useCan()
 *   if (can.manageProjects) <button>+ New project</button>
 *
 * Hoặc gọi predicates trực tiếp khi không có hook context:
 *   if (canManageProjects(user.role)) ...
 */

import { useAuthStore } from '@/features/auth/store/authStore'

const isAdmin = (r) => r === 'ADMIN'
const isHr    = (r) => r === 'HR'
const isPm    = (r) => r === 'PROJECT_MANAGER'
const isTm    = (r) => r === 'TEAM_MEMBER'
const isAuth  = (r) => isAdmin(r) || isHr(r) || isPm(r) || isTm(r)

// ── User management ───────────────────────────────────────────────────────────
export const canManageUsers      = (r) => isAdmin(r) || isHr(r)
export const canChangeUserRole   = (r) => isAdmin(r)            // HR cannot change role per §12
export const canActivateUser     = (r) => isAdmin(r) || isHr(r)
export const canViewSensitiveUserFields = (r) => isAdmin(r) || isHr(r)

// ── Projects ──────────────────────────────────────────────────────────────────
export const canCreateProject       = (r) => isAdmin(r) || isPm(r)
export const canEditProject         = (r) => isAdmin(r) || isPm(r)
export const canDeleteProject       = (r) => isAdmin(r) || isPm(r)
export const canViewProjectMembers  = (r) => isAuth(r)          // TM read-only
export const canManageProjectMembers = (r) => isAdmin(r) || isPm(r)

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const canCreateTask       = (r) => isAdmin(r) || isPm(r)
export const canEditTask         = (r) => isAdmin(r) || isPm(r)
export const canDeleteTask       = (r) => isAdmin(r) || isPm(r)
export const canUpdateTaskStatus = (r) => isAuth(r)             // any logged-in user
export const canLogTime          = (r) => isAuth(r)
export const canCommentOnTask    = (r) => isAuth(r)
/** Comments are only fully editable by ADMIN — others can only edit/delete their own */
export const canModerateComments = (r) => isAdmin(r)

// ── Skills ────────────────────────────────────────────────────────────────────
export const canManageSkillCatalog   = (r) => isAdmin(r) || isHr(r)
export const canViewSkillCatalog     = (r) => isAuth(r)
export const canManageEmployeeSkills = (r) => isAdmin(r) || isHr(r)
/** TM can manage *their own* skills only */
export const canManageOwnSkills      = (r) => isAuth(r)

// ── Workforce ─────────────────────────────────────────────────────────────────
export const canViewAllWorkload = (r) => isAdmin(r) || isHr(r) || isPm(r)
export const canViewOwnWorkload = (r) => isAuth(r)

// ── Search (§13) ──────────────────────────────────────────────────────────────
export const canSearch = (r) => isAuth(r)

/**
 * Hook: returns a frozen object of computed booleans for the current user's role.
 * Use in components when you need multiple permissions in one place.
 */
export function useCan() {
  const role = useAuthStore((s) => s.user?.role)
  return {
    role,
    isAdmin: isAdmin(role),
    isHr:    isHr(role),
    isPm:    isPm(role),
    isTm:    isTm(role),

    manageUsers:           canManageUsers(role),
    changeUserRole:        canChangeUserRole(role),
    activateUser:          canActivateUser(role),
    viewSensitiveUserFields: canViewSensitiveUserFields(role),

    createProject:         canCreateProject(role),
    editProject:           canEditProject(role),
    deleteProject:         canDeleteProject(role),
    viewProjectMembers:    canViewProjectMembers(role),
    manageProjectMembers:  canManageProjectMembers(role),

    createTask:            canCreateTask(role),
    editTask:              canEditTask(role),
    deleteTask:            canDeleteTask(role),
    updateTaskStatus:      canUpdateTaskStatus(role),
    logTime:               canLogTime(role),
    commentOnTask:         canCommentOnTask(role),
    moderateComments:      canModerateComments(role),

    manageSkillCatalog:    canManageSkillCatalog(role),
    viewSkillCatalog:      canViewSkillCatalog(role),
    manageEmployeeSkills:  canManageEmployeeSkills(role),
    manageOwnSkills:       canManageOwnSkills(role),

    viewAllWorkload:       canViewAllWorkload(role),
    viewOwnWorkload:       canViewOwnWorkload(role),

    search:                canSearch(role),
  }
}
