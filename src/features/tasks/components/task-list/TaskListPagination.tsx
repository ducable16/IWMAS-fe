import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import type { TaskFilterChange } from '@/types'

type TaskListPaginationProps = {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onChange: TaskFilterChange
}

export default function TaskListPagination({
  page,
  totalPages,
  totalElements,
  size,
  onChange,
}: TaskListPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    const half = 3
    let start = Math.max(0, page - half)
    const end = Math.min(totalPages - 1, start + 6)
    start = Math.max(0, end - 6)
    return start + i
  }).filter((p) => p < totalPages)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-bg-subtle/30">
      <span className="text-[12px] text-text-muted">
        Showing {page * size + 1}-{Math.min((page + 1) * size, totalElements)} of{' '}
        {totalElements}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onChange('page', page - 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((pg) => (
          <button
            key={pg}
            onClick={() => onChange('page', pg)}
            className={clsx(
              'min-w-[28px] h-7 rounded-lg text-[12px] font-medium border transition-colors',
              pg === page
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:border-border-strong',
            )}
          >
            {pg + 1}
          </button>
        ))}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onChange('page', page + 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
