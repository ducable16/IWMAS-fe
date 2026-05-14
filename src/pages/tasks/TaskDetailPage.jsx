import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, ChevronDown, MoreHorizontal, Check, X,
  User, Flag, Calendar, Tag, GitBranch,
  Clock, CheckSquare, MessageSquare, History, Timer,
  AlertTriangle, Loader2, ChevronRight, Paperclip, Upload, Download, Trash2,
} from 'lucide-react'
import clsx from 'clsx'
import MentionTextarea from '@/components/ui/MentionTextarea'
import CommentContent from '@/components/ui/CommentContent'
import {
  useTask, useTaskHistory, useUpdateTaskStatus,
  useUpdateTask, useAddTaskComment,
  useUpdateTaskComment, useDeleteTaskComment,
  useTaskAttachments, useUploadTaskAttachment, useDeleteTaskAttachment,
} from '@/features/tasks/hooks/useTask'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useProjectMembers } from '@/features/projects/hooks/useProjects'
import { LiveLoading, LiveError } from '@/components/feedback/LiveStateOverlay'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCan } from '@/utils/permissions'
import {
  TASK_STATUSES,
  TASK_STATUS_DETAIL_META as STATUS_META,
  TASK_PRIORITY_META,
  TASK_TYPE_LABEL,
  TASK_TYPES,
  TASK_PRIORITIES,
} from '@/constants/enums'
import { TaskStatusBadge } from '@/components/ui/Badge'

const PRIORITY_META = {
  LOW:      { label: 'Low',      icon: '▼', cls: 'text-text-muted'                 },
  MEDIUM:   { label: 'Medium',   icon: '●', cls: 'text-warning'                    },
  HIGH:     { label: 'High',     icon: '▲', cls: 'text-danger'                     },
  CRITICAL: { label: 'Critical', icon: '⬤', cls: 'text-danger font-semibold'       },
}

const ACTIVITY_TABS = [
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'attachments', label: 'Attachments', icon: Paperclip },
  { id: 'history',  label: 'History',  icon: History       },
  { id: 'worklog',  label: 'Work log', icon: Timer         },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ name, avatarUrl, size = 'sm' }) {
  const initials = name
    ? name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const sz = size === 'xs'
    ? 'w-5 h-5 text-[9px]'
    : size === 'sm'
    ? 'w-6 h-6 text-[10px]'
    : 'w-8 h-8 text-[12px]'
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User'}
        className={clsx('rounded-full object-cover border border-border-subtle shrink-0', sz)}
      />
    )
  }
  return (
    <div className={clsx('rounded-full bg-accent flex items-center justify-center font-semibold text-white shrink-0', sz)}>
      {initials}
    </div>
  )
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-2 py-2 border-b border-border-subtle last:border-0">
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted pt-0.5">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
        {label}
      </div>
      <div className="text-[13px] text-text-primary min-h-[20px]">{children}</div>
    </div>
  )
}

