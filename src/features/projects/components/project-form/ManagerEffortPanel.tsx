import { Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useUserEffortRemaining } from '../../hooks/useProjects'
import type { Id } from '@/types'

type FutureAvailabilityNote = {
  availableFrom: string
  additionalFreePercent: number
  cumulativeRemainingPercent: number
}

type EffortRemaining = {
  userName?: string | undefined
  remainingPercent: number
  peakAllocatedPercent: number
  futureAvailabilityNotes?: FutureAvailabilityNote[] | undefined
}

type ManagerEffortPanelProps = {
  userId: Id | null
  startDate: string
  endDate: string
  requestedEffort: string
}

export default function ManagerEffortPanel({
  userId,
  startDate,
  endDate,
  requestedEffort,
}: ManagerEffortPanelProps) {
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
    futureAvailabilityNotes = [],
  } = effort

  const requested = Number(requestedEffort) || 0
  const willExceed = requested > remainingPercent
  const formatAvailableFrom = (value: string) =>
    value === '9999-12-31' ? 'No end date' : value

  return (
    <div className={clsx(
      'rounded-lg border p-3 space-y-2 text-[12px] transition-colors',
      willExceed ? 'border-danger/40 bg-danger/5' : 'border-border-subtle bg-bg-subtle/50',
    )}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-secondary font-medium">
          {effort.userName}&apos;s availability
        </span>
        <div className="text-right shrink-0">
          <span className="text-text-muted">Peak used: </span>
          <span className="font-semibold text-text-primary">{peakAllocatedPercent}%</span>
        </div>
      </div>

      <div className="flex justify-between">
        <span className="text-text-muted">Remaining capacity</span>
        <span className={clsx(
          'font-semibold',
          remainingPercent < 20 ? 'text-danger' :
            remainingPercent < 50 ? 'text-warning' : 'text-success',
        )}>
          {remainingPercent}% free
        </span>
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
          Requested {requested}% exceeds remaining capacity of {remainingPercent}%. The server will reject this.
        </p>
      )}
    </div>
  )
}
