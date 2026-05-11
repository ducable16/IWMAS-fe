/**
 * TaskFilterDrawer — Slide-in panel with all filter controls matching
 * the backend GET /api/tasks endpoint parameters exactly.
 *
 * Props:
 *   open        boolean       – whether the drawer is visible
 *   onClose     () => void    – close handler
 *   filters     object        – current filter state
 *   onChange    (key, val) => void – single-field update
 *   onReset     () => void    – reset all filters
 *   projects    []            – [{id, name}] list for project dropdown
 *   users       []            – [{id, name}] list for assignee/reporter dropdowns
 */
import { useEffect, useRef, useState } from 'react'
import { X, RotateCcw, Search } from 'lucide-react'
import clsx from 'clsx'
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
  TASK_STATUS_META as STATUS_META,
  TASK_PRIORITY_META as PRIORITY_META,
  TASK_TYPE_META as TYPE_META,
} from '@/constants/enums'

// Re-export so callers (TasksPage, etc.) can keep their existing imports.
export { TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES, STATUS_META, PRIORITY_META, TYPE_META }

export const SORT_FIELDS = [
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
  { value: 'dueDate',   label: 'Due Date'   },
  { value: 'startDate', label: 'Start Date' },
  { value: 'priority',  label: 'Priority'   },
  { value: 'title',     label: 'Title'      },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
      {children}
    </label>
  )
}

/** Toggle chip for multi-select */
function ToggleChip({ active, onClick, children, colorCls = '' }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-lg border transition-all duration-150 font-medium',
        active
          ? clsx('border-transparent', colorCls || 'bg-accent text-white')
          : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary',
      )}
    >
      {children}
    </button>
  )
}

/**
 * Searchable single-select for a user.
 * Shows an input that filters the user list; selecting a user shows a chip.
 */
