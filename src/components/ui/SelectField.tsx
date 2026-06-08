import { ChevronDown } from 'lucide-react'
import Field from './Field'
import clsx from 'clsx'
import type { ReactNode, SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode
  id?: string | undefined
  required?: boolean
  hint?: ReactNode | undefined
  error?: ReactNode | undefined
  children: ReactNode
}

export default function SelectField({
  label,
  id,
  required = false,
  hint,
  error,
  children,
  className,
  ...rest
}: SelectFieldProps) {
  const control = (
    <div className="relative">
      <select
        id={id}
        className={clsx(error ? 'input-field-error pr-9' : 'input-select', className)}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </div>
  )

  if (!label) return control

  return (
    <Field
      label={label}
      id={id}
      required={required}
      hint={hint}
      error={error}
    >
      {control}
    </Field>
  )
}
