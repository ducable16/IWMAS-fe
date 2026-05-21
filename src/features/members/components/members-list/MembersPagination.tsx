import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

type MembersPaginationProps = {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onChange: (page: number) => void
}

export default function MembersPagination({
  page,
  totalPages,
  totalElements,
  size,
  onChange,
}: MembersPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    const half = 3
    let start = Math.max(0, page - half)
    const end = Math.min(totalPages - 1, start + 6)
    start = Math.max(0, end - 6)
    return start + i
  }).filter((p) => p < totalPages)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle bg-bg-subtle/30">
      <span className="text-[12px] text-text-muted">
        Showing {page * size + 1}-{Math.min((page + 1) * size, totalElements)} of{' '}
        {totalElements} {totalElements === 1 ? 'user' : 'users'}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((pg) => (
          <button
            key={pg}
            onClick={() => onChange(pg)}
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
          onClick={() => onChange(page + 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