// ─── Status dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({ current, taskId }) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useUpdateTaskStatus(taskId)
  const meta = STATUS_META[current] || STATUS_META.TODO

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className="flex items-center gap-1.5 transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isPending
          ? <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide', meta.cls)}><Loader2 className="w-3 h-3 animate-spin" /></span>
          : <TaskStatusBadge status={current} variant="detail" />}
        <ChevronDown className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute top-9 left-0 z-30 bg-bg-surface border border-border rounded-lg py-1 min-w-[160px] shadow-card animate-fade-in">
          {TASK_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { mutate({ status: s }); setOpen(false) }}
              className={clsx(
                'flex items-center gap-2 w-full px-3 py-1.5 text-[12.5px] hover:bg-bg-subtle transition-colors',
                s === current ? 'font-semibold text-text-primary' : 'text-text-secondary',
              )}
            >
              <TaskStatusBadge status={s} variant="detail" className="text-[10px] py-0" />
              {s === current && <Check className="w-3 h-3 ml-auto text-accent" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-4 py-3 bg-bg-subtle/60 hover:bg-bg-hover/40 transition-colors"
      >
        <span className="text-[12.5px] font-semibold text-text-primary uppercase tracking-wider">{title}</span>
        <ChevronRight
          className={clsx('w-4 h-4 text-text-muted transition-transform', open && 'rotate-90')}
          strokeWidth={1.75}
        />
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

// ─── History tab ──────────────────────────────────────────────────────────────

function HistoryTab({ taskId }) {
  const { data: history = [], isLoading } = useTaskHistory(taskId)
  if (isLoading) return <LiveLoading label="Loading history…" />
  if (history.length === 0)
    return <p className="text-[13px] text-text-muted py-4 text-center">No history yet.</p>
  return (
    <div className="space-y-3">
      {history.map((h, i) => (
        <div key={h.id || i} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-bg-subtle border border-border flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-3 h-3 text-text-muted" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] text-text-primary">
              Status changed{' '}
              <span className="font-medium">{h.oldStatus}</span>
              {' → '}
              <span className="font-medium">{h.newStatus}</span>
            </p>
            {h.note && <p className="text-[12px] text-text-muted mt-0.5">{h.note}</p>}
            <p className="text-[11px] text-text-muted mt-0.5">
              {h.changedAt ? new Date(h.changedAt).toLocaleString() : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Single comment item ──────────────────────────────────────────────────────

function CommentItem({ comment, taskId, currentUserId, mentionMap }) {
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState('')
  const [confirming, setConfirming] = useState(false)

  const { mutate: updateComment, isPending: isUpdating } = useUpdateTaskComment(taskId)
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteTaskComment(taskId)

  const isOwn = comment.author?.id === currentUserId

  const startEdit = () => {
    setDraft(comment.content || '')
    setEditing(true)
    setConfirming(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft('')
  }

  const submitEdit = () => {
    const trimmed = draft.trim()
    if (!trimmed || isUpdating) return
    updateComment(
      { commentId: comment.id, content: trimmed },
      { onSuccess: () => setEditing(false) },
    )
  }

  const confirmDelete = () => {
    deleteComment(comment.id, { onSuccess: () => setConfirming(false) })
  }

  return (
    <div className="flex items-start gap-3 group">
      <Avatar name={comment.author?.fullName} avatarUrl={comment.author?.avatarUrl} size="sm" />
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-text-primary">
              {comment.author?.fullName || 'Unknown'}
            </span>
            <span className="text-[11px] text-text-muted">
              {new Date(comment.createdAt).toLocaleString()}
              {comment.updatedAt !== comment.createdAt && (
                <span className="ml-1 italic">(edited)</span>
              )}
            </span>
          </div>

          {/* Actions — only visible when hovering and isOwn */}
          {isOwn && !editing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={startEdit}
                className="text-[11px] text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors"
              >
                Edit
              </button>
              {!confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="text-[11px] text-text-muted hover:text-danger px-1.5 py-0.5 rounded hover:bg-danger/10 transition-colors"
                >
                  Delete
                </button>
              ) : (
                <span className="flex items-center gap-1">
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="text-[11px] text-danger font-medium px-1.5 py-0.5 rounded hover:bg-danger/10 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? '…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-[11px] text-text-muted px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content or edit textarea */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit()
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitEdit()
              }}
              rows={3}
              className="w-full text-[13px] text-text-primary bg-bg-surface border border-accent/40 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-accent leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={submitEdit}
                disabled={!draft.trim() || isUpdating}
                className="btn-primary text-[12px] px-3 py-1 flex items-center gap-1.5 disabled:opacity-40"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" strokeWidth={2.5} />}
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="btn-ghost text-[12px] px-3 py-1"
              >
                Cancel
              </button>
              <span className="text-[11px] text-text-muted ml-auto">Ctrl+Enter to save</span>
            </div>
          </div>
        ) : (
          <CommentContent content={comment.content} mentionMap={mentionMap} />
        )}
      </div>
    </div>
  )
}

// ─── Comments tab ─────────────────────────────────────────────────────────────

function CommentsTab({ taskId, comments = [], projectId }) {
  const [content, setContent] = useState('')
  const { mutate, isPending } = useAddTaskComment(taskId)
  const user = useAuthStore(s => s.user)

  // Build { fullName → userId } map from project members so that
  // @mention badges in comments can link to /users/:id
  const { data: projectMembers = [] } = useProjectMembers(projectId)
  const mentionMap = Object.fromEntries(
    projectMembers
      .filter((m) => m.userId && m.userFullName)
      .map((m) => [m.userFullName, m.userId]),
  )

  const handleSubmit = () => {
    if (!content.trim() || isPending) return
    mutate(content, { onSuccess: () => setContent('') })
  }

  return (
    <div className="space-y-6">
      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-5">
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              taskId={taskId}
              currentUserId={user?.id}
              mentionMap={mentionMap}
            />
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-text-muted italic">No comments yet.</p>
      )}

      {/* Compose area */}
      <div className="flex items-start gap-3">
        <Avatar name={user?.fullName || user?.name || user?.email} avatarUrl={user?.avatarUrl} size="sm" />
        <div className="flex-1 min-w-0 space-y-2">
          <MentionTextarea
            value={content}
            onChange={setContent}
            onSubmit={handleSubmit}
            projectId={projectId}
            placeholder="Add a comment… (type @ to mention)"
            rows={2}
            disabled={isPending}
          />
          <div className="flex items-center justify-end">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              className="btn-primary text-[12px] px-4 py-1.5 disabled:opacity-40"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AttachmentsTab({ taskId, canUploadAttachments, canDeleteAsManager, currentUserId }) {
  const { data: attachments = [], isLoading } = useTaskAttachments(taskId)
  const { mutate: uploadAttachment, isPending: isUploading } = useUploadTaskAttachment(taskId)
  const { mutate: deleteAttachment, isPending: isDeleting } = useDeleteTaskAttachment(taskId)

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadAttachment(file, {
      onSettled: () => {
        e.target.value = ''
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] text-text-muted">
          Allowed: image, PDF, Word, Excel, text · Max 20 MB
        </p>
        {canUploadAttachments && (
          <label className="btn-secondary cursor-pointer text-[12px]">
            <Upload className="w-3.5 h-3.5" />
            {isUploading ? 'Uploading…' : 'Upload file'}
            <input
              type="file"
              className="hidden"
              disabled={isUploading}
              onChange={handleUpload}
            />
          </label>
        )}
      </div>

      {isLoading ? (
        <LiveLoading label="Loading attachments…" />
      ) : attachments.length === 0 ? (
        <p className="text-[13px] text-text-muted italic">No attachments yet.</p>
      ) : (
        <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl overflow-hidden">
          {attachments.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-bg-surface">
              <Paperclip className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-text-primary truncate">{item.fileName}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {formatFileSize(item.fileSize)} · Uploaded {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                  {item.uploadedBy ? ` · by #${item.uploadedBy}` : ''}
                </p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-[12px] h-8 px-2.5"
              >
                <Download className="w-3.5 h-3.5" />
                Open
              </a>
              {(canDeleteAsManager || item.uploadedBy === currentUserId) && (
                <button
                  type="button"
                  onClick={() => deleteAttachment(item.id)}
                  disabled={isDeleting}
                  className="btn-ghost text-[12px] h-8 px-2.5 text-danger hover:bg-danger/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TaskDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [activeTab, setActiveTab] = useState('comments')

  // Which right-panel field is open for editing (one at a time)
  const [editingField, setEditingField] = useState(null)

  // Title inline editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft]     = useState('')

  // Description inline editing
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft]     = useState('')

  // Assignee search
  const [memberSearch, setMemberSearch] = useState('')

  // Labels draft (controlled during label editing session)
  const [labelsDraft, setLabelsDraft] = useState(null)
  const [labelInput, setLabelInput]   = useState('')

  const titleRef    = useRef(null)
  const dropdownRef = useRef(null)

  // Close popup dropdowns when clicking outside
  useEffect(() => {
    if (!editingField || !['assignee', 'priority', 'type', 'labels'].includes(editingField)) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setEditingField(null)
        setMemberSearch('')
        setLabelsDraft(null)
        setLabelInput('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [editingField])

  const { data: task, isLoading, isError, error, refetch } = useTask(id)
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(id)
  const { data: membersData } = useMembers({ size: 100 })
  const members = membersData?.members ?? []
  const user    = useAuthStore(s => s.user)
  const can     = useCan()

  // §4.8 / §4.9: ADMIN, project manager, or task assignee may edit / change status
  const isAssignee  = !!user && !!task && user.id === task.assignee?.id
  const canEditTask = can.isAdmin || can.isPm || isAssignee
  const canUploadAttachments = can.isAdmin || can.isPm || can.isTm
  const canDeleteAsManager = can.isAdmin || can.isPm

  if (isLoading) return (
    <div className="max-w-[1200px] mx-auto pt-6"><LiveLoading label="Loading task…" /></div>
  )
  if (isError) return (
    <div className="max-w-[1200px] mx-auto pt-6"><LiveError error={error} onRetry={refetch} /></div>
  )

  // Build a full PUT payload, merging in any override fields
  const buildPayload = (overrides = {}) => ({
    title:          task.title,
    description:    task.description     || null,
    status:         task.status,
    priority:       task.priority,
    type:           task.type,
    startDate:      task.startDate       || null,
    dueDate:        task.dueDate         || null,
    estimatedHours: task.estimatedHours  || null,
    actualHours:    task.actualHours     || null,
    assigneeId:     task.assignee?.id    || null,
    labels:         task.labels          || [],
    projectId:      task.projectId       || null,
    sprint:         task.sprint          || null,
    ...overrides,
  })

  // Save a right-panel field and close editor
  const save = (overrides) => {
    updateTask(buildPayload(overrides))
    setEditingField(null)
  }

  const saveLabels = () => {
    if (labelsDraft !== null) updateTask(buildPayload({ labels: labelsDraft }))
    setEditingField(null)
    setLabelsDraft(null)
    setLabelInput('')
  }

  const status    = task?.status   || 'TODO'
  const priority  = task?.priority || 'MEDIUM'
  const assignee  = task?.assignee
  const reporter  = task?.reporter
  const priorityM = PRIORITY_META[priority] || PRIORITY_META.MEDIUM
  const isDueOverdue = task?.dueDate && new Date(task.dueDate) < new Date()

  const filteredMembers = memberSearch
    ? members.filter(m => m.fullName.toLowerCase().includes(memberSearch.toLowerCase()))
    : members.slice(0, 8)

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          Back
        </button>
        <span>/</span>
        <Link to="/tasks" className="hover:text-text-primary transition-colors">Tasks</Link>
        <span>/</span>
        <span className="text-text-primary font-mono">{task?.id}</span>
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Editable title */}
          {editingTitle ? (
            <textarea
              ref={titleRef}
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  const t = titleDraft.trim()
                  if (t && t !== task.title) updateTask(buildPayload({ title: t }))
                  setEditingTitle(false)
                }
                if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(task.title) }
              }}
              onBlur={() => {
                const t = titleDraft.trim()
                if (t && t !== task.title) updateTask(buildPayload({ title: t }))
                setEditingTitle(false)
              }}
              className="w-full text-[22px] font-semibold text-text-primary leading-tight tracking-tight bg-bg-surface border border-accent/40 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-accent"
              rows={2}
            />
          ) : (
            <h1
              onClick={canEditTask ? () => { setTitleDraft(task?.title || ''); setEditingTitle(true) } : undefined}
              title={canEditTask ? 'Click to edit' : undefined}
              className={clsx(
                'text-[22px] font-semibold text-text-primary leading-tight tracking-tight rounded-lg px-3 py-2 -mx-3 transition-colors',
                canEditTask && 'cursor-text hover:bg-bg-hover/50',
              )}
            >
              {task?.title || 'Untitled task'}
            </h1>
          )}

          {/* Action strip */}
          <div className="flex items-center gap-2">
            {isUpdating && (
              <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving…
              </span>
            )}
            <button className="btn-ghost text-[12.5px] px-2.5 py-1.5 ml-auto">
              <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>

          {/* Editable description */}
          <CollapsibleSection title="Description">
            {editingDesc ? (
              <div className="space-y-2.5">
                <textarea
                  autoFocus
                  value={descDraft}
                  onChange={e => setDescDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') { setEditingDesc(false); setDescDraft(task.description || '') }
                  }}
                  placeholder="Add a description…"
                  rows={5}
                  className="w-full text-[13px] text-text-primary bg-bg-surface border border-accent/40 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-accent leading-relaxed"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateTask(buildPayload({ description: descDraft.trim() || null }))
                      setEditingDesc(false)
                    }}
                    className="btn-primary text-[12px] py-1 px-3 flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3" strokeWidth={2.5} />
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingDesc(false); setDescDraft(task.description || '') }}
                    className="btn-ghost text-[12px] py-1 px-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={canEditTask ? () => { setDescDraft(task?.description || ''); setEditingDesc(true) } : undefined}
                title={canEditTask ? 'Click to edit' : undefined}
                className={clsx(
                  'rounded-lg px-2 py-1.5 -mx-2 transition-colors',
                  canEditTask && 'cursor-text hover:bg-bg-hover/40',
                )}
              >
                {task?.description ? (
                  <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-[13px] text-text-muted italic">Add a description…</p>
                )}
              </div>
            )}
          </CollapsibleSection>

          {/* Skill requirements */}
          {task?.skillRequirements?.length > 0 && (
            <CollapsibleSection title="Skill requirements">
              <div className="flex flex-wrap gap-2">
                {task.skillRequirements.map(sr => (
                  <div key={sr.id} className="flex items-center gap-1.5 bg-bg-subtle border border-border-subtle rounded-md px-2.5 py-1">
                    <span className="text-[12px] font-medium text-text-primary">{sr.skillName}</span>
                    <span className="text-[11px] text-text-muted">·</span>
                    <span className="text-[11px] text-text-muted">{sr.minimumLevel}</span>
                    {sr.isRequired && (
                      <span className="text-[10px] font-semibold text-accent ml-0.5">required</span>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}



          <CollapsibleSection title="Linked items">
            <p className="text-[13px] text-text-muted italic">No linked items.</p>
          </CollapsibleSection>

          {/* Activity */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-text-primary">Activity</h3>
            <div className="flex items-center gap-0.5 border-b border-border-subtle">
              {ACTIVITY_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 pb-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors',
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-muted hover:text-text-secondary',
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="min-h-[80px]">
              {activeTab === 'comments' && <CommentsTab taskId={id} comments={task?.comments} projectId={task?.projectId} />}
              {activeTab === 'attachments' && (
                <AttachmentsTab
                  taskId={id}
                  canUploadAttachments={canUploadAttachments}
                  canDeleteAsManager={canDeleteAsManager}
                  currentUserId={user?.id}
                />
              )}
              {activeTab === 'history'  && <HistoryTab taskId={id} />}
              {activeTab === 'worklog'  && (
                <p className="text-[13px] text-text-muted py-4 text-center italic">No work logs yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="w-[280px] shrink-0 space-y-4 sticky top-[68px]">

          {/* Status dropdown — §4.9: ADMIN/PM/assignee only */}
          <StatusDropdown current={status} taskId={id} canChange={canEditTask} />

          {/* Details panel */}
          <div className="card p-4 space-y-0">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Details</p>

            {/* ── Assignee ── */}
            <DetailRow icon={User} label="Assignee">
              <div className="relative" ref={editingField === 'assignee' ? dropdownRef : null}>
                <button
                  onClick={canEditTask ? () => { setEditingField(editingField === 'assignee' ? null : 'assignee'); setMemberSearch('') } : undefined}
                  className={clsx(
                    'flex items-center gap-2 w-full text-left rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors',
                    canEditTask ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
                  )}
                >
                  {assignee ? (
                    <>
                      <Avatar name={assignee.fullName} avatarUrl={assignee.avatarUrl} size="xs" />
                      <Link
                        to={`/users/${assignee.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[13px] truncate hover:text-accent hover:underline transition-colors"
                      >
                        {assignee.fullName}
                      </Link>
                    </>
                  ) : (
                    <span className="text-text-muted text-[13px]">Unassigned</span>
                  )}
                </button>

                {editingField === 'assignee' && (
                  <div className="absolute top-full right-0 mt-1.5 z-50 w-[240px] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-1.5 space-y-1.5">
                    <input
                      autoFocus
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Escape') { setEditingField(null); setMemberSearch('') } }}
                      placeholder="Search members…"
                      className="w-full text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1.5 focus:outline-none focus:border-border-strong"
                    />
                    <div className="max-h-[180px] overflow-y-auto space-y-0.5">
                      <button
                        onClick={() => { save({ assigneeId: null }); setEditingField(null); setMemberSearch('') }}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[12px] text-text-muted hover:bg-bg-hover transition-colors"
                      >
                        Unassigned
                      </button>
                      {filteredMembers.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { save({ assigneeId: m.id }); setEditingField(null); setMemberSearch('') }}
                          className={clsx(
                            'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[12px] hover:bg-bg-hover transition-colors text-left',
                            m.id === assignee?.id ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary',
                          )}
                        >
                          <Avatar name={m.fullName} avatarUrl={m.avatarUrl} size="xs" />
                          <span className="truncate flex-1">{m.fullName}</span>
                          {m.id === assignee?.id && <Check className="w-3.5 h-3.5 shrink-0 text-accent" strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DetailRow>

            {/* ── Priority ── */}
            <DetailRow icon={Flag} label="Priority">
              <div className="relative" ref={editingField === 'priority' ? dropdownRef : null}>
                <button
                  onClick={canEditTask ? () => setEditingField(editingField === 'priority' ? null : 'priority') : undefined}
                  className={clsx(
                    'flex items-center gap-1.5 font-medium rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors w-full text-left',
                    canEditTask ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
                  )}
                >
                  <span className={priorityM.cls}>{priorityM.label}</span>
                </button>

                {editingField === 'priority' && (
                  <div className="absolute top-full right-0 mt-1.5 z-50 w-[180px] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-1.5 space-y-0.5">
                    {TASK_PRIORITIES.map(p => {
                      const m = PRIORITY_META[p] || { icon: '', label: p, cls: '' }
                      return (
                        <button
                          key={p}
                          onClick={() => { save({ priority: p }); setEditingField(null) }}
                          className={clsx(
                            'flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[12.5px] hover:bg-bg-hover transition-colors text-left',
                            p === priority && 'bg-bg-subtle',
                          )}
                        >
                          <span className={clsx("flex-1", m.cls)}>{m.label}</span>
                          {p === priority && <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-accent" strokeWidth={2.5} />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </DetailRow>

            {/* ── Type ── */}
            <DetailRow icon={GitBranch} label="Type">
              <div className="relative" ref={editingField === 'type' ? dropdownRef : null}>
                <button
                  onClick={canEditTask ? () => setEditingField(editingField === 'type' ? null : 'type') : undefined}
                  className={clsx(
                    'rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px] text-text-secondary text-left w-full',
                    canEditTask ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
                  )}
                >
                  {TASK_TYPE_LABEL[task?.type] || task?.type || '—'}
                </button>

                {editingField === 'type' && (
                  <div className="absolute top-full right-0 mt-1.5 z-50 w-[180px] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-1.5 space-y-0.5">
                    {TASK_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => { save({ type: t }); setEditingField(null) }}
                        className={clsx(
                          'flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[12.5px] hover:bg-bg-hover transition-colors text-left',
                          t === task.type ? 'bg-bg-subtle text-text-primary' : 'text-text-secondary',
                        )}
                      >
                        <span className="flex-1">{TASK_TYPE_LABEL[t] || t}</span>
                        {t === task.type && <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-accent" strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DetailRow>

            {/* ── Start date ── */}
            <DetailRow icon={Calendar} label="Start date">
              {editingField === 'startDate' ? (
                <input
                  type="date"
                  autoFocus
                  defaultValue={task.startDate || ''}
                  onBlur={e => { save({ startDate: e.target.value || null }) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') setEditingField(null)
                  }}
                  className="text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1 focus:outline-none focus:border-border-strong"
                />
              ) : (
                <button
                  onClick={canEditTask ? () => setEditingField('startDate') : undefined}
                  className={clsx(
                    'rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px] text-text-secondary',
                    canEditTask ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
                  )}
                >
                  {task?.startDate || '—'}
                </button>
              )}
            </DetailRow>

            {/* ── Due date ── */}
            <DetailRow icon={Calendar} label="Due date">
              {editingField === 'dueDate' ? (
                <input
                  type="date"
                  autoFocus
                  defaultValue={task.dueDate || ''}
                  onBlur={e => { save({ dueDate: e.target.value || null }) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') setEditingField(null)
                  }}
                  className="text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1 focus:outline-none focus:border-border-strong"
                />
              ) : (
                <button
                  onClick={canEditTask ? () => setEditingField('dueDate') : undefined}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px]',
                    canEditTask ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
                    isDueOverdue ? 'text-danger font-medium' : 'text-text-secondary',
                  )}
                >
                  {isDueOverdue && <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />}
                  {task?.dueDate || '—'}
                </button>
              )}
            </DetailRow>

            {/* ── Estimate ── */}
            <DetailRow icon={Timer} label="Estimate">
              {editingField === 'estimate' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    autoFocus
                    min="0"
                    step="0.5"
                    defaultValue={task.estimatedHours || ''}
                    onBlur={e => {
                      const v = parseFloat(e.target.value)
                      save({ estimatedHours: isNaN(v) ? null : v })
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                      if (e.key === 'Escape') setEditingField(null)
                    }}
                    className="w-20 text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1 focus:outline-none focus:border-border-strong"
                  />
                  <span className="text-[12px] text-text-muted">hours</span>
                </div>
              ) : (
                <button
                  onClick={canEditTask ? () => setEditingField('estimate') : undefined}
                  className={clsx(
                    'rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors text-[13px] text-text-secondary',
                    canEditTask ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
                  )}
                >
                  {task?.estimatedHours ? `${task.estimatedHours}h` : '—'}
                </button>
              )}
            </DetailRow>

            {/* ── Actual hours (read-only — set by work log) ── */}
            <DetailRow icon={CheckSquare} label="Actual">
              <span className="text-text-secondary text-[13px]">
                {task?.actualHours ? `${task.actualHours}h` : '—'}
              </span>
            </DetailRow>

            {/* ── Labels ── */}
            <DetailRow icon={Tag} label="Labels">
              <div className="relative" ref={editingField === 'labels' ? dropdownRef : null}>
                <button
                  onClick={canEditTask
                    ? () => {
                        if (editingField === 'labels') {
                           setEditingField(null)
                        } else {
                           setLabelsDraft([...(task?.labels || [])])
                           setEditingField('labels')
                        }
                      }
                    : undefined
                  }
                  className={clsx(
                    'flex flex-wrap gap-1 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors w-full text-left',
                    canEditTask ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
                  )}
                >
                  {(task?.labels || []).length > 0 ? (
                    task.labels.map(l => (
                      <span
                        key={l}
                        className="text-[11px] bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20"
                      >
                        #{l}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-muted text-[13px]">None</span>
                  )}
                </button>

                {editingField === 'labels' && labelsDraft !== null && (
                  <div className="absolute bottom-full right-0 mb-1.5 z-50 w-[240px] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-2 space-y-2">
                    {labelsDraft.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {labelsDraft.map(l => (
                          <span
                            key={l}
                            className="inline-flex items-center gap-1 text-[11px] bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20"
                          >
                            #{l}
                            <button
                              onClick={() => setLabelsDraft(prev => prev.filter(x => x !== l))}
                              className="text-accent/60 hover:text-accent"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      autoFocus
                      value={labelInput}
                      onChange={e => setLabelInput(e.target.value)}
                      placeholder="Add label, Enter to confirm…"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const v = labelInput.trim()
                          if (v && !labelsDraft.includes(v))
                            setLabelsDraft(prev => [...prev, v])
                          setLabelInput('')
                        }
                        if (e.key === 'Escape') { setEditingField(null); setLabelsDraft(null); setLabelInput('') }
                      }}
                      className="w-full text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1.5 focus:outline-none focus:border-border-strong"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border-subtle">
                      <button
                        onClick={() => { setEditingField(null); setLabelsDraft(null); setLabelInput('') }}
                        className="text-[11.5px] text-text-muted hover:text-text-primary px-2 py-1 transition-colors"
                      >
                        Cancel
                      </button>
                      <button onClick={saveLabels} className="btn-primary text-[11.5px] px-3 py-1">
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </DetailRow>

            {/* ── Reporter (read-only) ── */}
            <DetailRow icon={User} label="Reporter">
              {reporter ? (
                <div className="flex items-center gap-2">
                  <Avatar name={reporter.fullName} avatarUrl={reporter.avatarUrl} />
                  <Link
                    to={`/users/${reporter.id}`}
                    className="text-[13px] hover:text-accent hover:underline transition-colors"
                  >
                    {reporter.fullName}
                  </Link>
                </div>
              ) : (
                <span className="text-text-muted text-[13px]">—</span>
              )}
            </DetailRow>
          </div>

          {/* Timestamps */}
          <div className="text-[11px] text-text-muted space-y-0.5 px-1">
            {task?.createdAt && (
              <p>Created {new Date(task.createdAt).toLocaleString()}</p>
            )}
            {task?.completedAt && (
              <p>Completed {new Date(task.completedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
