import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { useNotifications, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import NotificationItem from '@/features/notifications/components/NotificationItem'

const TABS = [
  { key: 'all',    label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
]

function SkeletonRow() {
  return (
    <div className="px-5 py-4 flex items-start gap-3 border-b border-border-subtle">
      <div className="w-8 h-8 rounded-md bg-bg-subtle animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 rounded bg-bg-subtle animate-pulse" />
        <div className="h-2.5 w-full rounded bg-bg-subtle animate-pulse" />
        <div className="h-2 w-1/5 rounded bg-bg-subtle animate-pulse" />
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [tab, setTab] = useState('all')

  const { data: notifications = [], isLoading } = useNotifications()
  const { mutate: markAll, isPending: markingAll } = useMarkAllAsRead()

  const list = tab === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="text-[12.5px] text-text-muted mt-0.5">
              {unreadCount} chưa đọc
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => markAll()}
          disabled={unreadCount === 0 || markingAll}
          className="btn-secondary flex items-center gap-1.5 text-[12.5px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* tabs */}
      <div className="flex gap-1 mb-4 border-b border-border-subtle">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`
              px-3 pb-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px
              ${tab === t.key
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary'}
            `}
          >
            {t.label}
            {t.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 text-[11px] bg-accent text-white rounded-full px-1.5 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* list */}
      <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-text-muted">
              {tab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {list.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
