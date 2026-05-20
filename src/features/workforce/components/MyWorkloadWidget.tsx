import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import WorkloadLevelBadge from './WorkloadLevelBadge'
import UtilizationBar from './UtilizationBar'
import { useMyWorkload } from '../hooks/useWorkload'
import type { WorkloadMember } from '@/types'

/**
 * Compact self-view widget for the Dashboard page.
 * Shows the current user's workload for the current week.
 * Auto-refreshes every 5 minutes + on window focus.
 */
export default function MyWorkloadWidget() {
  const { data, isLoading, isError } = useMyWorkload()

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="section-title text-[13px] mb-3">My workload this week</h3>
        <div className="flex items-center justify-center gap-2 py-4 text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[12px]">Loading…</span>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="card p-5">
        <h3 className="section-title text-[13px] mb-3">My workload this week</h3>
        <p className="text-[12px] text-text-muted italic">Unable to load workload data.</p>
      </div>
    )
  }

  const {
    workloadLevel,
    utilizationPercent,
    weeklyRemainingHours,
    weeklyCapacityHours,
    overdueTaskCount = 0,
  } = data as WorkloadMember

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="section-title text-[13px]">My workload this week</h3>
        <WorkloadLevelBadge level={workloadLevel} />
      </div>

      <UtilizationBar
        utilizationPercent={utilizationPercent}
        workloadLevel={workloadLevel}
        weeklyRemainingHours={weeklyRemainingHours}
        weeklyCapacityHours={weeklyCapacityHours}
      />

      {overdueTaskCount > 0 && (
        <div className="flex items-center gap-1.5 text-[12px] text-danger font-semibold bg-danger/[0.06] border border-danger/15 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          {overdueTaskCount} overdue task{overdueTaskCount > 1 ? 's' : ''} need attention
        </div>
      )}

      <Link
        to="/workforce"
        className="flex items-center gap-1 text-[12px] text-accent hover:text-accent-hover font-medium transition-colors"
      >
        View details
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
      </Link>
    </div>
  )
}
