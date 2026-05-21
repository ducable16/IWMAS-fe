import { Clock } from 'lucide-react'
import { useTaskHistory } from '@/features/tasks/hooks/useTask'
import { LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { fmtDateTime } from '@/utils/date'
import type { HistoryTabProps, TaskHistoryEntry } from './taskDetail.types'

export function HistoryTab({ taskId }: HistoryTabProps) {
  const { data: history = [], isLoading } = useTaskHistory(taskId)
  if (isLoading) return <LiveLoading label="Loading history…" />
  if (history.length === 0)
    return <p className="text-[13px] text-text-muted py-4 text-center">No history yet.</p>
  return (
    <div className="space-y-3">
      {(history as TaskHistoryEntry[]).map((h, i) => (
        <div key={h.id || i} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-bg-subtle border border-border flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-3 h-3 text-text-muted" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] text-text-primary">
              Status changed{' '}
              <span className="font-medium">{h.oldStatus}</span>
              {' → '}
              <span className="font-medium">{h.newStatus}</span>
            </p>
            {h.note && <p className="text-[12px] text-text-muted mt-0.5">{h.note}</p>}
            <p className="text-[11px] text-text-muted mt-0.5">
              {fmtDateTime(h.changedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
