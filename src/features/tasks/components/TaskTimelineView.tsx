import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import { taskService } from '@/features/tasks/services/taskService'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { ApiError, Id, TaskFilters, TaskListItem } from '@/types'

import {
  ROW_H,
  LEFT_W,
  SCALES,
  getUpperUnits,
  getLowerUnits,
  getTimelineRange,
  getTimelineBarMap,
  getWeekendColumns,
  getGridLineBackground,
  getDragDateOverride,
} from '../utils/timeline'
import type {
  DragOverride,
  DragState,
  TimelineScale,
  TimelineTooltipState,
} from '../utils/timeline'

import { BarTooltip } from './BarTooltip'
import { TimelineHeader } from './TimelineHeader'
import { TimelineRow } from './TimelineRow'
import TimelineFooter from './timeline/TimelineFooter'
import TimelineGrid from './timeline/TimelineGrid'
import TimelineScaleControls from './timeline/TimelineScaleControls'
import { filterTasksByStatuses } from '../utils/taskStatusFilter'

interface UpdateTaskDatesVariables {
  id: Id
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
}

interface TaskTimelineViewProps {
  filters: TaskFilters
}

const getDateUpdateErrorMessage = (err: unknown) => {
  const code = (err as ApiError | undefined)?.code
  if (code === 5005) return (err as ApiError | undefined)?.message || 'Start date must not be after due date'
  if (code === 5006) return (err as ApiError | undefined)?.message || 'Enter a start date or due date'
  return (err as ApiError | undefined)?.message || 'Failed to update task dates'
}

