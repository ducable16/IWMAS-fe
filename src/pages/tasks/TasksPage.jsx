import { useState } from 'react'
import { Search, Plus, MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'

const STATUS_STYLE = {
  todo: { label: 'To do', cls: 'badge-neutral' },
  in_progress: { label: 'In progress', cls: 'badge-accent' },
  in_review: { label: 'In review', cls: 'badge-info' },
  done: { label: 'Done', cls: 'badge-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger' },
}

const PRIORITY_DOT = { high: 'bg-danger', medium: 'bg-warning', low: 'bg-border-strong' }

const FILTERS = [
  ['all', 'All'],
  ['todo', 'To do'],
  ['in_progress', 'In progress'],
  ['in_review', 'In review'],
  ['done', 'Done'],
  ['cancelled', 'Cancelled'],
]

export default function TasksPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const navigate = useNavigate()
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()

  const all = tasks || []
  const filtered = all.filter((t) => {
    const matchSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.id).toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
            Tasks
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">
            {all.length} tasks across all sprints
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          New task
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 max-w-[280px] focus-within:border-border-strong transition-colors">
          <Search className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-1 p-0.5 bg-bg-subtle border border-border-subtle rounded-lg">
          {FILTERS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={clsx(
                'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium',
                statusFilter === val
                  ? 'bg-bg-surface text-text-primary border border-border-subtle'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <LiveLoading label="Loading tasks from API…" />}
      {isError && <LiveError error={error} onRetry={refetch} />}
      {!isLoading && !isError && all.length === 0 && <LiveEmpty label="No tasks yet." />}

      {!isLoading && !isError && all.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle/50">
                  {['Task', 'Status', 'Priority', 'Assignee', 'Sprint', 'Due', 'Estimate', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-[11px] text-text-muted font-medium uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                  {filtered.map((task) => {
                  const s = STATUS_STYLE[task.status] || { label: task.status, cls: 'badge-neutral' }
                  return (
                    <tr
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="border-b border-border-subtle last:border-0 hover:bg-bg-hover/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[11px] text-text-muted">{task.id}</span>
                          <span className="text-[13px] text-text-primary">{task.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={s.cls}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={clsx('dot', PRIORITY_DOT[task.priority] || 'bg-border-strong')} />
                          <span className="text-[12px] text-text-secondary capitalize">{task.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-6 h-6 rounded-full bg-bg-subtle border border-border-subtle flex items-center justify-center text-[10px] font-semibold text-text-primary">
                          {task.assignee}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-text-secondary">{task.sprint}</td>
                      <td className="px-4 py-3 text-[12px] text-text-muted tabular-nums">{task.due}</td>
                      <td className="px-4 py-3 text-[12px] text-text-muted tabular-nums">{task.estimate}</td>
                      <td className="px-4 py-3">
                        <button className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 rounded">
                          <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted text-[13px]">
              No tasks match your filter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
