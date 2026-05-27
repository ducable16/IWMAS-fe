import clsx from 'clsx'
import { AlertTriangle } from 'lucide-react'
import WorkloadLevelBadge from './WorkloadLevelBadge'
import UtilizationBar from './UtilizationBar'
import type { WorkloadMember } from '@/types'

type MemberWorkloadRowProps = {
  member: WorkloadMember
  onClick?: () => void
}

/**
 * A single row in the team workload table.
 *
 * When `projectAllocations` is present (endpoint §9.6 — project members),
 * it contains exactly 1 item — the allocation for the current project.
 * In that case we show a dual-bar:
 *   Primary (top)    → project-specific utilization
 *   Secondary (below) → total utilization across all projects
 *
 * When `projectAllocations` is absent (team-wide view §9.4) we show the
 * standard single total bar.
 */
export default function MemberWorkloadRow({ member, onClick }: MemberWorkloadRowProps) {
  const {
    userFullName = 'Unknown',
    position = '',
    workloadLevel = 'AVAILABLE',
    nearTermPercent = null,
    overallPercent = null,
    activeTaskCount = 0,
    overdueTaskCount = 0,
    projectAllocations = null,
  } = member

  const initials = userFullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Project-specific allocation (only present in §9.6 project member endpoint)
  const projectAlloc = projectAllocations?.[0] ?? null

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-start gap-4 p-4 rounded-xl transition-all duration-150',
        'bg-bg-surface border border-border-subtle',
        'hover:border-border-strong hover:shadow-sm hover:bg-bg-subtle/50',
        'active:scale-[0.995]',
        'text-left group',
      )}
    >
      {/* Avatar */}
      <div className={clsx(
        'w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 mt-0.5',
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

      {/* Badge — project-specific level takes priority */}
      <div className="shrink-0 mt-0.5">
        <WorkloadLevelBadge level={projectAlloc ? projectAlloc.workloadLevel : workloadLevel} />
      </div>

      {/* Utilization bar(s) */}
      <div className="flex-1 min-w-[140px] space-y-2">
        {projectAlloc ? (
          <>
            {/* Primary: project-specific */}
            <div>
              <p className="text-[10px] text-text-muted mb-0.5 uppercase tracking-wide font-medium">
                {projectAlloc.projectName}
              </p>
              <UtilizationBar
                utilizationPercent={projectAlloc.nearTermPercent}
                workloadLevel={projectAlloc.workloadLevel}
                compact
              />
            </div>
            {/* Secondary: total */}
            <div>
              <p className="text-[10px] text-text-muted mb-0.5 uppercase tracking-wide font-medium">
                Total (all projects)
              </p>
              <UtilizationBar
                utilizationPercent={overallPercent}
                workloadLevel={workloadLevel}
                compact
              />
            </div>
          </>
        ) : (
          <UtilizationBar
            utilizationPercent={nearTermPercent}
            workloadLevel={workloadLevel}
            compact
          />
        )}
      </div>

      {/* Stats */}
      <div className="shrink-0 text-right min-w-[110px] mt-0.5">
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
