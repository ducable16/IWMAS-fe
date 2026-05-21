import { LEFT_W } from '@/features/tasks/utils/timeline'

type TimelineFooterProps = {
  datedCount: number
  totalCount: number
  timelineW: number
}

export default function TimelineFooter({
  datedCount,
  totalCount,
  timelineW,
}: TimelineFooterProps) {
  if (totalCount === 0) return null

  return (
    <div
      className="sticky left-0 flex items-center px-4 py-2 border-t border-border-subtle bg-bg-canvas relative z-20"
      style={{ width: LEFT_W + timelineW }}
    >
      <span className="text-[11.5px] text-text-muted">
        {datedCount} of {totalCount} tasks have date ranges
        {datedCount < totalCount && (
          <span className="ml-1 text-text-muted/70">
            {' - '}
            {totalCount - datedCount} without dates (no bar shown)
          </span>
        )}
      </span>
    </div>
  )
}
