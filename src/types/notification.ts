import type { Id } from './api'

export interface Notification {
  id: Id
  title?: string
  content?: string
  message?: string
  type?: string
  isRead?: boolean
  read?: boolean
  createdAt?: string
  targetUrl?: string | null
  referenceType?: 'TASK' | 'PROJECT' | string | null
  referenceId?: Id | null
}
