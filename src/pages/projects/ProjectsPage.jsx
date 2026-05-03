import { useState, useCallback, useDeferredValue } from 'react'
import {
  Plus, Search, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useProjects, useMyProjects } from '@/features/projects/hooks/useProjects'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMembers } from '@/features/members/hooks/useMembers'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import ProjectFormModal from '@/features/projects/components/ProjectFormModal'
import {
  PROJECT_STATUSES as ALL_STATUSES,
  PROJECT_STATUS_META as STATUS_META,
} from '@/constants/enums'
import { useCan } from '@/utils/permissions'

/* ── Constants ─────────────────────────────────────────────── */

const SORT_FIELDS = {
  name:      'name',
  status:    'status',

  startDate: 'startDate',
  endDate:   'endDate',
  createdAt: 'createdAt',
}

const DEFAULT_PARAMS = {
  search:        '',
  statuses:      [],

  sortBy:        'createdAt',
  sortDirection: 'DESC',
  page:          0,
  size:          20,
}

/* ── Helpers ───────────────────────────────────────────────── */

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Sortable Column Header ────────────────────────────────── */

function SortHeader({ label, field, params, onSort, className }) {
  const backendField = SORT_FIELDS[field]
  const active = params.sortBy === backendField
  const isDesc = params.sortDirection === 'DESC'
  const icon = active
    ? isDesc
      ? <ArrowDown className="w-3 h-3" strokeWidth={2} />
      : <ArrowUp className="w-3 h-3" strokeWidth={2} />
    : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" strokeWidth={1.75} />

  return (
    <th
      className={clsx(
        'text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3 cursor-pointer select-none group transition-colors hover:text-text-secondary',
        className,
      )}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={clsx('transition-opacity', active ? 'text-accent' : 'text-text-muted')}>
          {icon}
        </span>
      </span>
    </th>
  )
}

/* ── Pagination ─────────────────────────────────────────────── */

