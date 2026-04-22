import { User, Building2, Shield, Bell } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/features/auth/store/authStore'
import { userService } from '@/features/members/services/memberService'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const DEFAULT_NOTIFICATIONS = [
  { id: 'burnout', label: 'Burnout alerts', desc: 'When a member exceeds workload threshold', enabled: true },
  { id: 'sprint_risk', label: 'Sprint risk warnings', desc: 'When AI detects sprint deadline risk', enabled: true },
  { id: 'task_assign', label: 'Task assignment', desc: 'When AI suggests or assigns tasks', enabled: true },
  { id: 'daily_digest', label: 'Daily digest', desc: 'Daily summary of team workload', enabled: false },
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

function ProfileSection({ user, updateUser }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.email.trim()) { toast.error('Email is required'); return }
    setSaving(true)
    try {
      const res = await userService.updateMe({ name: form.name, email: form.email })
      updateUser(res.data?.data ?? { ...user, ...form })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <h3 className="section-title text-[15px]">Profile settings</h3>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-xl font-semibold text-white">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <button type="button" className="btn-secondary">Change avatar</button>
          <p className="text-[11.5px] text-text-muted mt-1.5">JPG, PNG, max 2MB</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Full name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-base"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input-base"
            type="email"
          />
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
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function SecuritySection() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.current) { toast.error('Current password is required'); return }
    if (form.next.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (form.next !== form.confirm) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await userService.changePassword({ currentPassword: form.current, newPassword: form.next })
      toast.success('Password updated')
      setForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <h3 className="section-title text-[15px]">Security</h3>
      <div>
        <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Current password</label>
        <input
          name="current"
          type="password"
          placeholder="••••••••"
          value={form.current}
          onChange={handleChange}
          className="input-base"
        />
      </div>
      <div>
        <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">New password</label>
        <input
          name="next"
          type="password"
          placeholder="••••••••"
          value={form.next}
          onChange={handleChange}
          className="input-base"
        />
      </div>
      <div>
        <label className="text-[12px] font-medium text-text-secondary mb-1.5 block">Confirm password</label>
        <input
          name="confirm"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={handleChange}
          className="input-base"
        />
      </div>
      <div className="pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  )
}

function NotificationsSection() {
  const [items, setItems] = useState(DEFAULT_NOTIFICATIONS)

  const toggle = (id) =>
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, enabled: !n.enabled } : n))

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

export default function SettingsPage() {
  const [active, setActive] = useState('profile')
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

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
          {active === 'profile' && <ProfileSection user={user} updateUser={updateUser} />}

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

          {active === 'security' && <SecuritySection />}

          {active === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  )
}
