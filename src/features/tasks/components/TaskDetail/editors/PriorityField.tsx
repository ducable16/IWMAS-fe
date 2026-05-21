import { Check } from 'lucide-react'
import clsx from 'clsx'
import { TASK_PRIORITIES } from '@/constants/enums'
import { PRIORITY_META } from './editorMeta'
import { activeDropdownRef } from './editorTypes'
import type { PriorityFieldProps } from './editorTypes'

export function PriorityField({
  priority,
  canEdit,
  editingField,
  setEditingField,
  dropdownRef,
  save,
}: PriorityFieldProps) {
  const priorityMeta =
    PRIORITY_META[priority as keyof typeof PRIORITY_META] || PRIORITY_META.MEDIUM

  return (
    <div className="relative" ref={activeDropdownRef(editingField === 'priority', dropdownRef)}>
      <button
        type="button"
        onClick={canEdit
          ? () => setEditingField(editingField === 'priority' ? null : 'priority')
          : undefined}
        className={clsx(
          'flex items-center gap-1.5 font-medium rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors w-full text-left',
          canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
        )}
      >
        <span className={priorityMeta.cls}>{priorityMeta.label}</span>
      </button>

      {editingField === 'priority' && (
        <div className="absolute top-full right-0 mt-1.5 z-50 w-[180px] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-1.5 space-y-0.5">
          {TASK_PRIORITIES.map((option) => {
            const meta = PRIORITY_META[option] || { label: option, cls: '' }
            return (
              <button
                key={option}
                type="button"
                onClick={() => save({ priority: option })}
                className={clsx(
                  'flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[12.5px] hover:bg-bg-hover transition-colors text-left',
                  option === priority && 'bg-bg-subtle',
                )}
              >
                <span className={clsx('flex-1', meta.cls)}>{meta.label}</span>
                {option === priority && (
                  <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-accent" strokeWidth={2.5} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
