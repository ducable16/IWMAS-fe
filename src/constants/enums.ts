/**
 * Centralised enum definitions — mirrors api-docs/11-enums.md.
 * Bất cứ chỗ nào hiển thị enum (label, badge, dot…) phải import từ file này
 * để khi backend thêm/đổi value chỉ phải sửa một chỗ.
 *
 * Quy ước:
 *   *_VALUES   — array các value backend trả về (giữ thứ tự hiển thị mong muốn)
 *   *_LABEL    — { value: 'Display Text' }
 *   *_META     — { value: { label, badge, dot, color, cls } } cho component dùng nhiều style
 */

// ── User roles ────────────────────────────────────────────────────────────────
export const USER_ROLES = ['ADMIN', 'HR', 'PROJECT_MANAGER', 'TEAM_MEMBER'] as const
export type UserRole = typeof USER_ROLES[number]

export const USER_ROLE_LABEL = {
  ADMIN:           'Admin',
  HR:              'HR',
  PROJECT_MANAGER: 'Project Manager',
  TEAM_MEMBER:     'Team Member',
}

/** Short labels for table columns / compact badges */
export const USER_ROLE_SHORT_LABEL = {
  ADMIN:           'Admin',
  HR:              'HR',
  PROJECT_MANAGER: 'PM',
  TEAM_MEMBER:     'Member',
}

export const USER_ROLE_BADGE = {
  ADMIN:           'badge-danger',
  HR:              'badge-warning',
  PROJECT_MANAGER: 'badge-accent',
  TEAM_MEMBER:     'badge-neutral',
}

// ── Project status ────────────────────────────────────────────────────────────
export const PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
export type ProjectStatus = typeof PROJECT_STATUSES[number]

export const PROJECT_STATUS_LABEL = {
  PLANNING:    'Planning',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
}

export const PROJECT_STATUS_META = {
  PLANNING:    { label: 'PLANNING',    color: 'bg-[#8db5f8] text-slate-800 font-bold tracking-wide', dot: 'bg-info'    },
  IN_PROGRESS: { label: 'IN PROGRESS', color: 'bg-[#8db5f8] text-slate-800 font-bold tracking-wide', dot: 'bg-accent'  },
  COMPLETED:   { label: 'COMPLETED',   color: 'bg-[#a6d86e] text-slate-800 font-bold tracking-wide', dot: 'bg-success' },
  CANCELLED:   { label: 'CANCELLED',   color: 'bg-rose-300  text-slate-800 font-bold tracking-wide', dot: 'bg-danger'  },
}

// ── Project role-in-project ───────────────────────────────────────────────────
// API §11: PROJECT_MANAGER | MEMBER
export const PROJECT_ROLES = ['PROJECT_MANAGER', 'MEMBER'] as const
export type ProjectRole = typeof PROJECT_ROLES[number]

export const PROJECT_ROLE_LABEL = {
  PROJECT_MANAGER: 'Project Manager',
  MEMBER:          'Member',
}

// ── Task status ───────────────────────────────────────────────────────────────
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const
export type TaskStatus = typeof TASK_STATUSES[number]

export const TASK_STATUS_LABEL = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
  CANCELLED:   'Cancelled',
}

/** Background+text classes for status pills (TaskFilterDrawer / TasksPage) */
export const TASK_STATUS_META = {
  TODO:        { label: 'TO DO',       color: 'bg-[#e2e4e6] text-slate-800 font-bold tracking-wide' },
  IN_PROGRESS: { label: 'IN PROGRESS', color: 'bg-[#8db5f8] text-slate-800 font-bold tracking-wide' },
  DONE:        { label: 'DONE',        color: 'bg-[#a6d86e] text-slate-800 font-bold tracking-wide' },
  CANCELLED:   { label: 'CANCELLED',   color: 'bg-rose-300 text-slate-800 font-bold tracking-wide'  },
}

