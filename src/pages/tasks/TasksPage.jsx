import { useState } from 'react'
import { Search, Plus, MoreHorizontal } from 'lucide-react'
import clsx from 'clsx'

const ALL_TASKS = [
  { id: 'T-142', title: 'Implement OAuth2 flow for login', status: 'in_progress', priority: 'high', assignee: 'MR', tags: ['auth', 'backend'], sprint: 'Sprint 15', due: '2025-04-22', estimate: '8h' },
  { id: 'T-143', title: 'Design workload dashboard UI', status: 'review', priority: 'high', assignee: 'SC', tags: ['design', 'frontend'], sprint: 'Sprint 15', due: '2025-04-20', estimate: '6h' },
  { id: 'T-144', title: 'Set up Redis caching layer', status: 'todo', priority: 'medium', assignee: 'JP', tags: ['backend', 'infra'], sprint: 'Sprint 15', due: '2025-04-24', estimate: '5h' },
  { id: 'T-145', title: 'Write integration tests for API', status: 'todo', priority: 'medium', assignee: 'HL', tags: ['testing'], sprint: 'Sprint 15', due: '2025-04-25', estimate: '4h' },
  { id: 'T-146', title: 'DB migration script v2', status: 'in_progress', priority: 'high', assignee: 'TD', tags: ['backend', 'db'], sprint: 'Sprint 15', due: '2025-04-21', estimate: '7h' },
  { id: 'T-147', title: 'Mobile responsive fixes', status: 'todo', priority: 'low', assignee: 'PN', tags: ['frontend', 'css'], sprint: 'Sprint 15', due: '2025-04-28', estimate: '3h' },
  { id: 'T-148', title: 'Notification email templates', status: 'done', priority: 'medium', assignee: 'AK', tags: ['backend'], sprint: 'Sprint 14', due: '2025-04-10', estimate: '4h' },
  { id: 'T-149', title: 'Burnout alert algorithm', status: 'done', priority: 'high', assignee: 'MR', tags: ['backend', 'ai'], sprint: 'Sprint 14', due: '2025-04-08', estimate: '10h' },
]

const STATUS_STYLE = {
  todo: { label: 'To do', cls: 'badge-neutral' },
  in_progress: { label: 'In progress', cls: 'badge-accent' },
  review: { label: 'Review', cls: 'badge-info' },
  done: { label: 'Done', cls: 'badge-success' },
}

const PRIORITY_DOT = { high: 'bg-danger', medium: 'bg-warning', low: 'bg-border-strong' }

const FILTERS = [
  ['all', 'All'],
  ['todo', 'To do'],
  ['in_progress', 'In progress'],
  ['review', 'Review'],
  ['done', 'Done'],
]

export default function TasksPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = ALL_TASKS.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
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
            {ALL_TASKS.length} tasks across all sprints
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
                const s = STATUS_STYLE[task.status]
                return (
                  <tr
                    key={task.id}
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
                        <span className={clsx('dot', PRIORITY_DOT[task.priority])} />
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
    </div>
  )
}
