import clsx from 'clsx'
import { WORKLOAD_LEVEL_META } from '@/constants/enums'

/**
 * Pill/chip showing WorkloadLevel string with appropriate color.
 * OVERLOADED gets a subtle pulse animation on the dot.
 */
export default function WorkloadLevelBadge({ level }) {
  const meta = WORKLOAD_LEVEL_META[level] || WORKLOAD_LEVEL_META.AVAILABLE

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-0.5 rounded-full border',
        meta.bg, meta.text, meta.border,
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full shrink-0',
          meta.dot,
          level === 'OVERLOADED' && 'animate-pulse',
        )}
      />
      {meta.label}
    </span>
  )
}
