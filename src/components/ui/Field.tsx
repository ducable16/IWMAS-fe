import { Lock, AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

interface FieldProps {
  label: ReactNode
  id?: string | undefined
  required?: boolean
  readOnly?: boolean
  hint?: ReactNode | undefined
  error?: ReactNode | undefined
  children: ReactNode
}

export default function Field({
  label,
  id,
  required = false,
  readOnly = false,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={readOnly ? undefined : id}
          className="text-[12px] font-medium text-text-secondary flex items-center gap-1.5"
        >
          {label}
          {required && (
            <span className="text-danger text-[10px] leading-none">*</span>
          )}
          {readOnly && (
            <Lock
              className="w-3 h-3 text-text-muted"
              strokeWidth={1.75}
              aria-label="Read-only field"
            />
          )}
        </label>

        {hint && (
          <span className="text-[11px] text-text-muted">{hint}</span>
        )}
      </div>

      {children}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-[11.5px] text-danger"
        >
          <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={1.75} />
          {error}
        </p>
      )}
    </div>
  )
}
