import { memo } from 'react'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { TaskStatusBadge } from '@/components/ui/Badge'
import type { Id, TaskListItem } from '@/types'
import type { MouseEvent } from 'react'
import type { Dayjs } from 'dayjs'
import {
  BAR_COLOR,
  ROW_H,
  LEFT_W,
  LEFT_TITLE_W,
  LEFT_STATUS_W,
  CLIP_BOTH_JAGGED,
  CLIP_LEFT_JAGGED,
  CLIP_RIGHT_JAGGED,
} from '../utils/timeline'
import type { BarGeometry, DragOverride } from '../utils/timeline'

interface TimelineRowProps {
  task: TaskListItem
  bar: BarGeometry | undefined
  dragOverride: DragOverride | null
  rangeStart: Dayjs
  timelineW: number
  ppd: number
  onTaskClick: (taskId: Id) => void
  onStartDrag: (
    taskId: string,
    handle: 'start' | 'end',
    clientX: number,
    origStart: string | null | undefined,
    origDue: string | null | undefined
  ) => void
  onMouseEnterBar: (task: TaskListItem & { startDate?: string | null | undefined; due?: string | null | undefined }, left: number, width: number) => void
  onMouseLeaveBar: () => void
}

function TimelineRowComponent({
  task,
  bar,
  dragOverride,
  rangeStart,
  timelineW,
  ppd,
  onTaskClick,
  onStartDrag,
  onMouseEnterBar,
  onMouseLeaveBar,
}: TimelineRowProps) {
  const color = (BAR_COLOR as Record<string, { bg: string; text: string }>)[task.status] ?? BAR_COLOR.TODO
  const isCxl = task.status === 'CANCELLED'

  const ov = dragOverride?.taskId === String(task.id) ? dragOverride : null
  const effStart = ov?.startDate ?? task.startDate
  const effDue = ov?.dueDate ?? task.due

  let barPos = bar
  if (ov && (effStart || effDue)) {
    const s = effStart ? dayjs(effStart) : dayjs(effDue)
    const e = effDue ? dayjs(effDue) : dayjs(effStart)
    const left = s.diff(rangeStart, 'day') * ppd
    const w = Math.max(Math.ceil((e.diff(s, 'day') + 1) * ppd), Math.max(ppd, 8))
    barPos = { left, width: w }
  }

  const handleStartDrag = (handle: 'start' | 'end') => (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onStartDrag(String(task.id), handle, e.clientX, effStart, effDue)
  }

  // Jagged clip-path when start/due is undefined
  const hasStart = !!task.startDate
  const hasDue = !!task.due
  const clipPath = !hasStart && !hasDue
    ? CLIP_BOTH_JAGGED
    : !hasStart ? CLIP_LEFT_JAGGED
    : !hasDue ? CLIP_RIGHT_JAGGED
    : null

  return (
    <div
      data-row-id={task.id}
      className="flex border-b border-border-subtle hover:bg-bg-hover/15 transition-colors group"
      style={{ height: ROW_H }}
    >
      {/* ── Sticky left panel ── */}
      <div
        className="sticky left-0 z-10 flex flex-shrink-0 bg-bg-canvas group-hover:bg-bg-subtle border-r border-border-subtle"
        style={{ width: LEFT_W }}
      >
        {/* Title */}
        <div
          className="flex items-center gap-2 px-3 overflow-hidden flex-1 border-r border-border-subtle"
          style={{ maxWidth: LEFT_TITLE_W }}
        >
          <span className="font-mono text-[9.5px] text-text-muted bg-bg-subtle px-1 py-0.5 rounded flex-shrink-0">
            #{task.id}
          </span>
          <span
            onClick={() => onTaskClick(task.id)}
            className={clsx(
              'text-[12.5px] text-text-primary truncate cursor-pointer hover:text-accent transition-colors flex-1',
              isCxl && 'line-through text-text-muted',
            )}
            title={task.title}
          >
            {task.title}
          </span>
          <div
            className="ml-auto w-5 h-5 rounded-full bg-bg-subtle border border-border-subtle flex items-center justify-center text-[9px] font-semibold text-text-secondary flex-shrink-0"
            title={task.assigneeFull}
          >
            {task.assignee}
          </div>
        </div>

        {/* Status */}
        <div
          className="flex items-center px-2 flex-shrink-0"
          style={{ width: LEFT_STATUS_W }}
        >
          <TaskStatusBadge status={task.status} />
        </div>
      </div>

      {/* ── Timeline area ── */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: timelineW,
          height: ROW_H,
        }}
      >
        {/* Task bar */}
        {barPos && (
          <div
            className={clsx(
              'absolute flex items-center overflow-visible z-[2] group/bar transition-[filter] hover:brightness-90',
              !clipPath && 'rounded-[4px]',
            )}
            style={{
              left:            barPos.left,
              width:           barPos.width,
              top:             6,
              height:          ROW_H - 12,
              backgroundColor: color.bg,
              cursor:          'pointer',
              clipPath:        clipPath ?? undefined,
            }}
            onClick={() => onTaskClick(task.id)}
            onMouseEnter={() => {
              onMouseEnterBar(
                { ...task, startDate: effStart, due: effDue },
                barPos.left,
                barPos.width
              )
            }}
            onMouseLeave={onMouseLeaveBar}
          >
            {/* Left resize handle */}
            <div
              className="absolute left-0 inset-y-0 w-3 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity cursor-ew-resize z-10 flex-shrink-0"
              onMouseDown={handleStartDrag('start')}
            >
              <div className="w-1 h-3.5 rounded-full bg-white/60 border border-white/20" />
            </div>

            {/* Label */}
            {barPos.width >= 60 && (
              <span
                className={clsx('text-[11px] font-medium px-3 truncate whitespace-nowrap select-none flex-1 min-w-0', isCxl && 'line-through')}
                style={{ color: color.text }}
              >
                {task.title}
              </span>
            )}

            {/* Right resize handle */}
            <div
              className="absolute right-0 inset-y-0 w-3 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity cursor-ew-resize z-10 flex-shrink-0 ml-auto"
              onMouseDown={handleStartDrag('end')}
            >
              <div className="w-1 h-3.5 rounded-full bg-white/60 border border-white/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const TimelineRow = memo(TimelineRowComponent, (prev, next) =>
  prev.task === next.task &&
  prev.bar === next.bar &&
  prev.dragOverride === next.dragOverride &&
  prev.rangeStart === next.rangeStart &&
  prev.timelineW === next.timelineW &&
  prev.ppd === next.ppd &&
  prev.onTaskClick === next.onTaskClick &&
  prev.onStartDrag === next.onStartDrag &&
  prev.onMouseEnterBar === next.onMouseEnterBar &&
  prev.onMouseLeaveBar === next.onMouseLeaveBar,
)
