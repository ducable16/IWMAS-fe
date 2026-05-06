import { useState } from 'react'
import { ChevronDown, BarChart3 } from 'lucide-react'
import clsx from 'clsx'
import ProjectWorkloadDashboard from '@/features/workforce/components/ProjectWorkloadDashboard'
import { useMyProjects, useProjects } from '@/features/projects/hooks/useProjects'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCan } from '@/utils/permissions'

export default function WorkloadPage() {
  const can  = useCan()
  const user = useAuthStore((s) => s.user)

  // ADMIN sees all projects; PM/TM sees own projects
  const { data: projectsData, isLoading: projectsLoading } = can.isAdmin
    ? useProjects({ size: 100, sortBy: 'name', sortDirection: 'ASC' })
    : useMyProjects({ size: 100, sortBy: 'name', sortDirection: 'ASC' })

  const projects = projectsData?.projects ?? []
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-subhead text-text-primary">Workload Analytics</h2>
          <p className="text-text-secondary text-[14px] mt-1">
            Real-time team utilization by project
          </p>
        </div>
      </div>

      {/* Project selector */}
      <div className="flex items-center gap-3">
        <label className="text-[12.5px] font-medium text-text-muted shrink-0">
          Project:
        </label>
        <div className="relative">
          <select
            value={selectedProjectId ?? ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            className={clsx(
              'appearance-none text-[13px] font-medium',
              'bg-bg-surface border border-border-subtle rounded-lg',
              'pl-3 pr-8 py-2 min-w-[260px]',
              'focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-focus',
              'transition-colors cursor-pointer',
              !selectedProjectId && 'text-text-muted',
            )}
            disabled={projectsLoading}
          >
            <option value="">
              {projectsLoading ? 'Loading projects…' : 'Select a project…'}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.code ? ` (${p.code})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" strokeWidth={1.75} />
        </div>
      </div>

      {/* Dashboard or empty state */}
      {selectedProjectId ? (
        <div className="card p-5">
          {selectedProject && (
            <h3 className="text-[14px] font-semibold text-text-primary mb-4">
              {selectedProject.name}
            </h3>
          )}
          <ProjectWorkloadDashboard projectId={selectedProjectId} />
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" strokeWidth={1.5} />
          <p className="text-[14px] text-text-muted">
            Select a project to view team workload
          </p>
          <p className="text-[12px] text-text-muted mt-1">
            Choose from {projects.length} project{projects.length !== 1 ? 's' : ''} you have access to
          </p>
        </div>
      )}
    </div>
  )
}
