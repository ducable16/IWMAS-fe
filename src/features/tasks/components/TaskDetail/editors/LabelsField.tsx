import { X } from 'lucide-react'
import clsx from 'clsx'
import { activeDropdownRef } from './editorTypes'
import type { KeyboardEvent } from 'react'
import type { LabelsFieldProps } from './editorTypes'

export function LabelsField({
  labels,
  labelsDraft,
  setLabelsDraft,
  labelInput,
  setLabelInput,
  canEdit,
  editingField,
  setEditingField,
  dropdownRef,
  saveLabels,
}: LabelsFieldProps) {
  const close = () => {
    setEditingField(null)
    setLabelsDraft(null)
    setLabelInput('')
  }

  const onLabelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = labelInput.trim()
      if (value && labelsDraft && !labelsDraft.includes(value)) {
        setLabelsDraft((prev) => [...(prev ?? []), value])
      }
      setLabelInput('')
    }
    if (e.key === 'Escape') close()
  }

  return (
    <div className="relative min-w-0 max-w-full" ref={activeDropdownRef(editingField === 'labels', dropdownRef)}>
      <button
        type="button"
        onClick={canEdit
          ? () => {
              if (editingField === 'labels') {
                setEditingField(null)
              } else {
                setLabelsDraft([...labels])
                setEditingField('labels')
              }
            }
          : undefined}
        className={clsx(
          'flex min-w-0 max-w-full flex-wrap gap-1 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors w-full text-left',
          canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
        )}
      >
        {labels.length > 0 ? (
          labels.map((label) => (
            <span
              key={label}
              className="max-w-full truncate text-[11px] bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20"
            >
              #{label}
            </span>
          ))
        ) : (
          <span className="text-text-muted text-[13px]">None</span>
        )}
      </button>

      {editingField === 'labels' && labelsDraft !== null && (
        <div className="absolute bottom-full right-0 mb-1.5 z-50 w-[min(240px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-2 space-y-2">
          {labelsDraft.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {labelsDraft.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 text-[11px] bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20"
                >
                  #{label}
                  <button
                    type="button"
                    onClick={() =>
                      setLabelsDraft((prev) => (prev ?? []).filter((item) => item !== label))
                    }
                    className="text-accent/60 hover:text-accent"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            autoFocus
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            placeholder="Add label, Enter to confirm..."
            onKeyDown={onLabelKeyDown}
            className="w-full text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1.5 focus:outline-none focus:border-border-strong"
          />
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle">
            <button
              type="button"
              onClick={close}
              className="text-[11.5px] text-text-muted hover:text-text-primary px-2 py-1 transition-colors"
            >
              Cancel
            </button>
            <button type="button" onClick={saveLabels} className="btn-primary text-[11.5px] px-3 py-1">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
