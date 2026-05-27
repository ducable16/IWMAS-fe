import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Hourglass, Loader2 } from 'lucide-react'
import { useDeleteTimeLog } from '@/features/tasks/hooks/useTimeLogs'
import { fmtDate, fmtDateTime } from '@/utils/date'
import { formatHours } from './timeLogUtils'
import type { Id, TimeLogResponse } from '@/types'

type TimeLogItemProps = {
  log: TimeLogResponse
  currentUserId?: Id | null | undefined
  showTask?: boolean
  showUser?: boolean
  allowActions?: boolean
  onEdit: (log: TimeLogResponse) => void
}

export default function TimeLogItem({
  log,
  currentUserId,
  showTask = false,
  showUser = false,
  allowActions = false,
  onEdit,
}: TimeLogItemProps) {
  const [confirming, setConfirming] = useState(false)
  const { mutate: deleteTimeLog, isPending: isDeleting } = useDeleteTimeLog(log.taskId)
  const canManage =
    allowActions ||
    (currentUserId !== null && currentUserId !== undefined && String(log.userId) === String(currentUserId))

  const confirmDelete = () => {
    deleteTimeLog(log.id, { onSuccess: () => setConfirming(false) })
  }

  return (
    <div className="group border border-border-subtle rounded-lg bg-bg-surface px-3 py-2.5 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-text-primary">
              <CalendarDays className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
              {fmtDate(log.logDate)}
            </span>
            {showTask && (
              <Link
                to={`/tasks/${log.taskId}`}
                className="text-[12.5px] text-accent hover:underline truncate"
              >
                {log.taskTitle || `Task #${log.taskId}`}
              </Link>
            )}
            {showUser && (
              <span className="text-[12px] text-text-muted">User #{log.userId}</span>
            )}
            <span className="text-[11px] text-text-muted">{fmtDateTime(log.createdAt)}</span>
          </div>

          {log.description ? (
            <p className="text-[12.5px] text-text-secondary mt-1.5 leading-relaxed break-words">
              {log.description}
            </p>
          ) : (
            <p className="text-[12.5px] text-text-muted mt-1.5 italic">No description.</p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="grid grid-cols-2 gap-2 min-w-[120px]">
            <div>
              <p className="text-[10.5px] text-text-muted uppercase tracking-wide">Spent</p>
              <p className="text-[13px] font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                <Clock3 className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
                {formatHours(log.hoursSpent)}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] text-text-muted uppercase tracking-wide">Left</p>
              <p className="text-[13px] font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                <Hourglass className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
                {formatHours(log.remainingHours)}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  onEdit(log)
                }}
                className="text-[11px] text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors"
              >
                Edit
              </button>
              {!confirming ? (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="text-[11px] text-text-muted hover:text-danger px-1.5 py-0.5 rounded hover:bg-danger/10 transition-colors"
                >
                  Delete
                </button>
              ) : (
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="text-[11px] text-danger font-medium px-1.5 py-0.5 rounded hover:bg-danger/10 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="text-[11px] text-text-muted px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
