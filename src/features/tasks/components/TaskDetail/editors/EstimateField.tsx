import clsx from 'clsx'
import type { EstimateFieldProps } from './editorTypes'

export function EstimateField({
  value,
  canEdit,
  editingField,
  setEditingField,
  save,
}: EstimateFieldProps) {
  if (editingField === 'estimate') {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          autoFocus
          min="0"
          step="0.5"
          defaultValue={value || ''}
          onBlur={(e) => {
            const nextValue = parseFloat(e.target.value)
            save({ estimatedHours: Number.isNaN(nextValue) ? null : nextValue })
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') setEditingField(null)
          }}
          className="w-20 text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1 focus:outline-none focus:border-border-strong"
        />
        <span className="text-[12px] text-text-muted">hours</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={canEdit ? () => setEditingField('estimate') : undefined}
      className={clsx(
        'rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px] text-text-secondary',
        canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
      )}
    >
      {value ? `${value}h` : '-'}
    </button>
  )
}
