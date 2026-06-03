import clsx from 'clsx'
import type { SprintFieldProps } from './editorTypes'

export function SprintField({
  value,
  canEdit,
  editingField,
  setEditingField,
  save,
}: SprintFieldProps) {
  if (editingField === 'sprint') {
    return (
      <input
        type="text"
        autoFocus
        defaultValue={value || ''}
        onBlur={(e) => {
          save({ sprint: e.target.value.trim() || null })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setEditingField(null)
        }}
        placeholder="e.g. Sprint 1"
        className="w-full text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1 focus:outline-none focus:border-border-strong"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={canEdit ? () => setEditingField('sprint') : undefined}
      className={clsx(
        'rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px] text-text-secondary',
        canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
      )}
    >
      {value || 'None'}
    </button>
  )
}
