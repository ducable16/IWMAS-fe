import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import type { Notification } from '@/types'

const DEFAULT_WS_URL = 'ws://localhost:9090/ws'
const WS_URL = import.meta.env.VITE_WS_URL || DEFAULT_WS_URL
const NOTIFICATION_DESTINATION = '/user/queue/notifications'

let client: Client | null = null
let subscription: StompSubscription | null = null

export interface ConnectNotificationSocketOptions {
  accessToken: string
  onNotification: (notification: Notification) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (err: unknown) => void
}

export function connectNotificationSocket(opts: ConnectNotificationSocketOptions): void {
  if (client) {
    disconnectNotificationSocket()
  }

  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${opts.accessToken}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      subscription = client?.subscribe(NOTIFICATION_DESTINATION, (msg: IMessage) => {
        try {
          const payload = JSON.parse(msg.body) as Notification
          opts.onNotification(payload)
        } catch (err) {
          console.error('[notifications] failed to parse websocket payload', err)
          opts.onError?.(err)
        }
      }) ?? null
      opts.onConnect?.()
    },

    onStompError: (frame) => {
      console.error('[notifications] STOMP error', frame.headers.message, frame.body)
      opts.onError?.(frame)
    },

    onWebSocketError: (event) => {
      console.error('[notifications] websocket transport error', event)
      opts.onError?.(event)
    },

    onWebSocketClose: () => {
      opts.onDisconnect?.()
    },
  })

  client.activate()
}

export function disconnectNotificationSocket(): void {
  try {
    subscription?.unsubscribe()
  } catch {
    // Ignore unsubscribe failures during teardown.
  }
  subscription = null

  if (client) {
    void client.deactivate()
    client = null
  }
}

export function isNotificationSocketActive(): boolean {
  return Boolean(client?.active)
}
