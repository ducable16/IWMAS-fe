import clsx from 'clsx'
import {
  FilterSectionLabel,
  FilterToggleChip,
  PageSizeSelector,
} from '@/components/ui/FilterControls'
import SearchableFilterSelect from './SearchableFilterSelect'
import type { FilterSelectOption } from './SearchableFilterSelect'
import type { Id, TaskFilterChange, TaskFilters } from '@/types'

export {
  FilterDivider as Divider,
  FilterDrawerFooter as DrawerFooter,
  FilterDrawerHeader as DrawerHeader,
} from '@/components/ui/FilterControls'

type SelectSectionProps = {
  label: string
  selectedId: Id | null
  options: FilterSelectOption[]
  placeholder: string
  emptyText: string
  noResultsText: string
  onChange: (id: Id | null) => void
}

type ChipSectionProps = {
  label: string
  options: readonly string[]
  selected: string[]
  meta: Record<string, { label: string; color?: string }>
  onToggle: (value: string) => void
  getActiveColor?: (meta: { label: string; color?: string }) => string
}

type DueDateRangeSectionProps = {
  filters: TaskFilters
  onChange: TaskFilterChange
}

type SortSectionProps = {
  filters: TaskFilters
  sortFields: Array<{ value: string; label: string }>
  onChange: TaskFilterChange
}

type PageSizeSectionProps = {
  size: number
  onChange: TaskFilterChange
}

export function SelectSection({
  label,
  selectedId,
  options,
  placeholder,
  emptyText,
  noResultsText,
  onChange,
}: SelectSectionProps) {
  return (
    <div>
      <FilterSectionLabel>{label}</FilterSectionLabel>
      {options.length === 0 ? (
        <p className="text-[12px] text-text-muted italic">{emptyText}</p>
      ) : (
        <SearchableFilterSelect
          selectedId={selectedId}
          options={options}
          placeholder={placeholder}
          noResultsText={noResultsText}
          onChange={onChange}
        />
      )}
    </div>
  )
}

export function ChipSection({
  label,
  options,
  selected,
  meta,
  onToggle,
  getActiveColor,
}: ChipSectionProps) {
  return (
    <div>
      <FilterSectionLabel>{label}</FilterSectionLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const itemMeta = meta[option] ?? { label: option }
          const active = selected.includes(option)
          return (
            <FilterToggleChip
              key={option}
              active={active}
              onClick={() => onToggle(option)}
              colorCls={active ? getActiveColor?.(itemMeta) ?? itemMeta.color ?? '' : ''}
            >
              {itemMeta.label}
            </FilterToggleChip>
          )
        })}
      </div>
    </div>
  )
}

export function DueDateRangeSection({ filters, onChange }: DueDateRangeSectionProps) {
  return (
    <div>
      <FilterSectionLabel>Due Date Range</FilterSectionLabel>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-text-muted mb-1">From</label>
          <input
            type="date"
            value={filters.dueDateFrom || ''}
            onChange={(e) => onChange('dueDateFrom', e.target.value || null)}
            className="input-field w-full text-[12.5px]"
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted mb-1">To</label>
          <input
            type="date"
            value={filters.dueDateTo || ''}
            onChange={(e) => onChange('dueDateTo', e.target.value || null)}
            className="input-field w-full text-[12.5px]"
          />
        </div>
      </div>
    </div>
  )
}

export function SortSection({ filters, sortFields, onChange }: SortSectionProps) {
  return (
    <div>
      <FilterSectionLabel>Sort</FilterSectionLabel>
      <div className="flex gap-2">
        <select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => onChange('sortBy', e.target.value)}
          className="input-select flex-1 text-[12.5px]"
        >
          {sortFields.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-border overflow-hidden text-[12px]">
          {(['DESC', 'ASC'] as const).map((dir) => (
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
  )
}

export function PageSizeSection({ size, onChange }: PageSizeSectionProps) {
  return (
    <div>
      <FilterSectionLabel>Rows per page</FilterSectionLabel>
      <PageSizeSelector size={size} onChange={(pageSize) => onChange('size', pageSize)} />
    </div>
  )
}
