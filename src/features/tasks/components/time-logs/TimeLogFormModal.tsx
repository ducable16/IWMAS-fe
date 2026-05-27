import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import { useTask } from '@/features/tasks/hooks/useTask'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { formatHours, getDateInputValue, parseIdInput } from './timeLogUtils'
import type { FormEvent } from 'react'
import type { Id, TimeLogRequest, TimeLogResponse } from '@/types'

type TimeLogFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  taskId?: Id | null | undefined
  initialLog?: TimeLogResponse | null | undefined
  isPending?: boolean
  onClose: () => void
  onSubmit: (payload: TimeLogRequest) => void
}

type TimeLogFormState = {
  taskId: string
  logDate: string
  hoursSpent: string
  description: string
}

function toFormState(taskId?: Id | null, initialLog?: TimeLogResponse | null): TimeLogFormState {
  return {
    taskId: String(initialLog?.taskId ?? taskId ?? ''),
    logDate: initialLog?.logDate || getDateInputValue(),
    hoursSpent: initialLog?.hoursSpent === undefined ? '' : String(initialLog.hoursSpent),
    description: initialLog?.description || '',
  }
}

function calcRemainingHours(
  estimatedHours: number | null | undefined,
  actualHours: number | null | undefined,
  hoursSpent: number,
  previousLogHours: number,
) {
  if (estimatedHours === null || estimatedHours === undefined || !Number.isFinite(hoursSpent)) return null
  const actualBeforeThisLog = Math.max(0, (actualHours ?? 0) - previousLogHours)
  const remaining = Math.max(0, estimatedHours - actualBeforeThisLog - hoursSpent)
  return Math.round(remaining * 10) / 10
}

