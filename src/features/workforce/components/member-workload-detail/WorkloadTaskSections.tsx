import { AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import WorkloadTaskRow from './WorkloadTaskRow'
import type { WorkloadTask } from '@/types'
import type { WorkloadDetailVariant } from './memberWorkloadDetailTypes'

interface WorkloadTaskSectionsProps {
  tasks: WorkloadTask[]
  showAllTasks: boolean
  variant: WorkloadDetailVariant
}

const pageListClass = 'card divide-y divide-border-subtle overflow-hidden'
const modalListClass =
  'rounded-xl border border-border-subtle bg-bg-subtle/30 divide-y divide-border-subtle overflow-hidden'

function EmptyTaskList({ variant, label }: { variant: WorkloadDetailVariant; label: string }) {
  if (variant === 'page') {
    return (
      <div className="card p-8 text-center">
        <p className="text-[13px] text-text-muted italic">{label}</p>
      </div>
    )
  }

  return (
    <p className="text-[12.5px] text-text-muted italic py-3 px-1">
      {label}
    </p>
  )
}

export default function WorkloadTaskSections({
  tasks,
  showAllTasks,
  variant,
}: WorkloadTaskSectionsProps) {
  const overdueTasks = tasks.filter((task) => task.overdue)
  const dueThisWeek = tasks.filter((task) => !task.overdue)
  const isPage = variant === 'page'

  return (
    <>
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
              isPage ? 'card' : 'rounded-xl border',
            )}
          >
            {overdueTasks.map((task) => (
              <WorkloadTaskRow
                key={String(task.taskId ?? task.id)}
                task={task}
                variant={variant}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3
          className={clsx(
            'font-semibold text-text-muted uppercase tracking-wider',
            isPage ? 'text-[13px] mb-3' : 'text-[12px] mb-2',
          )}
        >
          Due this week ({dueThisWeek.length})
        </h3>
        {dueThisWeek.length > 0 ? (
          <div className={isPage ? pageListClass : modalListClass}>
            {dueThisWeek.map((task) => (
              <WorkloadTaskRow
                key={String(task.taskId ?? task.id)}
                task={task}
                variant={variant}
              />
            ))}
          </div>
        ) : (
          <EmptyTaskList variant={variant} label="No tasks due this week" />
        )}
      </section>

      {showAllTasks && (
        <section>
          <h3
            className={clsx(
              'font-semibold text-text-muted uppercase tracking-wider',
              isPage ? 'text-[13px] mb-3' : 'text-[12px] mb-2',
            )}
          >
            All tasks ({tasks.length})
          </h3>
          {tasks.length > 0 ? (
            <div className={isPage ? pageListClass : modalListClass}>
              {tasks.map((task) => (
                <WorkloadTaskRow
                  key={`all-${String(task.taskId ?? task.id)}`}
                  task={task}
                  variant={variant}
                />
              ))}
            </div>
          ) : (
            <EmptyTaskList variant={variant} label="No tasks found" />
          )}
        </section>
      )}
    </>
  )
}
