import clsx from 'clsx'
import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  error?: ReactNode | undefined
  required?: boolean
  children: ReactNode
}

type EffortFieldProps = {
  effort: string | number
  effortError?: ReactNode | undefined
  onEffortChange: (effort: string) => void
}

type DateNoteFieldsProps = {
  joinDate: string
  note: string
  joinDateReadOnly?: boolean
  onJoinDateChange: (value: string) => void
  onNoteChange: (value: string) => void
}

export function Field({ label, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-text-secondary mb-1">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-danger mt-0.5">{error}</p>}
    </div>
  )
}

export function EffortField({
  effort,
  effortError,
  onEffortChange,
}: EffortFieldProps) {
  return (
    <Field label="Effort (%)" required error={effortError}>
      <input
        type="number"
        min="0"
        max="100"
        value={effort}
        onChange={(e) => onEffortChange(e.target.value)}
        className={clsx(
          'input-field w-full text-[13px]',
          effortError && 'border-danger focus:border-danger',
        )}
      />
    </Field>
  )
}

export function DateNoteFields({
  joinDate,
  note,
  joinDateReadOnly = false,
  onJoinDateChange,
  onNoteChange,
}: DateNoteFieldsProps) {
  return (
    <>
      <Field label="Join Date">
        <input
          type="date"
          value={joinDate}
          onChange={(e) => onJoinDateChange(e.target.value)}
          readOnly={joinDateReadOnly}
          tabIndex={joinDateReadOnly ? -1 : undefined}
          className={joinDateReadOnly ? 'input-readonly text-[13px]' : 'input-field w-full text-[13px]'}
        />
      </Field>

      <Field label="Note">
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="E.g., responsibilities, role details..."
          rows={2}
          className="input-field w-full text-[13px] resize-none leading-relaxed"
        />
      </Field>
    </>
  )
}
