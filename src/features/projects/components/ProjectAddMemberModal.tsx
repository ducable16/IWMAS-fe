import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import { useAutocompleteExcludeProject } from '@/features/search/hooks/useSearch'
import { useAddProjectMember } from '../hooks/useProjects'
import {
  DateNoteFields,
  RoleEffortFields,
} from './project-member-modal/ProjectMemberFields'
import RemainingEffortPanel from './project-member-modal/RemainingEffortPanel'
import type { FormEvent } from 'react'
import type { Id } from '@/types'
import type { ProjectRole } from '@/constants/enums'

type ProjectMemberForm = {
  userId: Id | ''
  roleInProject: ProjectRole
  allocatedEffortPercent: string
  joinDate: string
  note: string
}

type FormErrors = Partial<Record<keyof ProjectMemberForm, string | null>>

type ProjectAddMemberModalProps = {
  open: boolean
  projectId: Id
  onClose: () => void
}

const BLANK: ProjectMemberForm = {
  userId: '',
  roleInProject: 'MEMBER',
  allocatedEffortPercent: '',
  joinDate: new Date().toISOString().slice(0, 10),
  note: '',
}

export default function ProjectAddMemberModal({
  open,
  projectId,
  onClose,
}: ProjectAddMemberModalProps) {
  const [form, setForm] = useState<ProjectMemberForm>(BLANK)
  const [errors, setErrors] = useState<FormErrors>({})

  const addMember = useAddProjectMember(projectId)
  const isPending = addMember.isPending

  useEffect(() => {
    if (open) {
      setForm(BLANK)
      setErrors({})
    }
  }, [open])

  const set = <K extends keyof ProjectMemberForm>(key: K, val: ProjectMemberForm[K]) => {
    setForm((current) => ({ ...current, [key]: val }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: FormErrors = {}
    const effort = Number(form.allocatedEffortPercent)
    if (!form.userId) next.userId = 'Please select a user.'
    if (
      form.allocatedEffortPercent === '' ||
      Number.isNaN(effort) ||
      effort < 0 ||
      effort > 100
    ) {
      next.allocatedEffortPercent = 'Must be between 0 and 100.'
    }
    return next
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    addMember.mutate({
      userId: Number(form.userId),
      roleInProject: form.roleInProject,
      allocatedEffortPercent: Number(form.allocatedEffortPercent),
      joinDate: form.joinDate || undefined,
      note: form.note.trim() || undefined,
    }, { onSuccess: onClose })
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[500px]">
      <Modal.Header title="Add Project Member" onClose={onClose} />

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <AutocompleteSelect
          id="add-member-userId"
          label="User"
          required
          placeholder="Search by name, email..."
          value={form.userId}
          onChange={(val) => set('userId', val)}
          useSearchHook={useAutocompleteExcludeProject}
          searchParams={projectId}
          error={errors.userId}
        />

        {form.userId && (
          <RemainingEffortPanel
            userId={form.userId}
            startDate={form.joinDate}
            requestedEffort={form.allocatedEffortPercent}
          />
        )}

        <RoleEffortFields
          role={form.roleInProject}
          effort={form.allocatedEffortPercent}
          effortError={errors.allocatedEffortPercent}
          onRoleChange={(role) => set('roleInProject', role as ProjectRole)}
          onEffortChange={(effort) => set('allocatedEffortPercent', effort)}
        />

        <DateNoteFields
          joinDate={form.joinDate}
          note={form.note}
          onJoinDateChange={(value) => set('joinDate', value)}
          onNoteChange={(value) => set('note', value)}
        />

        <ModalFormActions
          onCancel={onClose}
          isPending={isPending}
          cancelDisabled={isPending}
          idleIcon={<Plus className="w-3.5 h-3.5" strokeWidth={2} />}
          pendingLabel="Adding..."
          submitLabel="Add Member"
        />
      </form>
    </Modal>
  )
}