function Pagination({ page, totalPages, totalElements, size, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    let start = Math.max(0, page - 3)
    const end = Math.min(totalPages - 1, start + 6)
    start = Math.max(0, end - 6)
    return start + i
  }).filter((p) => p < totalPages)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle bg-bg-subtle/30">
      <span className="text-[12px] text-text-muted">
        Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of{' '}
        {totalElements} {totalElements === 1 ? 'project' : 'projects'}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((pg) => (
          <button
            key={pg}
            onClick={() => onChange(pg)}
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
          onClick={() => onChange(page + 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */

export default function ProjectsPage() {
  const navigate = useNavigate()
  const can = useCan()
  const canEdit = can.createProject
  const user = useAuthStore((s) => s.user)
  const isTeamMember = user?.role === 'TEAM_MEMBER'

  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const deferredParams = useDeferredValue(params)

  // §3.1 for ADMIN/PM (PM gets auto-filtered to their managed projects by backend)
  // §3.2 for TEAM_MEMBER (projects they are an active member of)
  const allQ = useProjects(deferredParams, !isTeamMember)
  const myQ  = useMyProjects(deferredParams,  isTeamMember)
  const { data, isLoading, isError, error, refetch, isFetching } = isTeamMember ? myQ : allQ

  // Fetch all users once for manager name lookup (uses React Query cache)
  const { data: usersData } = useMembers({ size: 100 })
  const allUsers = usersData?.members ?? []

  const projects      = data?.projects      ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages    = data?.totalPages    ?? 1
  const isStale       = isFetching && !isLoading

  /* ── Param helpers ── */
  const set = useCallback((key, val) => {
    setParams((prev) => ({
      ...prev,
      [key]: val,
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }, [])

  const reset = useCallback(() => setParams(DEFAULT_PARAMS), [])

  const toggle = useCallback((key, val) => {
    setParams((prev) => {
      const arr = prev[key] || []
      const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
      return { ...prev, [key]: next, page: 0 }
    })
  }, [])

  const handleSort = useCallback((field) => {
    const backendField = SORT_FIELDS[field]
    setParams((prev) => ({
      ...prev,
      sortBy: backendField,
      sortDirection:
        prev.sortBy === backendField && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      page: 0,
    }))
  }, [])

  const hasFilters =
    params.search ||
    params.statuses.length > 0

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-subhead text-text-primary">
            {isTeamMember ? 'My Projects' : can.isPm ? 'Projects I Manage' : 'Projects'}
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">
            {isLoading
              ? 'Loading…'
              : isTeamMember
              ? `${totalElements.toLocaleString()} project${totalElements !== 1 ? 's' : ''} you\'re a member of`
              : can.isPm
              ? `${totalElements.toLocaleString()} project${totalElements !== 1 ? 's' : ''} you manage`
              : `${totalElements.toLocaleString()} project${totalElements !== 1 ? 's' : ''} in workspace`}
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
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-[320px] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all">
          <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
          <input
            value={params.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search by name or code…"
            className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
          />
        </div>

        {/* Status toggle pills */}
        <div className="flex gap-1 p-0.5 bg-bg-subtle border border-border-subtle rounded-lg flex-shrink-0">
          <button
            onClick={() => set('statuses', [])}
            className={clsx(
              'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium',
              params.statuses.length === 0
                ? 'bg-bg-surface text-text-primary border border-border-subtle'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => {
            const active = params.statuses.includes(s)
            return (
              <button
                key={s}
                onClick={() => toggle('statuses', s)}
                className={clsx(
                  'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap',
                  active
                    ? 'bg-bg-surface text-text-primary border border-border-subtle'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {STATUS_META[s].label}
              </button>
            )
          })}
        </div>

        {hasFilters && (
          <button
            onClick={reset}
            className="text-[11.5px] text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Clear filters
          </button>
        )}

        {isStale && (
          <span className="text-[11px] text-text-muted animate-pulse">Updating…</span>
        )}
      </div>

      {/* ── States ── */}
      {isLoading && <LiveLoading label="Loading projects…" />}
      {isError && <LiveError error={error} onRetry={refetch} />}

      {!isLoading && !isError && totalElements === 0 && !hasFilters && (
        <LiveEmpty label="No projects yet. Create your first project." />
      )}
      {!isLoading && !isError && totalElements === 0 && hasFilters && (
        <LiveEmpty label="No projects match your filters." />
      )}

      {/* ── Table ── */}
      {!isLoading && !isError && totalElements > 0 && (
        <div className={clsx('card overflow-hidden transition-opacity duration-200', isStale && 'opacity-70')}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle/50">
                  <SortHeader label="Project"    field="name"      params={params} onSort={handleSort} className="pl-5" />
                  <SortHeader label="Status"     field="status"    params={params} onSort={handleSort} />

                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Manager</th>
                  <SortHeader label="Start"      field="startDate" params={params} onSort={handleSort} />
                  <SortHeader label="End"        field="endDate"   params={params} onSort={handleSort} />
                  <SortHeader label="Created"    field="createdAt" params={params} onSort={handleSort} />
                  <th className="py-2.5 px-3 w-10"><span className="sr-only">Open</span></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {projects.map((project) => {
                  const statusMeta = STATUS_META[project.status] || STATUS_META.PLANNING

                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="cursor-pointer transition-colors hover:bg-bg-subtle/70 group"
                      id={`project-row-${project.id}`}
                    >
                      {/* Project name + code */}
                      <td className="py-3 px-3 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[11px] font-bold text-accent shrink-0">
                            {project.code?.[0] || project.name?.[0] || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text-primary truncate max-w-[220px] group-hover:text-accent transition-colors">
                              {project.name}
                            </p>
                            {project.code && (
                              <p className="text-[11px] text-text-muted font-mono">{project.code}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={clsx('badge', statusMeta.badge)}>
                          <span className={clsx('dot', statusMeta.dot)} />
                          {statusMeta.label}
                        </span>
                      </td>


                      {/* Manager name */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-secondary">
                          {project.managerId
                            ? (allUsers.find((u) => u.id === project.managerId)?.fullName ?? `#${project.managerId}`)
                            : '—'}
                        </span>
                      </td>

                      {/* Start date */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {formatDate(project.startDate)}
                        </span>
                      </td>

                      {/* End date */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {formatDate(project.endDate)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {formatDate(project.createdAt)}
                        </span>
                      </td>

                      {/* Chevron */}
                      <td className="py-3 px-3 text-right">
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted -rotate-90 inline-block" strokeWidth={1.75} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <Pagination
            page={params.page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={params.size}
            onChange={(pg) => set('page', pg)}
          />
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
