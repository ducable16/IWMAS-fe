import { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import { useInviteUser } from '../hooks/useInviteUser'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'

const ROLES = ['TEAM_MEMBER', 'PROJECT_MANAGER', 'HR', 'ADMIN']

const ROLE_LABELS = {
  TEAM_MEMBER: 'Team Member',
  PROJECT_MANAGER: 'Project Manager',
  HR: 'HR',
  ADMIN: 'Admin',
}

export default function InviteUserModal({ open, onClose }) {
  const { mutate, isPending } = useInviteUser()

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    password: '',
    phone: '',
    position: '',
    role: 'TEAM_MEMBER',
  })
  const [errors, setErrors] = useState({})

  if (!open) return null

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Invalid email format.'
    if (!form.fullName.trim()) next.fullName = 'Full name is required.'
    if (!form.password.trim()) next.password = 'Password is required.'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }

    mutate(form, {
      onSuccess: () => {
        setForm({ email: '', fullName: '', password: '', phone: '', position: '', role: 'TEAM_MEMBER' })
        setErrors({})
        onClose()
      },
    })
  }

  const handleClose = () => {
    if (isPending) return
    setForm({ email: '', fullName: '', password: '', phone: '', position: '', role: 'TEAM_MEMBER' })
    setErrors({})
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-accent" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary leading-tight">
                Invite user
              </h3>
              <p className="text-[11.5px] text-text-muted">Add a new user to workspace</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-bg-subtle"
            aria-label="Close"
            id="invite-close-btn"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" id="inv-name" required error={errors.fullName}>
              <input
                id="inv-name"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Nguyen Van A"
                maxLength={100}
                className={errors.fullName ? 'input-field-error' : 'input-field'}
              />
            </Field>

            <Field label="Email" id="inv-email" required error={errors.email}>
              <input
                id="inv-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="user@company.com"
                className={errors.email ? 'input-field-error' : 'input-field'}
              />
            </Field>
          </div>

          <Field label="Password" id="inv-password" required error={errors.password}>
            <input
              id="inv-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Min 8 characters"
              className={errors.password ? 'input-field-error' : 'input-field'}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" id="inv-phone">
              <input
                id="inv-phone"
                value={form.phone}
                onChange={set('phone')}
                placeholder="0901234567"
                maxLength={20}
                className="input-field"
              />
            </Field>

            <Field label="Position" id="inv-position">
              <input
                id="inv-position"
                value={form.position}
                onChange={set('position')}
                placeholder="Developer"
                maxLength={100}
                className="input-field"
              />
            </Field>
          </div>

          <SelectField
            label="System role"
            id="inv-role"
            value={form.role}
            onChange={set('role')}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </SelectField>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="btn-ghost text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary text-[13px] min-w-[100px] justify-center"
              id="invite-submit-btn"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? 'Inviting…' : 'Invite user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