export default function TimeLogFormModal({
  open,
  mode,
  taskId,
  initialLog,
  isPending = false,
  onClose,
  onSubmit,
}: TimeLogFormModalProps) {
  const fixedTaskId = taskId !== null && taskId !== undefined
  const taskOptionsQuery = useTasks(open && !fixedTaskId)
  const fixedTaskQuery = useTask(open && fixedTaskId ? taskId : null)
  const taskOptions = taskOptionsQuery.data ?? []
  const [form, setForm] = useState<TimeLogFormState>(() => toFormState(taskId, initialLog))
  const [error, setError] = useState('')
  const selectedTask = taskOptions.find((task) => String(task.id) === form.taskId)
  const taskMetrics = fixedTaskId ? fixedTaskQuery.data : selectedTask
  const hoursSpentValue = Number.parseFloat(form.hoursSpent)
  const previousLogHours =
    initialLog && String(initialLog.taskId) === String(fixedTaskId ? taskId : form.taskId)
      ? initialLog.hoursSpent
      : 0
  const computedRemainingHours = calcRemainingHours(
    taskMetrics?.estimatedHours,
    taskMetrics?.actualHours,
    hoursSpentValue,
    previousLogHours,
  )

  useEffect(() => {
    if (!open) return
    setForm(toFormState(taskId, initialLog))
    setError('')
  }, [open, taskId, initialLog])

  const setField = <K extends keyof TimeLogFormState>(key: K, value: TimeLogFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (isPending) return

    const parsedTaskId = fixedTaskId ? taskId : parseIdInput(form.taskId)
    const hoursSpent = Number.parseFloat(form.hoursSpent)

    if (!parsedTaskId) {
      setError('Task is required.')
      return
    }
    if (!form.logDate) {
      setError('Log date is required.')
      return
    }
    if (!Number.isFinite(hoursSpent) || hoursSpent < 0.1 || hoursSpent > 24) {
      setError('Hours spent must be between 0.1 and 24.')
      return
    }
    const payload: TimeLogRequest = {
      taskId: parsedTaskId,
      logDate: form.logDate,
      hoursSpent,
    }
    if (computedRemainingHours !== null) payload.remainingHours = computedRemainingHours
    if (form.description.trim()) payload.description = form.description.trim()

    onSubmit(payload)
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[520px]" persistent={isPending}>
      <Modal.Header
        title={mode === 'edit' ? 'Edit time log' : 'Log work'}
        subtitle={fixedTaskId ? `Task #${taskId}` : 'Select the task you worked on'}
        onClose={onClose}
      />
      <Modal.Body className="space-y-3">
        <form id="time-log-form" onSubmit={submit} className="space-y-3">
          {!fixedTaskId && (
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Task
              </label>
              <select
                autoFocus
                value={form.taskId}
                onChange={(e) => setField('taskId', e.target.value)}
                disabled={taskOptionsQuery.isLoading}
                className="input-select w-full text-[12.5px]"
              >
                <option value="">
                  {taskOptionsQuery.isLoading ? 'Loading your tasks...' : 'Select a task...'}
                </option>
                {taskOptions.map((task) => (
                  <option key={task.id} value={String(task.id)}>
                    {task.title} - {String(task.status).toUpperCase()}
                  </option>
                ))}
              </select>
              {taskOptionsQuery.isError && (
                <p className="text-[11.5px] text-danger mt-1">
                  Failed to load your tasks. Try reopening the modal.
                </p>
              )}
              {!taskOptionsQuery.isLoading && !taskOptionsQuery.isError && taskOptions.length === 0 && (
                <p className="text-[11.5px] text-text-muted mt-1">
                  You have no assigned tasks to log time against.
                </p>
              )}
              {selectedTask && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-bg-subtle border border-border-subtle px-3 py-2">
                    <p className="text-[10.5px] text-text-muted uppercase tracking-wide">
                      Estimate
                    </p>
                    <p className="text-[13px] font-semibold text-text-primary mt-0.5">
                      {formatHours(selectedTask.estimatedHours)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-bg-subtle border border-border-subtle px-3 py-2">
                    <p className="text-[10.5px] text-text-muted uppercase tracking-wide">
                      Actual
                    </p>
                    <p className="text-[13px] font-semibold text-text-primary mt-0.5">
                      {formatHours(selectedTask.actualHours)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {fixedTaskId && taskMetrics && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-bg-subtle border border-border-subtle px-3 py-2">
                <p className="text-[10.5px] text-text-muted uppercase tracking-wide">
                  Estimate
                </p>
                <p className="text-[13px] font-semibold text-text-primary mt-0.5">
                  {formatHours(taskMetrics.estimatedHours)}
                </p>
              </div>
              <div className="rounded-lg bg-bg-subtle border border-border-subtle px-3 py-2">
                <p className="text-[10.5px] text-text-muted uppercase tracking-wide">
                  Actual
                </p>
                <p className="text-[13px] font-semibold text-text-primary mt-0.5">
                  {formatHours(taskMetrics.actualHours)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Log date
              </label>
              <input
                type="date"
                value={form.logDate}
                onChange={(e) => setField('logDate', e.target.value)}
                className="input-field w-full text-[12.5px]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Spent
              </label>
              <input
                type="number"
                min="0.1"
                max="24"
                step="0.1"
                value={form.hoursSpent}
                onChange={(e) => setField('hoursSpent', e.target.value)}
                placeholder="4.5"
                className="input-field w-full text-[12.5px]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Remaining
              </label>
              <div className="input-field w-full text-[12.5px] flex items-center bg-bg-subtle text-text-secondary">
                {computedRemainingHours === null ? 'No estimate' : formatHours(computedRemainingHours)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              placeholder="What did you work on?"
              className="input-field w-full resize-none text-[12.5px] leading-relaxed"
            />
          </div>

          {error && (
            <p className="text-[12px] text-danger bg-danger/10 border border-danger/15 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>
      </Modal.Body>
      <ModalFormActions
        onCancel={onClose}
        isPending={isPending}
        disabled={
          (fixedTaskId && fixedTaskQuery.isLoading) ||
          (!fixedTaskId && (taskOptionsQuery.isLoading || taskOptions.length === 0))
        }
        submitLabel={mode === 'edit' ? 'Save changes' : 'Log work'}
        pendingLabel={mode === 'edit' ? 'Saving...' : 'Logging...'}
        idleIcon={<Clock className="w-3.5 h-3.5" strokeWidth={1.75} />}
        submitButtonId="time-log-submit"
        submitType="submit"
        onSubmitClick={() => submit()}
      />
    </Modal>
  )
}
