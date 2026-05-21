import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  ListTodo,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import {
  useUserAssignedTasks,
  useUserProjects,
  useUserReportedTasks,
} from '@/features/members/hooks/useMembers'
import { LiveEmpty, LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { Pagination } from '@/components/ui/Pagination'
import { ProjectStatusBadge, TaskPriorityBadge, TaskStatusBadge } from '@/components/ui/Badge'
import { TASK_STATUS_DETAIL_META as STATUS_META } from '@/constants/enums'
import { fmtRelative } from '@/utils/date'
import type { Id, Project, Task } from '@/types'

export type MainTab = 'tasks' | 'projects'
type TaskSubTab = 'assigned' | 'reported'

type UserIdProps = {
  userId: Id
}

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  color?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-accent',
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-subtle/60 rounded-xl border border-border-subtle">
      <div className={clsx('p-2 rounded-lg bg-bg-surface border border-border-subtle', color)}>
        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-text-primary tabular-nums leading-none">{value}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
        {sub && <p className="text-[10.5px] text-text-muted">{sub}</p>}
      </div>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-bg-subtle/80 transition-colors border border-transparent hover:border-border-subtle"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary leading-snug group-hover:text-accent transition-colors truncate">
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <TaskStatusBadge status={String(task.status || 'TODO')} variant="detail" />
          {task.priority && <TaskPriorityBadge priority={String(task.priority)} />}
          {task.dueDate && (
            <span className={clsx(
              'flex items-center gap-0.5 text-[11px]',
              new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                ? 'text-danger font-medium'
                : 'text-text-muted',
            )}>
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {task.dueDate}
            </span>
          )}
          {task.projectId && (
            <span className="text-[11px] text-text-muted font-mono">
              #{task.projectId}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-text-muted shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
    </Link>
  )
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-bg-subtle/80 transition-colors border border-transparent hover:border-border-subtle"
    >
      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
        <FolderOpen className="w-4 h-4 text-accent" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary leading-snug group-hover:text-accent transition-colors truncate">
          {project.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {project.code && (
            <span className="text-[11px] font-mono text-text-muted">{project.code}</span>
          )}
          <ProjectStatusBadge status={String(project.status || 'PLANNING')} />
          {project.startDate && (
            <span className="text-[11px] text-text-muted">
              {project.startDate}{project.endDate ? ` -> ${project.endDate}` : ''}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
    </Link>
  )
}

export function TasksPanel({ userId }: UserIdProps) {
  const [sub, setSub] = useState<TaskSubTab>('assigned')
  const [page, setPage] = useState(0)

  const commonParams = { sortBy: 'updatedAt', sortDirection: 'DESC', size: 10, page }
  const assigned = useUserAssignedTasks(userId, commonParams, sub === 'assigned')
  const reported = useUserReportedTasks(userId, commonParams, sub === 'reported')
  const active = sub === 'assigned' ? assigned : reported
  const activeTasks = active.data?.tasks ?? []
  const activeTotalPages = active.data?.totalPages ?? 1

  const subTabs = [
    { id: 'assigned', label: 'Assigned to them', icon: ListTodo },
    { id: 'reported', label: 'Reported by them', icon: FileText },
  ] satisfies Array<{ id: TaskSubTab; label: string; icon: LucideIcon }>

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border-subtle mb-3">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSub(tab.id)
              setPage(0)
            }}
            className={clsx(
              'flex items-center gap-1.5 px-3 pb-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors',
              sub === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            <tab.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            {tab.label}
            {sub === tab.id && active.data && (
              <span className="ml-1 text-[10.5px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-semibold">
                {active.data.totalElements}
              </span>
            )}
          </button>
        ))}
      </div>

      {active.isLoading && <LiveLoading label="Loading tasks..." />}
      {active.isError && <LiveError error={active.error} onRetry={active.refetch} />}

      {!active.isLoading && !active.isError && (
        activeTasks.length === 0
          ? <LiveEmpty label={`No ${sub === 'assigned' ? 'assigned' : 'reported'} tasks visible to you.`} />
          : (
            <div className="space-y-0.5">
              {activeTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
              <Pagination
                page={page}
                totalPages={activeTotalPages}
                onChange={setPage}
              />
            </div>
          )
      )}
    </div>
  )
}

export function ProjectsPanel({ userId }: UserIdProps) {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, error, refetch } = useUserProjects(
    userId,
    { sortBy: 'name', sortDirection: 'ASC', size: 10, page },
  )

  if (isLoading) return <LiveLoading label="Loading projects..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />
  if (!data?.projects?.length) return <LiveEmpty label="No shared projects visible to you." />

  return (
    <div>
      <div className="space-y-0.5">
        {data.projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  )
}

export function ActivityFeed({ userId }: UserIdProps) {
  const { data, isLoading } = useUserAssignedTasks(
    userId,
    { sortBy: 'updatedAt', sortDirection: 'DESC', size: 8, page: 0 },
    true,
  )

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-text-muted py-3">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Loading activity...
      </div>
    )
  }

  const tasks = data?.tasks ?? []
  if (tasks.length === 0) {
    return <p className="text-[12px] text-text-muted italic py-2">No recent activity visible.</p>
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const statusKey = String(task.status || 'TODO') as keyof typeof STATUS_META
        const statusMeta = STATUS_META[statusKey] || STATUS_META.TODO
        const updatedAt = task.updatedAt ? new Date(task.updatedAt) : null
        const timeAgo = updatedAt ? fmtRelative(updatedAt) : ''

        return (
          <div key={task.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 rounded-full shrink-0 bg-text-muted" />
              <div className="w-px flex-1 bg-border-subtle mt-1 min-h-[16px]" />
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <Link
                to={`/tasks/${task.id}`}
                className="text-[12.5px] font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
              >
                {task.title}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={clsx('text-[11px] font-medium', statusMeta.cls || 'text-text-muted')}>
                  {statusMeta.label || task.status}
                </span>
                {timeAgo && (
                  <span className="text-[11px] text-text-muted">- {timeAgo}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
