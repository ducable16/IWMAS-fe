import type { QueryClient } from '@tanstack/react-query'
import type { Id, Notification } from '@/types'

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const
export const UNREAD_NOTIFICATIONS_QUERY_KEY = ['notifications', 'unread'] as const
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'] as const

function sameId(a: Id | undefined, b: Id | undefined) {
  return a !== undefined && b !== undefined && String(a) === String(b)
}

function sortNewestFirst(items: Notification[]) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })
}

function upsertNotification(items: Notification[] | undefined, notification: Notification) {
  const current = items ?? []
  if (current.some((item) => sameId(item.id, notification.id))) {
    return current.map((item) => sameId(item.id, notification.id) ? { ...item, ...notification } : item)
  }
  return sortNewestFirst([notification, ...current])
}

export function hydrateNotificationCache(
  queryClient: QueryClient,
  notifications: Notification[],
  unreadCount: number,
) {
  queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, notifications)
  queryClient.setQueryData(UNREAD_NOTIFICATIONS_QUERY_KEY, notifications.filter((item) => !item.isRead))
  queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, unreadCount)
}

export function prependNotificationToCache(queryClient: QueryClient, notification: Notification) {
  const allNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY)
  const alreadyKnown = allNotifications?.some((item) => sameId(item.id, notification.id)) ?? false

  queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
    upsertNotification(old, notification),
  )

  if (!notification.isRead) {
    queryClient.setQueryData<Notification[]>(UNREAD_NOTIFICATIONS_QUERY_KEY, (old) =>
      upsertNotification(old, notification),
    )

    if (!alreadyKnown) {
      queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, (old) => (old ?? 0) + 1)
    }
  }
}

export function markNotificationReadInCache(
  queryClient: QueryClient,
  id: Id,
  updated?: Notification | null,
) {
  const now = new Date().toISOString()
  const allNotifications = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY) ?? []
  const unreadNotifications = queryClient.getQueryData<Notification[]>(UNREAD_NOTIFICATIONS_QUERY_KEY) ?? []
  const wasUnread = [...allNotifications, ...unreadNotifications].some(
    (item) => sameId(item.id, id) && !item.isRead,
  )

  const mark = (item: Notification): Notification =>
    sameId(item.id, id)
      ? {
          ...item,
          ...updated,
          isRead: true,
          readAt: updated?.readAt ?? item.readAt ?? now,
        }
      : item

  queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
    old ? old.map(mark) : old,
  )
  queryClient.setQueryData<Notification[]>(UNREAD_NOTIFICATIONS_QUERY_KEY, (old) =>
    old ? old.filter((item) => !sameId(item.id, id)) : old,
  )

  if (wasUnread) {
    queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, (old) => Math.max(0, (old ?? 0) - 1))
  }
}

export function markAllNotificationsReadInCache(queryClient: QueryClient) {
  const now = new Date().toISOString()
  queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
    old?.map((item) => ({
      ...item,
      isRead: true,
      readAt: item.readAt ?? now,
    })),
  )
  queryClient.setQueryData<Notification[]>(UNREAD_NOTIFICATIONS_QUERY_KEY, [])
  queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, 0)
}
