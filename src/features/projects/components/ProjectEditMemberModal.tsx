import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import { useUpdateProjectMember } from '../hooks/useProjects'
import {
  DateNoteFields,
  RoleEffortFields,
} from './project-member-modal/ProjectMemberFields'
import RemainingEffortPanel from './project-member-modal/RemainingEffortPanel'
import type { FormEvent } from 'react'
import type { Id, ProjectMember } from '@/types'
import type { ProjectRole } from '@/constants/enums'

type EditMemberForm = {
  roleInProject: ProjectRole | string
  allocatedEffortPercent: string | number
  joinDate: string
  note: string
}

type FormErrors = Partial<Record<keyof EditMemberForm, string | null>>

type ProjectEditMemberModalProps = {
  open: boolean
  member: ProjectMember | null
  projectId: Id
  onClose: () => void
}

const BLANK: EditMemberForm = {
  roleInProject: 'MEMBER',
  allocatedEffortPercent: '',
  joinDate: '',
  note: '',
}

export default function ProjectEditMemberModal({
  open,
  member,
  projectId,
  onClose,
}: ProjectEditMemberModalProps) {
  const [form, setForm] = useState<EditMemberForm>(BLANK)
  const [errors, setErrors] = useState<FormErrors>({})

  const updateMember = useUpdateProjectMember(projectId)
  const isPending = updateMember.isPending

  useEffect(() => {
    if (open && member) {
      setForm({
        roleInProject: member.roleInProject || 'MEMBER',
        allocatedEffortPercent: member.allocatedEffortPercent ?? '',
        joinDate: member.joinDate || '',
        note: member.note || '',
      })
      setErrors({})
    }
  }, [open, member])

  const set = <K extends keyof EditMemberForm>(key: K, val: EditMemberForm[K]) => {
    setForm((current) => ({ ...current, [key]: val }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: FormErrors = {}
    const effort = Number(form.allocatedEffortPercent)
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
    if (!member) return
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    updateMember.mutate({
      memberId: member.id,
      data: {
        userId: member.userId,
        roleInProject: form.roleInProject,
        allocatedEffortPercent: Number(form.allocatedEffortPercent),
        note: form.note.trim() || undefined,
      },
    }, { onSuccess: onClose })
  }

  if (!member) return null

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[480px]">
      <Modal.Header
        title={
          <div>
            <div className="text-[15px] font-semibold text-text-primary">Edit Member</div>
            <p className="text-[12px] text-text-muted mt-0.5">{member.userFullName}</p>
          </div>
        }
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <RemainingEffortPanel
          userId={member.userId}
          startDate={form.joinDate}
          requestedEffort={form.allocatedEffortPercent}
          currentEffort={member.allocatedEffortPercent}
        />

        <RoleEffortFields
          role={form.roleInProject}
          effort={form.allocatedEffortPercent}
          effortError={errors.allocatedEffortPercent}
          onRoleChange={(role) => set('roleInProject', role)}
          onEffortChange={(effort) => set('allocatedEffortPercent', effort)}
        />

        <DateNoteFields
          joinDate={form.joinDate}
          note={form.note}
          joinDateReadOnly
          onJoinDateChange={(value) => set('joinDate', value)}
          onNoteChange={(value) => set('note', value)}
        />

        <ModalFormActions
          onCancel={onClose}
          isPending={isPending}
          cancelDisabled={isPending}
          idleIcon={<Save className="w-3.5 h-3.5" strokeWidth={2} />}
          pendingLabel="Saving..."
          submitLabel="Save changes"
        />
      </form>
    </Modal>
  )
}
