import { AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import WorkloadTaskRow from './WorkloadTaskRow'
import type { TaskWorkloadItem } from '@/types'
import type { WorkloadDetailVariant } from './memberWorkloadDetailTypes'

interface WorkloadTaskSectionsProps {
  tasks: TaskWorkloadItem[]
  variant: WorkloadDetailVariant
  embedded?: boolean
}

const modalListClass =
  'rounded-xl border border-border-subtle bg-bg-subtle/30 divide-y divide-border-subtle overflow-hidden'

function EmptyTaskList({
  variant,
  embedded,
  label,
}: {
  variant: WorkloadDetailVariant
  embedded: boolean
  label: string
}) {
  if (variant === 'page' && !embedded) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[13px] text-text-muted italic">{label}</p>
      </div>
    )
  }

  return (
    <p className={clsx(
      'text-[12.5px] text-text-muted italic',
      embedded ? 'rounded-xl border border-border-subtle bg-bg-subtle/30 px-4 py-6 text-center' : 'px-1 py-3',
    )}>
      {label}
    </p>
  )
}

export default function WorkloadTaskSections({
  tasks,
  variant,
  embedded = false,
}: WorkloadTaskSectionsProps) {
  const overdueTasks = tasks.filter((task) => task.overdue)
  const remainingTasks = tasks.filter((task) => !task.overdue)
  const isPage = variant === 'page'

  if (tasks.length === 0) {
    return (
      <EmptyTaskList
        variant={variant}
        embedded={embedded}
        label="No tasks in this project"
      />
    )
  }

  return (
    <div className={clsx(isPage ? 'space-y-5' : 'space-y-4')}>
      {overdueTasks.length > 0 && (
        <section>
          <div className={clsx('flex items-center gap-2', isPage ? 'mb-3' : 'mb-2')}>
            <AlertTriangle
              className={clsx(isPage ? 'w-4 h-4' : 'w-3.5 h-3.5', 'text-danger')}
              strokeWidth={2}
            />
            <h3
              className={clsx(
                'font-semibold text-danger uppercase tracking-wider',
                isPage ? 'text-[13px]' : 'text-[12px]',
              )}
            >
              Overdue ({overdueTasks.length})
            </h3>
          </div>
          <div
            className={clsx(
              'border-danger/20 bg-danger/[0.03] divide-y divide-danger/10 overflow-hidden',
              isPage && !embedded ? 'card' : 'rounded-xl border',
            )}
          >
            {overdueTasks.map((task) => (
              <WorkloadTaskRow
                key={String(task.taskId)}
                task={task}
                variant={variant}
              />
            ))}
          </div>
        </section>
      )}

      {remainingTasks.length > 0 && (
        <section>
          <h3
            className={clsx(
              'font-semibold text-text-muted uppercase tracking-wider',
              isPage ? 'text-[13px] mb-3' : 'text-[12px] mb-2',
            )}
          >
            Remaining ({remainingTasks.length})
          </h3>
          <div className={isPage && !embedded
            ? 'card divide-y divide-border-subtle overflow-hidden'
            : modalListClass}
          >
            {remainingTasks.map((task) => (
              <WorkloadTaskRow
                key={String(task.taskId)}
                task={task}
                variant={variant}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
