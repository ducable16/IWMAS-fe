import TimeLogItem from './TimeLogItem'
import type { Id, TimeLogResponse } from '@/types'

type TimeLogListProps = {
  logs: TimeLogResponse[]
  currentUserId?: Id | null | undefined
  showTask?: boolean
  showUser?: boolean
  allowActions?: boolean
  emptyLabel?: string
  onEdit: (log: TimeLogResponse) => void
}

export default function TimeLogList({
  logs,
  currentUserId,
  showTask = false,
  showUser = false,
  allowActions = false,
  emptyLabel = 'No work logs yet.',
  onEdit,
}: TimeLogListProps) {
  if (logs.length === 0) {
    return (
      <p className="text-[13px] text-text-muted py-4 text-center italic">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <TimeLogItem
          key={log.id}
          log={log}
          currentUserId={currentUserId}
          showTask={showTask}
          showUser={showUser}
          allowActions={allowActions}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
