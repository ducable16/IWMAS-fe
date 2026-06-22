import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

type DeadlineRiskIndicatorProps = {
  atRiskCount?: number | null | undefined
  overdueCount?: number | null | undefined
  predictedLateCount?: number | null | undefined
  compact?: boolean
}

/** Deadline-risk axis, intentionally independent from the workload-volume badge. */
export default function DeadlineRiskIndicator({
  atRiskCount = 0,
  overdueCount = 0,
  predictedLateCount = 0,
  compact = false,
}: DeadlineRiskIndicatorProps) {
  const count = Math.max(0, atRiskCount || 0)
  const hasRisk = count > 0
  const detail = `${overdueCount || 0} overdue · ${predictedLateCount || 0} predicted late`

  return (
    <div
      className={clsx(
        'inline-flex flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1 text-[11.5px]',
        hasRisk
          ? 'border-danger/20 bg-danger/[0.06] text-danger'
          : 'border-success/15 bg-success/[0.05] text-success',
      )}
      title={detail}
    >
      {hasRisk
        ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
        : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />}
      <span className="font-semibold">{hasRisk ? `${count} at risk` : 'No deadline risk'}</span>
      {!compact && <span className="text-current/75">{detail}</span>}
    </div>
  )
}
