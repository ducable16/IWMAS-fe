import {
  CalendarDays,
  Clock,
  FileMinus,
  FilePlus,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useTaskHistory } from '@/features/tasks/hooks/useTask'
import { LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { fmtDateTime } from '@/utils/date'
import {
  TASK_ACTIVITY_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  TASK_TYPE_LABEL,
} from '@/constants/enums'
import type { LucideIcon } from 'lucide-react'
import type { HistoryTabProps } from './taskDetail.types'
import type { TaskActivityEntry, UserPublicView } from '@/types'

const ACTIVITY_ICON: Record<string, LucideIcon> = {
  TASK_CREATED: Clock,
  STATUS_CHANGED: Pencil,
  PRIORITY_CHANGED: Pencil,
  TYPE_CHANGED: Pencil,
  TITLE_CHANGED: Pencil,
  DESCRIPTION_CHANGED: Pencil,
  ESTIMATE_CHANGED: Pencil,
  ASSIGNEE_CHANGED: UserRound,
  START_DATE_CHANGED: CalendarDays,
  DUE_DATE_CHANGED: CalendarDays,
  ATTACHMENT_ADDED: FilePlus,
  ATTACHMENT_REMOVED: FileMinus,
  TASK_DELETED: Trash2,
}

function userName(user: UserPublicView | null | undefined, fallback: string | null | undefined) {
  if (user) return user.fullName || user.email || `User #${user.id}`
  return fallback ? `User #${fallback}` : 'Unassigned'
}

function formatValue(entry: TaskActivityEntry, side: 'old' | 'new') {
  const value = side === 'old' ? entry.oldValue : entry.newValue
  if (entry.action === 'ASSIGNEE_CHANGED') {
    return userName(side === 'old' ? entry.oldUser : entry.newUser, value)
  }
  if (value == null || value === '') return 'None'
  if (entry.action === 'STATUS_CHANGED') {
    return (TASK_STATUS_LABEL as Record<string, string>)[value] ?? value
  }
  if (entry.action === 'PRIORITY_CHANGED') {
    return (TASK_PRIORITY_LABEL as Record<string, string>)[value] ?? value
  }
  if (entry.action === 'TYPE_CHANGED') {
    return (TASK_TYPE_LABEL as Record<string, string>)[value] ?? value
  }
  if (entry.action === 'ESTIMATE_CHANGED') return `${value}h`
  return value
}

function hasValueChange(entry: TaskActivityEntry) {
  return entry.oldValue != null || entry.newValue != null || entry.action === 'ASSIGNEE_CHANGED'
}

function ActivityValues({ entry }: { entry: TaskActivityEntry }) {
  if (!hasValueChange(entry)) return null
  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-text-muted">
      <span className="max-w-[180px] truncate font-medium text-text-primary">
        {formatValue(entry, 'old')}
      </span>
      <span>-&gt;</span>
      <span className="max-w-[180px] truncate font-medium text-text-primary">
        {formatValue(entry, 'new')}
      </span>
    </span>
  )
}

export function HistoryTab({ taskId }: HistoryTabProps) {
  const { data: history = [], isLoading } = useTaskHistory(taskId)
  if (isLoading) return <LiveLoading label="Loading history..." />
  if (history.length === 0) {
    return <p className="text-[13px] text-text-muted py-4 text-center">No history yet.</p>
  }

  return (
    <div className="space-y-3">
      {history.map((entry, i) => {
        const Icon = ACTIVITY_ICON[entry.action] || Clock
        const label = (TASK_ACTIVITY_LABEL as Record<string, string>)[entry.action] || entry.action
        const actor = entry.actor?.fullName || entry.actor?.email

        return (
          <div key={entry.id || i} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-bg-subtle border border-border flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-3 h-3 text-text-muted" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] text-text-primary">
                <span className="font-medium">{label}</span>{' '}
                <ActivityValues entry={entry} />
              </p>
              {actor && (
                <p className="text-[12px] text-text-muted mt-0.5">
                  by {actor}
                </p>
              )}
              {entry.note && <p className="text-[12px] text-text-muted mt-0.5">{entry.note}</p>}
              <p className="text-[11px] text-text-muted mt-0.5">
                {fmtDateTime(entry.createdAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
