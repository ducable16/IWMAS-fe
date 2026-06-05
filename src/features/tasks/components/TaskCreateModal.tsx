import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import { useCreateTask } from '@/features/tasks/hooks/useTask'
import { useUserSkills } from '@/features/skills/hooks/useSkills'
import {
  getMissingRequiredSkills,
  getRequiredSkillRequirements,
  normalizeTaskSkillRequirements,
} from '@/features/tasks/utils/taskSkillRequirements'
import TaskCreateFields from './task-create/TaskCreateFields'
import {
  EMPTY_TASK_CREATE_FORM,
  getTodayDateInputValue,
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
  const requiredSkillRequirements = getRequiredSkillRequirements(form.skillRequirements)
  const shouldValidateAssignee = !!form.assigneeId && requiredSkillRequirements.length > 0
  const assigneeSkills = useUserSkills(shouldValidateAssignee ? form.assigneeId : null)
  const missingRequiredSkills = shouldValidateAssignee
    ? getMissingRequiredSkills(assigneeSkills.data, form.skillRequirements)
    : []
  const isCheckingAssigneeSkills = shouldValidateAssignee && assigneeSkills.isLoading
  const hasAssigneeSkillMismatch = shouldValidateAssignee
    && !isCheckingAssigneeSkills
    && missingRequiredSkills.length > 0
  const assigneeError = hasAssigneeSkillMismatch
    ? 'Selected assignee does not meet all required skills.'
    : undefined

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_TASK_CREATE_FORM,
        status: defaultStatus || 'TODO',
        projectId: defaultProjectId || '',
        startDate: getTodayDateInputValue(),
      })
    }
  }, [open, defaultStatus, defaultProjectId])

  const setField: SetTaskCreateField = (key, value) =>
    setForm((prev) => {
      if (key === 'projectId') {
        return {
          ...prev,
          projectId: value as TaskCreateForm['projectId'],
          assigneeId: value === prev.projectId ? prev.assigneeId : '',
        }
      }
      return { ...prev, [key]: value }
    })

  const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!form.title.trim() || isPending || isCheckingAssigneeSkills || hasAssigneeSkillMismatch) return
    const estimatedHours = Number.parseFloat(form.estimatedHours)

    createTask(
      {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        type: form.type,
        projectId: form.projectId || null,
        assigneeId: form.assigneeId || null,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        estimatedHours: Number.isFinite(estimatedHours) && estimatedHours >= 0 ? estimatedHours : null,
        skillRequirements: normalizeTaskSkillRequirements(form.skillRequirements),
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[640px]">
      <Modal.Header title="Create task" onClose={onClose} />
      <Modal.Body className="space-y-3 max-h-[72vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <TaskCreateFields
            form={form}
            setField={setField}
            defaultProjectName={defaultProjectName}
            onSubmit={() => handleSubmit()}
            assigneeError={assigneeError}
            assigneeDisabled={!form.projectId}
          />
        </form>
      </Modal.Body>
      <ModalFormActions
        onCancel={onClose}
        isPending={isPending}
        disabled={!form.title.trim() || isCheckingAssigneeSkills || hasAssigneeSkillMismatch}
        idleIcon={<Plus className="w-3.5 h-3.5" strokeWidth={2} />}
        submitLabel="Create task"
        submitType="button"
        onSubmitClick={() => handleSubmit()}
      />
    </Modal>
  )
}
