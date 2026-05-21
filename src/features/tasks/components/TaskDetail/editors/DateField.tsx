import { AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import type { DateFieldProps } from './editorTypes'

export function DateField({
  field,
  value,
  canEdit,
  editingField,
  setEditingField,
  save,
  overdue = false,
}: DateFieldProps) {
  if (editingField === field) {
    return (
      <input
        type="date"
        autoFocus
        defaultValue={value || ''}
        onBlur={(e) => save({ [field]: e.target.value || null })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setEditingField(null)
        }}
        className="text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1 focus:outline-none focus:border-border-strong"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={canEdit ? () => setEditingField(field) : undefined}
      className={clsx(
        'flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px]',
        canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
        overdue ? 'text-danger font-medium' : 'text-text-secondary',
      )}
    >
      {overdue && <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />}
      {value || '-'}
    </button>
  )
}
