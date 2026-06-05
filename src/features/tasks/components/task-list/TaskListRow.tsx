import { MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'
import { TaskStatusBadge, TaskTypeBadge } from '@/components/ui/Badge'
import { TASK_PRIORITY_META as PRIORITY_META } from '@/constants/enums'
import { fmtDay, isOverdue } from '@/utils/date'
import type { NavigateFunction } from 'react-router-dom'
import type { TaskFilterChange, TaskFilters, TaskListItem } from '@/types'

type TaskListRowProps = {
  task: TaskListItem
  filters: TaskFilters
  onChange: TaskFilterChange
  navigate: NavigateFunction
}

const PRIORITY_META_BY_KEY = PRIORITY_META as Record<string, { label: string; color?: string }>

export default function TaskListRow({
  task,
  filters,
  onChange,
  navigate,
}: TaskListRowProps) {
  const prio = PRIORITY_META_BY_KEY[task.priority] || {
    label: task.priority,
    color: 'text-text-secondary',
  }
  const overdue = task.due && task.status !== 'DONE' ? isOverdue(task.due) : false
  const projectLabel = task.projectCode || task.projectName || (task.projectId ? `#${task.projectId}` : '-')
  const projectTitle = task.projectName
    ? `${task.projectName}${task.projectCode ? ` (${task.projectCode})` : ''}`
    : task.projectCode || (task.projectId ? `Project #${task.projectId}` : 'Project')

  return (
    <tr
      onClick={() => navigate(`/tasks/${task.id}`)}
      className="border-b border-border-subtle last:border-0 hover:bg-bg-hover/40 transition-colors cursor-pointer group"
    >
      <td className="px-4 py-3 max-w-[300px]">
        <div className="flex items-start gap-2.5">
          <span className="font-mono text-[10px] text-text-muted mt-0.5 flex-shrink-0 bg-bg-subtle px-1.5 py-0.5 rounded">
            #{task.id}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] text-text-primary group-hover:text-accent transition-colors truncate">
              {task.title}
            </p>
            {task.labels.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {task.labels.map((label) => (
                  <span
                    key={label}
                    onClick={(e) => {
                      e.stopPropagation()
                      const already = filters.labels.includes(label)
                      onChange('labels', already
                        ? filters.labels.filter((item) => item !== label)
                        : [...filters.labels, label])
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-subtle border border-border-subtle text-text-muted hover:border-accent/40 hover:text-accent cursor-pointer transition-colors"
                  >
                    #{label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <TaskTypeBadge type={task.type} />
      </td>

      <td className="px-4 py-3 max-w-[180px]">
        {task.projectId ? (
          <span
            title={projectTitle}
            onClick={(e) => {
              e.stopPropagation()
              onChange('projectId', task.projectId ?? null)
            }}
            className="text-[12px] text-text-primary hover:text-accent hover:underline cursor-pointer transition-colors truncate block"
          >
            {projectLabel}
          </span>
        ) : (
          <span className="text-[12px] text-text-muted">-</span>
        )}
      </td>

      <td className="px-4 py-3">
        <TaskStatusBadge status={task.status} />
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className={clsx('text-[12px]', prio.color ?? 'text-text-secondary')}>
            {prio.label}
          </span>
        </div>
      </td>

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
            {task.assigneeFull || task.assigneeEmail}
          </span>
        ) : (
          <span className="text-[12px] text-text-muted">-</span>
        )}
      </td>

      <td className={clsx('px-4 py-3 text-[12px] tabular-nums whitespace-nowrap', overdue ? 'text-danger font-semibold' : 'text-text-muted')}>
        {overdue && <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger mr-1.5 align-middle" />}
        {fmtDay(task.due)}
      </td>

      <td className="px-4 py-3 text-[12px] text-text-muted tabular-nums">
        {task.estimate}
      </td>

      <td className="px-4 py-3">
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 rounded opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </td>
    </tr>
  )
}
