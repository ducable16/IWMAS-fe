import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { notificationService } from '../services/notificationService'
import {
  markAllNotificationsReadInCache,
  markNotificationReadInCache,
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_COUNT_QUERY_KEY,
  UNREAD_NOTIFICATIONS_QUERY_KEY,
} from '../utils/notificationCache'
import type { ApiError, Id } from '@/types'

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

/** Section 8.3 GET /api/notifications/unread/count - fallback polling for bell badge */
export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: async () => {
      const res = await notificationService.getUnreadCount()
      return (typeof res.data === 'object' && res.data && 'count' in res.data
        ? Number(res.data.count)
        : Number(res.data ?? 0))
    },
    refetchInterval: 30_000,
    staleTime: 0,
  })
}

/** Section 8.1 GET /api/notifications - all notifications, newest first */
export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await notificationService.getAll()
      return Array.isArray(res.data) ? res.data : []
    },
    enabled,
    staleTime: 15_000,
  })
}

/** Section 8.2 GET /api/notifications/unread */
export function useUnreadNotifications(enabled = true) {
  return useQuery({
    queryKey: UNREAD_NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await notificationService.getUnread()
      return Array.isArray(res.data) ? res.data : []
    },
    enabled,
    staleTime: 15_000,
  })
}

/** Section 8.4 PATCH /api/notifications/:id/read */
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => notificationService.markAsRead(id),
    onSuccess: (res, id) => {
      markNotificationReadInCache(queryClient, id, res.data)
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to mark as read')),
  })
}

/** Section 8.5 PATCH /api/notifications/read-all */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      markAllNotificationsReadInCache(queryClient)
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to mark all as read')),
  })
}
