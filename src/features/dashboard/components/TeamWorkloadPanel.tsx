import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Users,
} from 'lucide-react'
import clsx from 'clsx'
import BacklogMetric from '@/features/workforce/components/BacklogMetric'
import DeadlineRiskIndicator from '@/features/workforce/components/DeadlineRiskIndicator'
import { useProjectWorkload } from '@/features/workforce/hooks/useWorkload'
import {
  allocationAtRiskCount,
  compareProjectMemberWorkload,
} from '@/features/workforce/workloadPresentation'
import { LiveError } from '@/components/feedback/LiveStateOverlay'
import WorkloadTaskList from './WorkloadTaskList'
import type { Id, Project, ProjectMemberWorkloadResponse } from '@/types'

type MemberRowProps = {
  member: ProjectMemberWorkloadResponse
  expanded: boolean
  onToggle: (id: Id) => void
}

type ProjectGroupProps = {
  project: Project
  expanded: boolean
  onToggle: (id: Id) => void
}

type TeamWorkloadPanelProps = {
  title?: string
  projects?: Project[]
  isLoading?: boolean
  isError?: boolean
  error?: Error | { message?: string } | null
  onRetry?: () => void
  emptyLabel?: string
}

const keyOf = (id: Id) => String(id)

const MemberRow = memo(function MemberRow({ member, expanded, onToggle }: MemberRowProps) {
  const allocation = member.projectAllocation

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onToggle(member.userId)}
        className={clsx(
          'flex w-full items-start gap-4 rounded-xl p-4 text-left',
          'transition-colors hover:bg-bg-subtle/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-text-primary">
                {member.userFullName || 'Unknown'}
              </p>
              {member.email && (
                <p className="mt-0.5 truncate text-[12px] text-text-muted">
                  {member.email}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <DeadlineRiskIndicator
                atRiskCount={allocationAtRiskCount(allocation)}
                overdueCount={allocation.overdueCount}
                predictedLateCount={allocation.predictedLateTaskCount}
                compact
              />
            </div>
          </div>

          <div className="mt-2">
            <BacklogMetric days={allocation.backlogDays} compact />
          </div>

          <div className="mt-2 text-[12px] text-text-muted">
            <span className="font-semibold tabular-nums text-text-secondary">
              {member.activeTaskCount ?? 0}
            </span>{' '}
            active tasks
            {member.unestimatedTaskCount > 0 && (
              <span className="font-semibold text-warning">
                {' '}· {member.unestimatedTaskCount} unestimated
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-text-muted">
          {expanded
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <WorkloadTaskList
            tasks={member.tasks}
            emptyLabel="No tasks for this member"
            showDeadlineRisk
          />
        </div>
      )}
    </div>
  )
})

function ProjectGroup({ project, expanded, onToggle }: ProjectGroupProps) {
  const workload = useProjectWorkload(project.id)
  const [expandedMemberId, setExpandedMemberId] = useState<Id | null>(null)
  const members = useMemo(
    () => [...(workload.data ?? [])].sort(compareProjectMemberWorkload),
    [workload.data],
  )
  const atRisk = members.filter(
    (member) => allocationAtRiskCount(member.projectAllocation) > 0,
  ).length
  const contentId = `project-workload-${keyOf(project.id)}`

  const handleMemberToggle = useCallback((id: Id) => {
    setExpandedMemberId((current) => keyOf(current ?? '') === keyOf(id) ? null : id)
  }, [])

  return (
    <section className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => onToggle(project.id)}
        className={clsx(
          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
          expanded ? 'bg-bg-subtle/60' : 'hover:bg-bg-subtle/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/30',
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-accent/10 text-accent">
          <FolderKanban className="h-4 w-4" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-text-primary">{project.name}</p>
          {project.code && (
            <p className="mt-0.5 text-[12px] text-text-muted">{project.code}</p>
          )}
        </div>

        <div className="hidden flex-wrap items-center justify-end gap-3 text-[12px] sm:flex">
          {workload.isLoading ? (
            <span className="text-text-muted">Loading workload...</span>
          ) : workload.isError ? (
            <span className="text-danger">Workload unavailable</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <Users className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
                <span className="font-semibold tabular-nums">{members.length}</span> members
              </span>
              {atRisk > 0 && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
                  {atRisk} at risk
                </span>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 text-text-muted">
          {expanded
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div id={contentId} className="border-t border-border-subtle bg-bg-subtle/20 p-3">
          {workload.isLoading && (
            <p className="px-1 py-3 text-[12.5px] text-text-muted">Loading project members...</p>
          )}
          {workload.isError && (
            <LiveError error={workload.error} onRetry={() => { void workload.refetch() }} />
          )}
          {!workload.isLoading && !workload.isError && members.length === 0 && (
            <p className="px-1 py-3 text-[12.5px] text-text-muted">
              No members in this project.
            </p>
          )}
          {!workload.isLoading && !workload.isError && members.length > 0 && (
            <div className="space-y-2">
              {members.map((member) => (
                <MemberRow
                  key={member.userId}
                  member={member}
                  expanded={keyOf(expandedMemberId ?? '') === keyOf(member.userId)}
                  onToggle={handleMemberToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default function TeamWorkloadPanel({
  title = 'Team workload & tasks',
  projects = [],
  isLoading,
  isError,
  error,
  onRetry,
  emptyLabel = 'No projects to display.',
}: TeamWorkloadPanelProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<Id | null>(null)

  useEffect(() => {
    setExpandedProjectId((current) => {
      if (!projects.length) return null
      if (current != null && projects.some((project) => keyOf(project.id) === keyOf(current))) {
        return current
      }
      return projects[0]?.id ?? null
    })
  }, [projects])

  const handleProjectToggle = useCallback((id: Id) => {
    setExpandedProjectId((current) => keyOf(current ?? '') === keyOf(id) ? null : id)
  }, [])

  if (isLoading) {
    return (
      <div className="card p-5">
        <h3 className="section-title mb-4 text-[13px]">{title}</h3>
        <p className="text-[12.5px] text-text-muted">Loading projects...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="card p-5">
        <h3 className="section-title mb-4 text-[13px]">{title}</h3>
        <LiveError error={error} {...(onRetry ? { onRetry } : {})} />
      </div>
    )
  }

  if (!projects.length) {
    return (
      <div className="card p-5">
        <h3 className="section-title mb-4 text-[13px]">{title}</h3>
        <p className="text-[12.5px] text-text-muted">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="card space-y-3 p-5">
      <h3 className="section-title text-[13px]">{title}</h3>
      <div className="space-y-2">
        {projects.map((project) => (
          <ProjectGroup
            key={project.id}
            project={project}
            expanded={keyOf(expandedProjectId ?? '') === keyOf(project.id)}
            onToggle={handleProjectToggle}
          />
        ))}
      </div>
    </div>
  )
}
