import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Brain,
  CalendarDays,
  GripVertical,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react'
import {
  closestCenter,
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { LiveEmpty, LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { TaskPriorityBadge } from '@/components/ui/Badge'
import WorkloadLevelBadge from './WorkloadLevelBadge'
import { fmtDay } from '@/utils/date'
import {
  useArrangeLane,
  useArrangeMyLane,
  useLaneNextTask,
  useMyNextTask,
  usePreviewSchedule,
  useSaveSchedule,
} from '../hooks/useWorkload'
import type {
  ArrangeTaskItem,
  Id,
  ProjectAllocationItem,
  ProjectScheduleResponse,
  TaskWorkloadItem,
} from '@/types'

type TaskArrangementPanelProps = {
  userId: Id
  isSelf: boolean
  allocations: ProjectAllocationItem[]
  selectedProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}

type SortableArrangeRowProps = {
  id: string
  task: ArrangeTaskItem
  previewTask?: TaskWorkloadItem | undefined
  isEditable: boolean
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { message?: string } | null | undefined)?.message || fallback

const EMPTY_ARRANGE_TASKS: ArrangeTaskItem[] = []

const keyOf = (id: Id) => String(id)

function formatHours(value: number | null | undefined) {
  return value == null ? '-' : `${value.toFixed(1)}h`
}

function idsEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function SortableArrangeRow({ id, task, previewTask, isEditable }: SortableArrangeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditable })

  const projectedStart = previewTask?.projectedStartDate ?? task.projectedStart
  const projectedFinish = previewTask?.projectedFinishDate ?? task.projectedFinish
  const willSlip = previewTask?.willSlip ?? task.willSlip
  const lateByWorkdays = previewTask?.lateByWorkdays ?? task.lateByWorkdays
  const atRisk = willSlip || task.slackHours < 0

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={clsx(
        'flex items-start gap-3 rounded-xl border bg-bg-surface p-3 transition-shadow',
        atRisk ? 'border-warning/25' : 'border-border-subtle',
        isDragging && 'shadow-lg ring-2 ring-accent/20',
      )}
    >
      <button
        type="button"
        className={clsx(
          'mt-0.5 rounded-md p-1 text-text-muted transition-colors',
          isEditable ? 'cursor-grab hover:bg-bg-hover hover:text-text-primary' : 'cursor-default opacity-40',
        )}
        title={isEditable ? 'Drag to reorder' : 'Suggested position'}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-subtle text-[12px] font-bold tabular-nums text-text-secondary">
        {task.position + 1}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 truncate text-[13.5px] font-semibold text-text-primary">
            {task.title}
          </p>
          <TaskPriorityBadge priority={task.priority || 'MEDIUM'} className="shrink-0" />
          {atRisk && (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              <AlertTriangle className="h-3 w-3" strokeWidth={2} />
              At risk
            </span>
          )}
          {task.estimateDefaulted && (
            <span className="rounded-full border border-danger/20 bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">
              Needs estimate
            </span>
          )}
        </div>

        <div className="mt-2 grid gap-2 text-[11.5px] text-text-muted sm:grid-cols-4">
          <span className="tabular-nums">Score {task.priorityIndex.toFixed(3)}</span>
          <span className={clsx('tabular-nums', task.slackHours < 0 && 'font-semibold text-warning')}>
            Slack {formatHours(task.slackHours)}
          </span>
          <span className="tabular-nums">Start {fmtDay(projectedStart)}</span>
          <span className={clsx('tabular-nums', willSlip && 'font-semibold text-danger')}>
            Finish {fmtDay(projectedFinish)}
            {lateByWorkdays > 0 ? ` (+${lateByWorkdays}d)` : ''}
          </span>
        </div>

        {task.reason && (
          <p className="mt-2 line-clamp-2 text-[11.5px] text-text-muted" title={task.reason}>
            {task.reason}
          </p>
        )}
      </div>
    </div>
  )
}

