import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import WorkloadTaskSections from './member-workload-detail/WorkloadTaskSections'
import UtilizationBar from './UtilizationBar'
import WorkloadLevelBadge from './WorkloadLevelBadge'
import { useUserWorkloadDetail } from '../hooks/useWorkload'
import type { Id, WorkloadMember } from '@/types'

type MemberWorkloadDetailModalProps = {
  userId: Id | null | undefined
  userFullName?: string
  weekStart?: string
  weekEnd?: string
  open: boolean
  onClose: () => void
}

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
    userId,
    weekStart,
    weekEnd,
    open,
  )

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setShowAllTasks(false)
  }, [open, userId])

  if (!open) return null

  const detail = data as WorkloadMember | null | undefined
  const tasks = detail?.tasks ?? []

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[520px] bg-bg-surface border-l border-border overflow-y-auto animate-slide-in-right"
        role="dialog"
        aria-label="Member workload detail"
      >
        <div className="sticky top-0 z-10 bg-bg-surface/95 backdrop-blur-sm border-b border-border-subtle px-5 py-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-text-primary truncate">
            {userFullName || 'Workload Detail'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-bg-subtle"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading workload data...</span>
            </div>
          )}

          {isError && (
            <div className="card p-4 border-danger/20 bg-danger/[0.03] text-center">
              <p className="text-[13px] text-danger font-medium">
                {error?.message || 'Failed to load workload detail'}
              </p>
            </div>
          )}

          {detail && !isLoading && (
            <>
              <div className="space-y-3">
                <div>
                  <p className="text-[16px] font-semibold text-text-primary">
                    {detail.userFullName || detail.fullName}
                  </p>
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
                onClick={() => setShowAllTasks((value) => !value)}
                className="flex items-center justify-between w-full p-3 rounded-lg border border-border-subtle hover:bg-bg-subtle/60 transition-colors"
              >
                <span className="text-[12.5px] text-text-secondary font-medium">Active tasks</span>
                <span className="text-[12.5px] font-semibold text-text-primary tabular-nums">
                  {detail.activeTaskCount ?? 0}
                </span>
              </button>

              <WorkloadTaskSections tasks={tasks} showAllTasks={showAllTasks} variant="modal" />

              <div className="divider" />
              <p className="text-[12px] text-text-muted text-center">
                <span className="font-semibold text-text-secondary">{detail.activeTaskCount}</span>
                {' active tasks total across all weeks'}
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
