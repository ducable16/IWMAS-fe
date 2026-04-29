import { useState } from 'react'
import {
  Plus, MoreHorizontal, Calendar, Users,
  FolderKanban, Search, ChevronDown, Pencil, Trash2,
} from 'lucide-react'
import clsx from 'clsx'
import { useProjects, useCreateProject, useDeleteProject } from '@/features/projects/hooks/useProjects'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import ProjectFormModal from '@/features/projects/components/ProjectFormModal'

/* ── Status metadata — matches backend enum exactly §3.1 ───── */

const STATUS_META = {
  PLANNING:    { label: 'Planning',    badge: 'badge-info',    bar: 'bg-info',    dot: 'bg-info' },
  IN_PROGRESS: { label: 'In Progress', badge: 'badge-accent',  bar: 'bg-accent',  dot: 'bg-accent' },
  ON_HOLD:     { label: 'On Hold',     badge: 'badge-warning', bar: 'bg-warning', dot: 'bg-warning' },
  COMPLETED:   { label: 'Completed',   badge: 'badge-success', bar: 'bg-success', dot: 'bg-success' },
  CANCELLED:   { label: 'Cancelled',   badge: 'badge-danger',  bar: 'bg-danger',  dot: 'bg-danger' },
}

const PRIORITY_BADGE = {
  LOW:      'badge-neutral',
  MEDIUM:   'badge-info',
  HIGH:     'badge-warning',
  CRITICAL: 'badge-danger',
}

const STATUS_OPTIONS = [
  { value: '',            label: 'All statuses' },
  { value: 'PLANNING',    label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD',     label: 'On Hold' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'CANCELLED',   label: 'Cancelled' },
]

/* ── Helpers ────────────────────────────────────────────────── */

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

/** Compute a rough progress % from status since API doesn't return one */
function progressFromStatus(status) {
  return { PLANNING: 5, IN_PROGRESS: 50, ON_HOLD: 40, COMPLETED: 100, CANCELLED: 0 }[status] ?? 0
}

/* ── Project Card ───────────────────────────────────────────── */

function ProjectCard({ project, canEdit, onEdit, onDelete }) {
  const meta = STATUS_META[project.status] || STATUS_META.PLANNING
  const progress = progressFromStatus(project.status)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="card p-5 hover:border-border transition-all duration-200 cursor-pointer relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[12px] font-bold text-accent shrink-0">
            {project.code?.[0] || project.name?.[0] || '?'}
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-text-primary truncate">{project.name}</h3>
            {project.code && (
              <span className="text-[11px] text-text-muted font-mono">{project.code}</span>
            )}
          </div>
        </div>

        {/* Actions menu */}
        {canEdit && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
              className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 rounded opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-20 w-36 bg-bg-surface border border-border rounded-xl shadow-lg py-1"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-danger hover:bg-danger/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={clsx('badge', meta.badge)}>
          <span className={clsx('dot', meta.dot)} />
          {meta.label}
        </span>
        {project.priority && (
          <span className={clsx('badge', PRIORITY_BADGE[project.priority] || 'badge-neutral')}>
            {project.priority}
          </span>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-[12.5px] text-text-muted mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[11.5px] mb-1.5">
          <span className="text-text-muted">Progress</span>
          <span className="text-text-secondary tabular-nums">{progress}%</span>
        </div>
        <div className="h-1 bg-bg-subtle rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-700', meta.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-3 text-[11.5px] text-text-muted">
          {/* Manager ID badge */}
          {project.managerId && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" strokeWidth={1.75} />
              PM #{project.managerId}
            </span>
          )}
          {/* End date from §3.1: endDate field */}
          {project.endDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" strokeWidth={1.75} />
              {formatDate(project.endDate)}
            </span>
          )}
        </div>
        {/* Created date */}
        {project.createdAt && (
          <span className="text-[11px] text-text-muted">
            {formatDate(project.createdAt)}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */

export default function ProjectsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER'

  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const { data: projects, isLoading, isError, error, refetch } = useProjects(
    statusFilter ? { status: statusFilter } : {},
  )
  const { mutate: deleteProject } = useDeleteProject()

  const list = projects || []

  // Client-side search (name/code/description)
  const filtered = search
    ? list.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.code?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : list

  // Stats
  const inProgressCount = list.filter((p) => p.status === 'IN_PROGRESS').length
  const completedCount  = list.filter((p) => p.status === 'COMPLETED').length

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormOpen(true)
  }

  const handleDelete = (project) => {
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return
    deleteProject(project.id)
  }

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
            Projects
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">
            {isLoading
              ? 'Loading…'
              : `${inProgressCount} in progress · ${completedCount} completed · ${list.length} total`}
          </p>
        </div>
        {canEdit && (
          <button
            className="btn-primary"
            onClick={() => { setEditingProject(null); setFormOpen(true) }}
            id="new-project-btn"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            New project
          </button>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-[320px] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all">
          <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code…"
            className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
          />
        </div>

        {/* Status filter — maps to backend ?status= param */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 text-[12.5px] text-text-primary hover:border-border-strong focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" strokeWidth={1.75} />
        </div>

        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('') }}
            className="text-[11.5px] text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── States ── */}
      {isLoading && <LiveLoading label="Loading projects…" />}
      {isError   && <LiveError error={error} onRetry={refetch} />}

      {!isLoading && !isError && list.length === 0 && (
        <LiveEmpty label="No projects yet. Create your first project." />
      )}

      {!isLoading && !isError && list.length > 0 && filtered.length === 0 && (
        <LiveEmpty label="No projects match your search." />
      )}

      {/* ── Grid ── */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canEdit={canEdit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <ProjectFormModal
        open={formOpen}
        project={editingProject}
        onClose={() => setFormOpen(false)}
      />
    </div>
  )
}
