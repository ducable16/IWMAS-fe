import { useState, useCallback, useDeferredValue } from 'react'
import {
  Search,
  Plus,
  SlidersHorizontal,
  X,
  LayoutList,
  Columns,
  CalendarDays,
  GanttChart,
} from 'lucide-react'
import clsx from 'clsx'
import { useProjects, useMyProjects } from '@/features/projects/hooks/useProjects'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import TaskFilterDrawer, {
  STATUS_META,
  PRIORITY_META,
  TYPE_META,
  TASK_STATUSES,
} from '@/features/tasks/components/TaskFilterDrawer'
import TaskListView     from '@/features/tasks/components/TaskListView'
import TaskBoardView    from '@/features/tasks/components/TaskBoardView'
import TaskCalendarView from '@/features/tasks/components/TaskCalendarView'
import TaskTimelineView from '@/features/tasks/components/TaskTimelineView'
import TaskCreateModal  from '@/features/tasks/components/TaskCreateModal'
import { useCan } from '@/utils/permissions'

// ─── View mode config ─────────────────────────────────────────────────────────
const VIEW_MODES = [
  { key: 'list',     label: 'List',     Icon: LayoutList  },
  { key: 'board',    label: 'Board',    Icon: Columns     },
  { key: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { key: 'timeline', label: 'Timeline', Icon: GanttChart  },
]

// ─── Default filters ──────────────────────────────────────────────────────────
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

// ─── Active filter chips ──────────────────────────────────────────────────────
function ActiveChips({ filters, users, projects, onChange, onClearAll }) {
  const chips = []

  if (filters.projectId) {
    const proj = projects.find((p) => p.id === filters.projectId)
    chips.push({
      key: 'projectId',
      label: `Project: ${proj?.name ?? filters.projectId}`,
      clear: () => onChange('projectId', null),
    })
  }

  ;(filters.statuses || []).forEach((s) =>
    chips.push({
      key: `status-${s}`,
      label: STATUS_META[s]?.label ?? s,
      clear: () => onChange('statuses', filters.statuses.filter((x) => x !== s)),
    }),
  )

  ;(filters.priorities || []).forEach((p) =>
    chips.push({
      key: `priority-${p}`,
      label: PRIORITY_META[p]?.label ?? p,
      clear: () => onChange('priorities', filters.priorities.filter((x) => x !== p)),
    }),
  )

  ;(filters.types || []).forEach((t) =>
    chips.push({
      key: `type-${t}`,
      label: TYPE_META[t]?.label ?? t,
      clear: () => onChange('types', filters.types.filter((x) => x !== t)),
    }),
  )

  if (filters.assigneeId) {
    const u = users.find((x) => x.id === filters.assigneeId)
    chips.push({
      key: 'assigneeId',
      label: `Assignee: ${(u?.fullName || u?.name) ?? filters.assigneeId}`,
      clear: () => onChange('assigneeId', null),
    })
  }

  if (filters.reporterId) {
    const u = users.find((x) => x.id === filters.reporterId)
    chips.push({
      key: 'reporterId',
      label: `Reporter: ${(u?.fullName || u?.name) ?? filters.reporterId}`,
      clear: () => onChange('reporterId', null),
    })
  }

  if (filters.sprint)
    chips.push({
      key: 'sprint',
      label: `Sprint: ${filters.sprint}`,
      clear: () => onChange('sprint', null),
    })

  if (filters.dueDateFrom || filters.dueDateTo)
    chips.push({
      key: 'due',
      label: `Due: ${filters.dueDateFrom ?? '…'} → ${filters.dueDateTo ?? '…'}`,
      clear: () => { onChange('dueDateFrom', null); onChange('dueDateTo', null) },
    })

  ;(filters.labels || []).forEach((l) =>
    chips.push({
      key: `label-${l}`,
      label: `#${l}`,
      clear: () => onChange('labels', filters.labels.filter((x) => x !== l)),
    }),
  )

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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [filters, setFilters]       = useState(DEFAULT_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewMode, setViewMode]     = useState('list')
  const [createOpen, setCreateOpen] = useState(false)

  const deferredFilters = useDeferredValue(filters)

  // Only fetch for list view; board/calendar/timeline fetch their own data
  const { data, isLoading, isError, error, refetch, isFetching } =
    useSearchTasks(deferredFilters, viewMode === 'list')

  const can = useCan()

  // §4.3 – API restricts task list to accessible projects automatically.
  // For the project-filter dropdown, PM/ADMIN use §3.1; TM uses §3.2 /my.
  const allProjQ = useProjects({}, !can.isTm)
  const myProjQ  = useMyProjects({}, can.isTm)
  const { data: projectsData } = can.isTm ? myProjQ : allProjQ
  const projects = projectsData?.projects ?? []
  const { data: membersData }  = useMembers()
  const users    = membersData?.members ?? []

  const tasks         = data?.tasks         ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages    = data?.totalPages    ?? 1

  const set = useCallback((key, val) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }, [])

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

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

  const isStale = isFetching && !isLoading

  // Subtitle varies by view mode
  const subtitle =
    viewMode === 'list'
      ? isLoading
        ? 'Loading…'
        : `${totalElements.toLocaleString()} task${totalElements !== 1 ? 's' : ''} found`
      : VIEW_MODES.find((m) => m.key === viewMode)?.label + ' view'

  return (
    <>
      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultProjectId={filters.projectId}
      />

      <TaskFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={set}
        onReset={reset}
        projects={projects}
        users={users}
      />

      <div className="space-y-5 max-w-[1400px] mx-auto">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-subhead text-text-primary">Tasks</h2>
            <p className="text-text-secondary text-[14px] mt-0.5">{subtitle}</p>
          </div>
          {/* §4.7 – Only ADMIN/PM can create tasks; hide button for TEAM_MEMBER */}
          {!can.isTm && (
            <button
              className="btn-primary flex-shrink-0"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              New task
            </button>
          )}
        </div>

        {/* ── View mode tabs ── */}
        <div className="flex items-center gap-0.5 p-0.5 bg-bg-subtle border border-border-subtle rounded-lg self-start w-fit">
          {VIEW_MODES.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              title={label}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-all duration-150',
                viewMode === key
                  ? 'bg-bg-surface text-text-primary shadow-sm border border-border-subtle'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Toolbar (search + status tabs + filter) ── */}
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

            {/* Quick status tabs — hidden on calendar view */}
            {viewMode !== 'calendar' && (
              <div className="flex gap-1 p-0.5 bg-bg-subtle border border-border-subtle rounded-lg flex-shrink-0">
                <button
                  onClick={() => set('statuses', [])}
                  className={clsx(
                    'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap',
                    filters.statuses.length === 0
                      ? 'bg-bg-surface text-text-primary border border-border-subtle'
                      : 'text-text-muted hover:text-text-secondary',
                  )}
                >
                  All
                </button>
                {TASK_STATUSES.map((s) => {
                  const meta = STATUS_META[s]
                  const active = filters.statuses.length === 1 && filters.statuses[0] === s
                  return (
                    <button
                      key={s}
                      onClick={() => set('statuses', active ? [] : [s])}
                      className={clsx(
                        'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap',
                        active
                          ? 'bg-bg-surface text-text-primary border border-border-subtle'
                          : 'text-text-muted hover:text-text-secondary',
                      )}
                    >
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Advanced filter */}
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

            {isStale && (
              <span className="text-[11px] text-text-muted animate-pulse flex-shrink-0">
                Updating…
              </span>
            )}
          </div>

          <ActiveChips
            filters={filters}
            users={users}
            projects={projects}
            onChange={set}
            onClearAll={reset}
          />
        </div>

        {/* ── View content ── */}
        {viewMode === 'list' && (
          <TaskListView
            tasks={tasks}
            filters={filters}
            onChange={set}
            totalElements={totalElements}
            totalPages={totalPages}
            isLoading={isLoading}
            isError={isError}
            error={error}
            refetch={refetch}
            isStale={isStale}
          />
        )}

        {viewMode === 'board' && (
          <TaskBoardView filters={deferredFilters} />
        )}

        {viewMode === 'calendar' && (
          <TaskCalendarView filters={deferredFilters} />
        )}

        {viewMode === 'timeline' && (
          <TaskTimelineView filters={deferredFilters} />
        )}
      </div>
    </>
  )
}
