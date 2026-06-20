import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useConfirm } from '@/hooks/useConfirm'
import {
  ArrowLeft, Pencil, Trash2, X, Save, Loader2,
  type LucideIcon, BarChart3, Lock, Paperclip
} from 'lucide-react'
import clsx from 'clsx'
import {
  useProject, useProjectMembers, useDeleteProject,
  useRemoveProjectMember, useUpdateProject,
  useProjectDocuments,
  useUploadProjectDocument, useDeleteProjectDocument,
} from '@/features/projects/hooks/useProjects'
import ProjectAddMemberModal from '@/features/projects/components/ProjectAddMemberModal'
import ProjectEditMemberModal from '@/features/projects/components/ProjectEditMemberModal'
import ProjectChangeManagerModal from '@/features/projects/components/ProjectChangeManagerModal'
import { useMembers } from '@/features/members/hooks/useMembers'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import {
  PROJECT_STATUS_META as STATUS_META,
} from '@/constants/enums'
import { useCan } from '@/utils/permissions'
import { useAuthStore } from '@/features/auth/store/authStore'
import ProjectWorkloadDashboard from '@/features/workforce/components/ProjectWorkloadDashboard'
import type { ChangeEvent } from 'react'
import type { ProjectMember } from '@/types'
import type { ProjectStatus } from '@/constants/enums'

import { ProjectOverviewTab } from '@/features/projects/components/ProjectOverviewTab'
import { ProjectMembersTab } from '@/features/projects/components/ProjectMembersTab'
import { ProjectDocumentsTab } from '@/features/projects/components/ProjectDocumentsTab'

type ProjectDetailTab = 'overview' | 'members' | 'documents' | 'workload'

type ProjectDetailForm = {
  name: string
  code: string
  description: string
  status: ProjectStatus | string
  startDate: string
  endDate: string
  managerId: string
}

type ProjectDetailErrors = Partial<Record<keyof ProjectDetailForm, string | null>>

