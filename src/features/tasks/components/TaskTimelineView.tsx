import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import { taskService } from '@/features/tasks/services/taskService'
import { TaskStatusBadge } from '@/components/ui/Badge'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { MouseEvent } from 'react'
import type { Dayjs } from 'dayjs'
import type { Id, TaskFilters, TaskListItem } from '@/types'

interface UpdateTaskDatesVariables {
  id: Id
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const LEFT_TITLE_W  = 256  // task info column
const LEFT_STATUS_W = 120  // status badge column
const LEFT_W        = LEFT_TITLE_W + LEFT_STATUS_W
const ROW_H         = 40
const HEADER_TOP_H  = 28
const HEADER_BOT_H  = 28
const HEADER_H      = HEADER_TOP_H + HEADER_BOT_H

// ─── Scale config ─────────────────────────────────────────────────────────────
const SCALES = [
  { key: 'weeks',    label: 'Weeks',    ppd: 30 },
  { key: 'months',   label: 'Months',   ppd: 8  },
  { key: 'quarters', label: 'Quarters', ppd: 3  },
] as const

type TimelineScale = typeof SCALES[number]['key']

// How many days to show before/after today as the baseline range
const BASE_RANGE: Record<TimelineScale, { before: number; after: number }> = {
  weeks:    { before: 14,  after: 56  },
  months:   { before: 60,  after: 150 },
  quarters: { before: 90,  after: 270 },
}

// ─── Bar colors (solid) ───────────────────────────────────────────────────────
const BAR_COLOR = {
  TODO:        { bg: '#C8D0D8', text: '#4B5563' },
  IN_PROGRESS: { bg: '#0075DE', text: '#FFFFFF' },
  IN_REVIEW:   { bg: '#0284C7', text: '#FFFFFF' },
  DONE:        { bg: '#1AAE39', text: '#FFFFFF' },
  CANCELLED:   { bg: '#94A3B8', text: '#94A3B8' },
} satisfies Record<string, { bg: string; text: string }>

// ─── Jagged clip-paths for open-ended bars (bar height = ROW_H-12 = 28px) ─────
// Zigzag teeth: 4px step. Points wrap polygon clockwise.
const CLIP_LEFT_JAGGED  = 'polygon(4px 0, 0 4px, 4px 8px, 0 12px, 4px 16px, 0 20px, 4px 24px, 0 28px, 100% 28px, 100% 0)'
const CLIP_RIGHT_JAGGED = 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, calc(100% - 4px) 8px, 100% 12px, calc(100% - 4px) 16px, 100% 20px, calc(100% - 4px) 24px, 100% 28px, 0 28px)'
const CLIP_BOTH_JAGGED  = 'polygon(4px 0, 0 4px, 4px 8px, 0 12px, 4px 16px, 0 20px, 4px 24px, 0 28px, calc(100% - 4px) 28px, 100% 24px, calc(100% - 4px) 20px, 100% 16px, calc(100% - 4px) 12px, 100% 8px, calc(100% - 4px) 4px, 100% 0)'

// ─── Date helpers ─────────────────────────────────────────────────────────────
const TODAY_STR = dayjs().format('YYYY-MM-DD')
const fmtFull   = (d: string | null | undefined) => dayjs(d).format('MMM D, YYYY')

interface TimelineUnit {
  key: string | number
  label: string
  left: number
  width: number
  isToday?: boolean
  isMon?: boolean
}

interface TimelineTooltipState {
  task: TaskListItem & { startDate?: string | null | undefined; due?: string | null | undefined }
  startX: number
  endX: number
  centerY: number
}

interface DragOverride {
  taskId: string
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
}

interface DragState {
  taskId: string
  handle: 'start' | 'end'
  startClientX: number
  origStart?: string | null | undefined
  origDue?: string | null | undefined
  hasDragged: boolean
}

interface BarGeometry {
  left: number
  width: number
}

interface BarTooltipProps {
  task: TimelineTooltipState['task']
  startX: number | null
  endX: number
  centerY: number
}

