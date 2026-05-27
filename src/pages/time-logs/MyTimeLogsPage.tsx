import { useMemo, useState } from 'react'
import { Clock, ListChecks, Plus, RotateCcw } from 'lucide-react'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCreateTimeLog, useMyTimeLogs, useUpdateTimeLog } from '@/features/tasks/hooks/useTimeLogs'
import TimeLogFormModal from '@/features/tasks/components/time-logs/TimeLogFormModal'
import TimeLogList from '@/features/tasks/components/time-logs/TimeLogList'
import { formatHours, getCurrentWeekRange } from '@/features/tasks/components/time-logs/timeLogUtils'
import type { TimeLogRequest, TimeLogResponse } from '@/types'

export default function MyTimeLogsPage() {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const initialRange = useMemo(() => getCurrentWeekRange(), [])
  const [from, setFrom] = useState(initialRange.from)
  const [to, setTo] = useState(initialRange.to)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<TimeLogResponse | null>(null)

  const params = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
    }),
    [from, to],
  )
  const logsQuery = useMyTimeLogs(params)
  const createLog = useCreateTimeLog()
  const updateLog = useUpdateTimeLog(editingLog?.taskId)
  const isSaving = createLog.isPending || updateLog.isPending
  const logs = logsQuery.data ?? []
  const totalHours = logs.reduce((sum, log) => sum + (Number(log.hoursSpent) || 0), 0)

  const openCreate = () => {
    setEditingLog(null)
    setModalOpen(true)
  }

  const openEdit = (log: TimeLogResponse) => {
    setEditingLog(log)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setModalOpen(false)
    setEditingLog(null)
  }

  const submit = (payload: TimeLogRequest) => {
    if (editingLog) {
      updateLog.mutate(
        { id: editingLog.id, data: payload },
        { onSuccess: closeModal },
      )
      return
    }

    createLog.mutate(payload, { onSuccess: closeModal })
  }

  const applyThisWeek = () => {
    const range = getCurrentWeekRange()
    setFrom(range.from)
    setTo(range.to)
  }

  const clearFilters = () => {
    setFrom('')
    setTo('')
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-subhead text-text-primary">Time Logs</h2>
          <p className="text-text-secondary text-[14px] mt-1">
            Review and manage your logged work time.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary text-[13px]"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
          Log work
        </button>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input-field text-[12.5px]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input-field text-[12.5px]"
            />
          </div>
          <button
            type="button"
            onClick={applyThisWeek}
            className="btn-secondary text-[12.5px] px-3 py-2"
          >
            This week
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-ghost text-[12.5px] px-3 py-2"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-bg-subtle border border-border-subtle px-3 py-2">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">Logs</p>
            <p className="text-[18px] font-semibold text-text-primary flex items-center gap-1.5 mt-0.5">
              <ListChecks className="w-4 h-4 text-accent" strokeWidth={1.75} />
              {logs.length}
            </p>
          </div>
          <div className="rounded-lg bg-bg-subtle border border-border-subtle px-3 py-2">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">Total hours</p>
            <p className="text-[18px] font-semibold text-text-primary flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-accent" strokeWidth={1.75} />
              {formatHours(totalHours)}
            </p>
          </div>
          <div className="rounded-lg bg-bg-subtle border border-border-subtle px-3 py-2">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">Range</p>
            <p className="text-[13px] font-medium text-text-primary mt-1">
              {from || 'Any'} - {to || 'Any'}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        {logsQuery.isLoading && <LiveLoading label="Loading time logs..." />}
        {logsQuery.isError && <LiveError error={logsQuery.error} onRetry={() => logsQuery.refetch()} />}
        {!logsQuery.isLoading && !logsQuery.isError && (
          <TimeLogList
            logs={logs}
            currentUserId={currentUserId}
            showTask
            allowActions
            emptyLabel="No time logs in this range."
            onEdit={openEdit}
          />
        )}
      </div>

      <TimeLogFormModal
        open={modalOpen}
        mode={editingLog ? 'edit' : 'create'}
        initialLog={editingLog}
        isPending={isSaving}
        onClose={closeModal}
        onSubmit={submit}
      />
    </div>
  )
}
