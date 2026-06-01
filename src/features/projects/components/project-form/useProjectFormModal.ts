import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useUser } from '@/features/members/hooks/useMembers'
import { useDebounce } from '@/utils/hooks'
import {
  useCreateProject,
  useSuggestProjectCode,
  useUpdateProject,
} from '../../hooks/useProjects'
import {
  BLANK_PROJECT_FORM,
  type ProjectFormErrors,
  type ProjectFormModalProps,
  type ProjectFormState,
} from './projectFormTypes'
import type { ChangeEvent, FormEvent } from 'react'
import type { ApiError, CreateProjectRequest, Id } from '@/types'

export function useProjectFormModal({ open, project, onClose }: ProjectFormModalProps) {
  const isEdit = !!project
  const [form, setForm] = useState<ProjectFormState>(BLANK_PROJECT_FORM)
  const [errors, setErrors] = useState<ProjectFormErrors>({})
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false)

  const currentUser = useAuthStore((s) => s.user)
  const isPmSelfOnly = currentUser?.role === 'PROJECT_MANAGER'
  const allowedManagerIds = isPmSelfOnly && currentUser?.id ? [currentUser.id] : null

  const selectedManagerId = form.managerId ? Number(form.managerId) : null
  const { data: selectedManager } = useUser(selectedManagerId)

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const isPending = createProject.isPending || updateProject.isPending

  const debouncedName = useDebounce(form.name, 400)
  const { data: suggestedCode, isFetching: isSuggestingCode } = useSuggestProjectCode(
    debouncedName,
    !isEdit && open,
  )

  const prevSuggestedCode = useRef<string | null>(null)

  useEffect(() => {
    if (isEdit) return
    if (suggestedCode && suggestedCode !== prevSuggestedCode.current) {
      prevSuggestedCode.current = suggestedCode
      if (!codeManuallyEdited) {
        setForm((f) => ({ ...f, code: suggestedCode }))
        setErrors((prev) => ({ ...prev, code: null }))
      }
    }
  }, [suggestedCode, codeManuallyEdited, isEdit])

  useEffect(() => {
    if (!open) return
    if (project) {
      setForm({
        name: project.name || '',
        code: project.code || '',
        description: project.description || '',
        status: project.status || 'PLANNING',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        managerId: project.managerId ? String(project.managerId) : '',
        managerEffortPercent: '0',
      })
    } else {
      setForm({
        ...BLANK_PROJECT_FORM,
        managerId: isPmSelfOnly && currentUser?.id ? String(currentUser.id) : '',
      })
    }
    setErrors({})
    setCodeManuallyEdited(false)
    prevSuggestedCode.current = null
  }, [open, project, isPmSelfOnly, currentUser?.id])

  const set = (key: keyof ProjectFormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
    }

  const setCodeField = (e: ChangeEvent<HTMLInputElement>) => {
    setCodeManuallyEdited(true)
    set('code')(e)
  }

  const setValue = (key: keyof ProjectFormState, value: Id | '') => {
    setForm((f) => ({ ...f, [key]: value ? String(value) : '' }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: ProjectFormErrors = {}
    if (!form.name.trim()) next.name = 'Project name is required.'
    if (!isEdit && !form.managerId) next.managerId = 'Manager is required.'
    if (!isEdit) {
      const managerEffort = Number(form.managerEffortPercent)
      if (
        form.managerEffortPercent === '' ||
        Number.isNaN(managerEffort) ||
        managerEffort <= 0 ||
        managerEffort > 100
      ) {
        next.managerEffortPercent = 'Must be between 1 and 100.'
      }
    }
    return next
  }

  const retriggerSuggestCode = () => {
    setCodeManuallyEdited(false)
    prevSuggestedCode.current = null
  }

  const handleApiError = (err: unknown) => {
    const code = (err as ApiError | undefined)?.code
    if (code === 4002) {
      setErrors((prev) => ({
        ...prev,
        code: 'This code is already taken. A new suggestion is loading...',
      }))
      retriggerSuggestCode()
    } else if (code === 4006) {
      setErrors((prev) => ({
        ...prev,
        code: 'Code must be 2-10 uppercase letters, digits, or hyphens (e.g. HRM, PRJ-2).',
      }))
    } else if (code === 4007) {
      setErrors((prev) => ({
        ...prev,
        code: 'Project code cannot be changed after creation.',
      }))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    }

    if (project) {
      updateProject.mutate(
        { id: project.id, data: payload },
        { onSuccess: onClose, onError: handleApiError },
      )
      return
    }

    const createPayload: CreateProjectRequest = {
      ...payload,
      code: form.code.trim() || undefined,
      managerId: Number(form.managerId),
      managerAllocationPercent: Number(form.managerEffortPercent),
    }

    createProject.mutate(
      { data: createPayload },
      { onSuccess: onClose, onError: handleApiError },
    )
  }

  return {
    isEdit,
    form,
    errors,
    currentUser,
    isPmSelfOnly,
    allowedManagerIds,
    selectedManager,
    isPending,
    isSuggestingCode,
    set,
    setCodeField,
    setValue,
    handleSubmit,
  }
}
