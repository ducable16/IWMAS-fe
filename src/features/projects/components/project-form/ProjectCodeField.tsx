import { Lock, Wand2 } from 'lucide-react'
import clsx from 'clsx'
import type { ChangeEvent } from 'react'

type ProjectCodeFieldProps = {
  value: string
  isEdit: boolean
  isSuggestingCode: boolean
  error?: string | null | undefined
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function ProjectCodeField({
  value,
  isEdit,
  isSuggestingCode,
  error,
  onChange,
}: ProjectCodeFieldProps) {
  return (
    <div>
      <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
        Project Code
      </label>

      {isEdit ? (
        <div className="relative">
          <input
            value={value}
            readOnly
            tabIndex={-1}
            className="input-field w-full text-[12.5px] bg-bg-subtle/60 text-text-muted cursor-not-allowed pr-7"
          />
          <Lock className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>
      ) : (
        <div className="relative">
          <input
            value={value}
            onChange={onChange}
            placeholder="e.g. RTP (optional)"
            className={clsx(
              'input-field w-full text-[12.5px]',
              error && 'input-field-error',
              isSuggestingCode && 'pr-7',
            )}
          />
          {isSuggestingCode && (
            <Wand2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-accent animate-pulse pointer-events-none" />
          )}
        </div>
      )}

      {isEdit && (
        <p className="text-[10.5px] text-text-muted mt-0.5">
          Code cannot be changed after creation
        </p>
      )}
      {error && (
        <p className="text-[11px] text-danger mt-0.5">{error}</p>
      )}
    </div>
  )
}
