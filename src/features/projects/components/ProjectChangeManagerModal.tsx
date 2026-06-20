import { useEffect, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import { useChangeProjectManager } from '../hooks/useProjects'
import { useProjectManagerCandidates } from '../hooks/useProjectMemberCandidates'
import RemainingEffortPanel from './project-member-modal/RemainingEffortPanel'
import { EffortField } from './project-member-modal/ProjectMemberFields'
import type { FormEvent } from 'react'
import type { Id } from '@/types'

type ChangeManagerForm = {
  newManagerId: Id | ''
  managerAllocationPercent: string
}

type FormErrors = Partial<Record<keyof ChangeManagerForm, string | null>>

type ProjectChangeManagerModalProps = {
  open: boolean
  projectId: Id
  onClose: () => void
}

const BLANK: ChangeManagerForm = {
  newManagerId: '',
  managerAllocationPercent: '',
}

export default function ProjectChangeManagerModal({
  open,
  projectId,
  onClose,
}: ProjectChangeManagerModalProps) {
  const [form, setForm] = useState<ChangeManagerForm>(BLANK)
  const [errors, setErrors] = useState<FormErrors>({})

  const changeManager = useChangeProjectManager()
  const isPending = changeManager.isPending

  useEffect(() => {
    if (open) {
      setForm(BLANK)
      setErrors({})
    }
  }, [open])

  const set = <K extends keyof ChangeManagerForm>(key: K, val: ChangeManagerForm[K]) => {
    setForm((current) => ({ ...current, [key]: val }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next: FormErrors = {}
    const effort = Number(form.managerAllocationPercent)
    if (!form.newManagerId) next.newManagerId = 'Please select a new manager.'
    if (
      form.managerAllocationPercent === '' ||
      Number.isNaN(effort) ||
      effort <= 0 ||
      effort > 100
    ) {
      next.managerAllocationPercent = 'Must be between 1 and 100.'
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

    changeManager.mutate({
      id: projectId,
      data: {
        newManagerId: Number(form.newManagerId),
        managerAllocationPercent: Number(form.managerAllocationPercent),
      },
    }, { onSuccess: onClose })
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[480px]">
      <Modal.Header title="Change Project Manager" onClose={onClose} />

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <AutocompleteSelect
          id="change-manager-userId"
          label="New Manager"
          required
          placeholder="Search by name, email..."
          value={form.newManagerId}
          onChange={(val) => set('newManagerId', val)}
          useSearchHook={useProjectManagerCandidates}
          searchParams={projectId}
          error={errors.newManagerId}
          noResultsText="No eligible project managers found"
        />

        {form.newManagerId && (
          <RemainingEffortPanel
            userId={form.newManagerId}
            requestedEffort={form.managerAllocationPercent}
          />
        )}

        <div className="w-1/2">
          <EffortField
            effort={form.managerAllocationPercent}
            effortError={errors.managerAllocationPercent}
            onEffortChange={(effort) => set('managerAllocationPercent', effort)}
          />
        </div>

        <ModalFormActions
          onCancel={onClose}
          isPending={isPending}
          cancelDisabled={isPending}
          idleIcon={<ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={2} />}
          pendingLabel="Changing..."
          submitLabel="Change Manager"
        />
      </form>
    </Modal>
  )
}
