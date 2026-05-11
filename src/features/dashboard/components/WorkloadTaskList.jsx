import { Link } from 'react-router-dom'
import { Clock, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/Badge'

function formatDueDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function WorkloadTaskList({
  tasks = [],
  isLoading,
  isError,
  error,
  emptyLabel = 'No tasks for this period.',
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-[12px] text-text-muted">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Loading tasks…
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-[12px] text-danger">
        {error?.message || 'Failed to load tasks.'}
      </p>
    )
  }

  if (!tasks.length) {
    return (
      <p className="text-[12px] text-text-muted italic">{emptyLabel}</p>
    )
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <div
          key={task.taskId}
          className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-bg-subtle/60 transition-colors"
        >
          <Link
            to={`/tasks/${task.taskId}`}
            className="flex-1 min-w-0 text-[12.5px] font-medium text-text-primary hover:text-accent transition-colors truncate"
          >
            {task.title}
          </Link>
          <TaskPriorityBadge priority={task.priority} className="shrink-0" />
          <TaskStatusBadge status={task.status} className="shrink-0" />
          <span
            className={clsx(
              'text-[11.5px] tabular-nums shrink-0 flex items-center gap-1',
              task.overdue ? 'text-danger font-semibold' : 'text-text-muted',
            )}
          >
            <Clock className="w-3 h-3" strokeWidth={1.75} />
            {formatDueDate(task.dueDate)}
          </span>
        </div>
      ))}
    </div>
  )
}
