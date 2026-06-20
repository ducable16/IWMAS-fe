import clsx from 'clsx'
import type { WorkloadLevel } from '@/constants/enums'

type WorkloadBarProps = {
  workloadPercent?: number | null | undefined
  workloadLevel?: WorkloadLevel | string | null | undefined
  compact?: boolean
}

/** Progress bar for the workload tightness ratio returned by API section 9. */
export default function WorkloadBar({
  workloadPercent = null,
  workloadLevel = 'AVAILABLE',
  compact = false,
}: WorkloadBarProps) {
  if (workloadPercent === null || workloadPercent === undefined) {
    return (
      <div className={clsx('w-full', compact ? 'min-w-[100px]' : 'min-w-[140px]')}>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full border border-border-subtle bg-bg-subtle" />
          <span className="shrink-0 text-[12px] font-bold tabular-nums text-text-muted">-</span>
        </div>
        {!compact && <p className="mt-1 text-[11px] text-text-muted">No capacity data</p>}
      </div>
    )
  }

  const percent = Math.max(0, workloadPercent)
  const level = String(workloadLevel || 'AVAILABLE')
  const isOverloaded = level === 'OVERDUE' || level === 'WILL_SLIP' || percent > 100
  const width = Math.min(percent, 100)
  const barColor = isOverloaded
    ? 'bg-orange-500'
    : level === 'TIGHT'
      ? 'bg-warning'
      : level === 'AVAILABLE'
        ? 'bg-info'
        : 'bg-success'
  const textColor = isOverloaded
    ? 'text-orange-600'
    : level === 'TIGHT'
      ? 'text-warning'
      : level === 'AVAILABLE'
        ? 'text-info'
        : 'text-success'

  return (
    <div className={clsx('w-full', compact ? 'min-w-[100px]' : 'min-w-[140px]')}>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full border border-border-subtle bg-bg-subtle">
          <div
            className={clsx(
              'h-full rounded-full',
              !isOverloaded && 'transition-all duration-500 ease-out',
              barColor,
            )}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className={clsx('shrink-0 text-[12px] font-bold tabular-nums', textColor)}>
          {percent.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
