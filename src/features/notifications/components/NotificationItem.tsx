import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  CheckSquare,
  FolderKanban,
  Activity,
  AlertTriangle,
  Clock,
  UserPlus,
  AtSign,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMarkAsRead } from '../hooks/useNotifications'
import type { Id, Notification } from '@/types'

dayjs.extend(relativeTime)

const TYPE_META: Record<string, { icon: LucideIcon; color: string }> = {
  TASK_ASSIGNED:       { icon: CheckSquare,   color: 'text-accent' },
  TASK_STATUS_CHANGED: { icon: CheckSquare,   color: 'text-text-secondary' },
  TASK_OVERDUE:        { icon: AlertTriangle,  color: 'text-danger' },
  DEADLINE_REMINDER:   { icon: Clock,          color: 'text-warning' },
  COMMENT_MENTION:     { icon: AtSign,         color: 'text-accent' },
  PROJECT_ADDED:       { icon: FolderKanban,   color: 'text-success' },
  OVERLOAD_WARNING:    { icon: TrendingUp,     color: 'text-warning' },
  BURNOUT_ALERT:       { icon: Activity,       color: 'text-danger' },
}

type NotificationItemProps = {
  notification: Notification
  compact?: boolean
  onNavigate?: () => void
}

function resolveRoute(referenceType?: string | null, referenceId?: Id | null) {
  if (referenceType === 'TASK')    return `/tasks/${referenceId}`
  if (referenceType === 'PROJECT') return `/projects/${referenceId}`
  return '/workforce'
}

export default function NotificationItem({ notification, compact = false, onNavigate }: NotificationItemProps) {
  const navigate = useNavigate()
  const { mutate: markAsRead } = useMarkAsRead()

  const { icon: Icon, color } = TYPE_META[notification.type ?? ''] ?? {
    icon: UserPlus,
    color: 'text-text-secondary',
  }

  const handleClick = () => {
    if (!notification.isRead) markAsRead(notification.id)
    const route = resolveRoute(notification.referenceType, notification.referenceId)
    navigate(route)
    onNavigate?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-full text-left flex items-start gap-3 px-4 transition-colors
        hover:bg-bg-hover
        ${compact ? 'py-3' : 'py-4'}
        ${!notification.isRead ? 'bg-accent-subtle/40' : ''}
      `}
    >
      {/* type icon */}
      <div className="shrink-0 mt-0.5 w-7 h-7 rounded-md bg-bg-subtle flex items-center justify-center">
        <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.75} />
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[12.5px] font-medium text-text-primary leading-snug ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {notification.title}
        </p>
        <p className={`text-[11.5px] text-text-secondary mt-0.5 leading-snug ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {notification.content}
        </p>
        <p className="text-[11px] text-text-muted mt-1">
          {dayjs(notification.createdAt).fromNow()}
        </p>
      </div>

      {/* unread dot */}
      {!notification.isRead && (
        <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-accent" />
      )}
    </button>
  )
}
