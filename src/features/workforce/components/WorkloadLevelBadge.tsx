import clsx from 'clsx'
import { WORKLOAD_LEVEL_META } from '@/constants/enums'
import type { WorkloadLevel } from '@/constants/enums'

type WorkloadLevelBadgeProps = {
  level?: WorkloadLevel | string | null | undefined
}

/**
 * Pill/chip showing WorkloadLevel string with appropriate color.
 */
export default function WorkloadLevelBadge({ level }: WorkloadLevelBadgeProps) {
  const meta = level
    ? WORKLOAD_LEVEL_META[level as keyof typeof WORKLOAD_LEVEL_META] || WORKLOAD_LEVEL_META.AVAILABLE
    : WORKLOAD_LEVEL_META.AVAILABLE

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
        )}
      />
      {meta.label}
    </span>
  )
}
