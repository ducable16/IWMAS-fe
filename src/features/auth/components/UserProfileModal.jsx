import { X, User as UserIcon, Mail, Shield, Phone, Briefcase } from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNavigate } from 'react-router-dom'
import {
  USER_ROLE_LABEL as ROLE_LABELS,
  USER_ROLE_BADGE as ROLE_BADGE,
} from '@/constants/enums'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-bg-subtle flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-text-muted mb-0.5">{label}</p>
        <p className="text-[13px] text-text-primary font-medium truncate">
          {value || <span className="text-text-muted font-normal">—</span>}
        </p>
      </div>
    </div>
  )
}

export default function UserProfileModal({ open, onClose }) {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  if (!open) return null

  const displayName  = user?.fullName || user?.name || 'User'
  const initials     = displayName[0]?.toUpperCase() || 'U'
  const roleLabel    = ROLE_LABELS[user?.role] || user?.role || 'Member'
  const roleBadgeCls = ROLE_BADGE[user?.role]  || 'badge-neutral'

  const goToSettings = () => {
    onClose()
    navigate('/settings')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4 text-accent" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary leading-tight">Your profile</h3>
              <p className="text-[11.5px] text-text-muted">Account overview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-bg-subtle"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-14 h-14 rounded-2xl object-cover border border-border-subtle shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-xl font-semibold text-white shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-text-primary truncate">{displayName}</p>
            <span className={clsx('badge mt-1', roleBadgeCls)}>
              <Shield className="w-3 h-3" strokeWidth={1.75} />
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-5 pb-5 space-y-3">
          <div className="h-px bg-border-subtle" />
          <InfoRow icon={Mail}     label="Email"    value={user?.email}    />
          <InfoRow icon={Phone}    label="Phone"    value={user?.phone}    />
          <InfoRow icon={Briefcase} label="Position" value={user?.position} />

          {/* Go to Settings */}
          <div className="h-px bg-border-subtle" />
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11.5px] text-text-muted">
              Update your info in Settings
            </p>
            <button
              type="button"
              onClick={goToSettings}
              className="btn-secondary text-[12.5px] py-1.5 px-3"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
