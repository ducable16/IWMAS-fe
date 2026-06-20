import type { Id } from './api'

// ── §8 NotificationResponse ───────────────────────────────────────────────────
export interface Notification {
  id: Id
  /** §8 NotificationType: TASK_ASSIGNED | TASK_STATUS_CHANGED | TASK_OVERDUE |
   *  DEADLINE_REMINDER | COMMENT_MENTION | PROJECT_ADDED | OVERLOAD_WARNING */
  type?: string
  title?: string
  content?: string
  referenceType?: 'TASK' | 'PROJECT' | 'WORKLOAD' | string | null
  referenceId?: Id | null
  isRead?: boolean
  readAt?: string | null   // ISO 8601, null if unread
  createdAt?: string       // ISO 8601
}
