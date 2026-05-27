import { useState } from 'react'
import { Plus } from 'lucide-react'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCreateTimeLog, useTaskTimeLogs, useUpdateTimeLog } from '@/features/tasks/hooks/useTimeLogs'
import TimeLogFormModal from '@/features/tasks/components/time-logs/TimeLogFormModal'
import TimeLogList from '@/features/tasks/components/time-logs/TimeLogList'
import type { Id, TimeLogRequest, TimeLogResponse } from '@/types'

type WorkLogTabProps = {
  taskId: Id
}

export function WorkLogTab({ taskId }: WorkLogTabProps) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<TimeLogResponse | null>(null)

  const logsQuery = useTaskTimeLogs(taskId)
  const createLog = useCreateTimeLog(taskId)
  const updateLog = useUpdateTimeLog(taskId)
  const isSaving = createLog.isPending || updateLog.isPending

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="btn-secondary text-[12px] px-2.5 py-1.5"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
          Log work
        </button>
      </div>

      {logsQuery.isLoading && <LiveLoading label="Loading work logs..." />}
      {logsQuery.isError && <LiveError error={logsQuery.error} onRetry={() => logsQuery.refetch()} />}
      {!logsQuery.isLoading && !logsQuery.isError && (
        <TimeLogList
          logs={logsQuery.data ?? []}
          currentUserId={currentUserId}
          showUser
          onEdit={openEdit}
        />
      )}

      <TimeLogFormModal
        open={modalOpen}
        mode={editingLog ? 'edit' : 'create'}
        taskId={taskId}
        initialLog={editingLog}
        isPending={isSaving}
        onClose={closeModal}
        onSubmit={submit}
      />
    </div>
  )
}
