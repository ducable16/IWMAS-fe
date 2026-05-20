import { Bell, AlertTriangle, CheckSquare, MessageSquare, UserPlus, type LucideIcon } from 'lucide-react'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'

const TONE_STYLES = {
  accent: 'text-accent bg-accent-subtle',
  success: 'text-success bg-success-subtle',
  warning: 'text-warning bg-warning-subtle',
  danger: 'text-danger bg-danger-subtle',
  info: 'text-info bg-info-subtle',
}

type Tone = keyof typeof TONE_STYLES

const TYPE_META: Record<string, { tone: Tone; icon: LucideIcon }> = {
  TASK_ASSIGNED: { tone: 'accent', icon: CheckSquare },
  TASK_STATUS_CHANGED: { tone: 'info', icon: CheckSquare },
  TASK_OVERDUE: { tone: 'danger', icon: AlertTriangle },
  DEADLINE_REMINDER: { tone: 'warning', icon: AlertTriangle },
  COMMENT_MENTION: { tone: 'info', icon: MessageSquare },
  PROJECT_ADDED: { tone: 'success', icon: UserPlus },
  OVERLOAD_WARNING: { tone: 'danger', icon: AlertTriangle },
  BURNOUT_ALERT: { tone: 'danger', icon: AlertTriangle },
}

function formatTime(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export default function RecentActivity() {
  const { data: activities, isLoading } = useNotifications(true)
  const list = activities || []

  return (
    <div className="card p-5">
      <h3 className="section-title text-[13px] mb-4">Recent activity</h3>
      {isLoading ? (
        <p className="text-[12.5px] text-text-muted py-4">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-[12.5px] text-text-muted py-4">No recent activity.</p>
      ) : (
        <div className="space-y-0">
          {list.slice(0, 8).map((item) => {
            const meta = TYPE_META[item.type ?? ''] || { tone: 'info', icon: Bell }
            const Icon = meta.icon
            return (
              <div
                key={item.id}
                className="flex gap-3 items-start py-2.5 border-b border-border-subtle last:border-0"
              >
                <div className={`shrink-0 w-7 h-7 rounded-md ${TONE_STYLES[meta.tone]} flex items-center justify-center mt-0.5`}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-text-primary leading-snug">
                    {item.title || item.content}
                  </p>
                  {item.content && (
                    <p className="text-[12px] text-text-muted mt-0.5 truncate">{item.content}</p>
                  )}
                  <p className="text-[11.5px] text-text-muted mt-1">{formatTime(item.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
