import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import { useCreateTask } from '@/features/tasks/hooks/useTask'
import TaskCreateFields from './task-create/TaskCreateFields'
import {
  EMPTY_TASK_CREATE_FORM,
  type SetTaskCreateField,
  type TaskCreateForm,
} from './task-create/taskCreateTypes'
import type { FormEvent } from 'react'
import type { Id } from '@/types'

interface TaskCreateModalProps {
  open: boolean
  onClose: () => void
  defaultStatus?: string
  defaultProjectId?: Id | null
  defaultProjectName?: string
}

export default function TaskCreateModal({
  open,
  onClose,
  defaultStatus,
  defaultProjectId,
  defaultProjectName,
}: TaskCreateModalProps) {
  const [form, setForm] = useState<TaskCreateForm>(EMPTY_TASK_CREATE_FORM)
  const { mutate: createTask, isPending } = useCreateTask()

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_TASK_CREATE_FORM,
        status: defaultStatus || 'TODO',
        projectId: defaultProjectId || '',
      })
    }
  }, [open, defaultStatus, defaultProjectId])

  const setField: SetTaskCreateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!form.title.trim() || isPending) return

    createTask(
      {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        type: form.type,
        projectId: form.projectId || null,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[520px]">
      <Modal.Header title="Create task" onClose={onClose} />
      <Modal.Body className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <TaskCreateFields
            form={form}
            setField={setField}
            defaultProjectName={defaultProjectName}
            onSubmit={() => handleSubmit()}
          />
        </form>
      </Modal.Body>
      <ModalFormActions
        onCancel={onClose}
        isPending={isPending}
        disabled={!form.title.trim()}
        idleIcon={<Plus className="w-3.5 h-3.5" strokeWidth={2} />}
        submitLabel="Create task"
        submitType="button"
        onSubmitClick={() => handleSubmit()}
      />
    </Modal>
  )
}
