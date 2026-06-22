import { useCallback, useEffect, useMemo, useState } from 'react'
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
import BacklogMetric from './BacklogMetric'
import DeadlineRiskIndicator from './DeadlineRiskIndicator'
import LoadLevelBadge from './LoadLevelBadge'
import { fmtDay } from '@/utils/date'
import {
  useArrangeLane,
  useArrangeMyLane,
  useLaneNextTask,
  useMySchedule,
  useMyNextTask,
  usePreviewSchedule,
  useResetSchedule,
  useSaveSchedule,
  useSuggestSchedule,
} from '../hooks/useWorkload'
import type {
  ArrangeTaskItem,
  Id,
  ProjectAllocationItem,
  ProjectScheduleResponse,
  TaskWorkloadItem,
} from '@/types'
import { getErrorMessage } from '@/utils/apiError'
import { ERR_ARRANGEMENT_STALE } from '@/utils/errorMessages'

type TaskArrangementPanelProps = {
  userId: Id
  isSelf: boolean
  allocations: ProjectAllocationItem[]
  selectedProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}

type ScheduleView = 'plan' | 'suggested'

type SortableArrangeRowProps = {
  id: string
  task: ArrangeTaskItem
  displayPosition: number
  previewTask?: TaskWorkloadItem | undefined
  isEditable: boolean
}

const getErrorCode = (err: unknown) => {
  const error = err as {
    code?: string | number
    response?: { data?: { code?: string | number } }
  } | null | undefined
  return String(error?.response?.data?.code ?? error?.code ?? '')
}

const EMPTY_ARRANGE_TASKS: ArrangeTaskItem[] = []

const keyOf = (id: Id) => String(id)

function formatHours(value: number | null | undefined) {
  return value == null ? '-' : `${value.toFixed(1)}h`
}

function idsEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function SortableArrangeRow({
  id,
  task,
  displayPosition,
  previewTask,
  isEditable,
}: SortableArrangeRowProps) {
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
        {displayPosition}
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
          <span className={clsx('tabular-nums', task.slackHours < 0 && 'font-semibold text-warning')}>
            Slack {formatHours(task.slackHours)}
          </span>
          <span className={clsx('tabular-nums', task.projectedTardinessHours > 0 && 'font-semibold text-danger')}>
            Late {formatHours(task.projectedTardinessHours)}
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
  const [previewedOrder, setPreviewedOrder] = useState<string[]>([])
  const [scheduleView, setScheduleView] = useState<ScheduleView>('plan')

  const activeProjectId = selectedProjectId ?? allocations[0]?.projectId ?? null
  const activeAllocation = allocations.find((item) => keyOf(item.projectId) === keyOf(activeProjectId ?? ''))

  const myArrangement = useArrangeMyLane(activeProjectId, undefined, isSelf)
  const laneArrangement = useArrangeLane(activeProjectId, userId, undefined, !isSelf)
  const mySchedule = useMySchedule(activeProjectId, isSelf)
  const suggestedSchedule = useSuggestSchedule(activeProjectId, isSelf)
  const myNextTask = useMyNextTask(activeProjectId, undefined, isSelf)
  const laneNextTask = useLaneNextTask(
    activeProjectId,
    userId,
    undefined,
    !isSelf,
  )
  const previewSchedule = usePreviewSchedule()
  const saveSchedule = useSaveSchedule()
  const resetSchedule = useResetSchedule()

  const arrangementQuery = isSelf ? myArrangement : laneArrangement
  const nextQuery = isSelf ? myNextTask : laneNextTask
  const arrangement = arrangementQuery.data
  const tasks = useMemo(
    () => [...(arrangement?.tasks ?? EMPTY_ARRANGE_TASKS)].sort((a, b) => a.position - b.position),
    [arrangement?.tasks],
  )
  const initialOrder = useMemo(() => tasks.map((task) => keyOf(task.taskId)), [tasks])
  const taskByKey = useMemo(
    () => new Map(tasks.map((task) => [keyOf(task.taskId), task])),
    [tasks],
  )

  const orderFromSchedule = useCallback((schedule: ProjectScheduleResponse | null | undefined) => {
    const scheduled = (schedule?.tasks ?? [])
      .map((task) => keyOf(task.taskId))
      .filter((id) => taskByKey.has(id))
    const included = new Set(scheduled)
    return [...scheduled, ...initialOrder.filter((id) => !included.has(id))]
  }, [initialOrder, taskByKey])

  const savedOrder = useMemo(
    () => orderFromSchedule(mySchedule.data),
    [mySchedule.data, orderFromSchedule],
  )
  const suggestedOrder = useMemo(
    () => orderFromSchedule(suggestedSchedule.data),
    [orderFromSchedule, suggestedSchedule.data],
  )
  const orderedTasks = order.map((id) => taskByKey.get(id)).filter(Boolean) as ArrangeTaskItem[]
  const visibleSchedule = preview
    ?? (scheduleView === 'suggested' ? suggestedSchedule.data : mySchedule.data)
  const previewByKey = useMemo(
    () => new Map((visibleSchedule?.tasks ?? []).map((task) => [keyOf(task.taskId), task])),
    [visibleSchedule],
  )
  const hasOrderChanges = canEditOrder && !idsEqual(order, savedOrder)
  const hasCurrentPreview = !!preview && idsEqual(order, previewedOrder)
  const isScheduleLoading = isSelf && (mySchedule.isLoading || suggestedSchedule.isLoading)
  const scheduleError = isSelf ? (mySchedule.error || suggestedSchedule.error) : null
  const isMutating = previewSchedule.isPending || saveSchedule.isPending || resetSchedule.isPending

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    if (!isSelf) {
      setOrder(initialOrder)
      setScheduleView('suggested')
    } else if (mySchedule.data && suggestedSchedule.data) {
      const nextView = mySchedule.data.savedOrder ? 'plan' : 'suggested'
      setScheduleView(nextView)
      setOrder(nextView === 'plan' ? savedOrder : suggestedOrder)
    }
    setPreview(null)
    setPreviewedOrder([])
  }, [activeProjectId, initialOrder, isSelf, mySchedule.data, savedOrder, suggestedOrder, suggestedSchedule.data])

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
    setPreviewedOrder([])
  }

  const orderedTaskIds = () =>
    order
      .map((id) => taskByKey.get(id)?.taskId)
      .filter((id): id is Id => id !== undefined && id !== null)

  const refreshScheduleData = () => {
    void Promise.all([
      myArrangement.refetch(),
      mySchedule.refetch(),
      suggestedSchedule.refetch(),
    ])
  }

  const handleScheduleError = (err: unknown, fallback: string) => {
    if (getErrorCode(err) === '1012') {
      setPreview(null)
      setPreviewedOrder([])
      refreshScheduleData()
      toast.error(ERR_ARRANGEMENT_STALE)
      return
    }
    toast.error(getErrorMessage(err, fallback))
  }

  const handlePreview = () => {
    if (!activeProjectId) return
    previewSchedule.mutate(
      { projectId: activeProjectId, orderedTaskIds: orderedTaskIds() },
      {
        onSuccess: (data) => {
          setPreview(data)
          setPreviewedOrder([...order])
          toast.success('Schedule preview updated')
        },
        onError: (err) => handleScheduleError(err, 'Failed to preview schedule'),
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
          setPreviewedOrder([...order])
          setScheduleView('plan')
          toast.success('Task order saved')
        },
        onError: (err) => handleScheduleError(err, 'Failed to save task order'),
      },
    )
  }

  const handleReset = () => {
    setOrder(savedOrder)
    setPreview(null)
    setPreviewedOrder([])
  }

  const showPlan = () => {
    setScheduleView('plan')
    setOrder(savedOrder)
    setPreview(null)
    setPreviewedOrder([])
  }

  const showSuggestion = () => {
    setScheduleView('suggested')
    setOrder(suggestedOrder)
    setPreview(null)
    setPreviewedOrder([])
  }

  const useSuggestion = () => {
    setScheduleView('plan')
    setOrder(suggestedOrder)
    setPreview(suggestedSchedule.data ?? null)
    setPreviewedOrder(suggestedOrder)
  }

  const followAutomatically = () => {
    if (!activeProjectId) return
    resetSchedule.mutate(activeProjectId, {
      onSuccess: (data) => {
        const nextOrder = orderFromSchedule(data)
        setScheduleView('suggested')
        setOrder(nextOrder)
        setPreview(data)
        setPreviewedOrder(nextOrder)
        toast.success('Automatic task ordering restored')
      },
      onError: (err) => handleScheduleError(err, 'Failed to restore automatic ordering'),
    })
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
                {arrangement?.dailyCapacityHours != null
                  ? ` · ${arrangement.dailyCapacityHours.toFixed(1)}h/day`
                  : activeAllocation.dailyCapacityHours != null
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

      {isSelf && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-border-subtle bg-bg-subtle p-0.5">
            <button
              type="button"
              onClick={showPlan}
              className={clsx(
                'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors',
                scheduleView === 'plan'
                  ? 'bg-bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              My plan
            </button>
            <button
              type="button"
              onClick={showSuggestion}
              className={clsx(
                'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors',
                scheduleView === 'suggested'
                  ? 'bg-bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              Suggested
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-text-muted">
              {mySchedule.data?.savedOrder ? 'Saved custom order' : 'Following automatically'}
            </span>
            {mySchedule.data?.savedOrder && (
              <button
                type="button"
                onClick={followAutomatically}
                disabled={isMutating}
                className="btn-secondary inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                {resetSchedule.isPending ? 'Restoring...' : 'Follow automatically'}
              </button>
            )}
          </div>
        </div>
      )}

      {(arrangementQuery.isLoading || isScheduleLoading) && (
        <LiveLoading label="Loading task arrangement..." />
      )}
      {(arrangementQuery.isError || scheduleError) && (
        <LiveError
          error={arrangementQuery.error || scheduleError}
          onRetry={() => {
            void arrangementQuery.refetch()
            if (isSelf) {
              void mySchedule.refetch()
              void suggestedSchedule.refetch()
            }
          }}
        />
      )}

      {!arrangementQuery.isLoading && !isScheduleLoading && !arrangementQuery.isError && !scheduleError && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-border-subtle bg-bg-subtle/35 p-3">
            {arrangement && (
              <div className="mb-3 flex flex-wrap gap-2 text-[11.5px] text-text-muted">
                <span className="rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5">
                  ATC k={arrangement.k.toFixed(1)}
                </span>
                <span className="rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5">
                  Allocation {arrangement.allocatedEffortPercent ?? '-'}%
                </span>
                <span className="rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5">
                  Capacity {formatHours(arrangement.dailyCapacityHours)}/day
                </span>
              </div>
            )}
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

          {visibleSchedule && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/20 bg-accent/[0.04] px-3 py-2">
              <LoadLevelBadge level={visibleSchedule.loadLevel} />
              <div className="min-w-[180px] flex-1">
                <BacklogMetric
                  days={visibleSchedule.backlogDays}
                  hours={visibleSchedule.backlogHours}
                />
              </div>
              <DeadlineRiskIndicator
                atRiskCount={visibleSchedule.overdueCount + visibleSchedule.predictedLateTaskCount}
                overdueCount={visibleSchedule.overdueCount}
                predictedLateCount={visibleSchedule.predictedLateTaskCount}
                compact
              />
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
                    {orderedTasks.map((task, index) => (
                      <SortableArrangeRow
                        key={keyOf(task.taskId)}
                        id={keyOf(task.taskId)}
                        task={task}
                        displayPosition={index + 1}
                        previewTask={previewByKey.get(keyOf(task.taskId))}
                        isEditable={canEditOrder && scheduleView === 'plan'}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {canEditOrder && scheduleView === 'plan' && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                  <p className="inline-flex items-center gap-1.5 text-[12px] text-text-muted">
                    <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Preview before saving to see projected dates and lateness.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={!hasOrderChanges || isMutating}
                      className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Discard changes
                    </button>
                    <button
                      type="button"
                      onClick={handlePreview}
                      disabled={!hasOrderChanges || isMutating}
                      className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {previewSchedule.isPending ? 'Previewing...' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!hasOrderChanges || !hasCurrentPreview || isMutating}
                      className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {saveSchedule.isPending ? 'Saving...' : 'Save order'}
                    </button>
                  </div>
                </div>
              )}

              {canEditOrder && scheduleView === 'suggested' && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                  <p className="text-[12px] text-text-muted">
                    Review the suggested order, then use it as the starting point for your plan.
                  </p>
                  <button
                    type="button"
                    onClick={useSuggestion}
                    disabled={isMutating || idsEqual(savedOrder, suggestedOrder)}
                    className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {idsEqual(savedOrder, suggestedOrder) ? 'Suggestion in use' : 'Use suggestion'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
