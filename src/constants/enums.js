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
export const USER_ROLES = ['ADMIN', 'HR', 'PROJECT_MANAGER', 'TEAM_MEMBER']

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
export const PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

export const PROJECT_STATUS_LABEL = {
  PLANNING:    'Planning',
  IN_PROGRESS: 'In Progress',
  ON_HOLD:     'On Hold',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
}

export const PROJECT_STATUS_META = {
  PLANNING:    { label: 'Planning',    dot: 'bg-info',    badge: 'badge-info'    },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-accent',  badge: 'badge-accent'  },
  ON_HOLD:     { label: 'On Hold',     dot: 'bg-warning', badge: 'badge-warning' },
  COMPLETED:   { label: 'Completed',   dot: 'bg-success', badge: 'badge-success' },
  CANCELLED:   { label: 'Cancelled',   dot: 'bg-danger',  badge: 'badge-danger'  },
}



// ── Project role-in-project ───────────────────────────────────────────────────
export const PROJECT_ROLES = ['MANAGER', 'TECH_LEAD', 'DEVELOPER', 'DESIGNER', 'QA', 'MEMBER']

export const PROJECT_ROLE_LABEL = {
  MANAGER:   'Project Manager',
  TECH_LEAD: 'Tech Lead',
  DEVELOPER: 'Developer',
  DESIGNER:  'Designer',
  QA:        'QA',
  MEMBER:    'Member',
}

// ── Task status ───────────────────────────────────────────────────────────────
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']

export const TASK_STATUS_LABEL = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
  CANCELLED:   'Cancelled',
}

/** Background+text classes for status pills (TaskFilterDrawer / TasksPage) */
export const TASK_STATUS_META = {
  TODO:        { label: 'To Do',       color: 'bg-bg-hover text-text-secondary'   },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-accent/15 text-accent'          },
  IN_REVIEW:   { label: 'In Review',   color: 'bg-info-subtle text-info'          },
  DONE:        { label: 'Done',        color: 'bg-success-subtle text-success'    },
  CANCELLED:   { label: 'Cancelled',   color: 'bg-danger-subtle text-danger'      },
}

/** Border-style pills for the task detail page */
export const TASK_STATUS_DETAIL_META = {
  TODO:        { label: 'To Do',       cls: 'bg-bg-subtle text-text-secondary border-border'              },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-accent/10 text-accent border-accent/20'                   },
  IN_REVIEW:   { label: 'In Review',   cls: 'bg-[#1d6fa4]/10 text-[#1d6fa4] border-[#1d6fa4]/20'         },
  DONE:        { label: 'Done',        cls: 'bg-success/10 text-success border-success/20'               },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-danger/10 text-danger border-danger/20'                  },
}

// ── Task type ─────────────────────────────────────────────────────────────────
export const TASK_TYPES = ['FEATURE', 'BUG', 'IMPROVEMENT', 'RESEARCH', 'TASK']

export const TASK_TYPE_LABEL = {
  FEATURE:     'Feature',
  BUG:         'Bug',
  IMPROVEMENT: 'Improvement',
  RESEARCH:    'Research',
  TASK:        'Task',
}

export const TASK_TYPE_META = {
  FEATURE:     { label: 'Feature',     cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' },
  BUG:         { label: 'Bug',         cls: 'bg-rose-500/15 text-rose-400 border-rose-500/25'      },
  IMPROVEMENT: { label: 'Improvement', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25'   },
  RESEARCH:    { label: 'Research',    cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  TASK:        { label: 'Task',        cls: 'bg-sky-500/15 text-sky-400 border-sky-500/25'         },
}

// ── Task priority ─────────────────────────────────────────────────────────────
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

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
export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']

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
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const RISK_LEVEL_LABEL = {
  LOW:      'Low risk',
  MEDIUM:   'Medium risk',
  HIGH:     'High risk',
  CRITICAL: 'Critical',
}

export const RISK_LEVEL_META = {
  LOW:      { label: 'Low',      badge: 'badge-success', dot: 'bg-success' },
  MEDIUM:   { label: 'Medium',   badge: 'badge-warning', dot: 'bg-warning' },
  HIGH:     { label: 'High',     badge: 'badge-danger',  dot: 'bg-danger'  },
  CRITICAL: { label: 'Critical', badge: 'badge-danger',  dot: 'bg-danger'  },
}

// ── User active/status (derived from `active: boolean`) ───────────────────────
export const USER_STATUS_META = {
  ACTIVE:   { label: 'Active',   badge: 'badge-success', dot: 'bg-success' },
  DISABLED: { label: 'Disabled', badge: 'badge-danger',  dot: 'bg-danger'  },
  INVITED:  { label: 'Invited',  badge: 'badge-info',    dot: 'bg-info'    },
}

// ── Search source (§13) ───────────────────────────────────────────────────────
export const SEARCH_SOURCES = ['redis', 'elasticsearch', 'database']

export const SEARCH_SOURCE_LABEL = {
  redis:         'Redis cache',
  elasticsearch: 'Elasticsearch',
  database:      'Database (fallback)',
}

// ── Workload level (§9 / §11) ─────────────────────────────────────────────────
export const WORKLOAD_LEVELS = ['AVAILABLE', 'HEALTHY_BUSY', 'OVERLOADED']

export const WORKLOAD_LEVEL_META = {
  AVAILABLE:    { label: 'Available',    bg: 'bg-success/15', text: 'text-success', dot: 'bg-success', border: 'border-success/25' },
  HEALTHY_BUSY: { label: 'Healthy Busy', bg: 'bg-warning/15', text: 'text-warning', dot: 'bg-warning', border: 'border-warning/25' },
  OVERLOADED:   { label: 'Overloaded',   bg: 'bg-danger/15',  text: 'text-danger',  dot: 'bg-danger',  border: 'border-danger/25'  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert an enum map into <option> array: [{ value, label }] */
export function toOptions(labelMap) {
  return Object.entries(labelMap).map(([value, label]) => ({ value, label }))
}
