import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useUserEffortRemaining } from '../../hooks/useProjects'
import type { Id } from '@/types'

type FutureAvailabilityNote = {
  availableFrom: string
  additionalFreePercent: number
  cumulativeRemainingPercent: number
}

type OverlappingAllocation = {
  projectId: Id
  projectCode?: string | undefined
  projectName?: string | undefined
  allocatedPercent: number
  projectEndDate?: string | null
}

type EffortRemaining = {
  userName?: string | undefined
  remainingPercent: number
  peakAllocatedPercent: number
  overlappingAllocations?: OverlappingAllocation[] | undefined
  futureAvailabilityNotes?: FutureAvailabilityNote[] | undefined
}

type RemainingEffortPanelProps = {
  userId: Id | '' | null | undefined
  startDate?: string | undefined
  endDate?: string | undefined
  requestedEffort: string | number
  currentEffort?: number | null | undefined
}

function EffortBar({ percent, className }: { percent: number; className?: string | undefined }) {
  const color = percent >= 50 ? 'bg-success' : percent >= 20 ? 'bg-warning' : 'bg-danger'
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <span className={clsx(
        'text-[11.5px] font-semibold tabular-nums',
        percent >= 50 ? 'text-success' : percent >= 20 ? 'text-warning' : 'text-danger',
      )}>
        {percent}%
      </span>
    </div>
  )
}

function formatAvailableFrom(value: string) {
  return value === '9999-12-31' ? 'No end date' : value
}

export default function RemainingEffortPanel({
  userId,
  startDate,
  endDate,
  requestedEffort,
  currentEffort,
}: RemainingEffortPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const { data, isLoading } = useUserEffortRemaining(
    userId,
    { startDate: startDate || undefined, endDate: endDate || undefined },
    !!userId,
  )

  if (!userId) return null
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-text-muted py-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking effort availability...
      </div>
    )
  }

  const effort = data as EffortRemaining | null | undefined
  if (!effort) return null

  const {
    remainingPercent,
    peakAllocatedPercent,
    overlappingAllocations = [],
    futureAvailabilityNotes = [],
  } = effort
  const effectiveRemaining = currentEffort == null
    ? remainingPercent
    : Math.min(100, remainingPercent + (Number(currentEffort) || 0))
  const requested = Number(requestedEffort) || 0
  const willExceed = requested > effectiveRemaining
  const allocationLabel = currentEffort == null
    ? 'active allocation'
    : 'other active allocation'

  return (
    <div className={clsx(
      'rounded-lg border p-3 space-y-2 text-[12px] transition-colors',
      willExceed ? 'border-danger/40 bg-danger/5' : 'border-border-subtle bg-bg-subtle/50',
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {willExceed && <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />}
          <span className="text-text-secondary font-medium">
            {effort.userName}&apos;s availability
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-text-muted">Peak used: </span>
          <span className="font-semibold text-text-primary">{peakAllocatedPercent}%</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-text-muted">
            {currentEffort == null ? 'Remaining capacity' : 'Remaining capacity (excl. current)'}
          </span>
          <span className={clsx(
            'font-semibold',
            effectiveRemaining < 20 ? 'text-danger' :
              effectiveRemaining < 50 ? 'text-warning' : 'text-success',
          )}>
            {effectiveRemaining}% free
          </span>
        </div>
        <EffortBar percent={effectiveRemaining} />
      </div>

      {futureAvailabilityNotes.length > 0 && (
        <div className="text-[11.5px] text-text-muted">
          <p className="font-medium text-text-secondary">Upcoming free capacity</p>
          <ul className="mt-1 space-y-0.5">
            {futureAvailabilityNotes.map((note) => (
              <li key={`${note.availableFrom}-${note.cumulativeRemainingPercent}`} className="flex items-center justify-between gap-2">
                <span className="truncate">Free from {formatAvailableFrom(note.availableFrom)}</span>
                <span className="shrink-0 tabular-nums">
                  +{note.additionalFreePercent}% (total {note.cumulativeRemainingPercent}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {willExceed && (
        <p className="text-danger text-[11.5px] font-medium">
          Requested {requested}% exceeds available capacity of {effectiveRemaining}%. The server will reject this.
        </p>
      )}

      {overlappingAllocations.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {overlappingAllocations.length} {allocationLabel}
            {overlappingAllocations.length !== 1 ? 's' : ''}
          </button>

          {expanded && (
            <ul className="mt-1.5 space-y-1 pl-1">
              {overlappingAllocations.map((allocation) => (
                <li key={allocation.projectId} className="flex items-center justify-between gap-2">
                  <span className="text-text-secondary truncate">
                    <span className="font-mono text-text-muted mr-1">
                      {allocation.projectCode}
                    </span>
                    {allocation.projectName}
                  </span>
                  <span className="shrink-0 text-text-muted tabular-nums text-right">
                    {allocation.allocatedPercent}%
                    {allocation.projectEndDate && (
                      <span className="ml-2 text-text-muted">free {allocation.projectEndDate}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
