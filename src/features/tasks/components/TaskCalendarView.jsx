import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { useTaskCalendar } from '@/features/tasks/hooks/useTaskViews'
import { TASK_STATUS_META } from '@/constants/enums'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']



function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function CalendarDay({ date, tasks, currentMonth, navigate }) {
  const isCurrentMonth = date.getMonth() === currentMonth.month && date.getFullYear() === currentMonth.year
  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  const visible = tasks.slice(0, 3)
  const overflow = tasks.length - visible.length

  return (
    <div
      className={clsx(
        'min-h-[110px] p-2 border-r border-b border-border-subtle transition-colors',
        !isCurrentMonth && 'bg-bg-subtle/40',
        isWeekend && isCurrentMonth && 'bg-bg-subtle/20',
      )}
    >
      <div className="flex items-center justify-end mb-1">
        <span
          className={clsx(
            'text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full',
            isToday ? 'bg-accent text-white font-semibold' : '',
            !isToday && isCurrentMonth ? 'text-text-primary' : '',
            !isToday && !isCurrentMonth ? 'text-text-muted' : '',
          )}
        >
          {date.getDate()}
        </span>
      </div>

      <div className="space-y-0.5">
        {visible.map((task) => {
          const statusKey = (task.status || 'TODO').toUpperCase()
          const pillCls = TASK_STATUS_META[statusKey]?.color || 'bg-bg-hover text-text-secondary'
          return (
            <div
              key={task.id}
              onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`) }}
              title={task.title}
              className={clsx(
                'text-[10.5px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-75 transition-opacity',
                pillCls,
              )}
            >
              {task.title}
            </div>
          )
        })}
        {overflow > 0 && (
          <p className="text-[10px] text-text-muted pl-1">+{overflow} more</p>
        )}
      </div>
    </div>
  )
}

export default function TaskCalendarView({ filters }) {
  const navigate = useNavigate()
  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })

  const prevMonth = () =>
    setCurrentMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    )

  const nextMonth = () =>
    setCurrentMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    )

  const from = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-01`
  const lastDayNum = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate()
  const to = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`

  const { data: calData, isLoading } = useTaskCalendar({
    from,
    to,
    projectId: filters.projectId,
  })

  // Map date string → task array
  const taskMap = useMemo(() => {
    const map = {}
    ;(calData || []).forEach(({ date, tasks }) => {
      map[date] = tasks || []
    })
    return map
  }, [calData])

  // Build calendar grid (Mon-first, 6 weeks)
  const gridDays = useMemo(() => {
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1)
    // 0=Sun 1=Mon ... adjust so Mon=0
    const offset = (firstDay.getDay() + 6) % 7
    const start = new Date(firstDay)
    start.setDate(start.getDate() - offset)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [currentMonth])

  const monthLabel = new Date(currentMonth.year, currentMonth.month, 1).toLocaleString('en', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-subtle/30">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-text-primary">{monthLabel}</h3>
          {isLoading && (
            <span className="text-[11px] text-text-muted animate-pulse">Loading…</span>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border-subtle">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wide border-r border-border-subtle last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {gridDays.map((day, i) => {
          const key = toDateKey(day)
          const tasks = taskMap[key] || []
          return (
            <CalendarDay
              key={i}
              date={day}
              tasks={tasks}
              currentMonth={currentMonth}
              navigate={navigate}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border-subtle bg-bg-subtle/20">
        {Object.entries(TASK_STATUS_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={clsx('w-2.5 h-2.5 rounded-sm', meta.color?.split(' ')[0] || 'bg-bg-hover')} />
            <span className="text-[10.5px] text-text-muted">{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
