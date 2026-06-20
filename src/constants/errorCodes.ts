/**
 * Backend business error codes — mirrors §12 of the API docs.
 * Use getApiErrorCode(err) to extract the code, then compare with these constants.
 *
 * @example
 * const code = getApiErrorCode(err)
 * if (code === ERROR_CODES.SKILL_CATEGORY_HAS_SKILLS) toast.error(ERR_CATEGORY_HAS_SKILLS)
 */
export const ERROR_CODES = {
  // ── §5 Task ────────────────────────────────────────────────────────────────
  TASK_DATE_REVERSED:           5005,
  TASK_DATE_REQUIRED:           5006,
  TASK_ASSIGNEE_SKILL_MISSING:  5007,

  // ── §3 Skill / Category ────────────────────────────────────────────────────
  SKILL_CATEGORY_HAS_SKILLS:    3007,
  SKILL_HAS_TASK_REQUIREMENTS:  3008,
  SKILL_HAS_MEMBER_ASSIGNMENTS: 3009,

  // ── §4 Project ─────────────────────────────────────────────────────────────
  PROJECT_MEMBER_EXISTS:        4004,
  PROJECT_ALLOC_EXCEED:         4005,
  PROJECT_CODE_IMMUTABLE:       4007,
  PROJECT_EFFORT_REQUIRED:      4008,
  PROJECT_MANAGER_IMMUTABLE:    4009,

  // ── §9 File & Search ───────────────────────────────────────────────────────
  FILE_TOO_LARGE:               9991,
  FILE_TYPE_NOT_ALLOWED:        9992,
  ATTACHMENT_NOT_FOUND:         9993,
  DOCUMENT_NOT_FOUND:           9994,
  SEARCH_INVALID_SKILLS:        9504,
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
