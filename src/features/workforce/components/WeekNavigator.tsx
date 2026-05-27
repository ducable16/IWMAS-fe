import { ChevronLeft, ChevronRight } from 'lucide-react'

type WeekNavigatorProps = {
  onChange?: (weekStart: string, weekEnd: string) => void
  weekStart?: string | null
  weekEnd?: string | null
}

/** Get Monday of the week containing `date` */
function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get Sunday of the week containing `date` */
function getSunday(mondayDate: Date) {
  const d = new Date(mondayDate)
  d.setDate(d.getDate() + 6)
  return d
}

function parseDate(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}

/** Format ISO date string YYYY-MM-DD */
function toISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getCurrentWeekRange() {
  const monday = getMonday(new Date())
  const sunday = getSunday(monday)
  return {
    weekStart: toISO(monday),
    weekEnd: toISO(sunday),
  }
}

/** Format "Mon 4 May" */
function formatShort(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Format "Mon 4 May – Sun 10 May 2026" */
function formatRange(monday: Date, sunday: Date) {
  const left = formatShort(monday)
  const right = sunday.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${left} – ${right}`
}

/**
 * Week range picker: "Mon 4 May – Sun 10 May 2026"
 * with prev/next arrows and "This week" button.
 */
export default function WeekNavigator({ onChange, weekStart }: WeekNavigatorProps) {
  const parsedWeekStart = parseDate(weekStart)
  const monday = parsedWeekStart ? getMonday(parsedWeekStart) : getMonday(new Date())
  const sunday = getSunday(monday)
  const mondayISO = toISO(monday)
  const currentMonday = getMonday(new Date())
  const isCurrentWeek = mondayISO === toISO(currentMonday)

  const shiftWeek = (delta: number) => {
    const next = new Date(monday)
    next.setDate(next.getDate() + delta * 7)
    const nextSunday = getSunday(next)
    onChange?.(toISO(next), toISO(nextSunday))
  }

  const goToThisWeek = () => {
    const mon = getMonday(new Date())
    const sun = getSunday(mon)
    onChange?.(toISO(mon), toISO(sun))
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => shiftWeek(-1)}
        className="p-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-strong transition-colors"
        aria-label="Previous week"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
      </button>

      <span className="text-[13px] font-medium text-text-primary min-w-[240px] text-center select-none">
        {formatRange(monday, sunday)}
      </span>

      <button
        onClick={() => shiftWeek(1)}
        className="p-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-strong transition-colors"
        aria-label="Next week"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={goToThisWeek}
          className="text-[12px] font-medium text-accent hover:text-accent-hover transition-colors ml-1"
        >
          This week
        </button>
      )}
    </div>
  )
}
