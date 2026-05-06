import { useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Clock, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import WorkloadLevelBadge from '@/features/workforce/components/WorkloadLevelBadge'
import UtilizationBar from '@/features/workforce/components/UtilizationBar'
import WeekNavigator from '@/features/workforce/components/WeekNavigator'
import { useUserWorkloadDetail, useMyWorkload } from '@/features/workforce/hooks/useWorkload'
import { LiveLoading, LiveError } from '@/components/feedback/LiveStateOverlay'
import { TASK_STATUS_META, TASK_PRIORITY_META } from '@/constants/enums'
import { useCan } from '@/utils/permissions'
import { useAuthStore } from '@/features/auth/store/authStore'

/* ── Task row ──────────────────────────────────────────────── */

function TaskRow({ task }) {
  const statusMeta   = TASK_STATUS_META[task.status]   || { label: task.status, color: 'bg-bg-hover text-text-secondary' }
  const priorityMeta = TASK_PRIORITY_META[task.priority] || null

  const formatDueDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-bg-subtle/60 transition-colors group">
      {/* Priority dot */}
      {priorityMeta && (
        <span
          className={clsx('w-2 h-2 rounded-full shrink-0', priorityMeta.dot)}
          title={priorityMeta.label}
        />
      )}

      {/* Title */}
      <Link
        to={`/tasks/${task.taskId}`}
        className="flex-1 min-w-0 text-[13.5px] font-medium text-text-primary hover:text-accent transition-colors truncate"
      >
        {task.title}
      </Link>

      {/* Status chip */}
      <span className={clsx(
        'text-[10.5px] font-semibold px-2 py-0.5 rounded shrink-0',
        statusMeta.color,
      )}>
        {statusMeta.label}
      </span>

      {/* Due date */}
      <span className={clsx(
        'text-[12px] shrink-0 tabular-nums flex items-center gap-1',
        task.overdue ? 'text-danger font-bold' : 'text-text-muted',
      )}>
        <Clock className="w-3 h-3" strokeWidth={1.75} />
        {formatDueDate(task.dueDate)}
      </span>

      {/* Remaining hours */}
      <span className="text-[11.5px] font-semibold text-text-secondary bg-bg-subtle border border-border-subtle px-2 py-0.5 rounded-lg shrink-0 tabular-nums">
        {task.remainingHours?.toFixed(1) ?? '—'} h
      </span>

      {/* Open task link */}
      <Link
        to={`/tasks/${task.taskId}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-accent shrink-0"
        title="Open task"
      >
        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
      </Link>
    </div>
  )
}

/* ── Page content (shared layout) ─────────────────────────── */

function WorkloadDetailContent({ data, weekStart, weekEnd, onWeekChange, isSelf }) {
  const overdueTasks = (data?.tasks ?? []).filter((t) =>  t.overdue)
  const dueThisWeek  = (data?.tasks ?? []).filter((t) => !t.overdue)

  return (
    <>
      {/* ── Member header card ── */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/15 text-accent shrink-0">
              {data.userFullName?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-semibold text-text-primary">{data.userFullName}</h2>
                {isSelf && (
                  <span className="text-[10.5px] font-semibold text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              {data.position && (
                <p className="text-[13px] text-text-muted mt-0.5">{data.position}</p>
              )}
              <div className="mt-2">
                <WorkloadLevelBadge level={data.workloadLevel} />
              </div>
            </div>
          </div>

          {/* Week navigator */}
          <WeekNavigator onChange={onWeekChange} />
        </div>

        {/* Utilization bar */}
        <div className="mt-5 pt-4 border-t border-border-subtle">
          <UtilizationBar
            utilizationPercent={data.utilizationPercent}
            workloadLevel={data.workloadLevel}
            weeklyRemainingHours={data.weeklyRemainingHours}
            weeklyCapacityHours={data.weeklyCapacityHours}
          />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-bg-subtle rounded-xl">
            <p className="text-[20px] font-bold text-text-primary tabular-nums">{data.activeTaskCount ?? 0}</p>
            <p className="text-[11.5px] text-text-muted mt-0.5">Active tasks</p>
          </div>
          <div className="text-center p-3 bg-bg-subtle rounded-xl">
            <p className={clsx(
              'text-[20px] font-bold tabular-nums',
              overdueTasks.length > 0 ? 'text-danger' : 'text-text-primary',
            )}>
              {overdueTasks.length}
            </p>
            <p className="text-[11.5px] text-text-muted mt-0.5">Overdue</p>
          </div>
          <div className="text-center p-3 bg-bg-subtle rounded-xl">
            <p className="text-[20px] font-bold text-text-primary tabular-nums">
              {data.weeklyRemainingHours?.toFixed(1) ?? '—'}
              <span className="text-[13px] font-normal text-text-muted"> h</span>
            </p>
            <p className="text-[11.5px] text-text-muted mt-0.5">Remaining hrs</p>
          </div>
        </div>
      </div>

      {/* ── Overdue section ── */}
      {overdueTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-danger" strokeWidth={2} />
            <h3 className="text-[13px] font-semibold text-danger uppercase tracking-wider">
              Overdue ({overdueTasks.length})
            </h3>
          </div>
          <div className="card border-danger/20 bg-danger/[0.02] divide-y divide-danger/10 overflow-hidden">
            {overdueTasks.map((t) => (
              <TaskRow key={t.taskId} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* ── Due this week section ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-3">
          Due this week ({dueThisWeek.length})
        </h3>
        {dueThisWeek.length > 0 ? (
          <div className="card divide-y divide-border-subtle overflow-hidden">
            {dueThisWeek.map((t) => (
              <TaskRow key={t.taskId} task={t} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-[13px] text-text-muted italic">No tasks due this week</p>
          </div>
        )}
      </div>

      {/* ── Footer note ── */}
      <p className="text-[12px] text-text-muted text-center pb-4">
        <span className="font-semibold text-text-secondary">{data.activeTaskCount}</span>
        {' '}active tasks total across all weeks
      </p>
    </>
  )
}

/* ── Self view (§9.9) ──────────────────────────────────────── */

function SelfWorkloadView({ weekStart, weekEnd, onWeekChange }) {
  const { data, isLoading, isError, error, refetch } = useMyWorkload(weekStart, weekEnd)

  if (isLoading) return <LiveLoading label="Loading your workload…" />
  if (isError)   return <LiveError error={error} onRetry={refetch} />
  if (!data)     return null

  return <WorkloadDetailContent data={data} weekStart={weekStart} weekEnd={weekEnd} onWeekChange={onWeekChange} isSelf />
}

/* ── Other user view (§9.8) ────────────────────────────────── */

function OtherUserWorkloadView({ userId, weekStart, weekEnd, onWeekChange }) {
  const { data, isLoading, isError, error, refetch } = useUserWorkloadDetail(userId, weekStart, weekEnd)

  if (isLoading) return <LiveLoading label="Loading workload detail…" />
  if (isError)   return <LiveError error={error} onRetry={refetch} />
  if (!data)     return null

  return <WorkloadDetailContent data={data} weekStart={weekStart} weekEnd={weekEnd} onWeekChange={onWeekChange} isSelf={false} />
}

/* ── Page ──────────────────────────────────────────────────── */

export default function MemberWorkloadDetailPage() {
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const can         = useCan()
  const currentUser = useAuthStore((s) => s.user)

  const targetUserId = Number(userId)
  const isSelf = targetUserId === currentUser?.id

  // §9.8 requires ADMIN | HR | PM. TEAM_MEMBER can only see their own (§9.9).
  // Also force self-view when viewing own profile regardless of role.
  const canViewOther = can.viewAllWorkload && !isSelf

  const [weekStart, setWeekStart] = useState(searchParams.get('weekStart') || '')
  const [weekEnd,   setWeekEnd]   = useState(searchParams.get('weekEnd')   || '')

  const handleWeekChange = (ws, we) => {
    setWeekStart(ws)
    setWeekEnd(we)
  }

  return (
    <div className="max-w-[860px] mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Notice for restricted users viewing someone else */}
      {!isSelf && !canViewOther && (
        <div className="card p-4 border-warning/25 bg-warning/[0.04] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" strokeWidth={1.75} />
          <p className="text-[12.5px] text-text-secondary">
            You don't have permission to view other members' workload. Showing your own workload instead.
          </p>
        </div>
      )}

      {/* Render appropriate view */}
      {canViewOther ? (
        <OtherUserWorkloadView
          userId={targetUserId}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onWeekChange={handleWeekChange}
        />
      ) : (
        <SelfWorkloadView
          weekStart={weekStart}
          weekEnd={weekEnd}
          onWeekChange={handleWeekChange}
        />
      )}
    </div>
  )
}
