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

interface BadgeMeta {
  label: string
  color?: string | undefined
  cls?: string | undefined
  icon?: string | undefined
}

interface BaseBadgeProps {
  label: string
  colorClass?: string | undefined
  className?: string | undefined
}

interface StatusBadgeProps {
  status: string
  className?: string | undefined
}

interface TaskStatusBadgeProps extends StatusBadgeProps {
  variant?: 'default' | 'detail'
}

interface TaskTypeBadgeProps {
  type: string
  className?: string | undefined
}

interface TaskPriorityBadgeProps {
  priority: string
  className?: string | undefined
}

interface RiskLevelBadgeProps {
  level: string
  className?: string | undefined
}

function metaFrom<T extends Record<string, BadgeMeta>>(
  metaMap: T,
  key: string | null | undefined,
  fallback: BadgeMeta,
): BadgeMeta {
  return (key ? metaMap[key] : undefined) ?? fallback
}

export function BaseBadge({ label, colorClass, className }: BaseBadgeProps) {
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

export function TaskStatusBadge({ status, variant = 'default', className }: TaskStatusBadgeProps) {
  const map = variant === 'detail' ? TASK_STATUS_DETAIL_META : TASK_STATUS_META
  const meta = metaFrom(map, status, {
    label: status,
    color: 'bg-bg-subtle text-text-muted',
    cls: 'bg-bg-subtle text-text-muted',
  })
  return <BaseBadge label={meta.label} colorClass={meta.color ?? meta.cls} className={className} />
}

export function TaskTypeBadge({ type, className }: TaskTypeBadgeProps) {
  const meta = metaFrom(TASK_TYPE_META, type, {
    label: type,
    color: 'bg-bg-subtle text-text-muted border border-border',
  })
  return <BaseBadge label={meta.label} colorClass={meta.color ?? meta.cls} className={className} />
}

export function ProjectStatusBadge({ status, className }: StatusBadgeProps) {
  const meta = metaFrom(PROJECT_STATUS_META, status, {
    label: status,
    color: 'bg-bg-subtle text-text-muted',
  })
  return <BaseBadge label={meta.label} colorClass={meta.color} className={className} />
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  const meta = metaFrom(TASK_PRIORITY_META, priority, {
    label: priority,
    color: 'text-text-muted',
  })
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

export function UserStatusBadge({ status, className }: StatusBadgeProps) {
  const meta = metaFrom(USER_STATUS_META, status, {
    label: status,
    color: 'bg-bg-subtle text-text-muted',
  })
  return <BaseBadge label={meta.label} colorClass={meta.color} className={className} />
}

export function RiskLevelBadge({ level, className }: RiskLevelBadgeProps) {
  const meta = metaFrom(RISK_LEVEL_META, level, {
    label: level,
    color: 'bg-bg-subtle text-text-muted',
  })
  return <BaseBadge label={meta.label} colorClass={meta.color} className={className} />
}
