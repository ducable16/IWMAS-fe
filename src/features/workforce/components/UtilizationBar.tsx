import clsx from 'clsx'
import type { WorkloadLevel } from '@/constants/enums'

type UtilizationBarProps = {
  utilizationPercent?: number | null | undefined
  workloadLevel?: WorkloadLevel | string | null | undefined
  weeklyRemainingHours?: number | null | undefined
  weeklyCapacityHours?: number | null | undefined
  compact?: boolean
}

/**
 * Horizontal progress bar showing utilizationPercent.
 * - Green < 70%, amber 70–100%, red > 100%
 * - > 100% fills completely with striped animation + glow to signal overflow
 * - null utilizationPercent (BLOCKED / UNDEFINED) → muted dash, no bar
 */
export default function UtilizationBar({
  utilizationPercent = null,
  workloadLevel = 'AVAILABLE',
  weeklyRemainingHours = null,
  weeklyCapacityHours = null,
  compact = false,
}: UtilizationBarProps) {
  // BLOCKED / UNDEFINED return null — render a placeholder
  if (utilizationPercent === null || utilizationPercent === undefined) {
    return (
      <div className={clsx('w-full', compact ? 'min-w-[100px]' : 'min-w-[140px]')}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-bg-subtle border border-border-subtle" />
          <span className="text-[12px] font-bold text-text-muted tabular-nums shrink-0">—</span>
        </div>
        {!compact && <p className="text-[11px] text-text-muted mt-1">No capacity data</p>}
      </div>
    )
  }

  const pct = Math.max(0, utilizationPercent)
  const level = String(workloadLevel || 'AVAILABLE')
  const isCritical = level === 'OVERDUE' || level === 'WILL_SLIP' || pct > 100
  const barWidth = Math.min(pct, 100) // visual bar capped at 100% width

  const barColor =
    level === 'OVERDUE'   ? 'bg-danger' :
    level === 'WILL_SLIP' ? 'bg-orange-500' :
    level === 'TIGHT'     ? 'bg-warning' :
    level === 'AVAILABLE' ? 'bg-info' :
                            'bg-success'

  const textColor =
    level === 'OVERDUE'   ? 'text-danger' :
    level === 'WILL_SLIP' ? 'text-orange-600' :
    level === 'TIGHT'     ? 'text-warning' :
    level === 'AVAILABLE' ? 'text-info' :
                            'text-success'

  return (
    <div className={clsx('w-full', compact ? 'min-w-[100px]' : 'min-w-[140px]')}>
      {/* Bar + percentage */}
      <div className="flex items-center gap-2">
        <div className={clsx(
          'flex-1 h-2 rounded-full overflow-hidden',
          'bg-bg-subtle border border-border-subtle',
          isCritical && 'ring-1 ring-danger/30',
        )}>
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500 ease-out',
              barColor,
              pct > 100 && 'utilization-overflow',
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className={clsx(
          'text-[12px] font-bold tabular-nums shrink-0',
          textColor,
        )}>
          {pct.toFixed(0)}%
        </span>
      </div>

      {/* Capacity caption */}
      {!compact && weeklyCapacityHours != null && (
        <p className="text-[11px] text-text-muted mt-1">
          {(weeklyRemainingHours ?? 0).toFixed(1)} h remaining / {weeklyCapacityHours.toFixed(1)} h capacity
        </p>
      )}
    </div>
  )
}
