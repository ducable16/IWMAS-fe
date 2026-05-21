import { Link } from 'react-router-dom'
import { Clock, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import { TaskPriorityBadge, TaskStatusBadge } from '@/components/ui/Badge'
import { fmtDay } from '@/utils/date'
import type { WorkloadTask } from '@/types'
import type { WorkloadDetailVariant } from './memberWorkloadDetailTypes'

interface WorkloadTaskRowProps {
  task: WorkloadTask
  variant: WorkloadDetailVariant
}

export default function WorkloadTaskRow({ task, variant }: WorkloadTaskRowProps) {
  const taskId = task.taskId ?? task.id
  const isPage = variant === 'page'

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-lg hover:bg-bg-subtle/60 transition-colors group',
        isPage ? 'py-3 px-4 rounded-xl' : 'py-2.5 px-3',
      )}
    >
      <Link
        to={`/tasks/${taskId}`}
        className={clsx(
          'flex-1 min-w-0 font-medium text-text-primary hover:text-accent transition-colors truncate',
          isPage ? 'text-[13.5px]' : 'text-[13px]',
        )}
      >
        {task.title}
      </Link>

      <TaskPriorityBadge priority={String(task.priority || 'MEDIUM')} className="shrink-0" />
      <TaskStatusBadge status={String(task.status || 'TODO')} className="shrink-0" />

      <span
        className={clsx(
          'shrink-0 tabular-nums flex items-center gap-1',
          isPage ? 'text-[12px]' : 'text-[11.5px]',
          task.overdue ? 'text-danger font-bold' : 'text-text-muted',
        )}
      >
        <Clock className="w-3 h-3" strokeWidth={1.75} />
        {fmtDay(task.dueDate)}
      </span>

      <span
        className={clsx(
          'font-medium text-text-secondary bg-bg-subtle shrink-0 tabular-nums',
          isPage
            ? 'text-[11.5px] border border-border-subtle px-2 py-0.5 rounded-lg'
            : 'text-[11px] px-1.5 py-0.5 rounded',
        )}
      >
        {task.remainingHours?.toFixed(1) ?? '-'} h
      </span>

      {isPage && (
        <Link
          to={`/tasks/${taskId}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-accent shrink-0"
          title="Open task"
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  )
}
