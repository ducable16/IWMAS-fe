import clsx from 'clsx'
import { AlertTriangle } from 'lucide-react'
import WorkloadLevelBadge from './WorkloadLevelBadge'
import UtilizationBar from './UtilizationBar'

/**
 * A single row in the team workload table.
 * Displays avatar, name, badge, utilization bar, and task stats.
 */
export default function MemberWorkloadRow({ member, onClick }) {
  const {
    userFullName = 'Unknown',
    position = '',
    workloadLevel = 'AVAILABLE',
    utilizationPercent = 0,
    weeklyRemainingHours = 0,
    weeklyCapacityHours = 0,
    activeTaskCount = 0,
    overdueTaskCount = 0,
  } = member

  const initials = userFullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-150',
        'bg-bg-surface border border-border-subtle',
        'hover:border-border-strong hover:shadow-sm hover:bg-bg-subtle/50',
        'active:scale-[0.995]',
        'text-left group',
      )}
    >
      {/* Avatar */}
      <div className={clsx(
        'w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0',
        'bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/15 text-accent',
      )}>
        {initials}
      </div>

      {/* Name + position */}
      <div className="min-w-0 flex-shrink-0 w-[180px]">
        <p className="text-[13px] font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
          {userFullName}
        </p>
        {position && (
          <p className="text-[11.5px] text-text-muted truncate mt-0.5">{position}</p>
        )}
      </div>

      {/* Badge */}
      <div className="shrink-0">
        <WorkloadLevelBadge level={workloadLevel} />
      </div>

      {/* Utilization bar */}
      <div className="flex-1 min-w-[120px]">
        <UtilizationBar
          utilizationPercent={utilizationPercent}
          workloadLevel={workloadLevel}
          weeklyRemainingHours={weeklyRemainingHours}
          weeklyCapacityHours={weeklyCapacityHours}
          compact
        />
      </div>

      {/* Stats */}
      <div className="shrink-0 text-right min-w-[110px]">
        <p className="text-[12px] text-text-secondary">
          <span className="font-medium tabular-nums">{activeTaskCount}</span>
          <span className="text-text-muted"> tasks</span>
        </p>
        {overdueTaskCount > 0 && (
          <p className="flex items-center justify-end gap-1 text-[11.5px] text-danger font-semibold mt-0.5">
            <AlertTriangle className="w-3 h-3" strokeWidth={2} />
            {overdueTaskCount} overdue
          </p>
        )}
      </div>
    </button>
  )
}
