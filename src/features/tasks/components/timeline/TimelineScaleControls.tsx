import clsx from 'clsx'
import { SCALES } from '@/features/tasks/utils/timeline'
import type { TimelineScale } from '@/features/tasks/utils/timeline'

type TimelineScaleControlsProps = {
  scale: TimelineScale
  onScaleChange: (scale: TimelineScale) => void
  onTodayClick: () => void
}

export default function TimelineScaleControls({
  scale,
  onScaleChange,
  onTodayClick,
}: TimelineScaleControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-0.5 bg-bg-surface border border-border rounded-full px-1.5 py-1 shadow-deep select-none">
      <button
        onClick={onTodayClick}
        className="text-[12px] font-medium px-3 py-1.5 rounded-full text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
      >
        Today
      </button>
      <div className="w-px h-4 bg-border-subtle mx-0.5" />
      {SCALES.map((item) => (
        <button
          key={item.key}
          onClick={() => onScaleChange(item.key)}
          className={clsx(
            'text-[12px] font-medium px-3 py-1.5 rounded-full transition-all duration-150',
            scale === item.key
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
