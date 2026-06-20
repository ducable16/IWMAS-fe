import { useCallback, useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_META,
} from '@/constants/enums'
import {
  FilterDivider,
  FilterDrawerFooter,
  FilterDrawerHeader,
  FilterSectionLabel,
  FilterToggleChip,
  PageSizeSelector,
} from '@/components/ui/FilterControls'
import SearchableFilterSelect from '@/components/ui/SearchableFilterSelect'
import type { FilterSelectOption } from '@/components/ui/SearchableFilterSelect'
import {
  getActiveProjectFilterCount,
  PROJECT_SORT_FIELDS,
} from '../projectsPageConfig'
import type {
  ProjectFilterChange,
  ProjectFilterParams,
  ProjectSortDirection,
} from '../projectsPageConfig'
import type { Id, MemberView } from '@/types'
import type { ProjectStatus } from '@/constants/enums'

type ProjectFilterDrawerProps = {
  open: boolean
  onClose: () => void
  filters: ProjectFilterParams
  onChange: ProjectFilterChange
  onReset: () => void
  users?: MemberView[]
}

type DateRangeSectionProps = {
  label: string
  fromLabel: string
  toLabel: string
  fromValue: string | null
  toValue: string | null
  onFromChange: (value: string | null) => void
  onToChange: (value: string | null) => void
}

function toManagerOptions(users: MemberView[]): FilterSelectOption[] {
  return users
    .filter((user) => user.role === 'PROJECT_MANAGER')
    .map((user) => ({
      id: user.id,
      label: user.fullName || `#${user.id}`,
    }))
}

function DateRangeSection({
  label,
  fromLabel,
  toLabel,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: DateRangeSectionProps) {
  return (
    <div>
      <FilterSectionLabel>{label}</FilterSectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-text-muted mb-1">{fromLabel}</label>
          <input
            type="date"
            value={fromValue || ''}
            onChange={(e) => onFromChange(e.target.value || null)}
            className="input-field w-full text-[12.5px]"
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted mb-1">{toLabel}</label>
          <input
            type="date"
            value={toValue || ''}
            onChange={(e) => onToChange(e.target.value || null)}
            className="input-field w-full text-[12.5px]"
          />
        </div>
      </div>
    </div>
  )
}

export default function ProjectFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  users = [],
}: ProjectFilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const managerOptions = useMemo(() => toManagerOptions(users), [users])
  const activeCount = useMemo(() => getActiveProjectFilterCount(filters), [filters])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (open) drawerRef.current?.focus()
  }, [open])

  const toggleStatus = useCallback((status: ProjectStatus) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((item) => item !== status)
      : [...filters.statuses, status]
    onChange('statuses', next)
  }, [filters.statuses, onChange])

  const selectManager = useCallback((id: Id | null) => onChange('managerId', id), [onChange])

  return (
    <>
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      <div
        ref={drawerRef}
        tabIndex={-1}
        className={clsx(
          'fixed top-0 right-0 h-full w-[380px] max-w-[95vw] bg-bg-surface border-l border-border z-40',
          'flex flex-col transition-transform duration-300 ease-out outline-none',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <FilterDrawerHeader activeCount={activeCount} onReset={onReset} onClose={onClose} />

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div>
            <FilterSectionLabel>Status</FilterSectionLabel>
            <div className="flex flex-wrap gap-2">
              {PROJECT_STATUSES.map((status) => {
                const meta = PROJECT_STATUS_META[status]
                return (
                  <FilterToggleChip
                    key={status}
                    active={filters.statuses.includes(status)}
                    onClick={() => toggleStatus(status)}
                    colorCls={meta.color}
                  >
                    {meta.label}
                  </FilterToggleChip>
                )
              })}
            </div>
          </div>

          <FilterDivider />

          <div>
            <FilterSectionLabel>Manager</FilterSectionLabel>
            {managerOptions.length === 0 ? (
              <p className="text-[12px] text-text-muted italic">No managers available</p>
            ) : (
              <SearchableFilterSelect
                selectedId={filters.managerId}
                options={managerOptions}
                placeholder="Search manager by name..."
                noResultsText="No managers found"
                onChange={selectManager}
              />
            )}
          </div>

          <FilterDivider />

          <DateRangeSection
            label="Start Date Range"
            fromLabel="From"
            toLabel="To"
            fromValue={filters.startDateFrom}
            toValue={filters.startDateTo}
            onFromChange={(value) => onChange('startDateFrom', value)}
            onToChange={(value) => onChange('startDateTo', value)}
          />

          <FilterDivider />

          <DateRangeSection
            label="End Date Range"
            fromLabel="From"
            toLabel="To"
            fromValue={filters.endDateFrom}
            toValue={filters.endDateTo}
            onFromChange={(value) => onChange('endDateFrom', value)}
            onToChange={(value) => onChange('endDateTo', value)}
          />

          <FilterDivider />

          <div>
            <FilterSectionLabel>Sort</FilterSectionLabel>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => onChange('sortBy', e.target.value as ProjectFilterParams['sortBy'])}
                className="input-select flex-1 text-[12.5px]"
              >
                {PROJECT_SORT_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <div className="flex rounded-lg border border-border overflow-hidden text-[12px]">
                {(['DESC', 'ASC'] as ProjectSortDirection[]).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => onChange('sortDirection', dir)}
                    className={clsx(
                      'px-3 py-1.5 font-medium transition-colors',
                      filters.sortDirection === dir
                        ? 'bg-accent text-white'
                        : 'bg-bg-surface text-text-secondary hover:bg-bg-hover',
                    )}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <FilterDivider />

          <div>
            <FilterSectionLabel>Rows per page</FilterSectionLabel>
            <PageSizeSelector size={filters.size} onChange={(pageSize) => onChange('size', pageSize)} />
          </div>
        </div>

        <FilterDrawerFooter onReset={onReset} onClose={onClose} />
      </div>
    </>
  )
}
