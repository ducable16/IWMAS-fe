import { useCallback, useMemo, useState } from 'react'
import { FolderOpen, ListChecks } from 'lucide-react'
import clsx from 'clsx'
import { LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import { useConfirm } from '@/hooks/useConfirm'
import type { Id, ProjectAllocationItem, TaskWorkloadItem } from '@/types'
import BacklogMetric from '../BacklogMetric'
import DeadlineRiskIndicator from '../DeadlineRiskIndicator'
import TaskArrangementPanel, { type TaskArrangementState } from '../TaskArrangementPanel'
import { allocationAtRiskCount } from '../../workloadPresentation'
import WorkloadTaskSections from './WorkloadTaskSections'

interface MemberWorkloadLaneWorkspaceProps {
  userId: Id
  isSelf: boolean
  allocations: ProjectAllocationItem[]
  tasks: TaskWorkloadItem[]
  activeProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}

const keyOf = (id: Id) => String(id)

export default function MemberWorkloadLaneWorkspace({
  userId,
  isSelf,
  allocations,
  tasks,
  activeProjectId,
  onProjectChange,
}: MemberWorkloadLaneWorkspaceProps) {
  const { confirm, dialog } = useConfirm()
  const [arrangementState, setArrangementState] = useState<TaskArrangementState>({
    hasUnsavedChanges: false,
    isMutating: false,
  })

  const activeAllocation = useMemo(
    () => allocations.find(
      (allocation) => activeProjectId != null
        && keyOf(allocation.projectId) === keyOf(activeProjectId),
    ) ?? null,
    [activeProjectId, allocations],
  )
  const laneTasks = useMemo(
    () => activeProjectId == null
      ? []
      : tasks.filter((task) => keyOf(task.projectId) === keyOf(activeProjectId)),
    [activeProjectId, tasks],
  )

  const handleArrangementStateChange = useCallback((state: TaskArrangementState) => {
    setArrangementState((current) => (
      current.hasUnsavedChanges === state.hasUnsavedChanges
      && current.isMutating === state.isMutating
        ? current
        : state
    ))
  }, [])

  const handleProjectSelect = async (projectId: Id) => {
    if (
      arrangementState.isMutating
      || (activeProjectId != null && keyOf(projectId) === keyOf(activeProjectId))
    ) {
      return
    }

    if (arrangementState.hasUnsavedChanges) {
      const shouldSwitch = await confirm({
        title: 'Discard unsaved task order?',
        description: 'Switching projects will discard the task order changes in the current lane.',
        confirmLabel: 'Discard and switch',
        cancelLabel: 'Stay',
        variant: 'default',
      })
      if (!shouldSwitch) return
    }

    setArrangementState({ hasUnsavedChanges: false, isMutating: false })
    onProjectChange(projectId)
  }

  if (!activeAllocation || activeProjectId == null) {
    return (
      <div className="card p-5">
        <LiveEmpty label="No project lanes available." />
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-accent" strokeWidth={1.75} />
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-primary">
            Project lane
          </h3>
        </div>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          aria-label="Select project lane"
        >
          {allocations.map((allocation) => {
            const active = keyOf(allocation.projectId) === keyOf(activeProjectId)
            return (
              <button
                key={keyOf(allocation.projectId)}
                type="button"
                aria-pressed={active}
                disabled={arrangementState.isMutating}
                onClick={() => void handleProjectSelect(allocation.projectId)}
                className={clsx(
                  'shrink-0 rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 disabled:cursor-not-allowed disabled:opacity-50',
                  active
                    ? 'border-accent bg-accent text-white'
                    : 'border-border-subtle bg-bg-surface text-text-primary hover:border-border-strong hover:bg-bg-hover',
                )}
              >
                {allocation.projectName}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-border-subtle bg-bg-subtle/40 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Allocation</p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-text-primary">
              {activeAllocation.allocatedEffortPercent == null
                ? 'Not allocated'
                : `${activeAllocation.allocatedEffortPercent}%`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Capacity</p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-text-primary">
              {activeAllocation.dailyCapacityHours == null
                ? 'No capacity'
                : `${activeAllocation.dailyCapacityHours.toFixed(1)}h/day`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Backlog</p>
            <div className="mt-1">
              <BacklogMetric
                days={activeAllocation.backlogDays}
                hours={activeAllocation.backlogHours}
              />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Deadline risk</p>
            <div className="mt-1">
              <DeadlineRiskIndicator
                atRiskCount={allocationAtRiskCount(activeAllocation)}
                overdueCount={activeAllocation.overdueCount}
                predictedLateCount={activeAllocation.predictedLateTaskCount}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-border-subtle p-5">
        <TaskArrangementPanel
          key={keyOf(activeProjectId)}
          userId={userId}
          isSelf={isSelf}
          projectId={activeProjectId}
          embedded
          onStateChange={handleArrangementStateChange}
        />
      </section>

      <section className="border-t border-border-subtle p-5">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-accent" strokeWidth={1.75} />
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-primary">
            Project tasks
          </h3>
        </div>
        <WorkloadTaskSections tasks={laneTasks} variant="page" embedded />
      </section>

      {dialog}
    </div>
  )
}
