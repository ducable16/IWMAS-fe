import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      persistent={isPending}
      maxWidth="max-w-[400px]"
    >
      <Modal.Body className="pt-5 pb-2">
        <div className="flex gap-3">
          {/* Icon */}
          <div className={
            variant === 'danger'
              ? 'w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0'
              : 'w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0'
          }>
            {variant === 'danger'
              ? <Trash2 className="w-4 h-4 text-danger" strokeWidth={1.75} />
              : <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={1.75} />
            }
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[14px] font-semibold text-text-primary leading-snug">{title}</p>
            {description && (
              <p className="text-[12.5px] text-text-muted mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="btn-ghost text-[13px]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={variant === 'danger' ? 'btn-danger text-[13px]' : 'btn-primary text-[13px]'}
        >
          {isPending ? 'Please wait…' : confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  )
}
