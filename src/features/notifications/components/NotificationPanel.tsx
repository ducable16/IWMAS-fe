import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import { useNotifications, useMarkAllAsRead } from '../hooks/useNotifications'
import NotificationItem from './NotificationItem'

type NotificationPanelProps = {
  onClose: () => void
}

function Skeleton() {
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-bg-subtle animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 rounded bg-bg-subtle animate-pulse" />
        <div className="h-2.5 w-full rounded bg-bg-subtle animate-pulse" />
        <div className="h-2 w-1/4 rounded bg-bg-subtle animate-pulse" />
      </div>
    </div>
  )
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data: notifications = [], isLoading } = useNotifications()
  const { mutate: markAll, isPending: markingAll } = useMarkAllAsRead()

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const preview = notifications.slice(0, 8)

  const handleMarkAll = () => markAll()

  return (
    <div
      className="flex flex-col bg-bg-surface border border-border rounded-lg overflow-hidden"
      style={{ width: 360, boxShadow: 'var(--shadow-deep)' }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[11px] font-medium bg-accent text-white rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={unreadCount === 0 || markingAll}
          className="flex items-center gap-1 text-[11.5px] text-text-muted hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Mark all as read"
        >
          <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
          Mark all as read
        </button>
      </div>

      {/* list */}
      <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
        {isLoading ? (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : preview.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[12.5px] text-text-muted">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {preview.map((n) => (
              <NotificationItem key={n.id} notification={n} compact onNavigate={onClose} />
            ))}
          </div>
        )}
      </div>

      {/* footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border-subtle px-4 py-2.5">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-[12px] text-accent hover:text-accent-hover transition-colors font-medium"
          >
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  )
}