function UserSearchSelect({ filterKey, selectedId, users, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const selected = users.find((u) => u.id === selectedId) || null
  const selectedName = selected ? (selected.fullName || selected.name || '?') : null

  const filtered = users.filter((u) => {
    const name = (u.fullName || u.name || '').toLowerCase()
    return name.includes(query.toLowerCase())
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (user) => {
    // Toggle off if same user clicked
    onChange(filterKey, selectedId === user.id ? null : user.id)
    setQuery('')
    setOpen(false)
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange(filterKey, null)
    setQuery('')
  }

  const initials = (name) => name.substring(0, 2).toUpperCase()

  return (
    <div ref={wrapRef} className="relative">
      {/* Selected chip or search input */}
      {selectedName && !open ? (
        <div
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-accent bg-accent/10 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent text-accent text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
            {initials(selectedName)}
          </div>
          <span className="text-[12px] text-accent font-medium flex-1 truncate">{selectedName}</span>
          <button
            onClick={clear}
            className="text-accent/60 hover:text-danger transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              autoFocus={open}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder="Search by name…"
              className="input-field w-full pl-7 text-[12.5px]"
            />
        </div>
      )}

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-bg-surface border border-border rounded-xl overflow-hidden">
          {/* Search input inside dropdown when a chip is shown (i.e. user clicked chip to reopen) */}
          {selectedName && (
            <div className="p-2 border-b border-border-subtle relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name…"
                className="input-field w-full pl-7 text-[12.5px]"
              />
            </div>
          )}
          <ul className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-text-muted italic">No users found</li>
            ) : (
              filtered.map((u) => {
                const name = u.fullName || u.name || '?'
                const active = selectedId === u.id
                return (
                  <li
                    key={u.id}
                    onClick={() => select(u)}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-[12px]',
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-bg-hover text-text-primary',
                    )}
                  >
                    <div
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0',
                        active ? 'bg-accent/20 text-accent border border-accent' : 'bg-bg-subtle text-text-muted border border-border',
                      )}
                    >
                      {initials(name)}
                    </div>
                    <span className="truncate flex-1">{name}</span>
                    {active && <span className="text-[10px] text-accent font-medium">Selected</span>}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Searchable single-select for a project.
 */
function ProjectSearchSelect({ filterKey, selectedId, projects, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const selected = projects.find((p) => p.id === selectedId) || null
  const selectedName = selected ? selected.name : null

  const filtered = projects.filter((p) => {
    const name = (p.name || '').toLowerCase()
    return name.includes(query.toLowerCase())
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (project) => {
    // Toggle off if same project clicked
    onChange(filterKey, selectedId === project.id ? null : project.id)
    setQuery('')
    setOpen(false)
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange(filterKey, null)
    setQuery('')
  }

  const initials = (name) => name.substring(0, 2).toUpperCase()

  return (
    <div ref={wrapRef} className="relative">
      {/* Selected chip or search input */}
      {selectedName && !open ? (
        <div
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-accent bg-accent/10 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent text-accent text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
            {initials(selectedName)}
          </div>
          <span className="text-[12px] text-accent font-medium flex-1 truncate">{selectedName}</span>
          <button
            onClick={clear}
            className="text-accent/60 hover:text-danger transition-colors flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              autoFocus={open}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder="Search project by name…"
              className="input-field w-full pl-7 text-[12.5px]"
            />
        </div>
      )}

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          {/* Search input inside dropdown when a chip is shown (i.e. user clicked chip to reopen) */}
          {selectedName && (
            <div className="p-2 border-b border-border-subtle relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search project by name…"
                className="input-field w-full pl-7 text-[12.5px]"
              />
            </div>
          )}
          <ul className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-text-muted italic">No projects found</li>
            ) : (
              filtered.map((p) => {
                const name = p.name || '?'
                const active = selectedId === p.id
                return (
                  <li
                    key={p.id}
                    onClick={() => select(p)}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-[12px]',
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-bg-hover text-text-primary',
                    )}
                  >
                    <div
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0',
                        active ? 'bg-accent/20 text-accent border border-accent' : 'bg-bg-subtle text-text-muted border border-border',
                      )}
                    >
                      {initials(name)}
                    </div>
                    <span className="truncate flex-1">{name}</span>
                    {active && <span className="text-[10px] text-accent font-medium">Selected</span>}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

/** Divider */
function Divider() {
  return <hr className="border-border-subtle" />
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

export default function TaskFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  projects = [],
  users = [],
}) {
  const drawerRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Trap focus
  useEffect(() => {
    if (open) drawerRef.current?.focus()
  }, [open])

  const toggle = (key, val) => {
    const arr = filters[key] || []
    onChange(key, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const setUser = (key, id) => onChange(key, filters[key] === id ? null : id)

  // Count active filters (excluding search, sort, page, size)
  const activeCount = [
    filters.projectId ? 1 : 0,
    (filters.statuses || []).length,
    (filters.priorities || []).length,
    (filters.types || []).length,
    filters.assigneeId ? 1 : 0,
    filters.reporterId ? 1 : 0,
    filters.dueDateFrom || filters.dueDateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={clsx(
          'fixed top-0 right-0 h-full w-[380px] max-w-[95vw] bg-bg-surface border-l border-border z-40',
          'flex flex-col transition-transform duration-300 ease-out outline-none',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px] text-text-primary">Filters</span>
            {activeCount > 0 && (
              <span className="bg-accent text-white text-[11px] font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-[12px] text-text-muted hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-danger/5"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Project */}
          <div>
            <SectionLabel>Project</SectionLabel>
            {projects.length === 0 ? (
              <p className="text-[12px] text-text-muted italic">No projects available</p>
            ) : (
              <ProjectSearchSelect
                filterKey="projectId"
                selectedId={filters.projectId ?? null}
                projects={projects}
                onChange={onChange}
              />
            )}
          </div>

          <Divider />

          {/* Status */}
          <div>
            <SectionLabel>Status</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {TASK_STATUSES.map((s) => {
                const meta = STATUS_META[s]
                const active = (filters.statuses || []).includes(s)
                return (
                  <ToggleChip
                    key={s}
                    active={active}
                    onClick={() => toggle('statuses', s)}
                    colorCls={active ? meta.color : ''}
                  >
                    {meta.label}
                  </ToggleChip>
                )
              })}
            </div>
          </div>

          <Divider />

          {/* Priority */}
          <div>
            <SectionLabel>Priority</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {TASK_PRIORITIES.map((p) => {
                const meta = PRIORITY_META[p]
                const active = (filters.priorities || []).includes(p)
                return (
                  <ToggleChip
                    key={p}
                    active={active}
                    onClick={() => toggle('priorities', p)}
                    colorCls={active ? `bg-bg-hover ${meta.color}` : ''}
                  >
                    {meta.label}
                  </ToggleChip>
                )
              })}
            </div>
          </div>

          <Divider />

          {/* Type */}
          <div>
            <SectionLabel>Type</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {TASK_TYPES.map((t) => {
                const meta = TYPE_META[t]
                const active = (filters.types || []).includes(t)
                return (
                  <ToggleChip
                    key={t}
                    active={active}
                    onClick={() => toggle('types', t)}
                    colorCls={active ? meta.cls : ''}
                  >
                    {meta.label}
                  </ToggleChip>
                )
              })}
            </div>
          </div>

          <Divider />

          {/* Assignee */}
          <div>
            <SectionLabel>Assignee</SectionLabel>
            {users.length === 0 ? (
              <p className="text-[12px] text-text-muted italic">No users available</p>
            ) : (
              <UserSearchSelect
                filterKey="assigneeId"
                selectedId={filters.assigneeId ?? null}
                users={users}
                onChange={onChange}
              />
            )}
          </div>

          <Divider />

          {/* Reporter */}
          <div>
            <SectionLabel>Reporter</SectionLabel>
            {users.length === 0 ? (
              <p className="text-[12px] text-text-muted italic">No users available</p>
            ) : (
              <UserSearchSelect
                filterKey="reporterId"
                selectedId={filters.reporterId ?? null}
                users={users}
                onChange={onChange}
              />
            )}
          </div>

          <Divider />

          {/* Due date range */}
          <div>
            <SectionLabel>Due Date Range</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1">From</label>
                <input
                  type="date"
                  value={filters.dueDateFrom || ''}
                  onChange={(e) => onChange('dueDateFrom', e.target.value || null)}
                  className="input-field w-full text-[12.5px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">To</label>
                <input
                  type="date"
                  value={filters.dueDateTo || ''}
                  onChange={(e) => onChange('dueDateTo', e.target.value || null)}
                  className="input-field w-full text-[12.5px]"
                />
              </div>
            </div>
          </div>

          {/* Sort */}
          <div>
            <SectionLabel>Sort</SectionLabel>
            <div className="flex gap-2">
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => onChange('sortBy', e.target.value)}
                className="input-select flex-1 text-[12.5px]"
              >
                {SORT_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <div className="flex rounded-lg border border-border overflow-hidden text-[12px]">
                {['DESC', 'ASC'].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => onChange('sortDirection', dir)}
                    className={clsx(
                      'px-3 py-1.5 font-medium transition-colors',
                      filters.sortDirection === dir
                        ? 'bg-accent text-white'
                        : 'bg-bg-surface text-text-secondary hover:bg-bg-hover',
                    )}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Divider />

          {/* Page size */}
          <div>
            <SectionLabel>Rows per page</SectionLabel>
            <div className="flex gap-1.5">
              {[10, 20, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange('size', n)}
                  className={clsx(
                    'flex-1 py-1.5 text-[12px] font-medium rounded-lg border transition-colors',
                    filters.size === n
                      ? 'bg-accent text-white border-accent'
                      : 'bg-bg-surface text-text-secondary border-border hover:border-border-strong',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-border-subtle flex items-center justify-between bg-bg-subtle/50">
          <button onClick={onReset} className="btn-secondary text-[13px] py-1.5 px-3">
            Reset
          </button>
          <button onClick={onClose} className="btn-primary text-[13px] py-1.5 px-4">
            Apply filters
          </button>
        </div>
      </div>
    </>
  )
}

