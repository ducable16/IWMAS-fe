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
import { useEffect, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import clsx from 'clsx'

// ─── Enum options (mirror API enums) ─────────────────────────────────────────

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
export const TASK_TYPES = ['FEATURE', 'BUG', 'IMPROVEMENT', 'RESEARCH', 'TASK']
export const SORT_FIELDS = [
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
  { value: 'dueDate',   label: 'Due Date'   },
  { value: 'priority',  label: 'Priority'   },
  { value: 'title',     label: 'Title'      },
]

export const STATUS_META = {
  TODO:        { label: 'To Do',       color: 'bg-bg-hover text-text-secondary'          },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-accent/15 text-accent'                 },
  IN_REVIEW:   { label: 'In Review',   color: 'bg-info-subtle text-info'                 },
  DONE:        { label: 'Done',        color: 'bg-success-subtle text-success'            },
  CANCELLED:   { label: 'Cancelled',   color: 'bg-danger-subtle text-danger'              },
}

export const PRIORITY_META = {
  LOW:      { label: 'Low',      dot: 'bg-border-strong', color: 'text-text-secondary' },
  MEDIUM:   { label: 'Medium',   dot: 'bg-warning',       color: 'text-warning'        },
  HIGH:     { label: 'High',     dot: 'bg-danger',        color: 'text-danger'         },
  CRITICAL: { label: 'Critical', dot: 'bg-danger',        color: 'text-danger font-semibold' },
}

export const TYPE_META = {
  FEATURE:     { label: 'Feature',     cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' },
  BUG:         { label: 'Bug',         cls: 'bg-rose-500/15 text-rose-400 border-rose-500/25'       },
  IMPROVEMENT: { label: 'Improvement', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25'   },
  RESEARCH:    { label: 'Research',    cls: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  TASK:        { label: 'Task',        cls: 'bg-sky-500/15 text-sky-400 border-sky-500/25'          },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">
      {children}
    </p>
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
          ? clsx('border-transparent shadow-sm', colorCls || 'bg-accent text-white')
          : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary',
      )}
    >
      {children}
    </button>
  )
}

/** User avatar chip for assignee / reporter */
function UserChip({ user, active, onClick }) {
  const initials = (user.name || '?').substring(0, 2).toUpperCase()
  return (
    <button
      onClick={onClick}
      title={user.name}
      className={clsx(
        'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150 w-[64px]',
        active
          ? 'border-accent bg-accent/10'
          : 'border-border bg-bg-surface hover:border-border-strong',
      )}
    >
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 transition-colors',
          active ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted bg-bg-subtle',
        )}
      >
        {initials}
      </div>
      <span
        className={clsx(
          'text-[10px] text-center leading-tight max-w-full truncate w-full',
          active ? 'text-accent font-medium' : 'text-text-muted',
        )}
      >
        {user.name.split(' ').pop()}
      </span>
    </button>
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
    filters.sprint ? 1 : 0,
    filters.dueDateFrom || filters.dueDateTo ? 1 : 0,
    Object.keys(filters.customFields || {}).length,
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
          'flex flex-col shadow-2xl transition-transform duration-300 ease-out outline-none',
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
            <select
              value={filters.projectId ?? ''}
              onChange={(e) => onChange('projectId', e.target.value ? Number(e.target.value) : null)}
              className="input-sm w-full"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
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
                    <span className={clsx('w-1.5 h-1.5 rounded-full', meta.dot)} />
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
              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <UserChip
                    key={u.id}
                    user={u}
                    active={filters.assigneeId === u.id}
                    onClick={() => setUser('assigneeId', u.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Reporter */}
          <div>
            <SectionLabel>Reporter / Creator</SectionLabel>
            {users.length === 0 ? (
              <p className="text-[12px] text-text-muted italic">No users available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <UserChip
                    key={u.id}
                    user={u}
                    active={filters.reporterId === u.id}
                    onClick={() => setUser('reporterId', u.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Sprint */}
          <div>
            <SectionLabel>Sprint</SectionLabel>
            <input
              type="text"
              value={filters.sprint || ''}
              onChange={(e) => onChange('sprint', e.target.value || null)}
              placeholder="e.g. Sprint 3  (exact match)"
              className="input-sm w-full"
            />
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
                  className="input-sm w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1">To</label>
                <input
                  type="date"
                  value={filters.dueDateTo || ''}
                  onChange={(e) => onChange('dueDateTo', e.target.value || null)}
                  className="input-sm w-full"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Labels */}
          <div>
            <SectionLabel>Labels</SectionLabel>
            <LabelInput
              value={filters.labels || []}
              onChange={(v) => onChange('labels', v)}
            />
          </div>

          <Divider />

          {/* Custom fields */}
          <div>
            <SectionLabel>Custom Fields</SectionLabel>
            <CustomFieldsEditor
              value={filters.customFields || {}}
              onChange={(v) => onChange('customFields', v)}
            />
          </div>

          <Divider />

          {/* Sort */}
          <div>
            <SectionLabel>Sort</SectionLabel>
            <div className="flex gap-2">
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => onChange('sortBy', e.target.value)}
                className="input-sm flex-1"
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

// ─── Label input (comma / enter to add) ──────────────────────────────────────

function LabelInput({ value, onChange }) {
  const inputRef = useRef(null)

  const addLabel = (raw) => {
    const label = raw.trim().toLowerCase()
    if (!label || value.includes(label)) return
    onChange([...value, label])
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeLabel = (l) => onChange(value.filter((v) => v !== l))

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-1.5 min-h-[36px] bg-bg-surface border border-border rounded-lg px-2 py-1.5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((l) => (
          <span
            key={l}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-bg-subtle border border-border-subtle text-text-secondary"
          >
            {l}
            <button
              onClick={(e) => { e.stopPropagation(); removeLabel(l) }}
              className="text-text-muted hover:text-danger transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          placeholder={value.length === 0 ? 'Type label + Enter…' : ''}
          className="bg-transparent text-[12px] text-text-primary placeholder-text-muted focus:outline-none min-w-[120px] flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addLabel(e.currentTarget.value)
            } else if (e.key === 'Backspace' && !e.currentTarget.value && value.length > 0) {
              removeLabel(value[value.length - 1])
            }
          }}
          onBlur={(e) => addLabel(e.currentTarget.value)}
        />
      </div>
      <p className="text-[10px] text-text-muted">Press Enter or comma to add a label</p>
    </div>
  )
}

// ─── Custom fields key=value editor ──────────────────────────────────────────

function CustomFieldsEditor({ value, onChange }) {
  const entries = Object.entries(value)

  const updateKey = (oldKey, newKey) => {
    const next = {}
    for (const [k, v] of Object.entries(value)) {
      next[k === oldKey ? newKey : k] = v
    }
    onChange(next)
  }

  const updateVal = (key, newVal) => onChange({ ...value, [key]: newVal })

  const remove = (key) => {
    const next = { ...value }
    delete next[key]
    onChange(next)
  }

  const add = () => {
    let i = 1
    let key = `field${i}`
    while (value[key] !== undefined) key = `field${++i}`
    onChange({ ...value, [key]: '' })
  }

  return (
    <div className="space-y-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2 items-center">
          <input
            value={k}
            onChange={(e) => updateKey(k, e.target.value)}
            placeholder="key"
            className="input-sm flex-1 min-w-0"
          />
          <span className="text-text-muted text-[12px]">=</span>
          <input
            value={v}
            onChange={(e) => updateVal(k, e.target.value)}
            placeholder="value"
            className="input-sm flex-1 min-w-0"
          />
          <button
            onClick={() => remove(k)}
            className="flex-shrink-0 text-text-muted hover:text-danger transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="text-[12px] text-accent hover:text-accent-hover transition-colors font-medium"
      >
        + Add custom field
      </button>
    </div>
  )
}
