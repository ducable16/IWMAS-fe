import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export interface PaginationProps {
  /** 0-based page index */
  page: number
  totalPages: number
  totalElements?: number
  size?: number
  onChange: (page: number) => void
  /** Label for the items (e.g. "tasks", "members"). Shown as "1–5 of 20 tasks" */
  label?: string
  className?: string
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onChange,
  label,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = size ? page * size + 1 : null
  const to   = size && totalElements ? Math.min((page + 1) * size, totalElements) : null

  // Generate page window (sliding window of 7)
  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const pages: (number | '...')[] = [0]
    if (page > 2) pages.push('...')
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i)
    if (page < totalPages - 3) pages.push('...')
    pages.push(totalPages - 1)
    return pages
  }

  return (
    <div className={clsx('flex items-center justify-between gap-2 pt-2', className)}>
      {/* Summary */}
      <span className="text-[12px] text-text-muted">
        {from && to && totalElements
          ? `${from}-${to} of ${totalElements}${label ? ` ${label}` : ''}`
          : `Page ${page + 1} of ${totalPages}`
        }
      </span>

      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <button
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="p-1.5 rounded-md border border-border text-text-muted hover:border-border-strong hover:text-text-primary disabled:opacity-30 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-[12px] text-text-muted">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={clsx(
                'w-7 h-7 rounded-md text-[12px] font-medium transition-colors',
                p === page
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-bg-hover',
              )}
            >
              {(p as number) + 1}
            </button>
          ),
        )}

        <button
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
          className="p-1.5 rounded-md border border-border text-text-muted hover:border-border-strong hover:text-text-primary disabled:opacity-30 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
