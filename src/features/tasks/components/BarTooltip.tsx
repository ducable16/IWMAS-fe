import dayjs from 'dayjs'
import { BarTooltipProps, fmtFull } from '../utils/timeline'

export function BarTooltip({ task, startX, endX, centerY }: BarTooltipProps) {
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
