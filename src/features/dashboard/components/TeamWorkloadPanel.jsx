import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import WorkloadLevelBadge from '@/features/workforce/components/WorkloadLevelBadge'
import UtilizationBar from '@/features/workforce/components/UtilizationBar'
import { useUserWorkloadDetail } from '@/features/workforce/hooks/useWorkload'
import WorkloadTaskList from './WorkloadTaskList'

function MemberRow({ member, expanded, onToggle }) {
  const { data, isLoading, isError, error } = useUserWorkloadDetail(member.id)

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <button
        onClick={onToggle}
        className={clsx(
          'w-full flex items-start gap-4 p-4 text-left',
          'hover:bg-bg-subtle/40 transition-colors rounded-xl',
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-text-primary truncate">
                {member.fullName || 'Unknown'}
              </p>
              {member.position && (
                <p className="text-[11.5px] text-text-muted truncate mt-0.5">
                  {member.position}
                </p>
              )}
            </div>
            <div className="shrink-0">
              {data?.workloadLevel ? (
                <WorkloadLevelBadge level={data.workloadLevel} />
              ) : (
                <span className="text-[11.5px] text-text-muted">Loading…</span>
              )}
            </div>
          </div>

          <div className="mt-2">
            {data ? (
              <UtilizationBar
                utilizationPercent={data.utilizationPercent}
                workloadLevel={data.workloadLevel}
                weeklyRemainingHours={data.weeklyRemainingHours}
                weeklyCapacityHours={data.weeklyCapacityHours}
                compact
              />
            ) : (
              <div className="h-2 rounded-full bg-bg-subtle" />
            )}
          </div>

          <div className="mt-2 text-[11.5px] text-text-muted">
            {data ? (
              <span>
                <span className="font-semibold text-text-secondary tabular-nums">
                  {data.activeTaskCount ?? 0}
                </span>{' '}active tasks
                {data.overdueTaskCount > 0 && (
                  <span className="text-danger font-semibold">
                    {' '}· {data.overdueTaskCount} overdue
                  </span>
                )}
              </span>
            ) : (
              <span>Tasks: —</span>
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
            tasks={data?.tasks || []}
            isLoading={isLoading}
            isError={isError}
            error={error}
            emptyLabel="No tasks for this member"
          />
        </div>
      )}
    </div>
  )
}

export default function TeamWorkloadPanel({
  title = 'Team workload & tasks',
  members = [],
  isLoading,
  emptyLabel = 'No members to display.',
}) {
  const [expandedId, setExpandedId] = useState(null)

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="section-title text-[13px] mb-4">{title}</h3>
        <p className="text-[12.5px] text-text-muted">Loading team workload…</p>
      </div>
    )
  }

  if (!members.length) {
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
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            expanded={expandedId === member.id}
            onToggle={() =>
              setExpandedId(expandedId === member.id ? null : member.id)
            }
          />
        ))}
      </div>
    </div>
  )
}
