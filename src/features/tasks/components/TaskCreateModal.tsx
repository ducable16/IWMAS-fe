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
  createDefaultTaskCreateForm,
  type SetTaskCreateField,
  type TaskCreateForm,
} from './task-create/taskCreateTypes'
import type { FormEvent } from 'react'
import type { Id } from '@/types'

interface TaskCreateModalProps {
  open: boolean
  onClose: () => void
  defaultProjectId?: Id | null
  defaultProjectName?: string
}

const MAX_TITLE_LENGTH = 300

export default function TaskCreateModal({
  open,
  onClose,
  defaultProjectId,
  defaultProjectName,
}: TaskCreateModalProps) {
  const [form, setForm] = useState<TaskCreateForm>(createDefaultTaskCreateForm)
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
  const title = form.title.trim()
  const hasValidTitle = title.length > 0 && title.length <= MAX_TITLE_LENGTH
  const titleError = title.length > MAX_TITLE_LENGTH
    ? `Task title must be ${MAX_TITLE_LENGTH} characters or fewer.`
    : undefined
  const hasProject = !!form.projectId
  const projectError = hasProject ? undefined : 'Select a project.'
  const hasRequiredDate = !!form.startDate || !!form.dueDate
  const hasInvalidDateRange = !!form.startDate && !!form.dueDate && form.startDate > form.dueDate
  const dateError = !hasRequiredDate
    ? 'Enter a start date or due date.'
    : hasInvalidDateRange
      ? 'Start date must not be after due date.'
      : undefined

  useEffect(() => {
    if (open) {
      setForm({
        ...createDefaultTaskCreateForm(),
        projectId: defaultProjectId || '',
      })
    }
  }, [open, defaultProjectId])

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
    if (
      !hasValidTitle
      || !hasProject
      || !hasRequiredDate
      || hasInvalidDateRange
      || isPending
      || isCheckingAssigneeSkills
      || hasAssigneeSkillMismatch
    ) return
    const estimatedHours = Number.parseFloat(form.estimatedHours)

    createTask(
      {
        title,
        description: form.description.trim() || null,
        priority: form.priority,
        type: form.type,
        projectId: form.projectId,
        assigneeId: form.assigneeId || null,
        ...(form.startDate ? { startDate: form.startDate } : {}),
        ...(form.dueDate ? { dueDate: form.dueDate } : {}),
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
            titleError={titleError}
            projectError={projectError}
            assigneeError={assigneeError}
            dateError={dateError}
            assigneeDisabled={!form.projectId}
          />
        </form>
      </Modal.Body>
      <ModalFormActions
        onCancel={onClose}
        isPending={isPending}
        disabled={
          !hasValidTitle
          || !hasProject
          || !hasRequiredDate
          || hasInvalidDateRange
          || isCheckingAssigneeSkills
          || hasAssigneeSkillMismatch
        }
        idleIcon={<Plus className="w-3.5 h-3.5" strokeWidth={2} />}
        submitLabel="Create task"
        submitType="button"
        onSubmitClick={() => handleSubmit()}
      />
    </Modal>
  )
}