interface TaskTimelineViewProps {
  filters: TaskFilters
}

// ─── Header unit builders ──────────────────────────────────────────────────────

/** Upper row: months (for weeks/months scale) or quarters */
function getUpperUnits(days: Dayjs[], ppd: number, scale: TimelineScale): TimelineUnit[] {
  const units: Array<Omit<TimelineUnit, 'width'> & { count: number }> = []
  let cur: (Omit<TimelineUnit, 'width'> & { count: number }) | null = null
  days.forEach((d, i) => {
    const isQtr   = scale === 'quarters'
    const q       = Math.ceil((d.month() + 1) / 3)
    const key     = isQtr ? `${d.year()}-Q${q}` : d.format('YYYY-MM')
    const label   = isQtr ? `Q${q} ${d.year()}` : d.format('MMM YYYY')
    if (!cur || cur.key !== key) {
      cur = { key, label, left: i * ppd, count: 1 }
      units.push(cur)
    } else {
      cur.count++
    }
  })
  return units.map(u => ({ ...u, width: u.count * ppd }))
}

/** Lower row: days (weeks), Mondays (months), or month names (quarters) */
function getLowerUnits(days: Dayjs[], ppd: number, scale: TimelineScale): TimelineUnit[] {
  if (scale === 'weeks') {
    return days.map((d, i) => ({
      key:   i,
      label: String(d.date()),
      left:  i * ppd,
      width: ppd,
      isToday: d.format('YYYY-MM-DD') === TODAY_STR,
      isMon:   d.day() === 1,
    }))
  }
  if (scale === 'months') {
    const units: TimelineUnit[] = []
    days.forEach((d, i) => {
      if (d.day() === 1 || i === 0) {
        const end   = days.findIndex((x, j) => j > i && x.day() === 1)
        const count = end === -1 ? days.length - i : end - i
        units.push({ key: i, label: d.format('MMM D'), left: i * ppd, width: count * ppd, isMon: true })
      }
    })
    return units
  }
  // quarters → month cells in lower row
  const units: Array<Omit<TimelineUnit, 'width'> & { count: number }> = []
  let cur: (Omit<TimelineUnit, 'width'> & { count: number }) | null = null
  days.forEach((d, i) => {
    const key = d.format('YYYY-MM')
    if (!cur || cur.key !== key) {
      cur = { key, label: d.format('MMM'), left: i * ppd, count: 1 }
      units.push(cur)
    } else {
      cur.count++
    }
  })
  return units.map(u => ({ ...u, width: u.count * ppd }))
}

// ─── Tooltip — positions anchored to actual bar edges ─────────────────────────
function BarTooltip({ task, startX, endX, centerY }: BarTooltipProps) {
  if (startX == null) return null
  const hasStart = !!task.startDate
  const hasEnd   = !!task.due
  const duration = hasStart && hasEnd
    ? dayjs(task.due).diff(dayjs(task.startDate), 'day') + 1
    : null
  const tipTop = centerY - 14

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Start date label — or "No start date" hint */}
      <div
        className="absolute text-[11.5px] px-2.5 py-1 rounded-lg whitespace-nowrap font-medium shadow-deep"
        style={{
          left: startX - 8,
          top: tipTop,
          transform: 'translateX(-100%)',
          background: hasStart ? 'rgba(9,9,11,0.88)' : 'rgba(100,100,100,0.75)',
          color: '#fff',
        }}
      >
        {hasStart ? fmtFull(task.startDate) : 'No start date'}
      </div>
      {/* End date label — or "No due date" hint */}
      <div
        className="absolute text-[11.5px] px-2.5 py-1 rounded-lg whitespace-nowrap font-medium shadow-deep"
        style={{
          left: endX + 8,
          top: tipTop,
          background: hasEnd ? 'rgba(9,9,11,0.88)' : 'rgba(100,100,100,0.75)',
          color: '#fff',
        }}
      >
        {hasEnd
          ? (<>{fmtFull(task.due)}{duration && <span className="text-white/70 ml-1">({duration}d)</span>}</>)
          : 'No due date'
        }
      </div>
    </div>
  )
}


