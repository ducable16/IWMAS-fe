/**
 * Common Badge system — all status/type chips inherit from BaseBadge.
 * Each concrete badge (TaskStatusBadge, TaskTypeBadge, ProjectStatusBadge, ...)
 * only needs to pass the right meta object; the rendering is identical.
 *
 * Convention in enums.js: every *_META entry MUST have `label` and `color`.
 *   - `color` is a Tailwind class string applied to the badge.
 *   - `label` is the displayed text.
 */
import clsx from 'clsx'
import {
  TASK_STATUS_META,
  TASK_STATUS_DETAIL_META,
  TASK_TYPE_META,
  PROJECT_STATUS_META,
  TASK_PRIORITY_META,
  USER_STATUS_META,
  RISK_LEVEL_META,
} from '@/constants/enums'

// ── Base ─────────────────────────────────────────────────────────────────────

/**
 * The single source-of-truth renderer for all status/type badges.
 * @param {string} label      - Display text (already comes from meta.label)
 * @param {string} colorClass - Tailwind class(es) for background + text
 * @param {string} [className]- Extra classes (e.g. for size overrides)
 */
export function BaseBadge({ label, colorClass, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center px-2 py-0.5 rounded-md',
        'text-[11px] font-bold uppercase tracking-wide whitespace-nowrap',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  )
}

// ── Task Status ───────────────────────────────────────────────────────────────

/**
 * @param {string} status  - e.g. "DONE" | "IN_PROGRESS" | …
 * @param {'default'|'detail'} [variant] - uses DETAIL_META on detail page
 */
export function TaskStatusBadge({ status, variant = 'default', className }) {
  const meta = (variant === 'detail' ? TASK_STATUS_DETAIL_META : TASK_STATUS_META)[status]
    ?? { label: status, color: 'bg-bg-subtle text-text-muted', cls: 'bg-bg-subtle text-text-muted' }
  return <BaseBadge label={meta.label} colorClass={meta.color ?? meta.cls} className={className} />
}

// ── Task Type ─────────────────────────────────────────────────────────────────

/** @param {string} type - e.g. "FEATURE" | "BUG" | "RESEARCH" */
export function TaskTypeBadge({ type, className }) {
  const meta = TASK_TYPE_META[type] ?? { label: type, color: 'bg-bg-subtle text-text-muted border border-border' }
  return <BaseBadge label={meta.label} colorClass={meta.color ?? meta.cls} className={className} />
}

// ── Project Status ────────────────────────────────────────────────────────────

/** @param {string} status - e.g. "PLANNING" | "COMPLETED" | … */
export function ProjectStatusBadge({ status, className }) {
  const meta = PROJECT_STATUS_META[status] ?? { label: status, color: 'bg-bg-subtle text-text-muted' }
  return <BaseBadge label={meta.label} colorClass={meta.color} className={className} />
}

// ── Task Priority ────────────────────────────────────────────────────────────

/** @param {string} priority - e.g. "HIGH" | "LOW" | … */
export function TaskPriorityBadge({ priority, className }) {
  const meta = TASK_PRIORITY_META[priority] ?? { label: priority, color: 'text-text-muted' }
  // Priority uses text color only — no background chip; styled as inline tag
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-[12px] font-medium',
        meta.color,
        className,
      )}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  )
}

// ── User Status ───────────────────────────────────────────────────────────────

/** @param {string} status - "ACTIVE" | "DISABLED" | "INVITED" */
export function UserStatusBadge({ status, className }) {
  const meta = USER_STATUS_META[status] ?? { label: status, color: 'bg-bg-subtle text-text-muted' }
  return <BaseBadge label={meta.label} colorClass={meta.color} className={className} />
}

// ── Risk Level ────────────────────────────────────────────────────────────────

/** @param {string} level - "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" */
export function RiskLevelBadge({ level, className }) {
  const meta = RISK_LEVEL_META[level] ?? { label: level, color: 'bg-bg-subtle text-text-muted' }
  return <BaseBadge label={meta.label} colorClass={meta.color} className={className} />
}
