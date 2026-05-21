/**
 * Centralized date and lightweight display formatting utilities.
 *
 * Locale convention: 'en-US' for default display dates throughout the app.
 * Use fmtViDate only for Vietnamese-specific contexts.
 */

export type DateInput = string | number | Date | null | undefined

const EMPTY_DATE = '-'

function toDate(d: DateInput): Date | null {
  if (!d) return null
  const date = d instanceof Date ? d : new Date(d)
  return isNaN(date.getTime()) ? null : date
}

/** "May 20, 2026" */
export function fmtDate(d: DateInput): string {
  const date = toDate(d)
  if (!date) return EMPTY_DATE
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "May 20" (no year) */
export function fmtDay(d: DateInput): string {
  const date = toDate(d)
  if (!date) return EMPTY_DATE
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function fmtShort(d: DateInput): string {
  return fmtDay(d)
}

/** "20/05/2026" - Vietnamese short format */
export function fmtViDate(d: DateInput): string {
  const date = toDate(d)
  if (!date) return EMPTY_DATE
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** "May 20, 2026 19:14" */
export function fmtDateTime(d: DateInput): string {
  const date = toDate(d)
  if (!date) return EMPTY_DATE
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "2h ago" / "3d ago" / "May 20" for older dates */
export function fmtRelative(d: DateInput): string {
  const date = toDate(d)
  if (!date) return EMPTY_DATE
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return fmtDay(date)
}

/** Returns true if the exact date/time is in the past. */
export function isOverdue(d: DateInput): boolean {
  const date = toDate(d)
  if (!date) return false
  return date < new Date()
}

/** Returns true only after the calendar date has passed. */
export function isOverdueDateOnly(d: DateInput): boolean {
  const date = toDate(d)
  if (!date) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return target < today
}

export function formatEstimate(estimatedHours: number | null | undefined): string {
  return estimatedHours === null || estimatedHours === undefined ? '-' : `${estimatedHours}h`
}
