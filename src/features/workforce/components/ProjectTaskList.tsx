import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import clsx from 'clsx'
import { taskService } from '@/features/tasks/services/taskService'
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/Badge'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { Id, Task } from '@/types'

type ProjectTaskListProps = {
  projectId: Id | null | undefined
}

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function ProjectTaskList({ projectId }: ProjectTaskListProps) {
  const { data, isLoading, isError, error, refetch } = useQuery<Task[]>({
    queryKey: ['tasks', 'project', projectId],
    queryFn: async () => {
      const res = await taskService.getByProject(projectId as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!projectId,
    staleTime: 30_000,
  })

  const tasks = data || []

  if (isLoading) return <LiveLoading label="Loading project tasks…" />
  if (isError) return <LiveError error={error} onRetry={refetch} />
  if (!tasks.length) return <LiveEmpty label="No tasks in this project." />

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const assigneeName = task.assignee?.fullName || task.assignee?.email || '—'
        return (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-bg-surface hover:bg-bg-subtle/40 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-text-primary truncate">{task.title}</p>
              <p className="text-[11.5px] text-text-muted truncate mt-0.5">{assigneeName}</p>
            </div>
            <TaskPriorityBadge priority={String(task.priority || 'MEDIUM')} className="shrink-0" />
            <TaskStatusBadge status={String(task.status || 'TODO')} className="shrink-0" />
            <span className={clsx('text-[11.5px] tabular-nums text-text-muted flex items-center gap-1 shrink-0')}>
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {formatDate(task.dueDate)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
