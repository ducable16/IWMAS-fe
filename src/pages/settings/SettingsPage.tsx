import { Building2, Shield, Bell, User as UserIcon, Loader2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/features/auth/store/authStore'
import { userService } from '@/features/members/services/memberService'
import { useUploadAvatar } from '@/features/members/hooks/useMembers'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import type { ChangeEvent, FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { ApiError, User } from '@/types'

type SettingsSectionId = 'profile' | 'workspace' | 'security' | 'notifications'

interface SettingsSection {
  id: SettingsSectionId
  label: string
  icon: LucideIcon
}

interface ProfileForm {
  name: string
  email: string
  phone: string
  position: string
}

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>

interface SecurityForm {
  current: string
  next: string
  confirm: string
}

type SecurityErrors = Partial<Record<keyof SecurityForm, string>>

interface NotificationPreference {
  id: 'burnout' | 'sprint_risk' | 'task_assign' | 'daily_digest'
  label: string
  desc: string
  enabled: boolean
}

interface ToggleProps {
  enabled: boolean
  onChange?: (enabled: boolean) => void
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

const SECTIONS: SettingsSection[] = [
  { id: 'profile',       label: 'Profile',        icon: UserIcon  },
  { id: 'workspace',     label: 'Workspace',      icon: Building2 },
  { id: 'security',      label: 'Security',       icon: Shield    },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
]

const TIMEZONES = [
  'UTC+7 (Ho Chi Minh City)',
  'UTC+0 (London)',
  'UTC-5 (New York)',
  'UTC+8 (Singapore)',
  'UTC+9 (Tokyo)',
]

const DEFAULT_NOTIFICATIONS: NotificationPreference[] = [
  { id: 'burnout',      label: 'Burnout alerts',        desc: 'When a member exceeds workload threshold',  enabled: true  },
  { id: 'sprint_risk',  label: 'Sprint risk warnings',  desc: 'When AI detects sprint deadline risk',       enabled: true  },
  { id: 'task_assign',  label: 'Task assignment',       desc: 'When AI suggests or assigns tasks',         enabled: true  },
  { id: 'daily_digest', label: 'Daily digest',          desc: 'Daily summary of team workload',            enabled: false },
]

function Toggle({ enabled, onChange }: ToggleProps) {
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
function ProfileSection() {
  const user       = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [form, setForm] = useState<ProfileForm>({
    name:     user?.fullName || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
    position: user?.position || '',
  })
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const set = (key: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: ProfileErrors = {}
    if (!form.name.trim())  next.name  = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    return next
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }
    setSaving(true)
    try {
      const res = await userService.updateMe({
        name:     form.name,
        email:    form.email,
        phone:    form.phone,
        position: form.position,
      })
      if (res.data) {
        updateUser(res.data)
      } else if (user) {
        updateUser({
          ...user,
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          position: form.position,
        } as User)
      }
      toast.success('Profile updated')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  const displayName = user?.fullName || user?.email || 'User'
  const initials    = displayName[0]?.toUpperCase() || 'U'

  const handleChooseAvatar = () => fileInputRef.current?.click()

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type?.startsWith('image/')) {
      toast.error('File type not allowed')
      e.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large')
      e.target.value = ''
      return
    }

    setAvatarFile(file)
  }

  const handleUploadAvatar = () => {
    if (!avatarFile || isUploadingAvatar) return
    uploadAvatar(avatarFile, {
      onSuccess: () => {
        setAvatarFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <h3 className="section-title text-[15px]">Profile</h3>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border border-border-subtle shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-xl font-semibold text-white shrink-0">
            {initials}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button type="button" className="btn-secondary" onClick={handleChooseAvatar}>
              Change avatar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleUploadAvatar}
              disabled={!avatarFile || isUploadingAvatar}
            >
              {isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {isUploadingAvatar ? 'Uploading…' : 'Upload'}
            </button>
          </div>
          {avatarFile && (
            <p className="text-[11.5px] text-text-secondary mt-1.5">{avatarFile.name}</p>
          )}
          <p className="text-[11.5px] text-text-muted mt-1.5">JPG, PNG, max 2 MB</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" id="prof-name" required error={errors.name}>
          <input
            id="prof-name"
            name="name"
            value={form.name}
            onChange={set('name')}
            placeholder="Nguyen Van A"
            className={errors.name ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <Field label="Email" id="prof-email" required error={errors.email}>
          <input
            id="prof-email"
            name="email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@company.com"
            className={errors.email ? 'input-field-error' : 'input-field'}
          />
        </Field>

        <Field label="Phone" id="prof-phone">
          <input
            id="prof-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="0901234567"
            maxLength={20}
            className="input-field"
          />
        </Field>

        <Field label="Position" id="prof-position">
          <input
            id="prof-position"
            name="position"
            value={form.position}
            onChange={set('position')}
            placeholder="e.g. Senior Developer"
            maxLength={100}
            className="input-field"
          />
        </Field>

        <Field label="Role" readOnly hint="Assigned by admin">
          <div className="input-readonly">{user?.role || 'Project Manager'}</div>
        </Field>

        <SelectField label="Timezone" id="prof-timezone">
          {TIMEZONES.map((tz) => (
            <option key={tz}>{tz}</option>
          ))}
        </SelectField>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

/* ── Security Section ─────────────────────────────────────── */
function SecuritySection() {
  const [form, setForm] = useState<SecurityForm>({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<SecurityErrors>({})
  const [saving, setSaving] = useState(false)

  const set = (key: keyof SecurityForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: SecurityErrors = {}
    if (!form.current)              next.current  = 'Current password is required.'
    if (form.next.length < 6)       next.next     = 'New password must be at least 6 characters.'
    if (form.next !== form.confirm)  next.confirm  = 'Passwords do not match.'
    return next
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }
    setSaving(true)
    try {
      await userService.changePassword({ currentPassword: form.current, newPassword: form.next })
      toast.success('Password updated')
      setForm({ current: '', next: '', confirm: '' })
      setErrors({})
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update password'))
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
  const [items, setItems] = useState<NotificationPreference[]>(DEFAULT_NOTIFICATIONS)
  const toggle = (id: NotificationPreference['id']) =>
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
  const [active, setActive] = useState<SettingsSectionId>('profile')

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h2 className="text-subhead text-text-primary">Settings</h2>
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
          {active === 'profile' && <ProfileSection />}

          {active === 'workspace' && (
            <div className="card p-6 space-y-5">
              <h3 className="section-title text-[15px]">Workspace settings</h3>



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


            </div>
          )}

          {active === 'security'      && <SecuritySection />}
          {active === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  )
}
