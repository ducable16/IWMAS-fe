import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { notificationService } from '../services/notificationService'
import type { ApiError, Id } from '@/types'

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

/** §8.3 GET /api/notifications/unread/count — polls every 30s for bell badge */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
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

/** §8.1 GET /api/notifications — all notifications, newest first */
export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationService.getAll()
      return Array.isArray(res.data) ? res.data : []
    },
    enabled,
    staleTime: 15_000,
  })
}

/** §8.2 GET /api/notifications/unread */
export function useUnreadNotifications(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const res = await notificationService.getUnread()
      return Array.isArray(res.data) ? res.data : []
    },
    enabled,
    staleTime: 15_000,
  })
}

/** §8.4 PATCH /api/notifications/:id/read */
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to mark as read')),
  })
}

/** §8.5 PATCH /api/notifications/read-all */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to mark all as read')),
  })
}
