import { useState } from 'react'
import { AlertTriangle, Eye, EyeOff, KeyRound, Loader2, UserCheck, UserX } from 'lucide-react'
import clsx from 'clsx'
import { useResetUserPassword } from '../../hooks/useResetUserPassword'
import type { MemberView } from '@/types'

type UserDrawerDangerZoneProps = {
  user: MemberView
  isToggling: boolean
  onToggleStatus: () => void
}

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/

export default function UserDrawerDangerZone({
  user,
  isToggling,
  onToggleStatus,
}: UserDrawerDangerZoneProps) {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { mutate: resetPassword, isPending: isResetting } = useResetUserPassword({
    onSuccess: () => {
      setNewPassword('')
      setValidationError('')
      setSuccessMessage('Password reset successfully')
      setTimeout(() => setSuccessMessage(''), 4000)
    },
    onError: () => {
      setValidationError('Failed to reset password. Please try again.')
    },
  })

  const handleReset = () => {
    setValidationError('')
    setSuccessMessage('')

    if (!PASSWORD_REGEX.test(newPassword)) {
      setValidationError('Min 8 characters, must contain both letters and numbers.')
      return
    }

    resetPassword({ id: user.id, newPassword })
  }

  const handlePasswordChange = (value: string) => {
    setNewPassword(value)
    if (validationError) setValidationError('')
    if (successMessage) setSuccessMessage('')
  }

  return (
    <section>
      <h5 className="text-[11.5px] font-semibold text-danger uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
        Danger Zone
      </h5>

      <div className="card border-danger/20 bg-danger/[0.03] p-4 rounded-lg space-y-4">

        {/* ── Activate / Deactivate ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-text-primary">
              {user.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
            </p>
            <p className="text-[11.5px] text-text-muted mt-0.5">
              {user.status === 'ACTIVE'
                ? 'User will lose access to the workspace'
                : 'Restore user access to the workspace'}
            </p>
          </div>
          <button
            onClick={onToggleStatus}
            disabled={isToggling}
            className={clsx(
              'inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-colors',
              user.status === 'ACTIVE'
                ? 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20'
                : 'bg-success/10 text-success hover:bg-success/20 border border-success/20',
            )}
            id="drawer-toggle-status-btn"
          >
            {isToggling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : user.status === 'ACTIVE' ? (
              <UserX className="w-3.5 h-3.5" strokeWidth={1.75} />
            ) : (
              <UserCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>

        <div className="border-t border-danger/10" />

        {/* ── Reset Password ── */}
        <div>
          <div className="flex items-start gap-2 mb-3">
            <KeyRound className="w-3.5 h-3.5 text-danger mt-[1px] shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[13px] font-medium text-text-primary">Reset password</p>
              <p className="text-[11.5px] text-text-muted mt-0.5">
                Set a new password without requiring the user's current password.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            {/* Input */}
            <div className="relative flex-1">
              <input
                id="drawer-reset-password-input"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                placeholder="New password"
                autoComplete="new-password"
                disabled={isResetting}
                className={clsx(
                  'w-full pr-8 pl-3 py-1.5 text-[12.5px] rounded-lg border bg-bg-surface',
                  'placeholder:text-text-placeholder text-text-primary',
                  'focus:outline-none focus:ring-1 transition-colors',
                  validationError
                    ? 'border-danger/50 focus:ring-danger/40'
                    : 'border-border focus:border-accent focus:ring-accent/30',
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} />
                  : <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />}
              </button>
            </div>

            {/* Submit */}
            <button
              id="drawer-reset-password-btn"
              onClick={handleReset}
              disabled={isResetting || !newPassword.trim()}
              className={clsx(
                'shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-medium',
                'px-3 py-1.5 rounded-lg border transition-colors',
                'bg-danger/10 text-danger hover:bg-danger/20 border-danger/20',
                'disabled:opacity-40 disabled:cursor-not-allowed',
              )}
            >
              {isResetting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <KeyRound className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {isResetting ? 'Resetting…' : 'Reset'}
            </button>
          </div>

          {/* Validation error */}
          {validationError && (
            <p className="text-[11.5px] text-danger mt-1.5">{validationError}</p>
          )}

          {/* Success */}
          {successMessage && (
            <p className="text-[11.5px] text-success mt-1.5">✓ {successMessage}</p>
          )}
        </div>

      </div>
    </section>
  )
}
