import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

type SortDirection = 'ASC' | 'DESC'

type SortableHeaderProps = {
  label: ReactNode
  active: boolean
  direction: SortDirection
  onClick: () => void
  className?: string | undefined
  mode?: 'cell' | 'button'
  showInactiveIcon?: boolean
}

export default function SortableHeader({
  label,
  active,
  direction,
  onClick,
  className,
  mode = 'cell',
  showInactiveIcon = true,
}: SortableHeaderProps) {
  const icon = active
    ? direction === 'DESC'
      ? <ArrowDown className="w-3 h-3" strokeWidth={2} />
      : <ArrowUp className="w-3 h-3" strokeWidth={2} />
    : showInactiveIcon
      ? <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" strokeWidth={1.75} />
      : null

  const content = (
    <span className="inline-flex items-center gap-1">
      {label}
      {icon && (
        <span className={clsx('transition-opacity', active ? 'text-accent' : 'text-text-muted')}>
          {icon}
        </span>
      )}
    </span>
  )

  if (mode === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          'flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition-colors',
          active ? 'text-accent' : 'text-text-muted hover:text-text-secondary',
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <th
      className={clsx(
        'text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3 cursor-pointer select-none group transition-colors hover:text-text-secondary',
        className,
      )}
      onClick={onClick}
    >
      {content}
    </th>
  )
}
