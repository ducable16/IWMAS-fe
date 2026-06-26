import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { taskService } from '@/features/tasks/services/taskService'
import { TaskStatusBadge, TaskTypeBadge } from '@/components/ui/Badge'
import { TASK_PRIORITY_META as PRIORITY_META } from '@/constants/enums'
import { fmtDay, isOverdue, formatEstimate } from '@/utils/date'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { Task } from '@/types'
import type { Id } from '@/types'

type Props = {
  projectId: Id
}

const PRIORITY_META_BY_KEY = PRIORITY_META as Record<string, { label: string; color?: string }>

function normaliseTask(t: Task) {
  const assigneeName = t.assignee?.fullName || t.assignee?.email || 'â€”'
  return {
    id: t.id,
    title: t.title || 'Untitled',
    status: t.status ? String(t.status).toUpperCase() : 'TODO',
    priority: t.priority ? String(t.priority).toUpperCase() : 'MEDIUM',
    type: String(t.type || 'FEATURE'),
    assigneeFull: assigneeName,
    assigneeId: t.assignee?.id ?? null,
    due: t.dueDate || null,
    estimate: formatEstimate(t.estimatedHours),
    projectId: t.projectId,
  }
}

export function ProjectTasksTab({ projectId }: Props) {
  const navigate = useNavigate()

  const { data: rawTasks = [], isLoading, isError, error, refetch } = useQuery<Task[]>({
    queryKey: ['tasks', 'byProject', projectId],
    queryFn: async () => {
      const res = await taskService.getByProject(projectId)
      return Array.isArray(res.data) ? res.data : []
    },
    refetchOnWindowFocus: true,
  })

  const tasks = rawTasks.map(normaliseTask)

  if (isLoading) return <LiveLoading label="Loading tasksâ€¦" />
  if (isError) return <LiveError error={error} onRetry={refetch} />

  return (
    <div className="space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-text-muted">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} in this project
          </p>
        </div>

        {tasks.length === 0 ? (
          <LiveEmpty label="No tasks yet. Create the first one!" />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-subtle/50">
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide">
                      Task
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Priority
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Assignee
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Due
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Est.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const prio = PRIORITY_META_BY_KEY[task.priority] || {
                      label: task.priority,
                      color: 'text-text-secondary',
                    }
                    const overdue =
                      task.due && task.status !== 'DONE' ? isOverdue(task.due) : false

                    return (
                      <tr
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="border-b border-border-subtle last:border-0 hover:bg-bg-hover/40 transition-colors cursor-pointer group"
                      >

                        {/* Title */}
                        <td className="px-4 py-3 max-w-[320px]">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-[10px] text-text-muted mt-0.5 flex-shrink-0 bg-bg-subtle px-1.5 py-0.5 rounded">
                              #{task.id}
                            </span>
                            <p className="text-[13px] text-text-primary group-hover:text-accent transition-colors truncate">
                              {task.title}
                            </p>
                          </div>
                        </td>


                        {/* Type */}
                        <td className="px-4 py-3">
                          <TaskTypeBadge type={task.type} />
                        </td>


                        {/* Status */}
                        <td className="px-4 py-3">
                          <TaskStatusBadge status={task.status} />
                        </td>


                        {/* Priority */}
                        <td className="px-4 py-3">
                          <span className={clsx('text-[12px]', prio.color ?? 'text-text-secondary')}>
                            {prio.label}
                          </span>
                        </td>


                        {/* Assignee */}
                        <td className="px-4 py-3">
                          {task.assigneeId ? (
                            <span
                              title={task.assigneeFull}
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/users/${task.assigneeId}`)
                              }}
                              className="text-[12px] text-text-primary hover:text-accent hover:underline cursor-pointer transition-colors whitespace-nowrap"
                            >
                              {task.assigneeFull}
                            </span>
                          ) : (
                            <span className="text-[12px] text-text-muted">â€”</span>
                          )}
                        </td>


                        {/* Due */}
                        <td
                          className={clsx(
                            'px-4 py-3 text-[12px] tabular-nums whitespace-nowrap',
                            overdue ? 'text-danger font-semibold' : 'text-text-muted',
                          )}
                        >
                          {overdue && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger mr-1.5 align-middle" />
                          )}
                          {fmtDay(task.due)}
                        </td>


                        {/* Estimate */}
                        <td className="px-4 py-3 text-[12px] text-text-muted tabular-nums">
                          {task.estimate}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  )
}
