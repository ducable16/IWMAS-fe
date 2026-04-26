import { User, Building2, Shield, Bell } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/features/auth/store/authStore'
import { userService } from '@/features/members/services/memberService'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'

const SECTIONS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'workspace',     label: 'Workspace',      icon: Building2 },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
]

const DEFAULT_NOTIFICATIONS = [
  { id: 'burnout',      label: 'Burnout alerts',        desc: 'When a member exceeds workload threshold',        enabled: true },
  { id: 'sprint_risk',  label: 'Sprint risk warnings',  desc: 'When AI detects sprint deadline risk',            enabled: true },
  { id: 'task_assign',  label: 'Task assignment',       desc: 'When AI suggests or assigns tasks',              enabled: true },
  { id: 'daily_digest', label: 'Daily digest',          desc: 'Daily summary of team workload',                 enabled: false },
]

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!enabled)}
      className={clsx('toggle', enabled ? 'toggle-on' : 'toggle-off')}
      aria-pressed={enabled}
    >
      <span className={clsx('toggle-thumb', enabled ? 'toggle-thumb-on' : 'toggle-thumb-off')} />
    </button>
  )
}

/* ── Profile Section ──────────────────────────────────────── */
function ProfileSection({ user, updateUser }) {
  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim())  next.name  = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }
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

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-xl font-semibold text-white">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <button type="button" className="btn-secondary">Change avatar</button>
          <p className="text-[11.5px] text-text-muted mt-1.5">JPG, PNG, max 2MB</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" id="ps-name" required error={errors.name}>
          <input
            id="ps-name"
            name="name"
            value={form.name}
            onChange={set('name')}
            placeholder="Nguyen Van A"
            className={errors.name ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <Field label="Email" id="ps-email" required error={errors.email}>
          <input
            id="ps-email"
            name="email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@company.com"
            className={errors.email ? 'input-field-error' : 'input-field'}
          />
        </Field>

        {/* Role — read-only */}
        <Field label="Role" readOnly hint="Assigned by admin">
          <div className="input-readonly">{user?.role || 'Project Manager'}</div>
        </Field>

        {/* Timezone — select */}
        <SelectField label="Timezone" id="ps-timezone">
          <option>UTC+7 (Ho Chi Minh City)</option>
          <option>UTC+0 (London)</option>
          <option>UTC-5 (New York)</option>
        </SelectField>
      </div>

      <div className="flex justify-end pt-2 border-t border-border-subtle">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

/* ── Security Section ─────────────────────────────────────── */
function SecuritySection() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.current)           next.current  = 'Current password is required.'
    if (form.next.length < 6)    next.next     = 'New password must be at least 6 characters.'
    if (form.next !== form.confirm) next.confirm = 'Passwords do not match.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }
    setSaving(true)
    try {
      await userService.changePassword({ currentPassword: form.current, newPassword: form.next })
      toast.success('Password updated')
      setForm({ current: '', next: '', confirm: '' })
      setErrors({})
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <h3 className="section-title text-[15px]">Security</h3>

      <Field label="Current password" id="sec-current" error={errors.current}>
        <input
          id="sec-current"
          name="current"
          type="password"
          placeholder="••••••••"
          value={form.current}
          onChange={set('current')}
          className={errors.current ? 'input-field-error' : 'input-field'}
        />
      </Field>

      <Field label="New password" id="sec-next" error={errors.next}>
        <input
          id="sec-next"
          name="next"
          type="password"
          placeholder="••••••••"
          value={form.next}
          onChange={set('next')}
          className={errors.next ? 'input-field-error' : 'input-field'}
        />
      </Field>

      <Field label="Confirm password" id="sec-confirm" error={errors.confirm}>
        <input
          id="sec-confirm"
          name="confirm"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={set('confirm')}
          className={errors.confirm ? 'input-field-error' : 'input-field'}
        />
      </Field>

      <div className="pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  )
}

/* ── Notifications Section ────────────────────────────────── */
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

/* ── Main Page ────────────────────────────────────────────── */
export default function SettingsPage() {
  const [active, setActive] = useState('profile')
  const user       = useAuthStore((s) => s.user)
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

              <Field label="Workspace name" id="ws-name">
                <input
                  id="ws-name"
                  defaultValue="ACME Engineering"
                  className="input-field"
                />
              </Field>

              <Field
                label="Burnout threshold"
                id="ws-threshold"
                hint="Alert when workload score exceeds this value (0–100)"
              >
                <input
                  id="ws-threshold"
                  type="number"
                  defaultValue="80"
                  min="50"
                  max="100"
                  className="input-field w-32"
                />
              </Field>

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

          {active === 'security'      && <SecuritySection />}
          {active === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  )
}
