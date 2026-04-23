import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, ChevronDown, Zap, MoreHorizontal, Plus,
  User, Flag, Calendar, Tag, Users, GitBranch,
  Clock, CheckSquare, Link2, MessageSquare, History, Timer,
  AlertTriangle, Loader2, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import { useTask, useTaskHistory, useUpdateTaskStatus, useAddTaskComment } from '@/features/tasks/hooks/useTask'
import { LiveLoading, LiveError } from '@/components/feedback/LiveStateOverlay'
import { useAuthStore } from '@/features/auth/store/authStore'

/* ─── constants ────────────────────────────────────────────── */
const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']

const STATUS_META = {
  TODO:        { label: 'To Do',       cls: 'bg-bg-subtle text-text-secondary border-border' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-accent/10 text-accent border-accent/20' },
  IN_REVIEW:   { label: 'In Review',   cls: 'bg-[#1d6fa4]/10 text-[#1d6fa4] border-[#1d6fa4]/20' },
  DONE:        { label: 'Done',        cls: 'bg-success/10 text-success border-success/20' },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-danger/10 text-danger border-danger/20' },
}

const PRIORITY_META = {
  HIGH:   { label: 'High',   icon: '▲', cls: 'text-danger' },
  MEDIUM: { label: 'Medium', icon: '●', cls: 'text-warning' },
  LOW:    { label: 'Low',    icon: '▼', cls: 'text-text-muted' },
}

const ACTIVITY_TABS = [
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'history',  label: 'History',  icon: History },
  { id: 'worklog',  label: 'Work log', icon: Timer },
]

/* ─── small helpers ─────────────────────────────────────────── */
function Avatar({ name, size = 'sm' }) {
  const initials = name ? name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : '?'
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-[12px]'
  return (
    <div className={clsx('rounded-full bg-accent flex items-center justify-center font-semibold text-white shrink-0', sz)}>
      {initials}
    </div>
  )
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-2 py-2.5 border-b border-border-subtle last:border-0">
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted pt-0.5">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
        {label}
      </div>
      <div className="text-[13px] text-text-primary min-h-[20px]">{children}</div>
    </div>
  )
}

