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
    <div className="shrink-0 flex items-center justify-end gap-2 border-b border-border-subtle bg-bg-surface px-3 py-2 overflow-x-auto select-none">
      <button
        type="button"
        onClick={onTodayClick}
        className="shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-md border border-border text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
      >
        Today
      </button>
      <div className="shrink-0 flex items-center gap-0.5 rounded-md bg-bg-subtle p-0.5 border border-border-subtle">
        {SCALES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onScaleChange(item.key)}
            className={clsx(
              'text-[12px] font-medium px-3 py-1 rounded transition-colors',
              scale === item.key
                ? 'bg-bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
