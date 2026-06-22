import clsx from 'clsx'
import BacklogMetric from './BacklogMetric'
import DeadlineRiskIndicator from './DeadlineRiskIndicator'
import LoadLevelBadge from './LoadLevelBadge'
import { allocationAtRiskCount } from '../workloadPresentation'
import type { MemberWorkloadResponse } from '@/types'

type MemberWorkloadRowProps = {
  member: MemberWorkloadResponse
  onClick?: () => void
}

/**
 * A single row in the team workload table.
 *
 * When `projectAllocations` is present (endpoint 9.5, project members),
 * it contains exactly 1 item — the allocation for the current project.
 * In that case we show project-specific and aggregate workload/risk axes.
 *
 * When `projectAllocations` is absent (team-wide view §9.4) we show the
 * standard single total bar.
 */
export default function MemberWorkloadRow({ member, onClick }: MemberWorkloadRowProps) {
  const {
    userFullName = 'Unknown',
    email = '',
    loadLevel = 'UNDEFINED',
    worstBacklogDays = null,
    atRiskCount = 0,
    activeTaskCount = 0,
    overdueTaskCount = 0,
    predictedLateTaskCount = 0,
    unestimatedTaskCount = 0,
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
        'w-full flex flex-wrap xl:flex-nowrap items-start gap-4 p-4 rounded-xl transition-all duration-150',
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

      {/* Name + email */}
      <div className="min-w-0 flex-shrink-0 w-[180px]">
        <p className="text-[13px] font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
          {userFullName}
        </p>
        {email && (
          <p className="text-[11.5px] text-text-muted truncate mt-0.5">{email}</p>
        )}
      </div>

      {/* Workload volume — project-specific level takes priority */}
      <div className="shrink-0 mt-0.5 space-y-1">
        <p className="text-[9.5px] uppercase tracking-wider font-semibold text-text-muted">Workload</p>
        <LoadLevelBadge level={projectAlloc ? projectAlloc.loadLevel : loadLevel} />
      </div>

      {/* Backlog and deadline-risk axes */}
      <div className="flex-1 min-w-[260px] space-y-2.5">
        {projectAlloc ? (
          <>
            <div className="grid gap-1.5 sm:grid-cols-[minmax(130px,1fr)_auto] sm:items-center">
              <div>
                <p className="text-[10px] text-text-muted mb-0.5 uppercase tracking-wide font-medium">
                {projectAlloc.projectName}
                </p>
                <BacklogMetric days={projectAlloc.backlogDays} hours={projectAlloc.backlogHours} compact />
              </div>
              <DeadlineRiskIndicator
                atRiskCount={allocationAtRiskCount(projectAlloc)}
                overdueCount={projectAlloc.overdueCount}
                predictedLateCount={projectAlloc.predictedLateTaskCount}
                compact
              />
            </div>
            <div className="grid gap-1.5 border-t border-border-subtle pt-2 sm:grid-cols-[minmax(130px,1fr)_auto] sm:items-center">
              <div>
                <p className="text-[10px] text-text-muted mb-0.5 uppercase tracking-wide font-medium">
                Total (all projects)
                </p>
                <BacklogMetric days={worstBacklogDays} compact />
              </div>
              <DeadlineRiskIndicator
                atRiskCount={atRiskCount}
                overdueCount={overdueTaskCount}
                predictedLateCount={predictedLateTaskCount}
                compact
              />
            </div>
          </>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-[minmax(130px,1fr)_auto] sm:items-center">
            <BacklogMetric days={worstBacklogDays} compact />
            <DeadlineRiskIndicator
              atRiskCount={atRiskCount}
              overdueCount={overdueTaskCount}
              predictedLateCount={predictedLateTaskCount}
              compact
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="shrink-0 text-right min-w-[110px] mt-0.5">
        <p className="text-[12px] text-text-secondary">
          <span className="font-medium tabular-nums">{activeTaskCount}</span>
          <span className="text-text-muted"> tasks</span>
        </p>
        {unestimatedTaskCount > 0 && (
          <p className="text-[11px] text-warning font-medium mt-0.5">
            {unestimatedTaskCount} unestimated
          </p>
        )}
      </div>
    </button>
  )
}
