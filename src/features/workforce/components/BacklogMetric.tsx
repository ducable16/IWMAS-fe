import clsx from 'clsx'

type BacklogMetricProps = {
  days?: number | null | undefined
  hours?: number | null | undefined
  compact?: boolean
  variant?: 'default' | 'analytics-row'
}


/** Backlog depth shown in real units; it is deliberately not rendered as a percentage. */
export default function BacklogMetric({
  days,
  hours,
  compact = false,
  variant = 'default',
}: BacklogMetricProps) {
  if (days === null || days === undefined) {
    return (
      <span
        className={clsx(
          'text-text-muted',
          variant === 'analytics-row' ? 'text-[12px]' : 'text-[11.5px]',
        )}
      >
        No capacity data
      </span>
    )
  }

  if (variant === 'analytics-row') {
    return (
      <span className="text-[13px] font-bold tabular-nums text-text-primary">
        {Math.max(0, days).toFixed(1)} workdays
      </span>
    )
  }

  return (
    <div className={clsx('flex items-baseline gap-1.5', !compact && 'flex-wrap')}>
      <span className="text-[13px] font-bold tabular-nums text-text-primary">
        {Math.max(0, days).toFixed(1)} workdays
      </span>
      {!compact && hours !== null && hours !== undefined && (
        <span className="text-[11px] text-text-primary tabular-nums">
          ({Math.max(0, hours).toFixed(1)}h)
        </span>
      )}
    </div>
  )
}
