import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, Users, Calendar,
  Plus, MoreHorizontal, X,
} from 'lucide-react'
import clsx from 'clsx'
import {
  useProject, useProjectMembers, useDeleteProject,
  useRemoveProjectMember,
} from '@/features/projects/hooks/useProjects'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import ProjectFormModal from '@/features/projects/components/ProjectFormModal'

/* ── Constants ─────────────────────────────────────────────── */

const STATUS_META = {
  PLANNING:    { label: 'Planning',    dot: 'bg-info',    badge: 'badge-info' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-accent',  badge: 'badge-accent' },
  ON_HOLD:     { label: 'On Hold',     dot: 'bg-warning', badge: 'badge-warning' },
  COMPLETED:   { label: 'Completed',   dot: 'bg-success', badge: 'badge-success' },
  CANCELLED:   { label: 'Cancelled',   dot: 'bg-danger',  badge: 'badge-danger' },
}

const PRIORITY_META = {
  LOW:      { label: 'Low',      badge: 'badge-neutral' },
  MEDIUM:   { label: 'Medium',   badge: 'badge-neutral' },
  HIGH:     { label: 'High',     badge: 'badge-warning' },
  CRITICAL: { label: 'Critical', badge: 'badge-danger' },
}

/* ── Helpers ───────────────────────────────────────────────── */

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-[12px] text-text-muted font-medium w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-[13px] text-text-primary">{children}</span>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER'

  const { data: project, isLoading, isError, error, refetch } = useProject(Number(id))
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(Number(id))
  const { mutate: deleteProject } = useDeleteProject()
  const { mutate: removeMember } = useRemoveProjectMember(Number(id))

  // Fetch all users to resolve managerId → fullName
  const { data: usersData } = useMembers({ size: 100 })
  const allUsers = usersData?.members ?? []
  const managerName = project?.managerId
    ? (allUsers.find((u) => u.id === project.managerId)?.fullName ?? `#${project.managerId}`)
    : '—'

  const [editOpen, setEditOpen] = useState(false)

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

  const statusMeta = STATUS_META[project.status] || STATUS_META.PLANNING
  const prioMeta   = PRIORITY_META[project.priority] || PRIORITY_META.MEDIUM

  return (
    <div className="max-w-[900px] mx-auto">
      {/* ── Back + Header ── */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to projects
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[16px] font-bold text-accent shrink-0">
              {project.code?.[0] || project.name?.[0] || '?'}
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-medium text-[24px] text-text-primary tracking-tight leading-tight truncate">
                {project.name}
              </h1>
              {project.code && (
                <span className="text-[12px] text-text-muted font-mono">{project.code}</span>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="btn-ghost"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-[13px] font-medium text-danger hover:bg-danger/5 px-3 py-1.5 rounded-lg border border-danger/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Info Section ── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        {/* Left column — details */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3 uppercase tracking-wide">
            Details
          </h3>
          <div className="divide-y divide-border-subtle">
            <InfoRow label="Status">
              <span className={clsx('badge', statusMeta.badge)}>
                <span className={clsx('dot', statusMeta.dot)} />
                {statusMeta.label}
              </span>
            </InfoRow>
            <InfoRow label="Priority">
              <span className={clsx('badge', prioMeta.badge)}>
                {prioMeta.label}
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
              <InfoRow label="Actual End">
                {formatDate(project.actualEndDate)}
              </InfoRow>
            )}
            <InfoRow label="Created">
              {formatDate(project.createdAt)}
            </InfoRow>
          </div>
        </div>

        {/* Right column — description */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3 uppercase tracking-wide">
            Description
          </h3>
          <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* ── Members Section §3.7 ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h3 className="text-[13px] font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-text-muted" />
            Project Members
            <span className="text-[11px] text-text-muted font-normal ml-1">
              ({members.length})
            </span>
          </h3>
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
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Note</th>
                  {canEdit && (
                    <th className="py-2.5 px-3 w-10"><span className="sr-only">Actions</span></th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-subtle/50 transition-colors">
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
                      <span className="badge badge-neutral">{m.roleInProject}</span>
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
                      <span className="text-[12.5px] text-text-muted truncate block max-w-[150px]">
                        {m.note || '—'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRemoveMember(m)}
                          className="text-text-muted hover:text-danger transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                          title="Remove member"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      <ProjectFormModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
      />
    </div>
  )
}
