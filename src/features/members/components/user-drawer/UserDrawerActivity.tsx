import { Calendar, Clock } from 'lucide-react'
import { fmtDate, fmtRelative } from '@/utils/date'
import type { MemberView } from '@/types'

type UserDrawerActivityProps = {
  user: MemberView
}

export default function UserDrawerActivity({ user }: UserDrawerActivityProps) {
  return (
    <section>
      <h5 className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wider mb-3">
        Activity
      </h5>
      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-[11.5px] text-text-muted">Last active</p>
            <p className="text-[13px] text-text-primary">{fmtRelative(user.lastActive)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
          <div>
            <p className="text-[11.5px] text-text-muted">Member since</p>
            <p className="text-[13px] text-text-primary">{fmtDate(user.createdAt)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
