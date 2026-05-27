import api from '@/lib/axios'
import type { Id, Notification } from '@/types'

export const notificationService = {
  getAll:         () => api.get<Notification[]>('/notifications'),
  getUnread:      () => api.get<Notification[]>('/notifications/unread'),
  /** §8.3 — use for badge polling; recommended interval 30 s */
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread/count'),
  markAsRead:     (id: Id) => api.patch<Notification>(`/notifications/${id}/read`),
  /** §8.5 — returns 204 No Content */
  markAllAsRead:  () => api.patch('/notifications/read-all'),
}