/** Border-style pills for the task detail page */
export const TASK_STATUS_DETAIL_META = {
  TODO:        { label: 'TO DO',       cls: 'bg-[#e2e4e6] text-slate-800 font-bold border-transparent tracking-wide' },
  IN_PROGRESS: { label: 'IN PROGRESS', cls: 'bg-[#8db5f8] text-slate-800 font-bold border-transparent tracking-wide' },
  DONE:        { label: 'DONE',        cls: 'bg-[#a6d86e] text-slate-800 font-bold border-transparent tracking-wide' },
  CANCELLED:   { label: 'CANCELLED',   cls: 'bg-rose-300 text-slate-800 font-bold border-transparent tracking-wide'  },
}

export const TASK_STATUS_TRANSITIONS = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DONE', 'TODO', 'CANCELLED'],
  DONE: ['IN_PROGRESS', 'TODO'],
  CANCELLED: ['TODO'],
} satisfies Record<TaskStatus, TaskStatus[]>

// ── Task type ─────────────────────────────────────────────────────────────────
export const TASK_TYPES = ['FEATURE', 'BUG', 'RESEARCH'] as const
export type TaskType = typeof TASK_TYPES[number]

export const TASK_TYPE_LABEL = {
  FEATURE:     'Feature',
  BUG:         'Bug',
  RESEARCH:    'Research',
}

export const TASK_TYPE_META = {
  FEATURE:     { label: 'FEATURE',  color: 'bg-indigo-100 text-indigo-700 border border-indigo-300' },
  BUG:         { label: 'BUG',      color: 'bg-rose-100   text-rose-700   border border-rose-300'   },
  RESEARCH:    { label: 'RESEARCH', color: 'bg-violet-100 text-violet-700 border border-violet-300' },
}

// ── Task priority ─────────────────────────────────────────────────────────────
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export type TaskPriority = typeof TASK_PRIORITIES[number]

export const TASK_PRIORITY_LABEL = {
  LOW:      'Low',
  MEDIUM:   'Medium',
  HIGH:     'High',
  CRITICAL: 'Critical',
}

export const TASK_PRIORITY_META = {
  LOW:      { label: 'Low',      icon: '▼', dot: 'bg-border-strong', color: 'text-text-secondary'        },
  MEDIUM:   { label: 'Medium',   icon: '●', dot: 'bg-warning',       color: 'text-warning'               },
  HIGH:     { label: 'High',     icon: '▲', dot: 'bg-danger',        color: 'text-danger'                },
  CRITICAL: { label: 'Critical', icon: '⬤', dot: 'bg-danger',        color: 'text-danger font-semibold'  },
}

// ── Skill level ───────────────────────────────────────────────────────────────
export const TASK_ACTIVITY_TYPES = [
  'TASK_CREATED',
  'STATUS_CHANGED',
  'PRIORITY_CHANGED',
  'TYPE_CHANGED',
  'TITLE_CHANGED',
  'DESCRIPTION_CHANGED',
  'ESTIMATE_CHANGED',
  'ASSIGNEE_CHANGED',
  'START_DATE_CHANGED',
  'DUE_DATE_CHANGED',
  'ATTACHMENT_ADDED',
  'ATTACHMENT_REMOVED',
  'TASK_DELETED',
] as const
export type TaskActivityType = typeof TASK_ACTIVITY_TYPES[number]

export const TASK_ACTIVITY_LABEL = {
  TASK_CREATED: 'Task created',
  STATUS_CHANGED: 'Status changed',
  PRIORITY_CHANGED: 'Priority changed',
  TYPE_CHANGED: 'Type changed',
  TITLE_CHANGED: 'Title changed',
  DESCRIPTION_CHANGED: 'Description changed',
  ESTIMATE_CHANGED: 'Estimate changed',
  ASSIGNEE_CHANGED: 'Assignee changed',
  START_DATE_CHANGED: 'Start date changed',
  DUE_DATE_CHANGED: 'Due date changed',
  ATTACHMENT_ADDED: 'Attachment added',
  ATTACHMENT_REMOVED: 'Attachment removed',
  TASK_DELETED: 'Task deleted',
} satisfies Record<TaskActivityType, string>

