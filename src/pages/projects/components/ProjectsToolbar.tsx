import { SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'
import SearchInput from '@/components/ui/SearchInput'
import { PROJECT_STATUSES, PROJECT_STATUS_META } from '@/constants/enums'
import type { ProjectFilterChange, ProjectFilterParams } from '../projectsPageConfig'

type ProjectsToolbarProps = {
  filters: ProjectFilterParams
  activeCount: number
  isStale: boolean
  onChange: ProjectFilterChange
  onOpenFilters: () => void
}

export default function ProjectsToolbar({
  filters,
  activeCount,
  isStale,
  onChange,
  onOpenFilters,
}: ProjectsToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={filters.search}
        onChange={(value) => onChange('search', value)}
        placeholder="Search by name or code..."
        className="py-2 min-w-[220px] max-w-[380px] focus-within:border-border-strong focus-within:ring-0 transition-colors"
      />

      <div className="flex gap-1 p-0.5 bg-bg-subtle border border-border-subtle rounded-lg flex-shrink-0">
        <button
          type="button"
          onClick={() => onChange('statuses', [])}
          className={clsx(
            'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap',
            filters.statuses.length === 0
              ? 'bg-bg-surface text-text-primary border border-border-subtle'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          ALL
        </button>
        {PROJECT_STATUSES.map((status) => {
          const meta = PROJECT_STATUS_META[status]
          const active = filters.statuses.length === 1 && filters.statuses[0] === status
          return (
            <button
              key={status}
              type="button"
              onClick={() => onChange('statuses', active ? [] : [status])}
              className={clsx(
                'text-[12px] px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap',
                active
                  ? 'bg-bg-surface text-text-primary border border-border-subtle'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {meta.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        className={clsx(
          'flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-lg border transition-all duration-150 flex-shrink-0',
          activeCount > 0
            ? 'border-accent/60 bg-accent/10 text-accent'
            : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary',
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="bg-accent text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-semibold">
            {activeCount}
          </span>
        )}
      </button>

      {isStale && (
        <span className="text-[11px] text-text-muted animate-pulse flex-shrink-0">
          Updating...
        </span>
      )}
    </div>
  )
}
