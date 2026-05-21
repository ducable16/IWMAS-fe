import type { TimelineUnit, WeekendColumn } from '@/features/tasks/utils/timeline'

type TimelineGridProps = {
  timelineW: number
  gridLineBg: string | null
  lowerUnits: TimelineUnit[]
  weekendCols: WeekendColumn[]
  todayOffset: number
}

export default function TimelineGrid({
  timelineW,
  gridLineBg,
  lowerUnits,
  weekendCols,
  todayOffset,
}: TimelineGridProps) {
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-0"
      style={{
        left: 376,
        width: timelineW,
        backgroundImage: gridLineBg || undefined,
      }}
    >
      {weekendCols.map((column, index) => (
        <div
          key={index}
          className="absolute inset-y-0 bg-bg-subtle/35"
          style={{ left: column.left, width: column.width }}
        />
      ))}

      {!gridLineBg && lowerUnits.map((unit) => (
        <div
          key={unit.key}
          className="absolute inset-y-0 border-r border-border-subtle/50"
          style={{ left: unit.left, width: unit.width }}
        />
      ))}

      <div
        className="absolute inset-y-0 w-px bg-accent/40"
        style={{ left: todayOffset }}
      />
    </div>
  )
}
