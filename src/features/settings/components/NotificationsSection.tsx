import { useState } from 'react'
import { DEFAULT_NOTIFICATIONS } from '../settingsConfig'
import Toggle from './Toggle'
import type { NotificationPreference } from '../settingsTypes'

export default function NotificationsSection() {
  const [items, setItems] = useState<NotificationPreference[]>(DEFAULT_NOTIFICATIONS)
  const toggle = (id: NotificationPreference['id']) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)))

  return (
    <div className="card p-6">
      <h3 className="section-title text-[15px] mb-2">Notification preferences</h3>
      <div className="divide-y divide-border-subtle">
        {items.map((n) => (
          <div key={n.id} className="flex items-center justify-between py-4">
            <div>
              <p className="text-[13px] font-medium text-text-primary">{n.label}</p>
              <p className="text-[11.5px] text-text-muted mt-0.5">{n.desc}</p>
            </div>
            <Toggle enabled={n.enabled} onChange={() => toggle(n.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
