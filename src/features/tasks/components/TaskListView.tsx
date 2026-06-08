import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { LiveEmpty, LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import SortableHeader from '@/components/ui/SortableHeader'
import TaskListPagination from './task-list/TaskListPagination'
import TaskListRow from './task-list/TaskListRow'
import type { Project, TaskFilterChange, TaskFilters, TaskListItem } from '@/types'

type TaskListViewProps = {
  tasks: TaskListItem[]
  projects?: Project[] | undefined
  filters: TaskFilters
  onChange: TaskFilterChange
  totalElements: number
  totalPages: number
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
  isStale: boolean
}

export default function TaskListView({
  tasks,
  projects = [],
  filters,
  onChange,
  totalElements,
  totalPages,
  isLoading,
  isError,
  error,
  refetch,
  isStale,
}: TaskListViewProps) {
  const navigate = useNavigate()
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [String(project.id), project])),
    [projects],
  )
  const sortBy = (field: string) => {
    if (filters.sortBy === field) {
      onChange('sortDirection', filters.sortDirection === 'DESC' ? 'ASC' : 'DESC')
    } else {
      onChange('sortBy', field)
      onChange('sortDirection', 'DESC')
    }
  }

  if (isLoading) return <LiveLoading label="Searching tasks..." />
  if (isError) return <LiveError error={error as Error | { message?: string } | null | undefined} onRetry={refetch} />
  if (totalElements === 0) return <LiveEmpty label="No tasks match your filters." />

  return (
    <div className={clsx('card overflow-hidden transition-opacity duration-200', isStale && 'opacity-70')}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle/50">
              <th className="text-left px-4 py-3">
                <SortableHeader
                  mode="button"
                  label="Task"
                  active={filters.sortBy === 'title'}
                  direction={filters.sortDirection}
                  onClick={() => sortBy('title')}
                  showInactiveIcon={false}
                />
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Type
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Project
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="text-left px-4 py-3">
                <SortableHeader
                  mode="button"
                  label="Priority"
                  active={filters.sortBy === 'priority'}
                  direction={filters.sortDirection}
                  onClick={() => sortBy('priority')}
                  showInactiveIcon={false}
                />
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Assignee
              </th>
              <th className="text-left px-4 py-3">
                <SortableHeader
                  mode="button"
                  label="Due"
                  active={filters.sortBy === 'dueDate'}
                  direction={filters.sortDirection}
                  onClick={() => sortBy('dueDate')}
                  showInactiveIcon={false}
                />
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Est.
              </th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskListRow
                key={task.id}
                task={task}
                project={task.projectId ? projectsById.get(String(task.projectId)) : undefined}
                onChange={onChange}
                navigate={navigate}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TaskListPagination
        page={filters.page}
        totalPages={totalPages}
        totalElements={totalElements}
        size={filters.size}
        onChange={onChange}
      />
    </div>
  )
}
