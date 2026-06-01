import { useCallback, useDeferredValue, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useProjects, useMyProjects } from '@/features/projects/hooks/useProjects'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMembers } from '@/features/members/hooks/useMembers'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import ProjectFormModal from '@/features/projects/components/ProjectFormModal'
import { useCan } from '@/utils/permissions'
import { fmtDate } from '@/utils/date'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import SortableHeader from '@/components/ui/SortableHeader'
import ProjectFilterDrawer from './components/ProjectFilterDrawer'
import ProjectsToolbar from './components/ProjectsToolbar'
import ActiveProjectFilters from './components/ActiveProjectFilters'
import {
  DEFAULT_PROJECT_FILTERS,
  getActiveProjectFilterCount,
  hasProjectQueryFilters,
} from './projectsPageConfig'
import type { Project } from '@/types'
import type { ProjectFilterChange, ProjectSortField } from './projectsPageConfig'

const SORT_FIELDS = {
  name: 'name',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
} as const

export default function ProjectsPage() {
  const navigate = useNavigate()
  const can = useCan()
  const canEdit = can.createProject
  const user = useAuthStore((s) => s.user)
  const isTeamMember = user?.role === 'TEAM_MEMBER'

  const [params, setParams] = useState(DEFAULT_PROJECT_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const deferredParams = useDeferredValue(params)

  const allQ = useProjects(deferredParams, !isTeamMember)
  const myQ = useMyProjects(deferredParams, isTeamMember)
  const { data, isLoading, isError, error, refetch, isFetching } = isTeamMember ? myQ : allQ

  const { data: usersData } = useMembers({ size: 100 })
  const allUsers = usersData?.members ?? []

  const projects = data?.projects ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1
  const isStale = isFetching && !isLoading

  const set = useCallback<ProjectFilterChange>((key, val) => {
    setParams((prev) => ({
      ...prev,
      [key]: val,
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }, [])

  const reset = useCallback(() => setParams(DEFAULT_PROJECT_FILTERS), [])

  const handleSort = useCallback((field: ProjectSortField) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection:
        prev.sortBy === field && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      page: 0,
    }))
  }, [])

  const activeCount = getActiveProjectFilterCount(params)
  const hasFilters = hasProjectQueryFilters(params)

  return (
    <>
      <ProjectFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={params}
        onChange={set}
        onReset={reset}
        users={allUsers}
      />

      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h2 className="text-subhead text-text-primary">
              {isTeamMember ? 'My Projects' : can.isPm ? 'Projects I Manage' : 'Projects'}
            </h2>
            <p className="text-text-secondary text-[14px] mt-1">
              {isLoading
                ? 'Loading...'
                : isTeamMember
                ? `${totalElements.toLocaleString()} project${totalElements !== 1 ? 's' : ''} you're a member of`
                : can.isPm
                ? `${totalElements.toLocaleString()} project${totalElements !== 1 ? 's' : ''} you manage`
                : `${totalElements.toLocaleString()} project${totalElements !== 1 ? 's' : ''} in workspace`}
            </p>
          </div>
          {canEdit && (
            <button
              className="btn-primary shrink-0"
              onClick={() => { setEditingProject(null); setFormOpen(true) }}
              id="new-project-btn"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              New project
            </button>
          )}
        </div>

        <div className="space-y-2.5 mb-4">
          <ProjectsToolbar
            filters={params}
            activeCount={activeCount}
            isStale={isStale}
            onChange={set}
            onOpenFilters={() => setDrawerOpen(true)}
          />

          <ActiveProjectFilters
            filters={params}
            users={allUsers}
            onChange={set}
            onClearAll={reset}
          />
        </div>

        {isLoading && <LiveLoading label="Loading projects..." />}
        {isError && <LiveError error={error} onRetry={refetch} />}

        {!isLoading && !isError && totalElements === 0 && !hasFilters && (
          <LiveEmpty label="No projects yet. Create your first project." />
        )}
        {!isLoading && !isError && totalElements === 0 && hasFilters && (
          <LiveEmpty label="No projects match your filters." />
        )}

        {!isLoading && !isError && totalElements > 0 && (
          <div className={clsx('card overflow-hidden transition-opacity duration-200', isStale && 'opacity-70')}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
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
                      <td className="py-3 px-3 pl-5">
                        <span className="text-[12.5px] font-mono text-black tabular-nums">
                          {project.code || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="text-[13px] font-medium text-text-primary truncate max-w-[240px] group-hover:text-accent transition-colors">
                          {project.name}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <ProjectStatusBadge status={String(project.status || 'PLANNING')} />
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-secondary">
                          {project.managerId
                            ? (allUsers.find((u) => u.id === project.managerId)?.fullName ?? `#${project.managerId}`)
                            : '-'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {fmtDate(project.startDate)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {fmtDate(project.endDate)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums whitespace-nowrap">
                          {fmtDate(project.createdAt)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted -rotate-90 inline-block" strokeWidth={1.75} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={params.page}
              totalPages={totalPages}
              totalElements={totalElements}
              size={params.size}
              onChange={(pg) => set('page', pg)}
            />
          </div>
        )}

        <ProjectFormModal
          open={formOpen}
          project={editingProject}
          onClose={() => setFormOpen(false)}
        />
      </div>
    </>
  )
}
