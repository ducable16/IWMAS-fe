import { FolderOpen } from 'lucide-react'
import UtilizationBar from '../UtilizationBar'
import WorkloadLevelBadge from '../WorkloadLevelBadge'
import type { ProjectWorkloadAllocation } from '@/types'

type Allocation = ProjectWorkloadAllocation & {
  allocatedEffortPercent?: number | null
  loadInWindowHours?: number | null
  dailyCapacityHours?: number | null
  nearTermPercent?: number | null
  overallPercent?: number | null
}

interface ProjectAllocationsTableProps {
  allocations?: Allocation[] | null
}

export default function ProjectAllocationsTable({ allocations }: ProjectAllocationsTableProps) {
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
        {allocations.map((allocation) => (
          <div
            key={allocation.projectId}
            className="flex items-center gap-4 py-2.5 px-3 rounded-xl bg-bg-subtle hover:bg-bg-hover transition-colors"
          >
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
            <div className="shrink-0">
              <WorkloadLevelBadge level={allocation.workloadLevel} />
            </div>
            <div className="flex-1 min-w-[120px]">
              <UtilizationBar
                utilizationPercent={allocation.nearTermPercent}
                workloadLevel={allocation.workloadLevel}
                compact
              />
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[12px] text-text-secondary tabular-nums">
                {allocation.loadInWindowHours != null ? (
                  <>
                    <span className="font-semibold">
                      {allocation.loadInWindowHours.toFixed(1)}
                    </span>
                    {' h load'}
                  </>
                ) : (
                  '-'
                )}
              </p>
              {allocation.dailyCapacityHours != null && (
                <p className="text-[11px] text-text-muted">
                  {allocation.dailyCapacityHours.toFixed(1)} h/day cap
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
