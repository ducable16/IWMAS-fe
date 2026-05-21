import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface SectionBlockProps {
  title: ReactNode
  count?: ReactNode
  actions?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

export function SectionBlock({
  title,
  count,
  actions,
  defaultOpen = true,
  children,
}: SectionBlockProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-text-muted shrink-0 transition-transform',
              !open && '-rotate-90',
            )}
            strokeWidth={1.75}
          />
          <span className="text-[14px] font-semibold text-text-primary">{title}</span>
          {count != null && (
            <span className="text-[11px] font-semibold bg-bg-subtle text-text-muted rounded px-1.5 py-0.5 tabular-nums">
              {count}
            </span>
          )}
        </button>
        {actions && (
          <div className="flex items-center gap-1 shrink-0 ml-auto">{actions}</div>
        )}
      </div>
      {open && <div className="pl-5">{children}</div>}
    </div>
  )
}
