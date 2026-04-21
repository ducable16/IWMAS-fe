import { Plus, MoreHorizontal, Calendar, Users } from 'lucide-react'
import clsx from 'clsx'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'

const STATUS_BADGE = {
  active: 'badge-success',
  on_hold: 'badge-warning',
  completed: 'badge-neutral',
  paused: 'badge-danger',
}

const STATUS_LABEL = {
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  paused: 'Paused',
}

const PROGRESS_BAR = {
  active: 'bg-accent',
  on_hold: 'bg-warning',
  completed: 'bg-success',
  paused: 'bg-danger',
}

export default function ProjectsPage() {
  const { data: projects, isLoading, isError, error, refetch } = useProjects()

  const list = projects || []
  const activeCount = list.filter((p) => p.status === 'active').length

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
            Projects
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">
            {activeCount} active projects
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          New project
        </button>
      </div>

      {isLoading && <LiveLoading label="Loading projects from API…" />}
      {isError && <LiveError error={error} onRetry={refetch} />}
      {!isLoading && !isError && list.length === 0 && <LiveEmpty label="No projects yet." />}

      {!isLoading && !isError && list.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((project) => (
            <div
              key={project.id}
              className="card p-5 hover:border-border transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-bg-subtle border border-border-subtle flex items-center justify-center text-[12px] font-semibold text-text-primary">
                    {project.key || project.name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-medium text-text-primary">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={STATUS_BADGE[project.status] || 'badge-neutral'}>
                        {STATUS_LABEL[project.status] || project.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-text-muted hover:text-text-primary transition-colors p-1 -m-1 rounded">
                  <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-[11.5px] mb-1.5">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-secondary tabular-nums">{project.progress ?? 0}%</span>
                </div>
                <div className="h-1 bg-bg-subtle rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-500', PROGRESS_BAR[project.status] || 'bg-accent')}
                    style={{ width: `${project.progress ?? 0}%` }}
                  />
                </div>
              </div>

              {project.tech?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tech.map((t) => (
                    <span key={t} className="badge-neutral">{t}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-3 text-[11.5px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" strokeWidth={1.75} />
                    {project.members ?? 0}
                  </span>
                  {project.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={1.75} />
                      {project.dueDate}
                    </span>
                  )}
                </div>
                {project.tasks && (
                  <div className="text-[11.5px] text-text-secondary tabular-nums">
                    <span className="text-text-muted">{project.tasks.open}</span>
                    <span className="text-text-muted"> / </span>
                    <span>{project.tasks.total} tasks</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
