import clsx from 'clsx'
import { PROJECT_ROLES, PROJECT_ROLE_LABEL } from '@/constants/enums'
import type { ReactNode } from 'react'
import type { ProjectRole } from '@/constants/enums'

type FieldProps = {
  label: string
  error?: ReactNode | undefined
  required?: boolean
  children: ReactNode
}

type RoleEffortFieldsProps = {
  role: ProjectRole | string
  effort: string | number
  effortError?: ReactNode | undefined
  onRoleChange: (role: ProjectRole | string) => void
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

export function RoleEffortFields({
  role,
  effort,
  effortError,
  onRoleChange,
  onEffortChange,
}: RoleEffortFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Role" required>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="input-select w-full text-[13px]"
        >
          {PROJECT_ROLES.map((option) => (
            <option key={option} value={option}>
              {PROJECT_ROLE_LABEL[option] || option}
            </option>
          ))}
        </select>
      </Field>

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
    </div>
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
