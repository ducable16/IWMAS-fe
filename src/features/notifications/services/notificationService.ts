import api from '@/lib/axios'
import type { Id, Notification } from '@/types'

export const notificationService = {
  getAll: () => api.get<Notification[]>('/notifications'),
  getUnread: () => api.get<Notification[]>('/notifications/unread'),
  getUnreadCount: () => api.get<number | { count: number }>('/notifications/unread/count'),
  markAsRead: (id: Id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
}
