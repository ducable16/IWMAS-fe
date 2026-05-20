import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from 'lucide-react'
import clsx from 'clsx'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import { TaskStatusBadge, TaskTypeBadge } from '@/components/ui/Badge'
import { TASK_PRIORITY_META as PRIORITY_META } from '@/constants/enums'
import type { TaskFilterChange, TaskFilters, TaskListItem } from '@/types'

interface SortHeaderProps {
  field: string
  label: string
  filters: TaskFilters
  onChange: TaskFilterChange
}

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onChange: TaskFilterChange
}

interface TaskListViewProps {
  tasks: TaskListItem[]
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

const PRIORITY_META_BY_KEY = PRIORITY_META as Record<string, { label: string; color?: string }>

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function isOverdue(task: TaskListItem) {
  return (
    task.due &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED' &&
    new Date(task.due) < new Date()
  )
}

function SortHeader({ field, label, filters, onChange }: SortHeaderProps) {
  const active = filters.sortBy === field
  const isDesc = filters.sortDirection === 'DESC'
  return (
    <button
      onClick={() => {
        if (active) {
          onChange('sortDirection', isDesc ? 'ASC' : 'DESC')
        } else {
          onChange('sortBy', field)
          onChange('sortDirection', 'DESC')
        }
      }}
      className={clsx(
        'flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition-colors',
        active ? 'text-accent' : 'text-text-muted hover:text-text-secondary',
      )}
    >
      {label}
      {active &&
        (isDesc ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
    </button>
  )
}

function Pagination({ page, totalPages, totalElements, size, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    const half = 3
    let start = Math.max(0, page - half)
    const end = Math.min(totalPages - 1, start + 6)
    start = Math.max(0, end - 6)
    return start + i
  }).filter((p) => p < totalPages)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-bg-subtle/30">
      <span className="text-[12px] text-text-muted">
        Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of{' '}
        {totalElements}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onChange('page', page - 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((pg) => (
          <button
            key={pg}
            onClick={() => onChange('page', pg)}
            className={clsx(
              'min-w-[28px] h-7 rounded-lg text-[12px] font-medium border transition-colors',
              pg === page
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:border-border-strong',
            )}
          >
            {pg + 1}
          </button>
        ))}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onChange('page', page + 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function TaskListView({
  tasks,
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

  if (isLoading) return <LiveLoading label="Searching tasks…" />
  if (isError) return <LiveError error={error as Error | { message?: string } | null | undefined} onRetry={refetch} />
  if (totalElements === 0) return <LiveEmpty label="No tasks match your filters." />

  return (
    <div className={clsx('card overflow-hidden transition-opacity duration-200', isStale && 'opacity-70')}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle/50">
              <th className="text-left px-4 py-3">
                <SortHeader field="title" label="Task" filters={filters} onChange={onChange} />
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Type
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader field="priority" label="Priority" filters={filters} onChange={onChange} />
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Assignee
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader field="dueDate" label="Due" filters={filters} onChange={onChange} />
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                Est.
              </th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const prio = PRIORITY_META_BY_KEY[task.priority] || { label: task.priority, color: 'text-text-secondary' }
              const overdue = isOverdue(task)

              return (
                <tr
                  key={task.id}
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
                            {task.labels.map((l) => (
                              <span
                                key={l}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const already = filters.labels.includes(l)
                                  onChange('labels', already
                                    ? filters.labels.filter((x) => x !== l)
                                    : [...filters.labels, l])
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-subtle border border-border-subtle text-text-muted hover:border-accent/40 hover:text-accent cursor-pointer transition-colors"
                              >
                                #{l}
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
                      <span className="text-[12px] text-text-muted">—</span>
                    )}
                  </td>

                  <td className={clsx('px-4 py-3 text-[12px] tabular-nums whitespace-nowrap', overdue ? 'text-danger font-semibold' : 'text-text-muted')}>
                    {overdue && <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger mr-1.5 align-middle" />}
                    {formatDate(task.due)}
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
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={filters.page}
        totalPages={totalPages}
        totalElements={totalElements}
        size={filters.size}
        onChange={onChange}
      />
    </div>
  )
}
