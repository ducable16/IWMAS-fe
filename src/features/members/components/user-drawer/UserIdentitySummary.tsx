import { Mail, Phone, Shield } from 'lucide-react'
import clsx from 'clsx'
import {
  USER_ROLE_BADGE as ROLE_BADGE,
  USER_ROLE_LABEL as ROLE_LABELS,
} from '@/constants/enums'
import type { MemberView } from '@/types'

type UserIdentitySummaryProps = {
  user: MemberView
}

export default function UserIdentitySummary({ user }: UserIdentitySummaryProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/10 flex items-center justify-center text-xl font-semibold text-accent shrink-0">
          {user.fullName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <h4 className="text-[16px] font-semibold text-text-primary truncate">
            {user.fullName}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3 h-3 text-text-muted shrink-0" strokeWidth={1.75} />
            <span className="text-[12.5px] text-text-muted truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3 h-3 text-text-muted shrink-0" strokeWidth={1.75} />
              <span className="text-[12.5px] text-text-muted">{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={clsx(
          'badge',
          user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger',
        )}>
          <span className={clsx(
            'dot',
            user.status === 'ACTIVE' ? 'bg-success' : 'bg-danger',
          )} />
          {user.status === 'ACTIVE' ? 'Active' : 'Disabled'}
        </span>
        <span className={clsx('badge', ROLE_BADGE[user.role as keyof typeof ROLE_BADGE] || 'badge-neutral')}>
          <Shield className="w-3 h-3" strokeWidth={1.75} />
          {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
        </span>
      </div>
    </>
  )
}
