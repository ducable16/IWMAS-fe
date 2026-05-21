import { Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { Modal } from './Modal'
import type { ReactNode } from 'react'

interface ModalFormActionsProps {
  onCancel: () => void
  isPending?: boolean
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  cancelLabel?: ReactNode
  disabled?: boolean
  cancelDisabled?: boolean
  idleIcon?: ReactNode
  submitButtonId?: string
  submitType?: 'button' | 'submit'
  onSubmitClick?: () => void
  submitClassName?: string
}

export default function ModalFormActions({
  onCancel,
  isPending = false,
  submitLabel,
  pendingLabel,
  cancelLabel = 'Cancel',
  disabled = false,
  cancelDisabled = false,
  idleIcon,
  submitButtonId,
  submitType = 'submit',
  onSubmitClick,
  submitClassName,
}: ModalFormActionsProps) {
  return (
    <Modal.Footer>
      <button
        type="button"
        onClick={onCancel}
        disabled={cancelDisabled}
        className="btn-ghost text-[13px]"
      >
        {cancelLabel}
      </button>
      <button
        id={submitButtonId}
        type={submitType}
        onClick={onSubmitClick}
        disabled={disabled || isPending}
        className={clsx(
          'btn-primary text-[13px] gap-1.5 disabled:opacity-50',
          submitClassName,
        )}
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : idleIcon}
        {isPending ? pendingLabel ?? submitLabel : submitLabel}
      </button>
    </Modal.Footer>
  )
}
