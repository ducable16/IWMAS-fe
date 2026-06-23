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
      type="button"
      onClick={onClick}
      className={clsx(
        'grid w-full grid-cols-1 items-start gap-4 rounded-xl p-4 transition-all duration-150',
        'sm:grid-cols-2 xl:grid-cols-[minmax(190px,1.15fr)_110px_minmax(190px,1fr)_minmax(190px,1fr)_90px] xl:items-center',
        'bg-bg-surface border border-border-subtle',
        'hover:border-border-strong hover:shadow-sm hover:bg-bg-subtle/50',
        'active:scale-[0.995]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        'text-left group',
      )}
    >
      {/* Member identity */}
      <div className="flex min-w-0 items-center gap-3 sm:col-span-2 xl:col-span-1">
        <div className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold',
          'border border-accent/15 bg-gradient-to-br from-accent/20 to-accent/5 text-accent',
        )}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-text-primary transition-colors group-hover:text-accent">
            {userFullName}
          </p>
          {email && (
            <p className="mt-0.5 truncate text-[12px] text-text-muted">{email}</p>
          )}
        </div>
      </div>

      {/* Workload volume — project-specific level takes priority */}
      <div className="min-w-0">
        <p className="mb-1.5 text-[12px] font-medium text-text-primary xl:sr-only">Workload</p>
        <LoadLevelBadge level={projectAlloc ? projectAlloc.loadLevel : loadLevel} />
      </div>

      {/* Selected-project axes */}
      <div className="min-w-0 space-y-1.5">
        <p className="text-[12px] font-medium text-text-primary xl:sr-only">Selected project</p>
        {projectAlloc ? (
          <>
            <BacklogMetric
              days={projectAlloc.backlogDays}
              hours={projectAlloc.backlogHours}
              variant="analytics-row"
            />
            <div>
              <DeadlineRiskIndicator
                atRiskCount={allocationAtRiskCount(projectAlloc)}
                overdueCount={projectAlloc.overdueCount}
                predictedLateCount={projectAlloc.predictedLateTaskCount}
                compact
                variant="analytics-row"
              />
            </div>
          </>
        ) : (
          <p className="text-[12px] text-text-muted">Project data unavailable</p>
        )}
      </div>

      {/* Aggregate axes remain visible for every member. */}
      <div className="min-w-0 space-y-1.5">
        <p className="text-[12px] font-medium text-text-primary xl:sr-only">All projects</p>
        <BacklogMetric days={worstBacklogDays} variant="analytics-row" />
        <div>
          <DeadlineRiskIndicator
            atRiskCount={atRiskCount}
            overdueCount={overdueTaskCount}
            predictedLateCount={predictedLateTaskCount}
            compact
            variant="analytics-row"
          />
        </div>
      </div>

      {/* Task counts */}
      <div className="min-w-0 text-left xl:text-right">
        <p className="mb-1.5 text-[12px] font-medium text-text-primary xl:sr-only">Tasks</p>
        <p className="text-[13px] text-text-secondary">
          <span className="font-semibold tabular-nums text-text-primary">{activeTaskCount}</span>
          <span className="text-text-muted"> active</span>
        </p>
        {unestimatedTaskCount > 0 && (
          <p className="mt-0.5 text-[12px] font-medium text-warning">
            {unestimatedTaskCount} unestimated
          </p>
        )}
      </div>
    </button>
  )
}
