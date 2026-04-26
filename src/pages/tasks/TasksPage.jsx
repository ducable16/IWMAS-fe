import { useState, useCallback, useDeferredValue } from 'react'
import {
  Search,
  Plus,
  SlidersHorizontal,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useMembers } from '@/features/members/hooks/useMembers'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import TaskFilterDrawer, {
  STATUS_META,
  PRIORITY_META,
  TYPE_META,
  SORT_FIELDS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
} from '@/features/tasks/components/TaskFilterDrawer'

// ─── Default filter (matches backend defaults exactly) ────────────────────────
const DEFAULT_FILTERS = {
  search:       '',
  projectId:    null,
  statuses:     [],
  priorities:   [],
  types:        [],
  assigneeId:   null,
  reporterId:   null,
  labels:       [],
  sprint:       null,
  dueDateFrom:  null,
  dueDateTo:    null,
  customFields: {},
  sortBy:       'createdAt',
  sortDirection:'DESC',
  page:         0,
  size:         20,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function isOverdue(task) {
  return (
    task.due &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED' &&
    new Date(task.due) < new Date()
  )
}

// ─── Active filter chips (shown in the toolbar) ───────────────────────────────
function ActiveChips({ filters, users, projects, onChange, onClearAll }) {
  const chips = []

  // Project
  if (filters.projectId) {
    const proj = projects.find((p) => p.id === filters.projectId)
    chips.push({
      key: 'projectId',
      label: `Project: ${proj?.name ?? filters.projectId}`,
      clear: () => onChange('projectId', null),
    })
  }

  // Statuses
  ;(filters.statuses || []).forEach((s) =>
    chips.push({
      key: `status-${s}`,
      label: STATUS_META[s]?.label ?? s,
      clear: () => onChange('statuses', filters.statuses.filter((x) => x !== s)),
    }),
  )

  // Priorities
  ;(filters.priorities || []).forEach((p) =>
    chips.push({
      key: `priority-${p}`,
      label: PRIORITY_META[p]?.label ?? p,
      clear: () => onChange('priorities', filters.priorities.filter((x) => x !== p)),
    }),
  )

  // Types
  ;(filters.types || []).forEach((t) =>
    chips.push({
      key: `type-${t}`,
      label: TYPE_META[t]?.label ?? t,
      clear: () => onChange('types', filters.types.filter((x) => x !== t)),
    }),
  )

  // Assignee
  if (filters.assigneeId) {
    const u = users.find((x) => x.id === filters.assigneeId)
    chips.push({
      key: 'assigneeId',
      label: `Assignee: ${u?.name ?? filters.assigneeId}`,
      clear: () => onChange('assigneeId', null),
    })
  }

  // Reporter
  if (filters.reporterId) {
    const u = users.find((x) => x.id === filters.reporterId)
    chips.push({
      key: 'reporterId',
      label: `Reporter: ${u?.name ?? filters.reporterId}`,
      clear: () => onChange('reporterId', null),
    })
  }

  // Sprint
  if (filters.sprint)
    chips.push({
      key: 'sprint',
      label: `Sprint: ${filters.sprint}`,
      clear: () => onChange('sprint', null),
    })

  // Due date
  if (filters.dueDateFrom || filters.dueDateTo)
    chips.push({
      key: 'due',
      label: `Due: ${filters.dueDateFrom ?? '…'} → ${filters.dueDateTo ?? '…'}`,
      clear: () => { onChange('dueDateFrom', null); onChange('dueDateTo', null) },
    })

  // Labels
  ;(filters.labels || []).forEach((l) =>
    chips.push({
      key: `label-${l}`,
      label: `#${l}`,
      clear: () => onChange('labels', filters.labels.filter((x) => x !== l)),
    }),
  )

  // Custom fields
  Object.entries(filters.customFields || {}).forEach(([k, v]) =>
    chips.push({
      key: `cf-${k}`,
      label: `${k}=${v}`,
      clear: () => {
        const next = { ...filters.customFields }
        delete next[k]
        onChange('customFields', next)
      },
    }),
  )

  if (chips.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/25"
        >
          {c.label}
          <button
            onClick={c.clear}
            className="text-accent/60 hover:text-accent transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-[11px] text-text-muted hover:text-danger transition-colors ml-1"
      >
        Clear all
      </button>
    </div>
  )
}

// ─── Column sort header ───────────────────────────────────────────────────────
function SortHeader({ field, label, filters, onChange }) {
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

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, totalElements, size, onChange }) {
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  // Defer filters so search/typing doesn't fire immediately on each keystroke
  const deferredFilters = useDeferredValue(filters)

  const { data, isLoading, isError, error, refetch, isFetching } =
    useSearchTasks(deferredFilters)

  const { data: projects = [] } = useProjects()
  const { data: users = [] } = useMembers()

  const tasks        = data?.tasks        ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages   = data?.totalPages   ?? 1

  // ── Filter state helpers ──
  const set = useCallback((key, val) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
      // reset to page 0 on any filter change except page itself
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }, [])

  const setMany = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 0 }))
  }, [])

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  // Active filter count (excludes search, sort, pagination)
  const activeCount = [
    filters.projectId ? 1 : 0,
    (filters.statuses || []).length,
    (filters.priorities || []).length,
    (filters.types || []).length,
    filters.assigneeId ? 1 : 0,
    filters.reporterId ? 1 : 0,
    filters.sprint ? 1 : 0,
    filters.dueDateFrom || filters.dueDateTo ? 1 : 0,
    (filters.labels || []).length,
    Object.keys(filters.customFields || {}).length,
  ].reduce((a, b) => a + b, 0)

  // ── Derived ──
  const isStale = isFetching && !isLoading // data present but re-fetching

  return (
    <>
      {/* ── Filter drawer ── */}
      <TaskFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={set}
        onReset={reset}
        projects={projects}
        users={users}
      />

      <div className="space-y-5 max-w-[1200px] mx-auto">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
              Tasks
            </h2>
            <p className="text-text-secondary text-[14px] mt-0.5">
              {isLoading
                ? 'Loading…'
                : `${totalElements.toLocaleString()} task${totalElements !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <button className="btn-primary flex-shrink-0">
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            New task
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-2 flex-1 min-w-[220px] max-w-[380px] focus-within:border-border-strong transition-colors">
              <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" strokeWidth={1.75} />
              <input
                value={filters.search}
                onChange={(e) => set('search', e.target.value)}
                placeholder="Search title or description…"
                className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
              />
              {filters.search && (
                <button
                  onClick={() => set('search', '')}
                  className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick status tabs */}
            <div className="flex gap-1 p-0.5 bg-bg-subtle border border-border-subtle rounded-lg flex-shrink-0">
              <button
                onClick={() => set('statuses', [])}
                className={clsx(
                  'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap',
                  filters.statuses.length === 0
                    ? 'bg-bg-surface text-text-primary border border-border-subtle shadow-sm'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                All
              </button>
              {TASK_STATUSES.map((s) => {
                const meta = STATUS_META[s]
                const active =
                  filters.statuses.length === 1 && filters.statuses[0] === s
                return (
                  <button
                    key={s}
                    onClick={() => set('statuses', active ? [] : [s])}
                    className={clsx(
                      'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap',
                      active
                        ? 'bg-bg-surface text-text-primary border border-border-subtle shadow-sm'
                        : 'text-text-muted hover:text-text-secondary',
                    )}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>

            {/* Advanced filter button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={clsx(
                'flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-lg border transition-all duration-150 flex-shrink-0',
                activeCount > 0
                  ? 'border-accent/60 bg-accent/10 text-accent'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary',
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeCount > 0 && (
                <span className="bg-accent text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-semibold">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Stale indicator */}
            {isStale && (
              <span className="text-[11px] text-text-muted animate-pulse flex-shrink-0">
                Updating…
              </span>
            )}
          </div>

          {/* Active filter chips */}
          <ActiveChips
            filters={filters}
            users={users}
            projects={projects}
            onChange={set}
            onClearAll={reset}
          />
        </div>

        {/* ── States ── */}
        {isLoading && <LiveLoading label="Searching tasks…" />}
        {isError   && <LiveError error={error} onRetry={refetch} />}
        {!isLoading && !isError && totalElements === 0 && (
          <LiveEmpty label="No tasks match your filters." />
        )}

        {/* ── Table ── */}
        {!isLoading && !isError && totalElements > 0 && (
          <div
            className={clsx(
              'card overflow-hidden transition-opacity duration-200',
              isStale && 'opacity-70',
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-subtle/50">
                    {/* Task / title */}
                    <th className="text-left px-4 py-3">
                      <SortHeader field="title" label="Task" filters={filters} onChange={set} />
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left px-4 py-3">
                      <SortHeader field="priority" label="Priority" filters={filters} onChange={set} />
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Assignee
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Sprint
                    </th>
                    <th className="text-left px-4 py-3">
                      <SortHeader field="dueDate" label="Due" filters={filters} onChange={set} />
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      Est.
                    </th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const status   = STATUS_META[task.status]   || { label: task.status,   color: 'bg-bg-hover text-text-secondary' }
                    const prio     = PRIORITY_META[task.priority] || { label: task.priority, dot: 'bg-border-strong' }
                    const type     = TYPE_META[task.type]        || { label: task.type,     cls: 'bg-bg-subtle text-text-muted border-border' }
                    const overdue  = isOverdue(task)

                    return (
                      <tr
                        key={task.id}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="border-b border-border-subtle last:border-0 hover:bg-bg-hover/40 transition-colors cursor-pointer group"
                      >
                        {/* Task title + labels */}
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
                                        set('labels', already
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

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              'text-[11px] px-2 py-0.5 rounded-full font-medium border',
                              type.cls,
                            )}
                          >
                            {type.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              'inline-flex items-center text-[11px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap',
                              status.color,
                            )}
                          >
                            {status.label}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={clsx('dot flex-shrink-0', prio.dot)} />
                            <span className={clsx('text-[12px]', prio.color ?? 'text-text-secondary')}>
                              {prio.label}
                            </span>
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="px-4 py-3">
                          <button
                            title={task.assigneeFull}
                            onClick={(e) => {
                              e.stopPropagation()
                              // clicking assignee quick-filters by them
                              const found = users.find((u) => u.name === task.assigneeFull)
                              if (found) set('assigneeId', filters.assigneeId === found.id ? null : found.id)
                            }}
                            className={clsx(
                              'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 transition-all',
                              filters.assigneeId && users.find((u) => u.name === task.assigneeFull && u.id === filters.assigneeId)
                                ? 'border-accent text-accent bg-accent/10'
                                : 'border-border-subtle text-text-primary bg-bg-subtle hover:border-accent/50',
                            )}
                          >
                            {task.assignee}
                          </button>
                        </td>

                        {/* Sprint */}
                        <td className="px-4 py-3">
                          {task.sprint !== '—' ? (
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                set('sprint', filters.sprint === task.sprint ? null : task.sprint)
                              }}
                              className={clsx(
                                'text-[11px] px-2 py-0.5 rounded-full border cursor-pointer transition-colors whitespace-nowrap',
                                filters.sprint === task.sprint
                                  ? 'bg-accent/10 text-accent border-accent/30'
                                  : 'bg-bg-subtle text-text-muted border-border-subtle hover:border-accent/30',
                              )}
                            >
                              {task.sprint}
                            </span>
                          ) : (
                            <span className="text-[12px] text-text-muted">—</span>
                          )}
                        </td>

                        {/* Due date */}
                        <td
                          className={clsx(
                            'px-4 py-3 text-[12px] tabular-nums whitespace-nowrap',
                            overdue ? 'text-danger font-semibold' : 'text-text-muted',
                          )}
                        >
                          {overdue && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger mr-1.5 align-middle" />
                          )}
                          {formatDate(task.due)}
                        </td>

                        {/* Estimate */}
                        <td className="px-4 py-3 text-[12px] text-text-muted tabular-nums">
                          {task.estimate}
                        </td>

                        {/* Actions */}
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

            {/* Pagination */}
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              totalElements={totalElements}
              size={filters.size}
              onChange={set}
            />
          </div>
        )}
      </div>
    </>
  )
}
