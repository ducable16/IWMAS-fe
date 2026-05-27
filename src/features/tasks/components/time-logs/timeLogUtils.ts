import type { Id } from '@/types'

export function getDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentWeekRange() {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    from: getDateInputValue(monday),
    to: getDateInputValue(sunday),
  }
}

export function formatHours(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return `${Number(value).toFixed(1).replace(/\.0$/, '')}h`
}

export function parseIdInput(value: string): Id | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed
}
