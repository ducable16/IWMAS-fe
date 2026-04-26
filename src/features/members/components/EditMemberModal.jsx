import { useEffect, useState } from 'react'
import { X, Save, Loader2, UserCog } from 'lucide-react'
import { useUpdateMember } from '../hooks/useUpdateMember'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'

const ROLES = ['TEAM_MEMBER', 'PROJECT_MANAGER', 'HR', 'ADMIN']

export default function EditMemberModal({ member, onClose, onSuccess }) {
  const { mutate, isPending } = useUpdateMember()

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    position: '',
    role: 'TEAM_MEMBER',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  // Populate form when member changes
  useEffect(() => {
    if (!member) return
    setForm({
      fullName: member.name || '',
      phone: member.phone || '',
      position: member.position || '',
      role: member.systemRole || 'TEAM_MEMBER',
    })
    setErrors({})
    setServerError(null)
  }, [member])

  if (!member) return null

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    // Clear field error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required.'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) { setErrors(next); return }
    setServerError(null)
    mutate(
      { id: member.id, data: form },
      {
        onSuccess: () => { onSuccess?.(); onClose() },
        onError: (err) => {
          setServerError(err?.response?.data?.message || err?.message || 'Failed to update member.')
        },
      },
    )
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="bg-bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-accent" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary leading-tight">
                Edit member
              </h3>
              <p className="text-[11.5px] text-text-muted">{member.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-bg-subtle"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">

          {/* Full name — editable */}
          <Field label="Full name" id="em-fullName" required error={errors.fullName}>
            <input
              id="em-fullName"
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="Nguyen Van A"
              maxLength={100}
              className={errors.fullName ? 'input-field-error' : 'input-field'}
            />
          </Field>

          {/* Email — read-only */}
          <Field
            label="Email"
            readOnly
            hint="Contact admin to change"
          >
            <div className="input-readonly">{member.email}</div>
          </Field>

          {/* Phone + Position */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" id="em-phone">
              <input
                id="em-phone"
                value={form.phone}
                onChange={set('phone')}
                placeholder="0901234567"
                maxLength={20}
                className="input-field"
              />
            </Field>

            <Field label="Position" id="em-position">
              <input
                id="em-position"
                value={form.position}
                onChange={set('position')}
                placeholder="Senior Developer"
                maxLength={100}
                className="input-field"
              />
            </Field>
          </div>

          {/* System role — select */}
          <SelectField
            label="System role"
            id="em-role"
            value={form.role}
            onChange={set('role')}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </SelectField>

          {/* Server error banner */}
          {serverError && (
            <p className="text-[12px] text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}

          {/* ── Footer ── */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn-ghost text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary text-[13px] min-w-[90px] justify-center"
            >
              {isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
