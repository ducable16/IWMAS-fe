import { useEffect, useRef, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useActivateMember } from '../hooks/useActivateMember'
import { useUpdateMember } from '../hooks/useUpdateMember'
import { useAuthStore } from '@/features/auth/store/authStore'
import { canChangeUserRole, canManageUsers } from '@/utils/permissions'
import UserDrawerActivity from './user-drawer/UserDrawerActivity'
import UserDrawerDangerZone from './user-drawer/UserDrawerDangerZone'
import UserDrawerHeader from './user-drawer/UserDrawerHeader'
import UserDrawerProfileForm from './user-drawer/UserDrawerProfileForm'
import UserIdentitySummary from './user-drawer/UserIdentitySummary'
import type { ChangeEvent } from 'react'
import type { MemberView } from '@/types'
import type { UserDrawerForm } from './user-drawer/userDrawerTypes'

type UserDrawerProps = {
  user: MemberView | null
  onClose: () => void
}

const BLANK_FORM: UserDrawerForm = {
  fullName: '',
  phone: '',
  position: '',
  role: 'TEAM_MEMBER',
}

export default function UserDrawer({ user, onClose }: UserDrawerProps) {
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = canManageUsers(currentUser?.role)
  const canEditRole = canChangeUserRole(currentUser?.role)
  const isSelf = currentUser?.id === user?.id

  const { mutate: updateUser, isPending: isUpdating } = useUpdateMember()
  const { mutate: toggleActive, isPending: isToggling } = useActivateMember()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<UserDrawerForm>(BLANK_FORM)
  const drawerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!user) return
    setForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      position: user.position || '',
      role: user.role || 'TEAM_MEMBER',
    })
    setIsEditing(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [user, onClose])

  if (!user) return null

  const set = (key: keyof UserDrawerForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: e.target.value }))

  const handleSave = () => {
    const { role: _role, ...rest } = form
    const payload = canEditRole ? form : rest
    updateUser(
      { id: user.id, data: payload },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const handleCancel = () => {
    setForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      position: user.position || '',
      role: user.role || 'TEAM_MEMBER',
    })
    setIsEditing(false)
  }

  const handleToggleStatus = () => {
    toggleActive({ id: user.id, active: user.status !== 'ACTIVE' })
  }

  const canEdit = isAdmin && !isSelf

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-bg-surface border-l border-border overflow-y-auto animate-slide-in-right"
        role="dialog"
        aria-label="User details"
      >
        <UserDrawerHeader
          userId={user.id}
          canEdit={canEdit}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onClose={onClose}
        />

        <div className="px-5 py-5 space-y-6">
          <UserIdentitySummary user={user} />

          <div className="divider" />

          <UserDrawerProfileForm
            user={user}
            form={form}
            isEditing={isEditing}
            canEditRole={canEditRole}
            onChange={set}
          />

          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="btn-primary text-[12.5px] py-1.5"
                id="drawer-save-btn"
              >
                {isUpdating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Save className="w-3.5 h-3.5" strokeWidth={1.75} />}
                {isUpdating ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="btn-ghost text-[12.5px] py-1.5"
                id="drawer-cancel-btn"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="divider" />

          <UserDrawerActivity user={user} />

          {canEdit && (
            <>
              <div className="divider" />
              <UserDrawerDangerZone
                user={user}
                isToggling={isToggling}
                onToggleStatus={handleToggleStatus}
              />
            </>
          )}
        </div>
      </aside>
    </>
  )
}
