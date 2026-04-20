import { User, Building2, Shield, Bell } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { useAuthStore } from '@/features/auth/store/authStore'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!enabled)}
      className={clsx('toggle', enabled ? 'toggle-on' : 'toggle-off')}
      aria-pressed={enabled}
    >
      <span
        className={clsx('toggle-thumb', enabled ? 'toggle-thumb-on' : 'toggle-thumb-off')}
      />
    </button>
  )
}

export default function SettingsPage() {
  const [active, setActive] = useState('profile')
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
          Settings
        </h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Manage your account and workspace preferences
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="w-52 shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={clsx('sidebar-link w-full', active === s.id && 'active')}
              >
                <s.icon className="w-4 h-4" strokeWidth={1.75} />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {active === 'profile' && (
            <div className="card p-6 space-y-6">
              <h3 className="section-title text-[15px]">Profile settings</h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-xl font-semibold text-white">
                  {user?.name?.[0] || 'A'}
                </div>
                <div>
                  <button className="btn-secondary">Change avatar</button>
                  <p className="text-[11.5px] text-text-muted mt-1.5">JPG, PNG, max 2MB</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Full name</label>
                  <input defaultValue={user?.name || ''} className="input-base" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Email</label>
                  <input defaultValue={user?.email || ''} className="input-base" type="email" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Role</label>
                  <input defaultValue={user?.role || 'Project Manager'} className="input-base" readOnly />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Timezone</label>
                  <select className="input-base">
                    <option>UTC+7 (Ho Chi Minh City)</option>
                    <option>UTC+0 (London)</option>
                    <option>UTC-5 (New York)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border-subtle">
                <button className="btn-primary">Save changes</button>
              </div>
            </div>
          )}

          {active === 'workspace' && (
            <div className="card p-6 space-y-5">
              <h3 className="section-title text-[15px]">Workspace settings</h3>
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">
                  Workspace name
                </label>
                <input defaultValue="ACME Engineering" className="input-base" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">
                  Burnout threshold
                </label>
                <p className="text-[11.5px] text-text-muted mb-2">
                  Alert when workload score exceeds this value (0–100)
                </p>
                <input type="number" defaultValue="80" min="50" max="100" className="input-base w-32" />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border-subtle">
                <div>
                  <p className="text-[13px] font-medium text-text-primary">AI smart assign</p>
                  <p className="text-[11.5px] text-text-muted mt-0.5">
                    Enable LLM-powered task assignment suggestions
                  </p>
                </div>
                <Toggle enabled={true} />
              </div>
            </div>
          )}

          {active === 'security' && (
            <div className="card p-6 space-y-5">
              <h3 className="section-title text-[15px]">Security</h3>
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">
                  Current password
                </label>
                <input type="password" placeholder="••••••••" className="input-base" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">
                  New password
                </label>
                <input type="password" placeholder="••••••••" className="input-base" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">
                  Confirm password
                </label>
                <input type="password" placeholder="••••••••" className="input-base" />
              </div>
              <div className="pt-2">
                <button className="btn-primary">Update password</button>
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="card p-6">
              <h3 className="section-title text-[15px] mb-2">Notification preferences</h3>
              <div className="divide-y divide-border-subtle">
                {[
                  { label: 'Burnout alerts', desc: 'When a member exceeds workload threshold', enabled: true },
                  { label: 'Sprint risk warnings', desc: 'When AI detects sprint deadline risk', enabled: true },
                  { label: 'Task assignment', desc: 'When AI suggests or assigns tasks', enabled: true },
                  { label: 'Daily digest', desc: 'Daily summary of team workload', enabled: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{n.label}</p>
                      <p className="text-[11.5px] text-text-muted mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle enabled={n.enabled} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
