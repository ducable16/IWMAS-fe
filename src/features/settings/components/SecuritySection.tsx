import { useState } from 'react'
import toast from 'react-hot-toast'
import Field from '@/components/ui/Field'
import { userService } from '@/features/members/services/memberService'
import { getErrorMessage } from '../settingsUtils'
import type { ChangeEvent, FormEvent } from 'react'
import type { SecurityErrors, SecurityForm } from '../settingsTypes'

export default function SecuritySection() {
  const [form, setForm] = useState<SecurityForm>({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<SecurityErrors>({})
  const [saving, setSaving] = useState(false)

  const set = (key: keyof SecurityForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: SecurityErrors = {}
    if (!form.current) next.current = 'Current password is required.'
    if (form.next.length < 6) next.next = 'New password must be at least 6 characters.'
    if (form.next !== form.confirm) next.confirm = 'Passwords do not match.'
    return next
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
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
          placeholder="********"
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
          placeholder="********"
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
          placeholder="********"
          value={form.confirm}
          onChange={set('confirm')}
          className={errors.confirm ? 'input-field-error' : 'input-field'}
        />
      </Field>

      <div className="pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </div>
    </form>
  )
}