export default function TaskTimelineView({ filters }: TaskTimelineViewProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const queryClient = useQueryClient()
  const [scale, setScale] = useState<TimelineScale>('weeks')
  const [tooltip, setTooltip] = useState<TimelineTooltipState | null>(null)
  const [dragOverride, setDragOverride] = useState<DragOverride | null>(null)

  const dragRef = useRef<DragState | null>(null)
  const ppdRef = useRef(30)
  const dragOverrideRef = useRef<DragOverride | null>(null)

  const ppd = SCALES.find((item) => item.key === scale)?.ppd ?? 30
  const params = { ...filters, size: 200, page: 0 }
  const { data, isLoading, isError, error, refetch } = useSearchTasks(params)
  const rawTasks = useMemo(
    () => filterTasksByStatuses(data?.tasks ?? [], filters.statuses),
    [data?.tasks, filters.statuses],
  )

  const { rangeStart, days, todayOffset, timelineW } = useMemo(
    () => getTimelineRange(rawTasks, scale, ppd),
    [rawTasks, scale, ppd],
  )
  const upperUnits = useMemo(() => getUpperUnits(days, ppd, scale), [days, ppd, scale])
  const lowerUnits = useMemo(() => getLowerUnits(days, ppd, scale), [days, ppd, scale])
  const gridLineBg = useMemo(() => getGridLineBackground(scale, ppd), [scale, ppd])
  const barMap = useMemo(
    () => getTimelineBarMap(rawTasks, rangeStart, ppd),
    [rawTasks, rangeStart, ppd],
  )
  const weekendCols = useMemo(
    () => getWeekendColumns(days, ppd, scale),
    [days, ppd, scale],
  )

  useEffect(() => {
    ppdRef.current = ppd
  }, [ppd])

  const updateDatesMutation = useMutation({
    mutationFn: ({ id, startDate, dueDate }: UpdateTaskDatesVariables) =>
      taskService.updateDates(id, { startDate, dueDate }),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board', filters.projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id, 'history'] })
      toast.success('Task dates updated')
    },
    onError: (err: unknown) => {
      toast.error(getDateUpdateErrorMessage(err))
      setDragOverride(null)
      dragOverrideRef.current = null
    },
  })

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const deltaX = e.clientX - drag.startClientX
      const deltaDays = Math.round(deltaX / ppdRef.current)
      if (Math.abs(deltaX) > 3) drag.hasDragged = true

      const overrideObj = {
        taskId: drag.taskId,
        ...getDragDateOverride(drag, deltaDays),
      }
      setDragOverride(overrideObj)
      dragOverrideRef.current = overrideObj
    }

    const onUp = () => {
      const drag = dragRef.current
      if (!drag) return

      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      if (drag.hasDragged) {
        const prev = dragOverrideRef.current
        if (prev && prev.taskId === drag.taskId) {
          updateDatesMutation.mutate({
            id: drag.taskId,
            startDate: prev.startDate,
            dueDate: prev.dueDate,
          })
        }
      }

      setDragOverride(null)
      dragOverrideRef.current = null

      setTimeout(() => {
        if (dragRef.current === drag) dragRef.current = null
      }, 0)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [updateDatesMutation])

  const getBarViewportX = useCallback((barLeft: number, barWidth: number) => {
    if (!scrollRef.current) return { startX: 0, endX: 0 }
    const clientRect = scrollRef.current.getBoundingClientRect()
    const scrollLeft = scrollRef.current.scrollLeft
    const startX = clientRect.left + LEFT_W + barLeft - scrollLeft
    return { startX, endX: startX + barWidth }
  }, [])

  const todayOffsetRef = useRef(todayOffset)
  todayOffsetRef.current = todayOffset

  const scrollToToday = useCallback(() => {
    if (!scrollRef.current) return
    const viewportWidth = scrollRef.current.clientWidth
    scrollRef.current.scrollLeft = Math.max(0, todayOffsetRef.current - viewportWidth / 3)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(scrollToToday)
    return () => cancelAnimationFrame(id)
  }, [scale, scrollToToday])

  const handleStartDrag = useCallback((
    taskId: string,
    handle: DragState['handle'],
    clientX: number,
    origStart: string | null | undefined,
    origDue: string | null | undefined,
  ) => {
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
    dragRef.current = {
      taskId,
      handle,
      startClientX: clientX,
      origStart,
      origDue,
      hasDragged: false,
    }
    setTooltip(null)
  }, [])

  const handleMouseEnterBar = useCallback((
    task: TaskListItem & { startDate?: string | null | undefined; due?: string | null | undefined },
    left: number,
    width: number,
  ) => {
    if (dragRef.current) return
    const rowEl = scrollRef.current?.querySelector<HTMLElement>(`[data-row-id="${task.id}"]`)
    const centerY = rowEl ? rowEl.getBoundingClientRect().top + ROW_H / 2 : 0
    setTooltip({
      task,
      ...getBarViewportX(left, width),
      centerY,
    })
  }, [getBarViewportX])

  const handleMouseLeaveBar = useCallback(() => {
    setTooltip(null)
  }, [])

  const handleTaskClick = useCallback((id: Id) => {
    navigate(`/tasks/${id}`)
  }, [navigate])

  if (isLoading) return <LiveLoading label="Loading timeline..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />

  const datedCount = rawTasks.filter((task) => task.startDate || task.due).length
  const totalCount = rawTasks.length

  return (
    <div className="card overflow-hidden flex flex-col relative">
      <TimelineScaleControls
        scale={scale}
        onScaleChange={setScale}
        onTodayClick={scrollToToday}
      />

      <div
        ref={scrollRef}
        className="overflow-auto"
        style={{ maxHeight: 'calc(100vh - 280px)', minHeight: 240 }}
      >
        <div className="relative" style={{ minWidth: LEFT_W + timelineW }}>
          <TimelineGrid
            timelineW={timelineW}
            gridLineBg={gridLineBg}
            lowerUnits={lowerUnits}
            weekendCols={weekendCols}
            todayOffset={todayOffset}
          />

          <TimelineHeader
            timelineW={timelineW}
            todayOffset={todayOffset}
            upperUnits={upperUnits}
            lowerUnits={lowerUnits}
          />

          <div className="relative z-10">
            {rawTasks.length === 0 ? (
              <LiveEmpty label="No tasks match your filters." />
            ) : (
              rawTasks.map((task) => {
                const bar = barMap.get(String(task.id))
                const taskDragOverride =
                  dragOverride?.taskId === String(task.id) ? dragOverride : null

                return (
                  <TimelineRow
                    key={task.id}
                    task={task}
                    bar={bar}
                    dragOverride={taskDragOverride}
                    rangeStart={rangeStart}
                    timelineW={timelineW}
                    ppd={ppd}
                    onTaskClick={handleTaskClick}
                    onStartDrag={handleStartDrag}
                    onMouseEnterBar={handleMouseEnterBar}
                    onMouseLeaveBar={handleMouseLeaveBar}
                  />
                )
              })
            )}
          </div>

          <TimelineFooter
            datedCount={datedCount}
            totalCount={totalCount}
            timelineW={timelineW}
          />
        </div>
      </div>

      {tooltip && !dragRef.current && (
        <BarTooltip
          task={tooltip.task}
          startX={tooltip.startX}
          endX={tooltip.endX}
          centerY={tooltip.centerY}
        />
      )}
    </div>
  )
}