export default function TaskArrangementPanel({
  userId,
  isSelf,
  allocations,
  selectedProjectId,
  onProjectChange,
}: TaskArrangementPanelProps) {
  const canEditOrder = isSelf
  const [order, setOrder] = useState<string[]>([])
  const [preview, setPreview] = useState<ProjectScheduleResponse | null>(null)

  const activeProjectId = selectedProjectId ?? allocations[0]?.projectId ?? null
  const activeAllocation = allocations.find((item) => keyOf(item.projectId) === keyOf(activeProjectId ?? ''))

  const myArrangement = useArrangeMyLane(activeProjectId, undefined, isSelf)
  const laneArrangement = useArrangeLane(activeProjectId, userId, undefined, !isSelf)
  const myNextTask = useMyNextTask(activeProjectId, undefined, isSelf)
  const laneNextTask = useLaneNextTask(
    activeProjectId,
    userId,
    undefined,
    !isSelf,
  )
  const previewSchedule = usePreviewSchedule()
  const saveSchedule = useSaveSchedule()

  const arrangementQuery = isSelf ? myArrangement : laneArrangement
  const nextQuery = isSelf ? myNextTask : laneNextTask
  const arrangement = arrangementQuery.data
  const tasks = arrangement?.tasks ?? EMPTY_ARRANGE_TASKS
  const initialOrder = useMemo(() => tasks.map((task) => keyOf(task.taskId)), [tasks])
  const taskByKey = useMemo(
    () => new Map(tasks.map((task) => [keyOf(task.taskId), task])),
    [tasks],
  )
  const orderedTasks = order.map((id) => taskByKey.get(id)).filter(Boolean) as ArrangeTaskItem[]
  const previewByKey = useMemo(
    () => new Map((preview?.tasks ?? []).map((task) => [keyOf(task.taskId), task])),
    [preview],
  )
  const hasOrderChanges = canEditOrder && !idsEqual(order, initialOrder)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    setOrder(initialOrder)
    setPreview(null)
  }, [initialOrder])

  if (!allocations.length) {
    return <LiveEmpty label="No project lanes available for task arrangement." />
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder((current) => {
      const oldIndex = current.indexOf(String(active.id))
      const newIndex = current.indexOf(String(over.id))
      if (oldIndex < 0 || newIndex < 0) return current
      return arrayMove(current, oldIndex, newIndex)
    })
    setPreview(null)
  }

  const orderedTaskIds = () =>
    order
      .map((id) => taskByKey.get(id)?.taskId)
      .filter((id): id is Id => id !== undefined && id !== null)

  const handlePreview = () => {
    if (!activeProjectId) return
    previewSchedule.mutate(
      { projectId: activeProjectId, orderedTaskIds: orderedTaskIds() },
      {
        onSuccess: (data) => {
          setPreview(data)
          toast.success('Schedule preview updated')
        },
        onError: (err) => toast.error(getErrorMessage(err, 'Failed to preview schedule')),
      },
    )
  }

  const handleSave = () => {
    if (!activeProjectId) return
    saveSchedule.mutate(
      { projectId: activeProjectId, orderedTaskIds: orderedTaskIds() },
      {
        onSuccess: (data) => {
          setPreview(data)
          toast.success('Task order saved')
        },
        onError: (err) => toast.error(getErrorMessage(err, 'Failed to save task order')),
      },
    )
  }

  const handleReset = () => {
    setOrder(initialOrder)
    setPreview(null)
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" strokeWidth={1.75} />
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
              Task arrangement
            </h3>
            {activeAllocation && (
              <p className="mt-0.5 text-[12px] text-text-muted">
                {activeAllocation.projectName}
                {activeAllocation.dailyCapacityHours != null
                  ? ` · ${activeAllocation.dailyCapacityHours.toFixed(1)}h/day`
                  : ''}
              </p>
            )}
          </div>
        </div>

      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {allocations.map((allocation) => {
          const active = keyOf(allocation.projectId) === keyOf(activeProjectId ?? '')
          return (
            <button
              key={keyOf(allocation.projectId)}
              type="button"
              onClick={() => onProjectChange(allocation.projectId)}
              className={clsx(
                'rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors',
                active
                  ? 'border-accent bg-accent text-white'
                  : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-strong',
              )}
            >
              {allocation.projectName}
            </button>
          )
        })}
      </div>

      {arrangementQuery.isLoading && <LiveLoading label="Loading task arrangement..." />}
      {arrangementQuery.isError && (
        <LiveError error={arrangementQuery.error} onRetry={arrangementQuery.refetch} />
      )}

      {!arrangementQuery.isLoading && !arrangementQuery.isError && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-border-subtle bg-bg-subtle/35 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                    Next task
                  </p>
                  {nextQuery.isLoading ? (
                    <p className="text-[13px] text-text-muted">Loading suggestion...</p>
                  ) : nextQuery.data?.queueEmpty ? (
                    <p className="text-[13px] text-text-muted">No eligible work in this lane.</p>
                  ) : nextQuery.data?.taskId ? (
                    <p className="text-[13.5px] font-semibold text-text-primary">
                      {nextQuery.data.title}
                    </p>
                  ) : (
                    <p className="text-[13px] text-text-muted">No suggestion available.</p>
                  )}
                </div>
              </div>
              {nextQuery.data?.priority && (
                <TaskPriorityBadge priority={nextQuery.data.priority} className="shrink-0" />
              )}
            </div>
            {nextQuery.data?.reason && (
              <p className="mt-2 text-[11.5px] text-text-muted" title={nextQuery.data.reason}>
                {nextQuery.data.reason}
              </p>
            )}
          </div>

          {preview && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/20 bg-accent/[0.04] px-3 py-2">
              <WorkloadLevelBadge level={preview.workloadLevel} />
              <span className="text-[12px] text-text-secondary">
                Near-term <span className="font-semibold tabular-nums">{preview.nearTermPercent.toFixed(0)}%</span>
              </span>
              <span className="text-[12px] text-text-secondary">
                Overall <span className="font-semibold tabular-nums">{preview.overallPercent.toFixed(0)}%</span>
              </span>
              <span className="text-[12px] text-text-secondary">
                Predicted late <span className="font-semibold tabular-nums">{preview.predictedLateTaskCount}</span>
              </span>
            </div>
          )}

          {tasks.length === 0 ? (
            <LiveEmpty label="No schedulable tasks in this project lane." />
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={order} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {orderedTasks.map((task) => (
                      <SortableArrangeRow
                        key={keyOf(task.taskId)}
                        id={keyOf(task.taskId)}
                        task={task}
                        previewTask={previewByKey.get(keyOf(task.taskId))}
                        isEditable={canEditOrder}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {canEditOrder && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                  <p className="inline-flex items-center gap-1.5 text-[12px] text-text-muted">
                    <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Preview before saving to see projected dates and lateness.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={!hasOrderChanges || previewSchedule.isPending || saveSchedule.isPending}
                      className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handlePreview}
                      disabled={!hasOrderChanges || previewSchedule.isPending || saveSchedule.isPending}
                      className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {previewSchedule.isPending ? 'Previewing...' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!hasOrderChanges || previewSchedule.isPending || saveSchedule.isPending}
                      className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {saveSchedule.isPending ? 'Saving...' : 'Save order'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
