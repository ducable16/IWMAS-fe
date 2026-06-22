import { memo, useCallback, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import BacklogMetric from '@/features/workforce/components/BacklogMetric'
import DeadlineRiskIndicator from '@/features/workforce/components/DeadlineRiskIndicator'
import LoadLevelBadge from '@/features/workforce/components/LoadLevelBadge'
import { compareMemberWorkload } from '@/features/workforce/workloadPresentation'
import { LiveError } from '@/components/feedback/LiveStateOverlay'
import WorkloadTaskList from './WorkloadTaskList'
import type { Id, MemberWorkloadResponse } from '@/types'

type MemberRowProps = {
  member: MemberWorkloadResponse
  expanded: boolean
  onToggle: (id: Id) => void
}

type TeamWorkloadPanelProps = {
  title?: string
  members?: MemberWorkloadResponse[]
  isLoading?: boolean
  isError?: boolean
  error?: Error | { message?: string } | null
  onRetry?: () => void
  emptyLabel?: string
}

const MemberRow = memo(function MemberRow({ member, expanded, onToggle }: MemberRowProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <button
        type="button"
        onClick={() => onToggle(member.userId)}
        className={clsx(
          'w-full flex items-start gap-4 p-4 text-left',
          'hover:bg-bg-subtle/40 transition-colors rounded-xl',
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-text-primary truncate">
                {member.userFullName || 'Unknown'}
              </p>
              {member.email && (
                <p className="text-[11.5px] text-text-muted truncate mt-0.5">
                  {member.email}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <LoadLevelBadge level={member.loadLevel} />
              <DeadlineRiskIndicator
                atRiskCount={member.atRiskCount}
                overdueCount={member.overdueTaskCount}
                predictedLateCount={member.predictedLateTaskCount}
                compact
              />
            </div>
          </div>

          <div className="mt-2">
            <BacklogMetric days={member.worstBacklogDays} compact />
          </div>

          <div className="mt-2 text-[11.5px] text-text-muted">
            <span className="font-semibold text-text-secondary tabular-nums">
              {member.activeTaskCount ?? 0}
            </span>{' '}
            active tasks
            {member.unestimatedTaskCount > 0 && (
              <span className="text-warning font-semibold">
                {' '}· {member.unestimatedTaskCount} unestimated
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-text-muted">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <WorkloadTaskList
            tasks={member.tasks ?? member.unestimatedTasks ?? []}
            emptyLabel="No tasks for this member"
          />
        </div>
      )}
    </div>
  )
})

export default function TeamWorkloadPanel({
  title = 'Team workload & tasks',
  members = [],
  isLoading,
  isError,
  error,
  onRetry,
  emptyLabel = 'No members to display.',
}: TeamWorkloadPanelProps) {
  const [expandedId, setExpandedId] = useState<Id | null>(null)
  const sortedMembers = useMemo(() => [...members].sort(compareMemberWorkload), [members])
  const handleToggle = useCallback((id: Id) => {
    setExpandedId((current) => current === id ? null : id)
  }, [])

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="section-title text-[13px] mb-4">{title}</h3>
        <p className="text-[12.5px] text-text-muted">Loading team workload...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="card p-5">
        <h3 className="section-title text-[13px] mb-4">{title}</h3>
        <LiveError error={error} {...(onRetry ? { onRetry } : {})} />
      </div>
    )
  }

  if (!sortedMembers.length) {
    return (
      <div className="card p-5">
        <h3 className="section-title text-[13px] mb-4">{title}</h3>
        <p className="text-[12.5px] text-text-muted">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-3">
      <h3 className="section-title text-[13px]">{title}</h3>
      <div className="space-y-2">
        {sortedMembers.map((member) => (
          <MemberRow
            key={member.userId}
            member={member}
            expanded={expandedId === member.userId}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  )
}
