import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Briefcase, ExternalLink,
  CheckSquare, FolderOpen, Clock, ChevronRight,
  ChevronLeft, AlertTriangle, Loader2,
  ListTodo, FileText, LayoutGrid,
} from 'lucide-react'
import clsx from 'clsx'
import {
  useUser,
  useUserProjects,
  useUserAssignedTasks,
  useUserReportedTasks,
} from '@/features/members/hooks/useMembers'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import {
  TASK_STATUS_DETAIL_META as STATUS_META,
  TASK_PRIORITY_META,
  PROJECT_STATUS_META,
  USER_ROLE_LABEL,
  USER_STATUS_META,
} from '@/constants/enums'
import { useCan } from '@/utils/permissions'
import { TaskStatusBadge, TaskPriorityBadge, ProjectStatusBadge, UserStatusBadge } from '@/components/ui/Badge'

/* ─────────────────────────────────────────────────────────────────────
 * Small helpers / atoms
 * ─────────────────────────────────────────────────────────────────── */

function UserAvatar({ name, size = 'lg' }) {
  const initials = name
    ? name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const sz =
    size === 'lg' ? 'w-16 h-16 text-[22px]' :
    size === 'md' ? 'w-10 h-10 text-[14px]' :
                    'w-7  h-7  text-[11px]'
  return (
    <div className={clsx(
      sz,
      'rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/20',
      'flex items-center justify-center font-bold text-accent shrink-0',
    )}>
      {initials}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-accent' }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-subtle/60 rounded-xl border border-border-subtle">
      <div className={clsx('p-2 rounded-lg bg-bg-surface border border-border-subtle', color)}>
        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-text-primary tabular-nums leading-none">{value}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{label}</p>
        {sub && <p className="text-[10.5px] text-text-muted">{sub}</p>}
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="p-1 rounded border border-border text-text-muted hover:border-border-strong disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="text-[12px] text-text-muted px-2">
        {page + 1} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="p-1 rounded border border-border text-text-muted hover:border-border-strong disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Task row — compact card-style list item
 * ─────────────────────────────────────────────────────────────────── */
function TaskRow({ task }) {
  const statusMeta   = STATUS_META[task.status]   || STATUS_META.TODO
  const priorityMeta = TASK_PRIORITY_META?.[task.priority] || null

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-bg-subtle/80 transition-colors border border-transparent hover:border-border-subtle"
    >
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="text-[13px] font-medium text-text-primary leading-snug group-hover:text-accent transition-colors truncate">
          {task.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <TaskStatusBadge status={task.status} variant="detail" />

          {task.priority && (
            <TaskPriorityBadge priority={task.priority} />
          )}

          {task.dueDate && (
            <span className={clsx(
              'flex items-center gap-0.5 text-[11px]',
              new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                ? 'text-danger font-medium'
                : 'text-text-muted',
            )}>
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {task.dueDate}
            </span>
          )}

          {task.projectId && (
            <span className="text-[11px] text-text-muted font-mono">
              #{task.projectId}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-text-muted shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Project row — compact list item
 * ─────────────────────────────────────────────────────────────────── */
function ProjectRow({ project }) {
  const meta = PROJECT_STATUS_META?.[project.status] || null

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-bg-subtle/80 transition-colors border border-transparent hover:border-border-subtle"
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
        <FolderOpen className="w-4 h-4 text-accent" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary leading-snug group-hover:text-accent transition-colors truncate">
          {project.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {project.code && (
            <span className="text-[11px] font-mono text-text-muted">{project.code}</span>
          )}
          <ProjectStatusBadge status={project.status} />
          {project.startDate && (
            <span className="text-[11px] text-text-muted">
              {project.startDate}{project.endDate ? ` → ${project.endDate}` : ''}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Tasks panel — Assigned / Reported sub-tabs
 * ─────────────────────────────────────────────────────────────────── */
function TasksPanel({ userId }) {
  const [sub, setSub]   = useState('assigned')
  const [page, setPage] = useState(0)

  const commonParams = { sortBy: 'updatedAt', sortDirection: 'DESC', size: 10, page }

  const assigned = useUserAssignedTasks(userId, commonParams, sub === 'assigned')
  const reported = useUserReportedTasks(userId, commonParams, sub === 'reported')

  const active = sub === 'assigned' ? assigned : reported

  const SUB_TABS = [
    { id: 'assigned', label: 'Assigned to them',    icon: ListTodo  },
    { id: 'reported', label: 'Reported by them',    icon: FileText  },
  ]

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle mb-3">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSub(t.id); setPage(0) }}
            className={clsx(
              'flex items-center gap-1.5 px-3 pb-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors',
              sub === t.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            <t.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            {t.label}
            {sub === t.id && active.data && (
              <span className="ml-1 text-[10.5px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-semibold">
                {active.data.totalElements}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {active.isLoading && <LiveLoading label="Loading tasks…" />}
      {active.isError   && <LiveError error={active.error} onRetry={active.refetch} />}

      {!active.isLoading && !active.isError && (
        active.data?.tasks?.length === 0
          ? <LiveEmpty label={`No ${sub === 'assigned' ? 'assigned' : 'reported'} tasks visible to you.`} />
          : (
            <div className="space-y-0.5">
              {active.data.tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
              <Pagination
                page={page}
                totalPages={active.data.totalPages}
                onChange={setPage}
              />
            </div>
          )
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Projects panel
 * ─────────────────────────────────────────────────────────────────── */
function ProjectsPanel({ userId }) {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, error, refetch } = useUserProjects(
    userId,
    { sortBy: 'name', sortDirection: 'ASC', size: 10, page },
  )

  if (isLoading) return <LiveLoading label="Loading projects…" />
  if (isError)   return <LiveError error={error} onRetry={refetch} />
  if (!data?.projects?.length) return <LiveEmpty label="No shared projects visible to you." />

  return (
    <div>
      <div className="space-y-0.5">
        {data.projects.map((p) => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </div>
      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Recent Activity feed — derived from assigned tasks (updatedAt desc)
 * ─────────────────────────────────────────────────────────────────── */
function ActivityFeed({ userId }) {
  const { data, isLoading } = useUserAssignedTasks(
    userId,
    { sortBy: 'updatedAt', sortDirection: 'DESC', size: 8, page: 0 },
    true,
  )

  if (isLoading) return (
    <div className="flex items-center gap-2 text-[12px] text-text-muted py-3">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      Loading activity…
    </div>
  )

  const tasks = data?.tasks ?? []
  if (tasks.length === 0) return (
    <p className="text-[12px] text-text-muted italic py-2">No recent activity visible.</p>
  )

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const statusMeta = STATUS_META[task.status] || STATUS_META.TODO
        const updatedAt  = task.updatedAt ? new Date(task.updatedAt) : null
        const timeAgo    = updatedAt ? formatTimeAgo(updatedAt) : ''

        return (
          <div key={task.id} className="flex items-start gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div className={clsx(
                'w-2 h-2 rounded-full shrink-0',
                statusMeta.dotCls || 'bg-text-muted',
              )} />
              <div className="w-px flex-1 bg-border-subtle mt-1 min-h-[16px]" />
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <Link
                to={`/tasks/${task.id}`}
                className="text-[12.5px] font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
              >
                {task.title}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={clsx('text-[11px] font-medium', statusMeta.cls || 'text-text-muted')}>
                  {statusMeta.label || task.status}
                </span>
                {timeAgo && (
                  <span className="text-[11px] text-text-muted">· {timeAgo}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Main Page
 * ─────────────────────────────────────────────────────────────────── */

const MAIN_TABS = [
  { id: 'tasks',    label: 'Tasks',    icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: LayoutGrid  },
]

export default function UserProfilePage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const userId     = Number(id)
  const currentUser = useAuthStore((s) => s.user)
  const can        = useCan()

  const [activeTab, setActiveTab] = useState('tasks')

  const { data: user, isLoading, isError, error, refetch } = useUser(userId)

  // Fetch task counts for stats
  const { data: assignedData } = useUserAssignedTasks(userId, { size: 1 }, !!userId)
  const { data: reportedData } = useUserReportedTasks(userId, { size: 1 }, !!userId)
  const { data: inProgressData } = useUserAssignedTasks(
    userId,
    { statuses: ['IN_PROGRESS'], size: 1 },
    !!userId,
  )

  if (isLoading) return (
    <div className="max-w-[1100px] mx-auto pt-8">
      <LiveLoading label="Loading profile…" />
    </div>
  )
  if (isError) return (
    <div className="max-w-[1100px] mx-auto pt-8">
      <LiveError error={error} onRetry={refetch} />
    </div>
  )

  const isOwnProfile   = currentUser?.id === userId
  const canSeeRestrict = can.isAdmin || can.isHr  // phone, status, dates
  const roleMeta       = USER_ROLE_LABEL?.[user.role] || user.role
  const statusMeta     = USER_STATUS_META?.[user.status] || null

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          Back
        </button>
        <span>/</span>
        <Link to="/members" className="hover:text-text-primary transition-colors">Members</Link>
        <span>/</span>
        <span className="text-text-primary">{user.fullName}</span>
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Profile header card */}
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <UserAvatar name={user.fullName} size="lg" />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-[20px] font-bold text-text-primary leading-tight">
                      {user.fullName}
                    </h1>
                    {user.position && (
                      <p className="text-[13px] text-text-secondary mt-0.5">{user.position}</p>
                    )}
                  </div>

                  {isOwnProfile && (
                    <Link
                      to="/settings"
                      className="btn-ghost text-[12px] gap-1.5 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Edit profile
                    </Link>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="badge badge-neutral text-[11.5px]">{roleMeta}</span>

                  {canSeeRestrict && statusMeta && (
                    <UserStatusBadge status={user.status} />
                  )}
                </div>

                {/* Contact info */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                    <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                    <a href={`mailto:${user.email}`} className="hover:text-accent transition-colors">
                      {user.email}
                    </a>
                  </div>

                  {canSeeRestrict && user.phone && (
                    <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                      <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                      {user.phone}
                    </div>
                  )}

                  {user.position && (
                    <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                      <Briefcase className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                      {user.position}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="card p-4">
            <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Recent Activity
            </h3>
            <ActivityFeed userId={userId} />
          </div>

          {/* Main tab panel */}
          <div className="card p-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border-subtle mb-4">
              {MAIN_TABS.map((tab) => (
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
                  <tab.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'tasks'    && <TasksPanel    userId={userId} />}
            {activeTab === 'projects' && <ProjectsPanel userId={userId} />}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────── */}
        <div className="w-[240px] shrink-0 space-y-4 sticky top-[68px]">

          {/* Stats */}
          <div className="card p-4 space-y-2.5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
              Stats
            </p>

            <StatCard
              icon={CheckSquare}
              label="Assigned tasks"
              value={assignedData?.totalElements ?? '—'}
              color="text-accent"
            />
            <StatCard
              icon={Loader2}
              label="In progress"
              value={inProgressData?.totalElements ?? '—'}
              color="text-warning"
            />
            <StatCard
              icon={FileText}
              label="Reported tasks"
              value={reportedData?.totalElements ?? '—'}
              color="text-info"
            />
          </div>

          {/* Meta info (ADMIN/HR only) */}
          {canSeeRestrict && (
            <div className="card p-4 space-y-2">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                Account
              </p>
              {user.createdAt && (
                <div className="text-[12px]">
                  <p className="text-text-muted">Joined</p>
                  <p className="text-text-primary font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {user.lastActive && (
                <div className="text-[12px]">
                  <p className="text-text-muted">Last active</p>
                  <p className="text-text-primary font-medium">
                    {formatTimeAgo(new Date(user.lastActive))}
                  </p>
                </div>
              )}
              <div className="text-[12px]">
                <p className="text-text-muted">Verified</p>
                <p className={clsx(
                  'font-medium',
                  user.verified ? 'text-success' : 'text-warning',
                )}>
                  {user.verified ? 'Yes' : 'Pending'}
                </p>
              </div>
            </div>
          )}

          {/* Quick link to Members page */}
          <Link
            to="/members"
            className="flex items-center gap-2 text-[12px] text-text-muted hover:text-accent transition-colors px-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            All members
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Utilities
 * ─────────────────────────────────────────────────────────────────── */
function formatTimeAgo(date) {
  if (!date) return '—'
  const d    = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30)  return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
