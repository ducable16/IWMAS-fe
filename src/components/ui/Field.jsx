import { Lock, AlertCircle } from 'lucide-react'

/**
 * Shared Field wrapper — dùng cho mọi form/popup trong hệ thống.
 *
 * Props:
 *   label      — string, bắt buộc
 *   id         — string, liên kết htmlFor ↔ input id
 *   required   — bool, hiển thị dấu * đỏ bên cạnh label
 *   readOnly   — bool, hiển thị icon 🔒 bên cạnh label để báo không sửa được
 *   hint       — string, text nhỏ bên phải label (VD: "Contact admin to change")
 *   error      — string | null, message lỗi hiển thị dưới input
 *   children   — input/select/div con
 */
export default function Field({ label, id, required, readOnly, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      {/* Label row */}
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

      {/* Input slot */}
      {children}

      {/* Error message */}
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
