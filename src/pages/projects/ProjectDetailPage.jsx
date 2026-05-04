import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, Users, Calendar,
  X, Save, Loader2, Plus, Edit2
} from 'lucide-react'
import clsx from 'clsx'
import {
  useProject, useProjectMembers, useDeleteProject,
  useRemoveProjectMember, useUpdateProject,
  useUpdateProjectMember,
} from '@/features/projects/hooks/useProjects'
import ProjectAddMemberModal from '@/features/projects/components/ProjectAddMemberModal'
import ProjectEditMemberModal from '@/features/projects/components/ProjectEditMemberModal'
import { useMembers } from '@/features/members/hooks/useMembers'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import {
  PROJECT_STATUS_META as STATUS_META,
  PROJECT_ROLE_LABEL,
  PROJECT_STATUS_LABEL,
  toOptions,
} from '@/constants/enums'
import { useCan } from '@/utils/permissions'
import { useAuthStore } from '@/features/auth/store/authStore'

/* ── Helpers ───────────────────────────────────────────────── */

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const STATUS_OPTIONS   = toOptions(PROJECT_STATUS_LABEL)

/** Inline view row */
function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-[12px] text-text-muted font-medium w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-[13px] text-text-primary">{children}</span>
    </div>
  )
}

/** Compact field wrapper for inline edit */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-text-secondary mb-1">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-danger mt-0.5">{error}</p>}
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const can  = useCan()
  const user = useAuthStore((s) => s.user)

  const { data: project, isLoading, isError, error, refetch } = useProject(Number(id))
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(Number(id))
  const { mutate: deleteProject }  = useDeleteProject()
  const { mutate: removeMember }   = useRemoveProjectMember(Number(id))
  const updateProject              = useUpdateProject()
  const isPending                  = updateProject.isPending

  // §3.5 / §3.8-3.10: ADMIN always; PM only when they are the project manager.
  // Computed AFTER project loads (project may be undefined during fetch).
  const isOwnProject     = !!project && project.managerId === user?.id
  const canEdit          = can.isAdmin || (can.isPm && isOwnProject)
  const canManageMembers = can.isAdmin || (can.isPm && isOwnProject)

  // Fetch all users to resolve managerId → fullName
  const { data: usersData } = useMembers({ size: 100 })
  const allUsers   = usersData?.members ?? []
  const managers   = allUsers.filter(
    (u) => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN',
  )
  const managerName = project?.managerId
    ? (allUsers.find((u) => u.id === project.managerId)?.fullName ?? `#${project.managerId}`)
    : '—'

  // ── Edit state ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [addMemberOpen,  setAddMemberOpen]  = useState(false)
  const [editingMember,  setEditingMember]  = useState(null)
  const [form,      setForm]      = useState({})
  const [errors,    setErrors]    = useState({})

  useEffect(() => {
    if (!project) return
    setForm({
      name:        project.name        || '',
      code:        project.code        || '',
      description: project.description || '',
      status:      project.status      || 'PLANNING',
      startDate:   project.startDate   || '',
      endDate:     project.endDate     || '',
      managerId:   project.managerId   ? String(project.managerId) : '',
    })
    setErrors({})
    setIsEditing(false)
  }, [project])

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.name?.trim()) next.name      = 'Project name is required.'
    if (!form.managerId)    next.managerId = 'Manager is required.'
    return next
  }

  const handleSave = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const payload = {
      name:        form.name.trim(),
      code:        form.code.trim()        || undefined,
      description: form.description.trim() || undefined,
      status:      form.status,
      startDate:   form.startDate || undefined,
      endDate:     form.endDate   || undefined,
      managerId:   Number(form.managerId),
    }
    updateProject.mutate(
      { id: project.id, data: payload },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const handleCancel = () => {
    // Reset form to original project values
    setForm({
      name:        project.name        || '',
      code:        project.code        || '',
      description: project.description || '',
      status:      project.status      || 'PLANNING',
      startDate:   project.startDate   || '',
      endDate:     project.endDate     || '',
      managerId:   project.managerId   ? String(project.managerId) : '',
    })
    setErrors({})
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!window.confirm(`Delete project "${project?.name}"? This cannot be undone.`)) return
    deleteProject(Number(id), { onSuccess: () => navigate('/projects') })
  }

  const handleRemoveMember = (member) => {
    if (!window.confirm(`Remove ${member.userFullName} from this project?`)) return
    removeMember(member.id)
  }

  if (isLoading) return <LiveLoading label="Loading project…" />
  if (isError)   return <LiveError error={error} onRetry={refetch} />
  if (!project)  return <LiveEmpty label="Project not found." />

  const statusMeta = STATUS_META[project.status]   || STATUS_META.PLANNING

  // Edit-mode derived values
  const editStatusMeta = STATUS_META[form.status]   || STATUS_META.PLANNING
  const editManagerName = form.managerId
    ? (allUsers.find((u) => String(u.id) === form.managerId)?.fullName ?? '—')
    : '—'

  return (
    <div className="max-w-[900px] mx-auto">

      {/* ── Back + Header ── */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          disabled={isEditing}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-4 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to projects
        </button>

        <div className="flex items-start justify-between gap-4">
          {/* Title / Code */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[16px] font-bold text-accent shrink-0">
              {(isEditing ? form.name : project.name)?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Project name"
                    autoFocus
                    className={clsx(
                      'w-full bg-transparent text-[20px] font-semibold text-text-primary outline-none border-b-2 pb-0.5 transition-colors',
                      errors.name ? 'border-danger' : 'border-accent',
                    )}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-danger">{errors.name}</p>
                  )}
                  <input
                    value={form.code}
                    onChange={set('code')}
                    placeholder="Project code (optional)"
                    className="w-full bg-transparent text-[12px] text-text-muted font-mono outline-none border-b border-border focus:border-accent pb-0.5 transition-colors"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-card-title text-text-primary truncate">{project.name}</h1>
                  {project.code && (
                    <span className="text-[12px] text-text-muted font-mono">{project.code}</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {canEdit && (
            <div className="flex items-center gap-2 shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="btn-ghost text-[13px]"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="btn-primary text-[13px]"
                  >
                    {isPending
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Save className="w-3.5 h-3.5" />}
                    {isPending ? 'Saving…' : 'Save changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-ghost"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-[13px] font-medium text-danger hover:bg-danger/5 px-3 py-1.5 rounded-lg border border-danger/30 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Info / Edit Section ── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">

        {/* Left — Details card */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3 uppercase tracking-wide">
            Details
          </h3>

          {isEditing ? (
            /* ── Edit mode ── */
            <div className="space-y-3">
              <Field label="Status">
                <select value={form.status} onChange={set('status')} className="field">
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>


              <Field label="Manager" required error={errors.managerId}>
                <select
                  value={form.managerId}
                  onChange={set('managerId')}
                  className={clsx('field', errors.managerId && 'field-error')}
                >
                  <option value="">Select a manager…</option>
                  {managers.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={set('startDate')}
                    className="field"
                  />
                </Field>
                <Field label="End Date">
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={set('endDate')}
                    className="field"
                  />
                </Field>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <div className="divide-y divide-border-subtle">
              <InfoRow label="Status">
                <span className={clsx('badge', statusMeta.badge)}>
                  <span className={clsx('dot', statusMeta.dot)} />
                  {statusMeta.label}
                </span>
              </InfoRow>

              <InfoRow label="Manager">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-[10px] font-semibold text-accent">
                    {managerName[0]?.toUpperCase() ?? '?'}
                  </span>
                  {managerName}
                </span>
              </InfoRow>
              <InfoRow label="Start Date">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  {formatDate(project.startDate)}
                </span>
              </InfoRow>
              <InfoRow label="End Date">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  {formatDate(project.endDate)}
                </span>
              </InfoRow>
              {project.actualEndDate && (
                <InfoRow label="Actual End">{formatDate(project.actualEndDate)}</InfoRow>
              )}
              <InfoRow label="Created">{formatDate(project.createdAt)}</InfoRow>
            </div>
          )}
        </div>

        {/* Right — Description card */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3 uppercase tracking-wide">
            Description
          </h3>
          {isEditing ? (
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of the project…"
              rows={8}
              className="field resize-none w-full"
            />
          ) : (
            <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {project.description || 'No description provided.'}
            </p>
          )}
        </div>
      </div>

      {/* ── Members Section ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h3 className="text-[13px] font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-text-muted" />
            Project Members
            <span className="text-[11px] text-text-muted font-normal ml-1">
              ({members.length})
            </span>
          </h3>
          {canManageMembers && (
            <button
              onClick={() => setAddMemberOpen(true)}
              className="btn-ghost text-[12px] h-8 px-3"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Member
            </button>
          )}
        </div>

        {membersLoading ? (
          <div className="p-8"><LiveLoading label="Loading members…" /></div>
        ) : members.length === 0 ? (
          <div className="p-8">
            <LiveEmpty label="No members assigned to this project yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-subtle/50 border-b border-border-subtle">
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3 pl-5">Member</th>
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Role</th>
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Effort %</th>
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Joined</th>
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Left</th>
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Note</th>
                  {canManageMembers && (
                    <th className="py-2.5 px-3 w-20"><span className="sr-only">Actions</span></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-subtle/50 transition-colors group">
                    <td className="py-3 px-3 pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[10px] font-semibold text-accent shrink-0">
                          {m.userFullName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-[13px] font-medium text-text-primary truncate max-w-[160px]">
                          {m.userFullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="badge badge-neutral">
                        {PROJECT_ROLE_LABEL[m.roleInProject] || m.roleInProject}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${m.allocatedEffortPercent ?? 0}%` }}
                          />
                        </div>
                        <span className="text-[12px] text-text-secondary tabular-nums">
                          {m.allocatedEffortPercent ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[12.5px] text-text-muted tabular-nums">
                        {formatDate(m.joinDate)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[12.5px] text-text-muted tabular-nums">
                        {m.leaveDate ? formatDate(m.leaveDate) : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[12.5px] text-text-muted truncate block max-w-[150px]">
                        {m.note || '—'}
                      </span>
                    </td>
                    {canManageMembers && (
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="text-text-muted hover:text-accent transition-colors p-1 rounded"
                            title="Edit member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(m)}
                            className="text-text-muted hover:text-danger transition-colors p-1 rounded"
                            title="Remove member"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProjectAddMemberModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        projectId={Number(id)}
      />

      <ProjectEditMemberModal
        open={!!editingMember}
        member={editingMember}
        projectId={Number(id)}
        onClose={() => setEditingMember(null)}
      />
    </div>
  )
}
