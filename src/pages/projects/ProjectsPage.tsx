import { useState, useCallback, useDeferredValue } from 'react'
import {
  Plus, ChevronDown,
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
import { fmtDate } from '@/utils/date'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import SortableHeader from '@/components/ui/SortableHeader'
import SearchInput from '@/components/ui/SearchInput'
import type { Project } from '@/types'
import type { ProjectStatus } from '@/constants/enums'

/* ── Constants ─────────────────────────────────────────────── */

const SORT_FIELDS = {
  name:      'name',
  status:    'status',
  startDate: 'startDate',
  endDate:   'endDate',
  createdAt: 'createdAt',
} as const

type SortField = keyof typeof SORT_FIELDS
type SortDirection = 'ASC' | 'DESC'

type ProjectFilterParams = {
  search: string
  statuses: ProjectStatus[]
  sortBy: typeof SORT_FIELDS[SortField]
  sortDirection: SortDirection
  page: number
  size: number
}

const DEFAULT_PARAMS: ProjectFilterParams = {
  search:        '',
  statuses:      [],
  sortBy:        'createdAt',
  sortDirection: 'DESC',
  page:          0,
  size:          20,
}

/* ── Helpers ───────────────────────────────────────────────── */


/* ── Sortable Column Header ────────────────────────────────── */

/* ── Main Page ─────────────────────────────────────────────── */

export default function ProjectsPage() {
  const navigate = useNavigate()
  const can = useCan()
  const canEdit = can.createProject
  const user = useAuthStore((s) => s.user)
  const isTeamMember = user?.role === 'TEAM_MEMBER'

  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

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
  const set = useCallback(<K extends keyof ProjectFilterParams>(key: K, val: ProjectFilterParams[K]) => {
    setParams((prev) => ({
      ...prev,
      [key]: val,
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }, [])

  const reset = useCallback(() => setParams(DEFAULT_PARAMS), [])

  const toggle = useCallback((key: 'statuses', val: ProjectStatus) => {
    setParams((prev) => {
      const arr = prev[key] || []
      const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
      return { ...prev, [key]: next, page: 0 }
    })
  }, [])

  const handleSort = useCallback((field: SortField) => {
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
        <SearchInput
          value={params.search}
          onChange={(value) => set('search', value)}
          placeholder="Search by name or code..."
        />

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
            ALL
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
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3 pl-5 w-[100px]">Code</th>
                  <SortableHeader label="Project" active={params.sortBy === SORT_FIELDS.name} direction={params.sortDirection} onClick={() => handleSort('name')} />
                  <SortableHeader label="Status" active={params.sortBy === SORT_FIELDS.status} direction={params.sortDirection} onClick={() => handleSort('status')} />
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Manager</th>
                  <SortableHeader label="Start" active={params.sortBy === SORT_FIELDS.startDate} direction={params.sortDirection} onClick={() => handleSort('startDate')} />
                  <SortableHeader label="End" active={params.sortBy === SORT_FIELDS.endDate} direction={params.sortDirection} onClick={() => handleSort('endDate')} />
                  <SortableHeader label="Created" active={params.sortBy === SORT_FIELDS.createdAt} direction={params.sortDirection} onClick={() => handleSort('createdAt')} />
                  <th className="py-2.5 px-3 w-10"><span className="sr-only">Open</span></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {projects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="cursor-pointer transition-colors hover:bg-bg-subtle/70 group"
                      id={`project-row-${project.id}`}
                    >
                      {/* Code — unique identifier column */}
                      <td className="py-3 px-3 pl-5">
                        <span className="text-[12.5px] font-mono text-black tabular-nums">
                          {project.code || '—'}
                        </span>
                      </td>

                      {/* Project name */}
                      <td className="py-3 px-3">
                        <p className="text-[13px] font-medium text-text-primary truncate max-w-[240px] group-hover:text-accent transition-colors">
                          {project.name}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <ProjectStatusBadge status={String(project.status || 'PLANNING')} />
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
                          {fmtDate(project.startDate)}
                        </span>
                      </td>

                      {/* End date */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {fmtDate(project.endDate)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {fmtDate(project.createdAt)}
                        </span>
                      </td>

                      {/* Chevron */}
                      <td className="py-3 px-3 text-right">
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted -rotate-90 inline-block" strokeWidth={1.75} />
                      </td>
                    </tr>
                ))}
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