export default function ProjectDetailPage() {
  const { id } = useParams()
  const projectId = Number(id)
  const navigate = useNavigate()
  const { confirm, dialog: confirmDialog } = useConfirm()
  const can  = useCan()
  const user = useAuthStore((s) => s.user)

  const { data: project, isLoading, isError, error, refetch } = useProject(projectId)
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId)
  const { data: documents = [], isLoading: documentsLoading } = useProjectDocuments(projectId)
  const { mutate: deleteProject }  = useDeleteProject()
  const { mutate: removeMember }   = useRemoveProjectMember(projectId)
  const { mutate: uploadDocument, isPending: isUploadingDocument } = useUploadProjectDocument(projectId)
  const { mutate: deleteDocument, isPending: isDeletingDocument } = useDeleteProjectDocument(projectId)
  const updateProject              = useUpdateProject()
  const isPending                  = updateProject.isPending

  // §3.5 / §3.8-3.10: ADMIN always; PM only when they are the project manager.
  const isOwnProject     = !!project && project.managerId === user?.id
  const canEdit          = can.isPm && isOwnProject
  const canManageMembers = can.isPm && isOwnProject
  const canUploadDocuments = true // Any participant can upload

  // Fetch all users to resolve managerId → fullName
  const { data: usersData } = useMembers({ size: 100 })
  const allUsers   = usersData?.members ?? []
  const managerName = project?.managerId
    ? (allUsers.find((u) => u.id === project.managerId)?.fullName ?? `#${project.managerId}`)
    : '—'

  // ── Edit state ──────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [addMemberOpen,  setAddMemberOpen]  = useState(false)
  const [changeManagerOpen, setChangeManagerOpen] = useState(false)
  const [editingMember,  setEditingMember]  = useState<ProjectMember | null>(null)
  const [form,      setForm]      = useState<ProjectDetailForm>({
    name: '',
    code: '',
    description: '',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    managerId: '',
  })
  const [errors,    setErrors]    = useState<ProjectDetailErrors>({})
  const [activeTab, setActiveTab]  = useState<ProjectDetailTab>('overview')

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

  const set = (key: keyof ProjectDetailForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: ProjectDetailErrors = {}
    if (!form.name?.trim()) next.name      = 'Project name is required.'
    return next
  }

  const handleSave = () => {
    if (!project) return
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || undefined,
      status:      form.status,
      startDate:   form.startDate || undefined,
      endDate:     form.endDate   || undefined,
    }
    updateProject.mutate(
      { id: project.id, data: payload },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const handleCancel = () => {
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
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete "${project?.name}"?`,
      description: 'This will permanently delete the project and all its data. This cannot be undone.',
      confirmLabel: 'Delete project',
    })
    if (!ok) return
    deleteProject(projectId, { onSuccess: () => navigate('/projects') })
  }

  const handleRemoveMember = async (member: ProjectMember) => {
    const ok = await confirm({
      title: `Remove ${member.userFullName}?`,
      description: 'This member will lose access to the project.',
      confirmLabel: 'Remove member',
    })
    if (!ok) return
    removeMember(member.id, {
      onSuccess: () => toast.success(`${member.userFullName || 'Member'} removed from project`),
    })
  }

  const handleUploadDocument = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadDocument(file, {
      onSettled: () => {
        e.target.value = ''
      },
    })
  }

  if (isLoading) return <LiveLoading label="Loading project…" />
  if (isError)   return <LiveError error={error} onRetry={refetch} />
  if (!project)  return <LiveEmpty label="Project not found." />

  const statusMeta = STATUS_META[project.status as keyof typeof STATUS_META] || STATUS_META.PLANNING

  // Edit-mode derived values
  const editStatusMeta = STATUS_META[form.status as keyof typeof STATUS_META] || STATUS_META.PLANNING
  const editManagerName = form.managerId
    ? (allUsers.find((u) => String(u.id) === form.managerId)?.fullName ?? '—')
    : '—'

  return (
    <div
      className="max-w-[900px] mx-auto"
      data-status-label={statusMeta.label}
      data-edit-status-label={editStatusMeta.label}
      data-edit-manager-name={editManagerName}
    >

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
                  <div className="flex items-center gap-1.5 text-[12px] text-text-muted font-mono">
                    <span>{form.code || 'No project code'}</span>
                    <Lock className="w-3 h-3" strokeWidth={1.75} aria-label="Project code cannot be changed" />
                  </div>
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
                    className="btn-ghost text-[13px]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-ghost text-[13px] text-danger hover:bg-danger/5"
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

      {/* ── Tab navigation ── */}
      <div className="flex items-center gap-1 border-b border-border-subtle mb-6">
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'members',  label: 'Members', count: members.length },
          { id: 'documents', label: 'Documents', count: documents.length, icon: Paperclip },
          ...(canEdit ? [{ id: 'workload', label: 'Workload', icon: BarChart3 }] : []),
        ] as Array<{ id: ProjectDetailTab; label: string; count?: number; icon?: LucideIcon }>).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 pb-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
            {tab.label}
            {tab.count != null && (
              <span className="text-[10.5px] bg-bg-subtle text-text-muted px-1.5 py-0.5 rounded-full ml-0.5">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <ProjectOverviewTab
          project={project}
          isEditing={isEditing}
          form={form}
          set={set}
          managerName={managerName}
          onChangeManager={(!isEditing && canManageMembers) ? () => setChangeManagerOpen(true) : undefined}
        />
      )}

      {/* ── Tab: Members ── */}
      {activeTab === 'members' && (
        <ProjectMembersTab
          members={members}
          membersLoading={membersLoading}
          canManageMembers={canManageMembers}
          onAddMemberClick={() => setAddMemberOpen(true)}
          onEditMemberClick={(m) => setEditingMember(m)}
          onRemoveMemberClick={handleRemoveMember}
        />
      )}

      {/* ── Tab: Documents ── */}
      {activeTab === 'documents' && (
        <ProjectDocumentsTab
          documents={documents}
          documentsLoading={documentsLoading}
          canUploadDocuments={canUploadDocuments}
          isUploadingDocument={isUploadingDocument}
          isDeletingDocument={isDeletingDocument}
          onUploadDocument={handleUploadDocument}
          onDeleteDocument={deleteDocument}
          user={user}
          isOwnProject={isOwnProject}
          isAdmin={can.isAdmin}
        />
      )}

      {/* ── Tab: Workload ── */}
      {activeTab === 'workload' && canEdit && (
        <div className="card p-5">
          <ProjectWorkloadDashboard projectId={projectId} />
        </div>
      )}

      <ProjectAddMemberModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        projectId={projectId}
      />

      <ProjectEditMemberModal
        open={!!editingMember}
        member={editingMember}
        projectId={projectId}
        onClose={() => setEditingMember(null)}
      />

      <ProjectChangeManagerModal
        open={changeManagerOpen}
        projectId={projectId}
        onClose={() => setChangeManagerOpen(false)}
      />

      {confirmDialog}
    </div>
  )
}
