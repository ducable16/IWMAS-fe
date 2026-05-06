import clsx from 'clsx'

/**
 * Horizontal progress bar showing utilizationPercent.
 * - Green < 70%, amber 70–100%, red > 100%
 * - >100% fills completely with striped animation + glow to signal overflow
 */
export default function UtilizationBar({
  utilizationPercent = 0,
  workloadLevel = 'AVAILABLE',
  weeklyRemainingHours = 0,
  weeklyCapacityHours = 0,
  compact = false,
}) {
  const pct = Math.max(0, utilizationPercent)
  const isOverloaded = workloadLevel === 'OVERLOADED'
  const barWidth = Math.min(pct, 100) // visual bar capped at 100% width

  const barColor =
    workloadLevel === 'OVERLOADED'   ? 'bg-danger'  :
    workloadLevel === 'HEALTHY_BUSY' ? 'bg-warning'  :
                                       'bg-success'

  return (
    <div className={clsx('w-full', compact ? 'min-w-[100px]' : 'min-w-[140px]')}>
      {/* Bar + percentage */}
      <div className="flex items-center gap-2">
        <div className={clsx(
          'flex-1 h-2 rounded-full overflow-hidden',
          'bg-bg-subtle border border-border-subtle',
          isOverloaded && 'ring-1 ring-danger/30',
        )}>
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500 ease-out',
              barColor,
              isOverloaded && 'utilization-overflow',
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className={clsx(
          'text-[12px] font-bold tabular-nums shrink-0',
          isOverloaded ? 'text-danger' :
          workloadLevel === 'HEALTHY_BUSY' ? 'text-warning' :
          'text-success',
        )}>
          {pct.toFixed(0)}%
        </span>
      </div>

      {/* Capacity caption */}
      {!compact && (
        <p className="text-[11px] text-text-muted mt-1">
          {weeklyRemainingHours.toFixed(1)} h remaining / {weeklyCapacityHours.toFixed(1)} h capacity
        </p>
      )}
    </div>
  )
}