export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const
export type SkillLevel = typeof SKILL_LEVELS[number]

export const SKILL_LEVEL_LABEL = {
  BEGINNER:     'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED:     'Advanced',
  EXPERT:       'Expert',
}

export const SKILL_LEVEL_META = {
  BEGINNER:     { label: 'Beginner',     badge: 'badge-neutral' },
  INTERMEDIATE: { label: 'Intermediate', badge: 'badge-info'    },
  ADVANCED:     { label: 'Advanced',     badge: 'badge-accent'  },
  EXPERT:       { label: 'Expert',       badge: 'badge-success' },
}

// ── Risk level (burnout) ──────────────────────────────────────────────────────
// ── User active/status (derived from `active: boolean`) ───────────────────────
export const USER_STATUS_META = {
  ACTIVE:   { label: 'Active',   color: 'bg-[#a6d86e] text-slate-800 font-bold tracking-wide', dot: 'bg-success' },
  DISABLED: { label: 'Disabled', color: 'bg-rose-300  text-slate-800 font-bold tracking-wide', dot: 'bg-danger'  },
  INVITED:  { label: 'Invited',  color: 'bg-[#8db5f8] text-slate-800 font-bold tracking-wide', dot: 'bg-info'    },
}

// ── Search source (§13) ───────────────────────────────────────────────────────
export const SEARCH_SOURCES = ['redis', 'elasticsearch', 'database'] as const
export type SearchSource = typeof SEARCH_SOURCES[number]

export const SEARCH_SOURCE_LABEL = {
  redis:         'Redis cache',
  elasticsearch: 'Elasticsearch',
  database:      'Database (fallback)',
}

// ── Workload level (§9 / §11) ─────────────────────────────────────────────────
//
// v3 risk badge — driven by the schedule simulation, not raw utilisation.
// Severity (worst first): OVERDUE > WILL_SLIP > TIGHT > HEALTHY > AVAILABLE
export const WORKLOAD_LEVELS = [
  'OVERDUE', 'WILL_SLIP', 'TIGHT', 'HEALTHY', 'AVAILABLE', 'BLOCKED', 'UNDEFINED',
] as const
export type WorkloadLevel = typeof WORKLOAD_LEVELS[number]

export const WORKLOAD_LEVEL_META = {
  OVERDUE:   { label: 'Overdue',   bg: 'bg-danger/15',        text: 'text-danger',     dot: 'bg-danger',        border: 'border-danger/25'     },
  WILL_SLIP: { label: 'Will Slip', bg: 'bg-orange-500/15',    text: 'text-orange-600', dot: 'bg-orange-500',    border: 'border-orange-500/25' },
  TIGHT:     { label: 'Tight',     bg: 'bg-warning/15',       text: 'text-warning',    dot: 'bg-warning',       border: 'border-warning/25'    },
  HEALTHY:   { label: 'Healthy',   bg: 'bg-success/15',       text: 'text-success',    dot: 'bg-success',       border: 'border-success/25'    },
  AVAILABLE: { label: 'Available', bg: 'bg-info/15',          text: 'text-info',       dot: 'bg-info',          border: 'border-info/25'       },
  BLOCKED:   { label: 'Observer',  bg: 'bg-bg-subtle',        text: 'text-text-muted', dot: 'bg-border-strong', border: 'border-border-subtle'  },
  UNDEFINED: { label: 'N/A',       bg: 'bg-bg-subtle',        text: 'text-text-muted', dot: 'bg-border-subtle', border: 'border-border-subtle'  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert an enum map into <option> array: [{ value, label }] */
export function toOptions<T extends Record<string, string>>(labelMap: T) {
  return Object.entries(labelMap).map(([value, label]) => ({ value, label }))
}
