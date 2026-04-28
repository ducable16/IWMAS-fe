import { useEffect, useRef, useState } from 'react'
import {
  X, Pencil, Save, Loader2, Mail, Phone, Calendar, Clock,
  Shield, AlertTriangle, UserX, UserCheck,
} from 'lucide-react'
import clsx from 'clsx'
import { useUpdateMember } from '../hooks/useUpdateMember'
import { useActivateMember } from '../hooks/useActivateMember'
import { useAuthStore } from '@/features/auth/store/authStore'
import Field from '@/components/ui/Field'
import SelectField from '@/components/ui/SelectField'

const ROLES = ['TEAM_MEMBER', 'PROJECT_MANAGER', 'HR', 'ADMIN']

const ROLE_LABELS = {
  TEAM_MEMBER: 'Team Member',
  PROJECT_MANAGER: 'Project Manager',
  HR: 'HR',
  ADMIN: 'Admin',
}

const ROLE_BADGE = {
  ADMIN: 'badge-danger',
  HR: 'badge-warning',
  PROJECT_MANAGER: 'badge-accent',
  TEAM_MEMBER: 'badge-neutral',
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Side drawer for viewing/editing a single user.
 * Slides in from the right, overlays with backdrop on mobile.
 */
export default function UserDrawer({ user, onClose }) {
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR'
  const isSelf = currentUser?.id === user?.id

  const { mutate: updateUser, isPending: isUpdating } = useUpdateMember()
  const { mutate: toggleActive, isPending: isToggling } = useActivateMember()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({})
  const drawerRef = useRef(null)

  // Populate form when user changes
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

  // Close on Escape
  useEffect(() => {
    if (!user) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [user, onClose])

  if (!user) return null

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = () => {
    updateUser(
      { id: user.id, data: form },
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
    const active = user.status !== 'ACTIVE'
    toggleActive({ id: user.id, active })
  }

  const canEdit = isAdmin && !isSelf

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-bg-surface border-l border-border shadow-2xl overflow-y-auto animate-slide-in-right"
        role="dialog"
        aria-label="User details"
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-bg-surface/95 backdrop-blur-sm border-b border-border-subtle px-5 py-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-text-primary">
            User details
          </h3>
          <div className="flex items-center gap-1.5">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-ghost text-[12.5px] py-1.5 px-2.5"
                id="drawer-edit-btn"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-bg-subtle"
              aria-label="Close drawer"
              id="drawer-close-btn"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* ── Section 1: Identity ── */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/10 flex items-center justify-center text-xl font-semibold text-accent shrink-0">
              {user.fullName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h4 className="text-[16px] font-semibold text-text-primary truncate">
                {user.fullName}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-text-muted shrink-0" strokeWidth={1.75} />
                <span className="text-[12.5px] text-text-muted truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-text-muted shrink-0" strokeWidth={1.75} />
                  <span className="text-[12.5px] text-text-muted">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={clsx(
              'badge',
              user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger',
            )}>
              <span className={clsx(
                'dot',
                user.status === 'ACTIVE' ? 'bg-success' : 'bg-danger',
              )} />
              {user.status === 'ACTIVE' ? 'Active' : 'Disabled'}
            </span>
            <span className={clsx('badge', ROLE_BADGE[user.role] || 'badge-neutral')}>
              <Shield className="w-3 h-3" strokeWidth={1.75} />
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>

          <div className="divider" />

          {/* ── Section 2: Role & Position ── */}
          <section>
            <h5 className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Role & Position
            </h5>
            <div className="space-y-3">
              {isEditing ? (
                <>
                  <SelectField
                    label="System role"
                    id="drawer-role"
                    value={form.role}
                    onChange={set('role')}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </SelectField>

                  <Field label="Position" id="drawer-position">
                    <input
                      id="drawer-position"
                      value={form.position}
                      onChange={set('position')}
                      placeholder="e.g. Senior Developer"
                      maxLength={100}
                      className="input-field"
                    />
                  </Field>

                  <Field label="Full name" id="drawer-name">
                    <input
                      id="drawer-name"
                      value={form.fullName}
                      onChange={set('fullName')}
                      placeholder="Full name"
                      maxLength={100}
                      className="input-field"
                    />
                  </Field>

                  <Field label="Phone" id="drawer-phone">
                    <input
                      id="drawer-phone"
                      value={form.phone}
                      onChange={set('phone')}
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
                      {ROLE_LABELS[user.role] || user.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-text-muted mb-1">Position</p>
                    <p className="text-[13px] text-text-primary">
                      {user.position || '—'}
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
                      {user.phone || '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Save / Cancel buttons (edit mode only) */}
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
                {isUpdating ? 'Saving…' : 'Save changes'}
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

          {/* ── Section 3: Activity ── */}
          <section>
            <h5 className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Activity
            </h5>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-[11.5px] text-text-muted">Last active</p>
                  <p className="text-[13px] text-text-primary">{formatTimeAgo(user.lastActive)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-[11.5px] text-text-muted">Member since</p>
                  <p className="text-[13px] text-text-primary">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 4: Danger Zone (admin only, not self) ── */}
          {canEdit && (
            <>
              <div className="divider" />
              <section>
                <h5 className="text-[11.5px] font-semibold text-danger uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Danger Zone
                </h5>
                <div className="card border-danger/20 bg-danger/[0.03] p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">
                        {user.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
                      </p>
                      <p className="text-[11.5px] text-text-muted mt-0.5">
                        {user.status === 'ACTIVE'
                          ? 'User will lose access to the workspace'
                          : 'Restore user access to the workspace'}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleStatus}
                      disabled={isToggling}
                      className={clsx(
                        'inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-colors',
                        user.status === 'ACTIVE'
                          ? 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20'
                          : 'bg-success/10 text-success hover:bg-success/20 border border-success/20',
                      )}
                      id="drawer-toggle-status-btn"
                    >
                      {isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : user.status === 'ACTIVE' ? (
                        <UserX className="w-3.5 h-3.5" strokeWidth={1.75} />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                      )}
                      {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
