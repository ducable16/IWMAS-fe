import { RotateCcw, X } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

type FilterSectionLabelProps = {
  children: ReactNode
}

type FilterToggleChipProps = {
  active: boolean
  onClick: () => void
  children: ReactNode
  colorCls?: string | undefined
  className?: string | undefined
}

type FilterDrawerHeaderProps = {
  title?: string | undefined
  activeCount: number
  onReset: () => void
  onClose: () => void
}

type FilterDrawerFooterProps = {
  onReset: () => void
  onClose: () => void
  applyLabel?: string | undefined
}

type PageSizeSelectorProps = {
  size: number
  sizes?: number[] | undefined
  onChange: (size: number) => void
}

export function FilterSectionLabel({ children }: FilterSectionLabelProps) {
  return (
    <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
      {children}
    </label>
  )
}

export function FilterToggleChip({
  active,
  onClick,
  children,
  colorCls = '',
  className,
}: FilterToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-lg border transition-all duration-150 font-medium',
        active
          ? clsx('border-transparent', colorCls || 'bg-accent text-white')
          : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function FilterDivider() {
  return <hr className="border-border-subtle" />
}

export function FilterDrawerHeader({
  title = 'Filters',
  activeCount,
  onReset,
  onClose,
}: FilterDrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[15px] text-text-primary">{title}</span>
        {activeCount > 0 && (
          <span className="bg-accent text-white text-[11px] font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {activeCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[12px] text-text-muted hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-danger/5"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function FilterDrawerFooter({
  onReset,
  onClose,
  applyLabel = 'Apply filters',
}: FilterDrawerFooterProps) {
  return (
    <div className="flex-shrink-0 px-5 py-4 border-t border-border-subtle flex items-center justify-between bg-bg-subtle/50">
      <button type="button" onClick={onReset} className="btn-secondary text-[13px] py-1.5 px-3">
        Reset
      </button>
      <button type="button" onClick={onClose} className="btn-primary text-[13px] py-1.5 px-4">
        {applyLabel}
      </button>
    </div>
  )
}

export function PageSizeSelector({
  size,
  sizes = [10, 20, 50, 100],
  onChange,
}: PageSizeSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {sizes.map((pageSize) => (
        <button
          key={pageSize}
          type="button"
          onClick={() => onChange(pageSize)}
          className={clsx(
            'flex-1 py-1.5 text-[12px] font-medium rounded-lg border transition-colors',
            size === pageSize
              ? 'bg-accent text-white border-accent'
              : 'bg-bg-surface text-text-secondary border-border hover:border-border-strong',
          )}
        >
          {pageSize}
        </button>
      ))}
    </div>
  )
}
