/**
 * Centralised error message strings — all in English.
 * Import the relevant constant instead of writing inline strings in hooks/components.
 *
 * Convention:
 *   ERR_<VERB>_<RESOURCE>   — generic fallback for a mutation failure
 *   ERR_<DOMAIN>_<DETAIL>   — specific business-rule message (used as toast text)
 */

// ── Auth & User ───────────────────────────────────────────────────────────────
export const ERR_UPDATE_PROFILE  = 'Failed to update profile'
export const ERR_UPDATE_PASSWORD = 'Failed to update password'
export const ERR_ADD_USER        = 'Failed to add user'
export const ERR_UPDATE_USER     = 'Failed to update user'
export const ERR_UPDATE_STATUS   = 'Failed to update status'
export const ERR_UPLOAD_AVATAR   = 'Failed to upload avatar'
export const ERR_AVATAR_PREPARE  = 'Could not prepare avatar image'

// ── File validation (client-side, before upload) ──────────────────────────────
export const ERR_FILE_TYPE_NOT_ALLOWED = 'File type not allowed'
export const ERR_AVATAR_TOO_LARGE      = 'Avatar must be 2 MB or smaller'
export const ERR_ATTACHMENT_TOO_LARGE  = 'Attachment must be 20 MB or smaller'

// ── Project ───────────────────────────────────────────────────────────────────
export const ERR_CREATE_PROJECT  = 'Failed to create project'
export const ERR_UPDATE_PROJECT  = 'Failed to update project'
export const ERR_DELETE_PROJECT  = 'Failed to delete project'
export const ERR_ADD_MEMBER      = 'Failed to add member'
export const ERR_UPDATE_MEMBER   = 'Failed to update member'
export const ERR_REMOVE_MEMBER   = 'Failed to remove member'
export const ERR_MANAGER_UNCHANGED = 'New manager cannot be the current manager'


// ── Project member — specific codes (§12: 4004, 4005, 4008) ──────────────────
export const ERR_MEMBER_ALREADY_EXISTS    = 'This user is already a member of this project.'
export const ERR_ALLOC_EXCEED_CREATE      = "Creating this project would push the manager's peak concurrent allocation above 100%."
export const ERR_ALLOC_EXCEED_ADD         = "Adding this allocation would push the user's peak concurrent allocation above 100%."
export const ERR_ALLOC_EXCEED_UPDATE      = "Updated allocation would push the user's peak concurrent allocation above 100%."
export const ERR_ALLOC_REQUIRED_PM        = 'Manager effort allocation (%) must be between 1 and 100.'
export const ERR_ALLOC_REQUIRED_ADD       = 'Effort allocation (%) is required when adding a member.'
export const ERR_ALLOC_REQUIRED_UPDATE    = 'Effort allocation (%) is required when updating a member.'

// ── Task ──────────────────────────────────────────────────────────────────────
export const ERR_CREATE_TASK        = 'Failed to create task'
export const ERR_UPDATE_TASK        = 'Failed to update task'
export const ERR_DELETE_TASK        = 'Failed to delete task'
export const ERR_TASK_UPDATE_STATUS = 'Failed to update status'
export const ERR_INVALID_TRANSITION = 'Cannot move task to that status from its current state.'
export const ERR_UPDATE_COMMENT     = 'Failed to update comment'
export const ERR_DELETE_COMMENT     = 'Failed to delete comment'
export const ERR_UPLOAD_ATTACHMENT  = 'Failed to upload attachment'
export const ERR_DELETE_ATTACHMENT  = 'Failed to delete attachment'

// ── Task — specific codes (§12: 5005, 5006, 5007, 5008) ──────────────────────
export const ERR_TASK_DATE_REVERSED  = 'Start date must not be after due date.'
export const ERR_TASK_DATE_REQUIRED  = 'At least one of start date or due date is required.'
export const ERR_TASK_SKILL_MISMATCH = 'Assignee does not meet the required skill level for this task.'
export const ERR_TASK_MANAGER_ASSIGNEE = 'Project managers cannot be assigned tasks.'

// ── Skill catalog ─────────────────────────────────────────────────────────────
export const ERR_CREATE_SKILL     = 'Failed to create skill'
export const ERR_UPDATE_SKILL     = 'Failed to update skill'
export const ERR_DELETE_SKILL     = 'Failed to delete skill'
export const ERR_CREATE_CATEGORY  = 'Failed to create category'
export const ERR_UPDATE_CATEGORY  = 'Failed to update category'
export const ERR_DELETE_CATEGORY  = 'Failed to delete category'
export const ERR_ADD_EMP_SKILL    = 'Failed to add skill'
export const ERR_UPDATE_EMP_SKILL = 'Failed to update skill'
export const ERR_REMOVE_EMP_SKILL = 'Failed to remove skill'

// ── Skill / Category — specific codes (§12: 3007, 3008, 3009) ────────────────
export const ERR_CATEGORY_HAS_SKILLS = 'This category still has active skills and cannot be deleted.'
export const ERR_SKILL_HAS_TASKS     = 'This skill is required by one or more active tasks and cannot be deleted.'
export const ERR_SKILL_HAS_MEMBERS   = 'This skill is assigned to one or more members and cannot be deleted.'

// Projects
export const ERR_CHANGE_MANAGER  = 'Failed to change project manager'

// ── Notifications ─────────────────────────────────────────────────────────────
export const ERR_MARK_READ     = 'Failed to mark as read'
export const ERR_MARK_ALL_READ = 'Failed to mark all as read'

// ── Task arrangement ──────────────────────────────────────────────────────────
export const ERR_ARRANGEMENT_STALE = 'The task list changed. Review the refreshed order and try again.'
