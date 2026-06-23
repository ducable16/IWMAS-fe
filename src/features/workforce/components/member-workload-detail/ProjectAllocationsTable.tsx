import { FolderOpen } from 'lucide-react'
import clsx from 'clsx'
import BacklogMetric from '../BacklogMetric'
import DeadlineRiskIndicator from '../DeadlineRiskIndicator'
import { allocationAtRiskCount } from '../../workloadPresentation'
import type { Id, ProjectAllocationItem } from '@/types'

interface ProjectAllocationsTableProps {
  allocations?: ProjectAllocationItem[] | null
  activeProjectId?: Id | null
  onSelectProject?: (projectId: Id) => void
}

const keyOf = (id: Id) => String(id)

export default function ProjectAllocationsTable({
  allocations,
  activeProjectId = null,
  onSelectProject,
}: ProjectAllocationsTableProps) {
  if (!allocations?.length) return null

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="w-4 h-4 text-text-muted" strokeWidth={1.75} />
        <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">
          Per-project breakdown
        </h3>
      </div>
      <div className="space-y-3">
        {allocations.map((allocation) => {
          const active = activeProjectId != null && keyOf(allocation.projectId) === keyOf(activeProjectId)
          const content = (
            <>
              <div className="min-w-0 w-[180px] shrink-0">
                <p className="text-[13px] font-semibold text-text-primary truncate">
                  {allocation.projectName}
                </p>
                {allocation.allocatedEffortPercent != null && (
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Allocated: <span className="font-medium">{allocation.allocatedEffortPercent}%</span>
                  </p>
                )}
              </div>
              <div className="flex-1 min-w-[120px]">
                <BacklogMetric
                  days={allocation.backlogDays}
                  hours={allocation.backlogHours}
                />
              </div>
              <DeadlineRiskIndicator
                atRiskCount={allocationAtRiskCount(allocation)}
                overdueCount={allocation.overdueCount}
                predictedLateCount={allocation.predictedLateTaskCount}
                compact
              />
              <div className="shrink-0 text-right">
                {allocation.dailyCapacityHours != null && (
                  <p className="text-[11px] text-text-muted tabular-nums">
                    {allocation.dailyCapacityHours.toFixed(1)} h/day cap
                  </p>
                )}
              </div>
            </>
          )

          const className = clsx(
            'flex w-full flex-wrap items-center gap-4 rounded-xl border py-2.5 px-3 text-left transition-colors md:flex-nowrap',
            active
              ? 'border-accent/35 bg-accent/[0.06]'
              : 'border-transparent bg-bg-subtle hover:bg-bg-hover',
            onSelectProject && 'cursor-pointer',
          )

          return onSelectProject ? (
            <button
              key={allocation.projectId}
              type="button"
              onClick={() => onSelectProject(allocation.projectId)}
              className={className}
            >
              {content}
            </button>
          ) : (
            <div key={allocation.projectId} className={className}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
