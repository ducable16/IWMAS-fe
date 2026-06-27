import { createElement, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { notificationService } from '../services/notificationService'
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from '../services/notificationSocket'
import {
  hydrateNotificationCache,
  markNotificationReadInCache,
  prependNotificationToCache,
} from '../utils/notificationCache'
import { resolveNotificationRoute } from '../utils/notificationRouting'
import type { Notification } from '@/types'

function NotificationToast({ notification }: { notification: Notification }) {
  return createElement(
    'div',
    { className: 'min-w-[260px] max-w-[360px] text-left' },
    createElement(
      'p',
      { className: 'text-[13px] font-semibold text-text-primary leading-snug line-clamp-2' },
      notification.title || 'New notification',
    ),
    notification.content
      ? createElement(
          'p',
          { className: 'text-[12px] text-text-secondary mt-1 leading-snug line-clamp-2' },
          notification.content,
        )
      : null,
    createElement(
      'p',
      { className: 'text-[11px] text-accent mt-2 font-medium' },
      'Open detail',
    ),
  )
}

export function useNotificationRealtime() {
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !token) {
      disconnectNotificationSocket()
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const listRes = await notificationService.getAll()
        const notifications = Array.isArray(listRes.data) ? listRes.data : []

        if (!cancelled) {
          hydrateNotificationCache(
            queryClient,
            notifications,
            notifications.filter((item) => !item.isRead).length,
          )
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[notifications] REST bootstrap failed', err)
        }
      }
    })()

    connectNotificationSocket({
      accessToken: token,
      onNotification: (notification) => {
        prependNotificationToCache(queryClient, notification)
        toast.custom((t) => createElement(
          'button',
          {
            type: 'button',
            onClick: () => {
              toast.dismiss(t.id)
              if (!notification.isRead) {
                void notificationService.markAsRead(notification.id)
                  .then((res) => markNotificationReadInCache(queryClient, notification.id, res.data))
                  .catch((err) => console.error('[notifications] mark toast notification read failed', err))
              }
              navigate(resolveNotificationRoute(notification.referenceType, notification.referenceId))
            },
            className: `
              pointer-events-auto rounded-xl border border-border bg-bg-surface px-4 py-3
              shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all
              ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
            `,
          },
          createElement(NotificationToast, { notification }),
        ))
      },
      onError: (err) => console.error('[notifications] realtime error', err),
    })

    return () => {
      cancelled = true
      disconnectNotificationSocket()
    }
  }, [isAuthenticated, isInitialized, navigate, queryClient, token])
}
