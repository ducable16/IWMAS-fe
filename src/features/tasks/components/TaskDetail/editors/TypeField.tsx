import { Check } from 'lucide-react'
import clsx from 'clsx'
import { TASK_TYPES, TASK_TYPE_LABEL } from '@/constants/enums'
import { TASK_TYPE_LABEL_BY_KEY } from './editorMeta'
import { activeDropdownRef } from './editorTypes'
import type { TypeFieldProps } from './editorTypes'

export function TypeField({
  type,
  canEdit,
  editingField,
  setEditingField,
  dropdownRef,
  save,
}: TypeFieldProps) {
  return (
    <div className="relative min-w-0 max-w-full" ref={activeDropdownRef(editingField === 'type', dropdownRef)}>
      <button
        type="button"
        onClick={canEdit
          ? () => setEditingField(editingField === 'type' ? null : 'type')
          : undefined}
        className={clsx(
          'rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px] text-text-secondary text-left w-full truncate',
          canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
        )}
      >
        {TASK_TYPE_LABEL_BY_KEY[type ?? ''] || type || '-'}
      </button>

      {editingField === 'type' && (
        <div className="absolute top-full right-0 mt-1.5 z-50 w-[min(180px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-1.5 space-y-0.5">
          {TASK_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => save({ type: option })}
              className={clsx(
                'flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[12.5px] hover:bg-bg-hover transition-colors text-left',
                option === type ? 'bg-bg-subtle text-text-primary' : 'text-text-secondary',
              )}
            >
              <span className="flex-1">{TASK_TYPE_LABEL[option] || option}</span>
              {option === type && (
                <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-accent" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