// ─── Main component ───────────────────────────────────────────────────────────
export default function TaskTimelineView({ filters }: TaskTimelineViewProps) {
  const navigate     = useNavigate()
  const scrollRef    = useRef<HTMLDivElement | null>(null)
  const queryClient  = useQueryClient()
  const [scale, setScale]           = useState<TimelineScale>('weeks')
  const [tooltip, setTooltip]       = useState<TimelineTooltipState | null>(null)
  const [dragOverride, setDragOverride] = useState<DragOverride | null>(null)

  // Refs used inside window listeners (avoid stale closures)
  const dragRef  = useRef<DragState | null>(null)
  const ppdRef   = useRef(30)
  const rangeRef = useRef<Dayjs | null>(null)

  const ppd = SCALES.find(s => s.key === scale)?.ppd ?? 30

  const params = { ...filters, size: 200, page: 0 }
  const { data, isLoading, isError, error, refetch } = useSearchTasks(params)
  const rawTasks = useMemo(() => data?.tasks ?? [], [data?.tasks])

  const dragOverrideRef = useRef<DragOverride | null>(null)

  // ── Compute date range, day array, today offset ───────────────────────────
  const { rangeStart, days, todayOffset, timelineW } = useMemo(() => {
    const today = dayjs()
    const { before, after } = BASE_RANGE[scale]
    let minDate = today.subtract(before, 'day')
    let maxDate = today.add(after, 'day')

    rawTasks.forEach(t => {
      if (t.startDate) { const d = dayjs(t.startDate); if (d.isBefore(minDate)) minDate = d }
      if (t.due)       { const d = dayjs(t.due);       if (d.isAfter(maxDate))  maxDate = d }
    })

    const start   = minDate.subtract(5, 'day')
    const end     = maxDate.add(7, 'day')
    const nDays   = end.diff(start, 'day') + 1
    const allDays = Array.from({ length: nDays }, (_, i) => start.add(i, 'day'))

    return {
      rangeStart:  start,
      days:        allDays,
      todayOffset: today.diff(start, 'day') * ppd,
      timelineW:   nDays * ppd,
    }
  }, [scale, ppd, rawTasks])

  // ── Header groups ──────────────────────────────────────────────────────────
  const upperUnits = useMemo(() => getUpperUnits(days, ppd, scale), [days, ppd, scale])
  const lowerUnits = useMemo(() => getLowerUnits(days, ppd, scale), [days, ppd, scale])

  // ── CSS background for grid lines (avoids per-row div flood in weeks mode) ─
  const gridLineBg = useMemo(() => {
    // weeks: every day column gets a hairline border via CSS repeat
    if (scale === 'weeks')
      return `repeating-linear-gradient(90deg, transparent 0, transparent calc(${ppd}px - 0.5px), rgba(0,0,0,0.06) calc(${ppd}px - 0.5px), rgba(0,0,0,0.06) ${ppd}px)`
    return null // months/quarters: render explicit divs (fewer items)
  }, [scale, ppd])

  // Keep refs in sync for drag listeners
  useEffect(() => { ppdRef.current = ppd }, [ppd])
  useEffect(() => { rangeRef.current = rangeStart }, [rangeStart])

  // ── Mutation: update task start/due dates ──────────────────────────────────
  const updateDatesMutation = useMutation({
    mutationFn: ({ id, startDate, dueDate }: UpdateTaskDatesVariables) =>
      taskService.updateDates(id, { startDate, dueDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      toast.success('Task dates updated')
    },
    onError: () => {
      toast.error('Failed to update task dates')
      setDragOverride(null)
      dragOverrideRef.current = null
    },
  })

  // ── Window drag handlers ───────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const deltaX    = e.clientX - drag.startClientX
      const deltaDays = Math.round(deltaX / ppdRef.current)
      if (Math.abs(deltaX) > 3) drag.hasDragged = true

      let newStart = drag.origStart
      let newDue   = drag.origDue
      if (drag.handle === 'start') {
        const base = drag.origStart || drag.origDue
        if (base) {
          const proposed = dayjs(base).add(deltaDays, 'day').format('YYYY-MM-DD')
          newStart = drag.origDue && proposed > drag.origDue ? drag.origDue : proposed
        }
      } else if (drag.handle === 'end') {
        const base = drag.origDue || drag.origStart
        if (base) {
          const proposed = dayjs(base).add(deltaDays, 'day').format('YYYY-MM-DD')
          newDue = drag.origStart && proposed < drag.origStart ? drag.origStart : proposed
        }
      }
      const overrideObj = { taskId: drag.taskId, startDate: newStart, dueDate: newDue }
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
          updateDatesMutation.mutate({ id: drag.taskId, startDate: prev.startDate, dueDate: prev.dueDate })
        }
        setDragOverride(null)
        dragOverrideRef.current = null
      } else {
        setDragOverride(null)
        dragOverrideRef.current = null
      }
      
      // Delay clearing the ref so the click event can read hasDragged
      setTimeout(() => {
        if (dragRef.current === drag) dragRef.current = null
      }, 0)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [updateDatesMutation])

  // ── Bar positions (Map: taskId → { left, width }) ──────────────────────────
  const barMap = useMemo(() => {
    const map = new Map<string, BarGeometry>()
    rawTasks.forEach(t => {
      if (!t.startDate && !t.due) return
      const s     = t.startDate ? dayjs(t.startDate) : dayjs(t.due)
      const e     = t.due       ? dayjs(t.due)       : dayjs(t.startDate)
      const left  = s.diff(rangeStart, 'day') * ppd
      const width = Math.max(Math.ceil((e.diff(s, 'day') + 1) * ppd), Math.max(ppd, 8))
      map.set(String(t.id), { left, width })
    })
    return map
  }, [rawTasks, rangeStart, ppd])

  // Helper: compute bar viewport-X coordinates from bar geometry + scroll
  const getBarViewportX = useCallback((barLeft: number, barWidth: number) => {
    if (!scrollRef.current) return { startX: 0, endX: 0 }
    const cr  = scrollRef.current.getBoundingClientRect()
    const sl  = scrollRef.current.scrollLeft
    const startX = cr.left + LEFT_W + barLeft - sl
    return { startX, endX: startX + barWidth }
  }, [])

  // ── Scroll to today ────────────────────────────────────────────────────────
  // Use a ref so the callback is always fresh without being in useEffect deps
  const todayOffsetRef = useRef(todayOffset)
  todayOffsetRef.current = todayOffset

  const scrollToToday = useCallback(() => {
    if (!scrollRef.current) return
    const vw = scrollRef.current.clientWidth
    scrollRef.current.scrollLeft = Math.max(0, todayOffsetRef.current - vw / 3)
  }, []) // stable — uses ref internally

  // Auto-scroll when scale changes
  useEffect(() => {
    const id = requestAnimationFrame(scrollToToday)
    return () => cancelAnimationFrame(id)
  }, [scale, scrollToToday])

  // ── Weekend cols for shading (shared across rows) ──────────────────────────
  const weekendCols = useMemo(() =>
    scale !== 'quarters'
      ? days
          .map((d, i) => ({ left: i * ppd, width: ppd, we: d.day() === 0 || d.day() === 6 }))
          .filter(c => c.we)
      : [],
  [days, ppd, scale])

  if (isLoading) return <LiveLoading label="Loading timeline…" />
  if (isError)   return <LiveError error={error} onRetry={refetch} />

  const datedCount = rawTasks.filter(t => t.startDate || t.due).length
  const totalCount = rawTasks.length

  return (
    <div className="card overflow-hidden flex flex-col relative">

      {/* ════ Scrollable body ════ */}
      <div
        ref={scrollRef}
        className="overflow-auto"
        style={{ maxHeight: 'calc(100vh - 280px)', minHeight: 240 }}
      >
        <div style={{ minWidth: LEFT_W + timelineW }}>

          {/* ── Sticky two-row header ── */}
          <div
            className="sticky top-0 z-20 flex bg-bg-surface border-b border-border-subtle select-none"
            style={{ height: HEADER_H }}
          >
            {/* Left corner (doubly-sticky: top + left) */}
            <div
              className="sticky left-0 z-30 bg-bg-surface border-r border-border-subtle flex-shrink-0 flex flex-col"
              style={{ width: LEFT_W }}
            >
              <div
                className="flex items-end pb-1.5 px-3 border-b border-border-subtle flex-shrink-0"
                style={{ height: HEADER_TOP_H }}
              >
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Work</span>
              </div>
              <div className="flex items-center flex-1 overflow-hidden">
                <div className="flex-1 px-3">
                  <span className="text-[10.5px] font-medium text-text-muted uppercase tracking-wide">Title</span>
                </div>
                <div
                  className="flex items-center border-l border-border-subtle h-full px-3 flex-shrink-0"
                  style={{ width: LEFT_STATUS_W }}
                >
                  <span className="text-[10.5px] font-medium text-text-muted uppercase tracking-wide">Status</span>
                </div>
              </div>
            </div>

            {/* Timeline header */}
            <div className="relative flex-shrink-0" style={{ width: timelineW }}>
              {/* Upper row: month / quarter groups */}
              <div
                className="absolute top-0 left-0 right-0 flex border-b border-border-subtle"
                style={{ height: HEADER_TOP_H }}
              >
                {upperUnits.map(u => (
                  <div
                    key={u.key}
                    style={{ width: u.width, flexShrink: 0 }}
                    className="flex items-end pb-1 px-2 border-r border-border text-[11px] font-semibold text-text-secondary overflow-hidden"
                  >
                    <span className="truncate">{u.label}</span>
                  </div>
                ))}
              </div>

              {/* Lower row: day / week / month labels */}
              <div
                className="absolute bottom-0 left-0 right-0 flex"
                style={{ height: HEADER_BOT_H }}
              >
                {/* Today vertical accent in header */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-accent z-10 pointer-events-none"
                  style={{ left: todayOffset }}
                />

                {lowerUnits.map(u => {
                  const isToday = u.isToday ?? false
                  const isMon   = u.isMon   ?? false
                  return (
                    <div
                      key={u.key}
                      style={{ width: u.width, flexShrink: 0 }}
                      className={clsx(
                        'flex items-center justify-center border-r overflow-hidden relative',
                        isMon     ? 'border-border-strong' : 'border-border-subtle',
                        isToday   ? 'bg-accent/5'          : '',
                      )}
                    >
                      {isToday ? (
                        <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                          {u.label}
                        </span>
                      ) : (
                        <span className={clsx(
                          'text-[10.5px]',
                          isMon ? 'font-semibold text-text-secondary' : 'text-text-muted',
                        )}>
                          {u.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Task rows ── */}
          {rawTasks.length === 0 ? (
            <LiveEmpty label="No tasks match your filters." />
          ) : (
            rawTasks.map(task => {
              const bar    = barMap.get(String(task.id))
              const color  = (BAR_COLOR as Record<string, { bg: string; text: string }>)[task.status] ?? BAR_COLOR.TODO
              const isCxl  = task.status === 'CANCELLED'

              return (
                <div
                  key={task.id}
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
                        onClick={() => navigate(`/tasks/${task.id}`)}
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
                      backgroundImage: gridLineBg || undefined,
                    }}
                  >
                    {/* Weekend shading */}
                    {weekendCols.map((c, ci) => (
                      <div
                        key={ci}
                        className="absolute inset-y-0 bg-bg-subtle/35 pointer-events-none"
                        style={{ left: c.left, width: c.width }}
                      />
                    ))}

                    {/* Grid lines for months/quarters (CSS bg handles weeks) */}
                    {!gridLineBg && lowerUnits.map(u => (
                      <div
                        key={u.key}
                        className="absolute inset-y-0 border-r border-border-subtle/50 pointer-events-none"
                        style={{ left: u.left, width: u.width }}
                      />
                    ))}

                    {/* Today line */}
                    <div
                      className="absolute inset-y-0 w-px bg-accent/40 pointer-events-none z-[1]"
                      style={{ left: todayOffset }}
                    />

                    {/* Task bar */}
                    {(() => {
                      const ov = dragOverride?.taskId === String(task.id) ? dragOverride : null
                      const effStart = ov?.startDate ?? task.startDate
                      const effDue   = ov?.dueDate   ?? task.due
                      let barPos = bar
                      if (ov && (effStart || effDue)) {
                        const s    = effStart ? dayjs(effStart) : dayjs(effDue)
                        const e    = effDue   ? dayjs(effDue)   : dayjs(effStart)
                        const left = s.diff(rangeStart, 'day') * ppd
                        const w    = Math.max(Math.ceil((e.diff(s, 'day') + 1) * ppd), Math.max(ppd, 8))
                        barPos = { left, width: w }
                      }
                      if (!barPos) return null

                      const startDrag = (handle: DragState['handle']) => (e: MouseEvent<HTMLDivElement>) => {
                        e.preventDefault()
                        e.stopPropagation()
                        document.body.style.cursor = 'ew-resize'
                        document.body.style.userSelect = 'none'
                        dragRef.current = {
                          taskId: String(task.id),
                          handle,
                          startClientX: e.clientX,
                          origStart: effStart,
                          origDue:   effDue,
                          hasDragged: false,
                        }
                        setTooltip(null)
                      }

                      // Jagged clip-path when start/due is undefined
                      const hasStart = !!task.startDate
                      const hasDue   = !!task.due
                      const clipPath = !hasStart && !hasDue
                        ? CLIP_BOTH_JAGGED
                        : !hasStart ? CLIP_LEFT_JAGGED
                        : !hasDue   ? CLIP_RIGHT_JAGGED
                        : null

                      return (
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
                          onClick={() => {
                            if (dragRef.current?.hasDragged) return
                            navigate(`/tasks/${task.id}`)
                          }}
                          onMouseEnter={() => {
                            if (dragRef.current) return
                            const rowEl = scrollRef.current?.querySelector<HTMLElement>(`[data-row-id="${task.id}"]`)
                            const centerY = rowEl
                              ? rowEl.getBoundingClientRect().top + ROW_H / 2
                              : 0
                            setTooltip({
                              task: { ...task, startDate: effStart, due: effDue },
                              ...getBarViewportX(barPos.left, barPos.width),
                              centerY,
                            })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {/* Left resize handle */}
                          <div
                            className="absolute left-0 inset-y-0 w-3 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity cursor-ew-resize z-10 flex-shrink-0"
                            onMouseDown={startDrag('start')}
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
                            onMouseDown={startDrag('end')}
                          >
                            <div className="w-1 h-3.5 rounded-full bg-white/60 border border-white/20" />
                          </div>
                        </div>
                      )
                    })()}

                  </div>
                </div>
              )
            })
          )}

          {/* Footer */}
          {totalCount > 0 && (
            <div
              className="sticky left-0 flex items-center px-4 py-2 border-t border-border-subtle bg-bg-subtle/20"
              style={{ width: LEFT_W + timelineW }}
            >
              <span className="text-[11.5px] text-text-muted">
                {datedCount} of {totalCount} tasks have date ranges
                {datedCount < totalCount && (
                  <span className="ml-1 text-text-muted/70">
                    · {totalCount - datedCount} without dates (no bar shown)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ════ Floating scale/today pill — absolute overlay at bottom-right ════ */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-0.5 bg-bg-surface border border-border rounded-full px-1.5 py-1 shadow-deep select-none">
        <button
          onClick={scrollToToday}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
        >
          Today
        </button>
        <div className="w-px h-4 bg-border-subtle mx-0.5" />
        {SCALES.map(s => (
          <button
            key={s.key}
            onClick={() => setScale(s.key)}
            className={clsx(
              'text-[12px] font-medium px-3 py-1.5 rounded-full transition-all duration-150',
              scale === s.key
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Floating tooltip (fixed-position, escapes overflow) */}
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
