import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { TaskFilters, TaskListItem } from '@/types'

// ─── Layout constants ─────────────────────────────────────────────────────────
export const LEFT_TITLE_W  = 256  // task info column
export const LEFT_STATUS_W = 120  // status badge column
export const LEFT_W        = LEFT_TITLE_W + LEFT_STATUS_W
export const ROW_H         = 40
export const HEADER_TOP_H  = 28
export const HEADER_BOT_H  = 28
export const HEADER_H      = HEADER_TOP_H + HEADER_BOT_H

// ─── Scale config ─────────────────────────────────────────────────────────────
export const SCALES = [
  { key: 'weeks',    label: 'Weeks',    ppd: 30 },
  { key: 'months',   label: 'Months',   ppd: 8  },
  { key: 'quarters', label: 'Quarters', ppd: 3  },
] as const

export type TimelineScale = typeof SCALES[number]['key']

// How many days to show before/after today as the baseline range
export const BASE_RANGE: Record<TimelineScale, { before: number; after: number }> = {
  weeks:    { before: 14,  after: 56  },
  months:   { before: 60,  after: 150 },
  quarters: { before: 90,  after: 270 },
}

// ─── Bar colors (solid) ───────────────────────────────────────────────────────
export const BAR_COLOR = {
  TODO:        { bg: '#C8D0D8', text: '#4B5563' },
  IN_PROGRESS: { bg: '#0075DE', text: '#FFFFFF' },
  DONE:        { bg: '#1AAE39', text: '#FFFFFF' },
  CANCELLED:   { bg: '#94A3B8', text: '#94A3B8' },
} satisfies Record<string, { bg: string; text: string }>

// ─── Jagged clip-paths for open-ended bars (bar height = ROW_H-12 = 28px) ─────
export const CLIP_LEFT_JAGGED  = 'polygon(4px 0, 0 4px, 4px 8px, 0 12px, 4px 16px, 0 20px, 4px 24px, 0 28px, 100% 28px, 100% 0)'
export const CLIP_RIGHT_JAGGED = 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, calc(100% - 4px) 8px, 100% 12px, calc(100% - 4px) 16px, 100% 20px, calc(100% - 4px) 24px, 100% 28px, 0 28px)'
export const CLIP_BOTH_JAGGED  = 'polygon(4px 0, 0 4px, 4px 8px, 0 12px, 4px 16px, 0 20px, 4px 24px, 0 28px, calc(100% - 4px) 28px, 100% 24px, calc(100% - 4px) 20px, 100% 16px, calc(100% - 4px) 12px, 100% 8px, calc(100% - 4px) 4px, 100% 0)'

// ─── Date helpers ─────────────────────────────────────────────────────────────
export const TODAY_STR = dayjs().format('YYYY-MM-DD')
export const fmtFull   = (d: string | null | undefined) => dayjs(d).format('MMM D, YYYY')

export interface TimelineUnit {
  key: string | number
  label: string
  left: number
  width: number
  isToday?: boolean
  isMon?: boolean
}

export interface TimelineTooltipState {
  task: TaskListItem & { startDate?: string | null | undefined; due?: string | null | undefined }
  startX: number
  endX: number
  centerY: number
}

export interface DragOverride {
  taskId: string
  startDate?: string | null | undefined
  dueDate?: string | null | undefined
}

export interface DragState {
  taskId: string
  handle: 'start' | 'end'
  startClientX: number
  origStart?: string | null | undefined
  origDue?: string | null | undefined
  hasDragged: boolean
}

export interface BarGeometry {
  left: number
  width: number
}

export interface TimelineRange {
  rangeStart: Dayjs
  days: Dayjs[]
  todayOffset: number
  timelineW: number
}

export interface WeekendColumn {
  left: number
  width: number
}

export interface BarTooltipProps {
  task: TimelineTooltipState['task']
  startX: number | null
  endX: number
  centerY: number
}

export interface TaskTimelineViewProps {
  filters: TaskFilters
}

export function getTimelineRange(
  tasks: TaskListItem[],
  scale: TimelineScale,
  ppd: number,
): TimelineRange {
  const today = dayjs()
  const { before, after } = BASE_RANGE[scale]
  let minDate = today.subtract(before, 'day')
  let maxDate = today.add(after, 'day')

  tasks.forEach((task) => {
    if (task.startDate) {
      const date = dayjs(task.startDate)
      if (date.isBefore(minDate)) minDate = date
    }
    if (task.due) {
      const date = dayjs(task.due)
      if (date.isAfter(maxDate)) maxDate = date
    }
  })

  const rangeStart = minDate.subtract(5, 'day')
  const rangeEnd = maxDate.add(7, 'day')
  const dayCount = rangeEnd.diff(rangeStart, 'day') + 1
  const days = Array.from({ length: dayCount }, (_, index) => rangeStart.add(index, 'day'))

  return {
    rangeStart,
    days,
    todayOffset: today.diff(rangeStart, 'day') * ppd,
    timelineW: dayCount * ppd,
  }
}

export function getTimelineBarMap(
  tasks: TaskListItem[],
  rangeStart: Dayjs,
  ppd: number,
): Map<string, BarGeometry> {
  const map = new Map<string, BarGeometry>()

  tasks.forEach((task) => {
    if (!task.startDate && !task.due) return
    const start = task.startDate ? dayjs(task.startDate) : dayjs(task.due)
    const end = task.due ? dayjs(task.due) : dayjs(task.startDate)
    const left = start.diff(rangeStart, 'day') * ppd
    const width = Math.max(Math.ceil((end.diff(start, 'day') + 1) * ppd), Math.max(ppd, 8))
    map.set(String(task.id), { left, width })
  })

  return map
}

export function getWeekendColumns(
  days: Dayjs[],
  ppd: number,
  scale: TimelineScale,
): WeekendColumn[] {
  if (scale === 'quarters') return []

  return days
    .map((day, index) => ({
      left: index * ppd,
      width: ppd,
      isWeekend: day.day() === 0 || day.day() === 6,
    }))
    .filter((column) => column.isWeekend)
    .map(({ left, width }) => ({ left, width }))
}

export function getGridLineBackground(scale: TimelineScale, ppd: number): string | null {
  if (scale !== 'weeks') return null
  return `repeating-linear-gradient(90deg, transparent 0, transparent calc(${ppd}px - 0.5px), rgba(0,0,0,0.06) calc(${ppd}px - 0.5px), rgba(0,0,0,0.06) ${ppd}px)`
}

export function getDragDateOverride(
  drag: DragState,
  deltaDays: number,
): Omit<DragOverride, 'taskId'> {
  let newStart = drag.origStart
  let newDue = drag.origDue

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

  return { startDate: newStart, dueDate: newDue }
}

// ─── Header unit builders ──────────────────────────────────────────────────────

/** Upper row: months (for weeks/months scale) or quarters */
export function getUpperUnits(days: Dayjs[], ppd: number, scale: TimelineScale): TimelineUnit[] {
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
export function getLowerUnits(days: Dayjs[], ppd: number, scale: TimelineScale): TimelineUnit[] {
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
