import clsx from 'clsx'
import { LOAD_LEVEL_META } from '@/constants/enums'
import type { LoadLevel } from '@/constants/enums'

type LoadLevelBadgeProps = {
  level?: LoadLevel | string | null | undefined
}

/** Dashboard workload-volume badge derived from backlog depth. */
export default function LoadLevelBadge({ level }: LoadLevelBadgeProps) {
  const meta = level
    ? LOAD_LEVEL_META[level as keyof typeof LOAD_LEVEL_META] || LOAD_LEVEL_META.UNDEFINED
    : LOAD_LEVEL_META.UNDEFINED

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-0.5 rounded-full border',
        meta.bg, meta.text, meta.border,
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', meta.dot)} />
      {meta.label}
    </span>
  )
}
