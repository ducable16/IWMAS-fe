import api from '@/lib/axios'

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
}