function StatusDropdown({ current, taskId }) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useUpdateTaskStatus(taskId)
  const meta = STATUS_META[current] || STATUS_META.TODO

  const select = (s) => {
    setOpen(false)
    mutate({ status: s })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12.5px] font-medium transition-colors',
          meta.cls,
        )}
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : meta.label}
        <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute top-9 left-0 z-30 bg-bg-surface border border-border rounded-lg shadow-xl py-1 min-w-[140px] animate-fade-in">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => select(s)}
              className={clsx(
                'flex items-center gap-2 w-full px-3 py-1.5 text-[12.5px] hover:bg-bg-subtle transition-colors',
                s === current ? 'font-semibold text-text-primary' : 'text-text-secondary',
              )}
            >
              {STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-4 py-3 bg-bg-subtle/60 hover:bg-bg-hover/40 transition-colors"
      >
        <span className="text-[12.5px] font-semibold text-text-primary uppercase tracking-wider">{title}</span>
        <ChevronRight className={clsx('w-4 h-4 text-text-muted transition-transform', open && 'rotate-90')} strokeWidth={1.75} />
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

/* ─── History tab ───────────────────────────────────────────── */
function HistoryTab({ taskId }) {
  const { data: history = [], isLoading } = useTaskHistory(taskId)
  if (isLoading) return <LiveLoading label="Loading history…" />
  if (history.length === 0) return (
    <p className="text-[13px] text-text-muted py-4 text-center">No history yet.</p>
  )
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

/* ─── Comments tab ──────────────────────────────────────────── */
function CommentsTab({ taskId, comments = [] }) {
  const [content, setContent] = useState('')
  const { mutate, isPending } = useAddTaskComment(taskId)
  const user = useAuthStore(s => s.user)

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!content.trim() || isPending) return
    mutate(content, {
      onSuccess: () => setContent('')
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Comments */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar name={c.author?.fullName || c.author?.username} size="sm" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-text-primary">
                    {c.author?.fullName || c.author?.username || 'Unknown'}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-[13px] text-text-secondary whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-text-muted italic">No comments yet.</p>
      )}

      {/* Add Comment Input */}
      <div className="flex items-start gap-3">
        <Avatar name={user?.name || user?.email} size="sm" />
        <div className="flex-1">
          <div className="border border-border rounded-lg bg-bg-surface focus-within:border-border-strong transition-colors overflow-hidden">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment…"
              rows={2}
              className="w-full bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none p-3 resize-none"
            />
            <div className="flex items-center justify-between bg-bg-subtle/50 border-t border-border-subtle px-3 py-2">
              <div className="flex gap-2">
                {['Who is working on this…?', 'Can I get more info…?', 'Status update…'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setContent(s)}
                    className="text-[11.5px] text-text-muted border border-border rounded px-2 py-0.5 hover:bg-bg-subtle transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleSubmit}
                disabled={!content.trim() || isPending}
                className="btn-primary text-[12px] px-3 py-1"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-text-muted mt-2">Pro tip: press <kbd className="kbd">Enter</kbd> to save, <kbd className="kbd">Shift</kbd> + <kbd className="kbd">Enter</kbd> for new line.</p>
        </div>
      </div>
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('comments')

  const { data: task, isLoading, isError, error, refetch } = useTask(id)

  if (isLoading) return (
    <div className="max-w-[1200px] mx-auto pt-6">
      <LiveLoading label="Loading task…" />
    </div>
  )
  if (isError) return (
    <div className="max-w-[1200px] mx-auto pt-6">
      <LiveError error={error} onRetry={refetch} />
    </div>
  )

  const status     = task?.status     || 'TODO'
  const priority   = task?.priority   || 'MEDIUM'
  const assignee   = task?.assignee
  const reporter   = task?.reporter
  const priorityM  = PRIORITY_META[priority] || PRIORITY_META.MEDIUM

  const isDueOverdue = task?.dueDate && new Date(task.dueDate) < new Date()

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          Back
        </button>
        <span>/</span>
        <Link to="/tasks" className="hover:text-text-primary transition-colors">Tasks</Link>
        <span>/</span>
        <span className="text-text-primary font-mono">{task?.id}</span>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">

        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Title */}
          <h1 className="text-[22px] font-semibold text-text-primary leading-tight tracking-tight">
            {task?.title || 'Untitled task'}
          </h1>

          {/* Action strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn-ghost text-[12.5px] px-2.5 py-1.5 gap-1">
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
            <button className="btn-ghost text-[12.5px] px-2.5 py-1.5">
              <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>

          {/* Description */}
          <CollapsibleSection title="Description">
            {task?.description ? (
              <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            ) : (
              <p className="text-[13px] text-text-muted italic">Add a description…</p>
            )}
          </CollapsibleSection>

          {/* Skill requirements */}
          {task?.skillRequirements?.length > 0 && (
            <CollapsibleSection title="Skill requirements">
              <div className="flex flex-wrap gap-2">
                {task.skillRequirements.map((sr) => (
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

          {/* Child tasks placeholder */}
          <CollapsibleSection title="Subtasks">
            <p className="text-[13px] text-text-muted italic">No subtasks yet.</p>
          </CollapsibleSection>

          {/* Linked work items placeholder */}
          <CollapsibleSection title="Linked items">
            <p className="text-[13px] text-text-muted italic">No linked items.</p>
          </CollapsibleSection>

          {/* Activity */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-text-primary">Activity</h3>

            {/* Tabs */}
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

            {/* Tab content */}
            <div className="min-h-[80px]">
              {activeTab === 'comments' && <CommentsTab taskId={id} comments={task?.comments} />}

              {activeTab === 'history' && <HistoryTab taskId={id} />}

              {activeTab === 'worklog' && (
                <p className="text-[13px] text-text-muted py-4 text-center italic">No work logs yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="w-[280px] shrink-0 space-y-4 sticky top-[68px]">

          {/* Status + actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusDropdown current={status} taskId={id} />
          </div>

          {/* Details panel */}
          <div className="card p-4 space-y-0">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Details</p>

            <DetailRow icon={User} label="Assignee">
              {assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar name={assignee.fullName || assignee.username} />
                  <span>{assignee.fullName || assignee.username}</span>
                </div>
              ) : (
                <span className="text-text-muted">Unassigned</span>
              )}
            </DetailRow>

            <DetailRow icon={Flag} label="Priority">
              <span className={clsx('flex items-center gap-1.5 font-medium', priorityM.cls)}>
                <span>{priorityM.icon}</span>
                {priorityM.label}
              </span>
            </DetailRow>

            <DetailRow icon={GitBranch} label="Type">
              <span className="capitalize text-text-secondary">{task?.type?.replace(/_/g, ' ') || '—'}</span>
            </DetailRow>

            <DetailRow icon={Calendar} label="Start date">
              <span className="text-text-secondary">{task?.startDate || '—'}</span>
            </DetailRow>

            <DetailRow icon={Calendar} label="Due date">
              {task?.dueDate ? (
                <span className={clsx(
                  'inline-flex items-center gap-1.5 font-medium',
                  isDueOverdue ? 'text-danger' : 'text-text-secondary',
                )}>
                  {isDueOverdue && <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />}
                  {task.dueDate}
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </DetailRow>

            <DetailRow icon={Timer} label="Estimate">
              <span className="text-text-secondary">
                {task?.estimatedHours ? `${task.estimatedHours}h` : '—'}
              </span>
            </DetailRow>

            <DetailRow icon={CheckSquare} label="Actual">
              <span className="text-text-secondary">
                {task?.actualHours ? `${task.actualHours}h` : '—'}
              </span>
            </DetailRow>

            <DetailRow icon={Tag} label="Labels">
              <span className="text-text-muted">None</span>
            </DetailRow>

            <DetailRow icon={User} label="Reporter">
              {reporter ? (
                <div className="flex items-center gap-2">
                  <Avatar name={reporter.fullName || reporter.username} />
                  <span>{reporter.fullName || reporter.username}</span>
                </div>
              ) : (
                <span className="text-text-muted">—</span>
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
