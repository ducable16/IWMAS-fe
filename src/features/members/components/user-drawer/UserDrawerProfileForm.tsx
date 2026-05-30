import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'
import { USER_ROLE_LABEL as ROLE_LABELS } from '@/constants/enums'
import type { ChangeEvent } from 'react'
import type { MemberView } from '@/types'
import type { UserRole } from '@/constants/enums'
import type { UserDrawerForm } from './userDrawerTypes'

const ROLES: UserRole[] = ['TEAM_MEMBER', 'PROJECT_MANAGER', 'HR', 'ADMIN']

type UserDrawerProfileFormProps = {
  user: MemberView
  form: UserDrawerForm
  isEditing: boolean
  canEditRole: boolean
  canEditEmail: boolean
  onChange: (key: keyof UserDrawerForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export default function UserDrawerProfileForm({
  user,
  form,
  isEditing,
  canEditRole,
  canEditEmail,
  onChange,
}: UserDrawerProfileFormProps) {
  return (
    <section>
      <h5 className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wider mb-3">
        Role & Position
      </h5>
      <div className="space-y-3">
        {isEditing ? (
          <>
            {canEditRole ? (
              <SelectField
                label="System role"
                id="drawer-role"
                value={form.role}
                onChange={onChange('role')}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </SelectField>
            ) : (
              <Field
                label="System role"
                id="drawer-role"
                hint="HR cannot modify roles. Contact an Admin."
              >
                <input
                  readOnly
                  value={ROLE_LABELS[form.role as keyof typeof ROLE_LABELS] || form.role}
                  className="input-readonly"
                />
              </Field>
            )}

            <Field label="Position" id="drawer-position">
              <input
                id="drawer-position"
                value={form.position}
                onChange={onChange('position')}
                placeholder="e.g. Senior Developer"
                maxLength={100}
                className="input-field"
              />
            </Field>

            <Field label="Full name" id="drawer-name">
              <input
                id="drawer-name"
                value={form.fullName}
                onChange={onChange('fullName')}
                placeholder="Full name"
                maxLength={100}
                className="input-field"
              />
            </Field>

            <Field
              label="Email"
              id="drawer-email"
              hint={canEditEmail ? undefined : 'Only Admin can modify email.'}
            >
              <input
                id="drawer-email"
                type="email"
                value={form.email}
                onChange={canEditEmail ? onChange('email') : undefined}
                placeholder="user@company.com"
                readOnly={!canEditEmail}
                className={canEditEmail ? 'input-field' : 'input-readonly'}
              />
            </Field>

            <Field label="Phone" id="drawer-phone">
              <input
                id="drawer-phone"
                value={form.phone}
                onChange={onChange('phone')}
                placeholder="0901234567"
                maxLength={20}
                className="input-field"
              />
            </Field>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11.5px] text-text-muted mb-1">Role</p>
              <p className="text-[13px] text-text-primary font-medium">
                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
              </p>
            </div>
            <div>
              <p className="text-[11.5px] text-text-muted mb-1">Position</p>
              <p className="text-[13px] text-text-primary">
                {user.position || '-'}
              </p>
            </div>
            <div>
              <p className="text-[11.5px] text-text-muted mb-1">Full name</p>
              <p className="text-[13px] text-text-primary">
                {user.fullName}
              </p>
            </div>
            <div>
              <p className="text-[11.5px] text-text-muted mb-1">Phone</p>
              <p className="text-[13px] text-text-primary">
                {user.phone || '-'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
