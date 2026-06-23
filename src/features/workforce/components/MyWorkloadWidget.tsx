import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import BacklogMetric from './BacklogMetric'
import DeadlineRiskIndicator from './DeadlineRiskIndicator'
import { useMyWorkload } from '../hooks/useWorkload'
import { useCan } from '@/utils/permissions'

/**
 * Compact self-view widget for the Dashboard page.
 * Shows the current user's real-time workload.
 * Auto-refreshes every 5 minutes + on window focus.
 */
export default function MyWorkloadWidget() {
  const { data, isLoading, isError } = useMyWorkload()
  const can = useCan()

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="section-title text-[13px] mb-3">My workload</h3>
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
        <h3 className="section-title text-[13px] mb-3">My workload</h3>
        <p className="text-[12px] text-text-muted italic">Unable to load workload data.</p>
      </div>
    )
  }

  const {
    worstBacklogDays,
    atRiskCount = 0,
    overdueTaskCount = 0,
    predictedLateTaskCount = 0,
  } = data

  return (
    <div className="card p-5 space-y-3">
      <h3 className="section-title text-[13px]">My workload</h3>

      <BacklogMetric days={worstBacklogDays} />

      <DeadlineRiskIndicator
        atRiskCount={atRiskCount}
        overdueCount={overdueTaskCount}
        predictedLateCount={predictedLateTaskCount}
      />

      {!can.isHr && (
        <Link
          to="/workforce"
          className="flex items-center gap-1 text-[12px] text-accent hover:text-accent-hover font-medium transition-colors"
        >
          View details
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  )
}
