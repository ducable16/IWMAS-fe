import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import WorkloadLevelBadge from './WorkloadLevelBadge'
import UtilizationBar from './UtilizationBar'
import { useUserWorkloadDetail } from '../hooks/useWorkload'
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/Badge'
import type { Id, WorkloadMember, WorkloadTask } from '@/types'

type MemberWorkloadDetailModalProps = {
  userId: Id | null | undefined
  userFullName?: string
  weekStart?: string
  weekEnd?: string
  open: boolean
  onClose: () => void
}

/* ── Task row ──────────────────────────────────────────────── */

function TaskRow({ task }: { task: WorkloadTask }) {
  const taskId = task.taskId ?? task.id

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-bg-subtle/60 transition-colors group">
      {/* Title */}
      <Link
        to={`/tasks/${taskId}`}
        className="flex-1 min-w-0 text-[13px] font-medium text-text-primary hover:text-accent transition-colors truncate"
      >
        {task.title}
      </Link>

      {/* Priority */}
      <TaskPriorityBadge priority={String(task.priority || 'MEDIUM')} className="shrink-0" />

      {/* Status chip */}
      <TaskStatusBadge status={String(task.status || 'TODO')} className="shrink-0" />

      {/* Due date */}
      <span className={clsx(
        'text-[11.5px] shrink-0 tabular-nums flex items-center gap-1',
        task.overdue ? 'text-danger font-bold' : 'text-text-muted',
      )}>
        <Clock className="w-3 h-3" strokeWidth={1.75} />
        {formatDueDate(task.dueDate)}
      </span>

      {/* Remaining hours */}
      <span className="text-[11px] font-medium text-text-secondary bg-bg-subtle px-1.5 py-0.5 rounded shrink-0 tabular-nums">
        {task.remainingHours?.toFixed(1) ?? '—'} h
      </span>
    </div>
  )
}

/* ── Modal ─────────────────────────────────────────────────── */

export default function MemberWorkloadDetailModal({
  userId,
  userFullName,
  weekStart,
  weekEnd,
  open,
  onClose,
}: MemberWorkloadDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [showAllTasks, setShowAllTasks] = useState(false)

  const { data, isLoading, isError, error } = useUserWorkloadDetail(
    userId, weekStart, weekEnd, open,
  )

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setShowAllTasks(false)
  }, [open, userId])

  if (!open) return null

  const detail = data as WorkloadMember | null | undefined
  const overdueTasks = (detail?.tasks ?? []).filter((t) => t.overdue)
  const dueThisWeek = (detail?.tasks ?? []).filter((t) => !t.overdue)
  const allTasks = detail?.tasks ?? []

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[520px] bg-bg-surface border-l border-border overflow-y-auto animate-slide-in-right"
        role="dialog"
        aria-label="Member workload detail"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-surface/95 backdrop-blur-sm border-b border-border-subtle px-5 py-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-text-primary truncate">
            {userFullName || 'Workload Detail'}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-bg-subtle"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading workload data…</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="card p-4 border-danger/20 bg-danger/[0.03] text-center">
              <p className="text-[13px] text-danger font-medium">
                {error?.message || 'Failed to load workload detail'}
              </p>
            </div>
          )}

          {/* Content */}
          {detail && !isLoading && (
            <>
              {/* Identity + Workload summary */}
              <div className="space-y-3">
                <div>
                  <p className="text-[16px] font-semibold text-text-primary">{detail.userFullName || detail.fullName}</p>
                  {detail.position && (
                    <p className="text-[12.5px] text-text-muted mt-0.5">{detail.position}</p>
                  )}
                </div>

                <WorkloadLevelBadge level={detail.workloadLevel} />

                <UtilizationBar
                  utilizationPercent={detail.utilizationPercent}
                  workloadLevel={detail.workloadLevel}
                  weeklyRemainingHours={detail.weeklyRemainingHours}
                  weeklyCapacityHours={detail.weeklyCapacityHours}
                />
              </div>

              <div className="divider" />

              <button
                type="button"
                onClick={() => setShowAllTasks((v) => !v)}
                className="flex items-center justify-between w-full p-3 rounded-lg border border-border-subtle hover:bg-bg-subtle/60 transition-colors"
              >
                <span className="text-[12.5px] text-text-secondary font-medium">Active tasks</span>
                <span className="text-[12.5px] font-semibold text-text-primary tabular-nums">
                  {detail.activeTaskCount ?? 0}
                </span>
              </button>

              {/* Overdue section */}
              {overdueTasks.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-danger" strokeWidth={2} />
                    <h4 className="text-[12px] font-semibold text-danger uppercase tracking-wider">
                      Overdue ({overdueTasks.length})
                    </h4>
                  </div>
                  <div className="rounded-xl border border-danger/20 bg-danger/[0.03] divide-y divide-danger/10 overflow-hidden">
                    {overdueTasks.map((t) => (
                      <TaskRow key={String(t.taskId ?? t.id)} task={t} />
                    ))}
                  </div>
                </section>
              )}

              {/* Due this week section */}
              <section>
                <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Due this week ({dueThisWeek.length})
                </h4>
                {dueThisWeek.length > 0 ? (
                  <div className="rounded-xl border border-border-subtle bg-bg-subtle/30 divide-y divide-border-subtle overflow-hidden">
                    {dueThisWeek.map((t) => (
                      <TaskRow key={String(t.taskId ?? t.id)} task={t} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[12.5px] text-text-muted italic py-3 px-1">
                    No tasks due this week
                  </p>
                )}
              </section>

              {/* All tasks section */}
              {showAllTasks && (
                <section>
                  <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                    All tasks ({allTasks.length})
                  </h4>
                  {allTasks.length > 0 ? (
                    <div className="rounded-xl border border-border-subtle bg-bg-subtle/30 divide-y divide-border-subtle overflow-hidden">
                      {allTasks.map((t) => (
                        <TaskRow key={`all-${String(t.taskId ?? t.id)}`} task={t} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12.5px] text-text-muted italic py-3 px-1">
                      No tasks found
                    </p>
                  )}
                </section>
              )}

              {/* Footer */}
              <div className="divider" />
              <p className="text-[12px] text-text-muted text-center">
                <span className="font-semibold text-text-secondary">{detail.activeTaskCount}</span>
                {' '}active tasks total across all weeks
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
