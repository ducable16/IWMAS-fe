import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import { useInviteUser } from '../hooks/useInviteUser'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import { USER_ROLES, USER_ROLE_LABEL } from '@/constants/enums'
import type { ChangeEvent, FormEvent } from 'react'
import type { UserRole } from '@/constants/enums'

const ROLES: UserRole[] = ['TEAM_MEMBER', 'PROJECT_MANAGER', 'HR', 'ADMIN'].filter((role): role is UserRole =>
  USER_ROLES.includes(role as UserRole),
)

type InviteUserForm = {
  email: string
  fullName: string
  password: string
  phone: string
  position: string
  role: UserRole
}

type InviteUserErrors = Partial<Record<keyof InviteUserForm, string | null>>

type InviteUserModalProps = {
  open: boolean
  onClose: () => void
}

const EMPTY_FORM: InviteUserForm = {
  email: '',
  fullName: '',
  password: '',
  phone: '',
  position: '',
  role: 'TEAM_MEMBER',
}

export default function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const { mutate, isPending } = useInviteUser()
  const [form, setForm] = useState<InviteUserForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<InviteUserErrors>({})



  const set = (key: keyof InviteUserForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: InviteUserErrors = {}
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Invalid email format.'
    if (!form.fullName.trim()) next.fullName = 'Full name is required.'
    if (!form.password.trim()) next.password = 'Password is required.'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    return next
  }

  const reset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    mutate({
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      password: form.password,
      role: form.role,
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.position.trim() ? { position: form.position.trim() } : {}),
    }, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  const handleClose = () => {
    if (isPending) return
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-md">
      <Modal.Header
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-accent" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text-primary leading-tight">
                Add user
              </h3>
              <p className="text-[11.5px] text-text-muted">Add a new user to workspace</p>
            </div>
          </div>
        }
        onClose={handleClose}
      />

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
                placeholder="e.g. Senior Developer"
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
            {ROLES.map((role) => (
              <option key={role} value={role}>{USER_ROLE_LABEL[role]}</option>
            ))}
          </SelectField>

          <ModalFormActions
            onCancel={handleClose}
            isPending={isPending}
            cancelDisabled={isPending}
            pendingLabel="Adding..."
            submitLabel="Add user"
            submitButtonId="add-user-submit-btn"
            submitClassName="min-w-[100px] justify-center"
          />
        </form>
    </Modal>
  )
}
