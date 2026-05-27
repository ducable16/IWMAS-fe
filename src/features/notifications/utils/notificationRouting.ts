import type { Id } from '@/types'

export function resolveNotificationRoute(referenceType?: string | null, referenceId?: Id | null) {
  if (referenceType === 'TASK' && referenceId != null) return `/tasks/${referenceId}`
  if (referenceType === 'PROJECT' && referenceId != null) return `/projects/${referenceId}`
  if (referenceType === 'WORKLOAD') return '/workforce'
  return '/notifications'
}
