import { AlertTriangle, Loader2, UserCheck, UserX } from 'lucide-react'
import clsx from 'clsx'
import type { MemberView } from '@/types'

type UserDrawerDangerZoneProps = {
  user: MemberView
  isToggling: boolean
  onToggleStatus: () => void
}

export default function UserDrawerDangerZone({
  user,
  isToggling,
  onToggleStatus,
}: UserDrawerDangerZoneProps) {
  return (
    <section>
      <h5 className="text-[11.5px] font-semibold text-danger uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
        Danger Zone
      </h5>
      <div className="card border-danger/20 bg-danger/[0.03] p-4 rounded-lg">
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
      </div>
    </section>
  )
}
