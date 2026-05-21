import clsx from 'clsx'
import {
  HEADER_H,
  LEFT_W,
  HEADER_TOP_H,
  HEADER_BOT_H,
  LEFT_STATUS_W,
  TimelineUnit,
} from '../utils/timeline'

interface TimelineHeaderProps {
  timelineW: number
  todayOffset: number
  upperUnits: TimelineUnit[]
  lowerUnits: TimelineUnit[]
}

export function TimelineHeader({
  timelineW,
  todayOffset,
  upperUnits,
  lowerUnits,
}: TimelineHeaderProps) {
  return (
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
  )
}
