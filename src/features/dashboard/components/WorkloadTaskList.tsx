import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/Badge'
import { fmtDay } from '@/utils/date'
import type { TaskWorkloadItem } from '@/types'

type WorkloadTaskListProps = {
  tasks?: TaskWorkloadItem[]
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
  emptyLabel?: string
  showDeadlineRisk?: boolean
}


export default function WorkloadTaskList({
  tasks = [],
  isLoading,
  isError,
  error,
  emptyLabel = 'No tasks for this period.',
  showDeadlineRisk = false,
}: WorkloadTaskListProps) {
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
      {tasks.map((task) => {
        const taskId = task.taskId
        const atRisk = task.overdue || task.willSlip

        return (
          <div
            key={taskId}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-2 py-2 transition-colors hover:bg-bg-subtle/60"
          >
            <div className="flex min-w-[220px] flex-1 items-center gap-2">
              <Link
                to={`/tasks/${taskId}`}
                className="min-w-0 flex-[0_1_auto] truncate text-[12.5px] font-medium text-text-primary transition-colors hover:text-accent"
              >
                {task.title}
              </Link>
              <TaskPriorityBadge priority={task.priority || 'MEDIUM'} className="shrink-0" />
              <TaskStatusBadge status={task.status || 'TODO'} className="shrink-0" />
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              {showDeadlineRisk && atRisk && (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-danger/20 bg-danger/[0.06] px-1.5 py-0.5 text-[10.5px] font-semibold text-danger"
                  title={task.overdue
                    ? 'This task is overdue'
                    : `Projected to finish ${task.lateByWorkdays} workdays late`}
                >
                  <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                  At risk
                </span>
              )}
              <span
                className={clsx(
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums',
                  task.unestimated
                    ? 'border border-warning/20 bg-warning/10 text-warning'
                    : 'bg-bg-subtle text-text-muted',
                )}
                title={task.unestimated ? 'Add an estimate to include this task in workload planning' : 'Estimated effort'}
              >
                {task.unestimated ? 'Needs estimate' : `${task.remainingHours?.toFixed(1) ?? '-'}h est.`}
              </span>
              <span
                className={clsx(
                  'flex shrink-0 items-center gap-1 text-[11.5px] tabular-nums',
                  task.overdue ? 'font-semibold text-danger' : 'text-text-muted',
                )}
              >
                <Clock className="h-3 w-3" strokeWidth={1.75} />
                {fmtDay(task.dueDate)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
