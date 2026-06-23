import clsx from 'clsx'
import BacklogMetric from './BacklogMetric'
import DeadlineRiskIndicator from './DeadlineRiskIndicator'
import { allocationAtRiskCount } from '../workloadPresentation'
import type { ProjectMemberWorkloadResponse } from '@/types'

type MemberWorkloadRowProps = {
  member: ProjectMemberWorkloadResponse
  onClick?: () => void
}

/** A project-scoped member row returned by workload endpoint 9.1. */
export default function MemberWorkloadRow({ member, onClick }: MemberWorkloadRowProps) {
  const {
    userFullName = 'Unknown',
    email = '',
    activeTaskCount = 0,
    unestimatedTaskCount = 0,
    projectAllocation,
  } = member

  const initials = userFullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'grid w-full grid-cols-1 items-start gap-4 rounded-xl p-4 transition-all duration-150',
        'sm:grid-cols-2 xl:grid-cols-[minmax(240px,1.2fr)_minmax(300px,1fr)_100px] xl:items-center',
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

      {/* Selected-project axes */}
      <div className="min-w-0 space-y-1.5">
        <p className="text-[12px] font-medium text-text-primary xl:sr-only">Selected project</p>
        <BacklogMetric
          days={projectAllocation.backlogDays}
          hours={projectAllocation.backlogHours}
          variant="analytics-row"
        />
        <div>
          <DeadlineRiskIndicator
            atRiskCount={allocationAtRiskCount(projectAllocation)}
            overdueCount={projectAllocation.overdueCount}
            predictedLateCount={projectAllocation.predictedLateTaskCount}
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
