import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  maxWidth?: string
  /** Set to true to prevent closing on backdrop click */
  persistent?: boolean
  children: ReactNode
  className?: string
}

export interface ModalHeaderProps {
  title: ReactNode
  onClose: () => void
  subtitle?: ReactNode
}

export interface ModalFooterProps {
  children: ReactNode
  className?: string
}

// ── Modal.Header ─────────────────────────────────────────────────────
export function ModalHeader({ title, onClose, subtitle }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
      <div>
        <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-[12px] text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors -mr-1"
        aria-label="Close"
      >
        <X className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  )
}

// ── Modal.Body ───────────────────────────────────────────────────────
export function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('p-5', className)}>
      {children}
    </div>
  )
}

// ── Modal.Footer ─────────────────────────────────────────────────────
export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={clsx('flex items-center justify-end gap-2 px-5 py-4 border-t border-border-subtle', className)}>
      {children}
    </div>
  )
}

// ── Modal (root) ─────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  maxWidth = 'max-w-[520px]',
  persistent = false,
  children,
  className,
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !persistent) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose, persistent])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
        onClick={persistent ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        className={clsx(
          'relative bg-bg-surface border border-border rounded-2xl shadow-deep w-full animate-fade-in',
          maxWidth,
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {title && <ModalHeader title={title} onClose={onClose} />}
        {children}
      </div>
    </div>
  )
}

// Attach sub-components
Modal.Header = ModalHeader
Modal.Body   = ModalBody
Modal.Footer = ModalFooter
