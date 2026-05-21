import { User as UserIcon, Mail, Shield, Phone, Briefcase, type LucideIcon } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import clsx from 'clsx'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  USER_ROLE_LABEL as ROLE_LABELS,
  USER_ROLE_BADGE as ROLE_BADGE,
} from '@/constants/enums'

type InfoRowProps = {
  icon: LucideIcon
  label: string
  value?: ReactNode
}

type UserProfileModalProps = {
  open: boolean
  onClose: () => void
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
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

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const displayName  = user?.fullName || user?.email || 'User'
  const roleLabel    = user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role : 'Member'
  const roleBadgeCls = user?.role ? ROLE_BADGE[user.role as keyof typeof ROLE_BADGE] || 'badge-neutral' : 'badge-neutral'

  const goToSettings = () => {
    onClose()
    navigate('/settings')
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <Modal.Header
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4 text-accent" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary leading-tight">Your profile</h3>
              <p className="text-[11.5px] text-text-muted">Account overview</p>
            </div>
          </div>
        }
        onClose={onClose}
      />

      {/* Avatar + name */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-4">
        <Avatar name={user?.fullName || user?.email} avatarUrl={user?.avatarUrl} size="md" />
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
        <InfoRow icon={Mail}      label="Email"    value={user?.email}    />
        <InfoRow icon={Phone}     label="Phone"    value={user?.phone}    />
        <InfoRow icon={Briefcase} label="Position" value={user?.position} />

        <div className="h-px bg-border-subtle" />
        <div className="flex items-center justify-between pt-1">
          <p className="text-[11.5px] text-text-muted">Update your info in Settings</p>
          <button type="button" onClick={goToSettings} className="btn-secondary text-[12.5px] py-1.5 px-3">
            Go to Settings
          </button>
        </div>
      </div>
    </Modal>
  )
}
