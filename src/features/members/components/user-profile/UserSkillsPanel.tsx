import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useConfirm } from '@/hooks/useConfirm'
import Field from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import SelectField from '@/components/ui/SelectField'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import {
  SKILL_LEVEL_LABEL,
  SKILL_LEVEL_META,
  SKILL_LEVELS,
} from '@/constants/enums'
import {
  useAddUserSkill,
  useRemoveUserSkill,
  useSkills,
  useUpdateUserSkill,
  useUserSkills,
} from '@/features/skills/hooks/useSkills'
import { useCan } from '@/utils/permissions'
import type { ChangeEvent, FormEvent } from 'react'
import type { EmployeeSkill, EmployeeSkillRequest, Id, Skill } from '@/types'
import type { SkillLevel } from '@/constants/enums'

type SkillForm = {
  skillId: string
  level: SkillLevel
  note: string
}

type SkillFormErrors = Partial<Record<keyof SkillForm, string>>

type SkillModalMode = 'add' | 'edit'

interface SkillAssignmentModalProps {
  open: boolean
  mode: SkillModalMode
  employeeSkill: EmployeeSkill | null
  skills: Skill[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: EmployeeSkillRequest) => void
}

interface UserSkillsPanelProps {
  userId: Id
}

const EMPTY_FORM: SkillForm = {
  skillId: '',
  level: 'INTERMEDIATE',
  note: '',
}

function categoryLabel(category: string | null | undefined) {
  return category?.trim() || 'Uncategorized'
}

function buildPayload(form: SkillForm): EmployeeSkillRequest {
  const note = form.note.trim()

  return {
    skillId: Number(form.skillId),
    level: form.level,
    ...(note ? { note } : {}),
  }
}

function SkillAssignmentModal({
  open,
  mode,
  employeeSkill,
  skills,
  isSubmitting,
  onClose,
  onSubmit,
}: SkillAssignmentModalProps) {
  const [form, setForm] = useState<SkillForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<SkillFormErrors>({})

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && employeeSkill) {
      setForm({
        skillId: String(employeeSkill.skillId),
        level: (employeeSkill.level || 'INTERMEDIATE') as SkillLevel,
        note: employeeSkill.note || '',
      })
    } else {
      setForm({
        ...EMPTY_FORM,
        skillId: skills[0]?.id == null ? '' : String(skills[0].id),
      })
    }
    setErrors({})
  }, [employeeSkill, mode, open, skills])

  const set = (key: keyof SkillForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[key]
        return next
      })
    }
  }

  const validate = () => {
    const next: SkillFormErrors = {}
    if (!form.skillId) next.skillId = 'Skill is required.'
    if (!form.level) next.level = 'Level is required.'
    return next
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = validate()
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    onSubmit(buildPayload(form))
  }

  const title = mode === 'edit' ? 'Edit skill' : 'Add skill'

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-[460px]" persistent={isSubmitting}>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <SelectField
            label="Skill"
            id="skill-assignment-skill"
            value={form.skillId}
            onChange={set('skillId')}
            required
            disabled={mode === 'edit' || isSubmitting}
            error={errors.skillId}
            hint={mode === 'edit' ? 'Catalog skill cannot be changed' : undefined}
          >
            {skills.map((skill) => (
              <option key={skill.id} value={String(skill.id)}>
                {skill.name} - {categoryLabel(skill.categoryName)}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Level"
            id="skill-assignment-level"
            value={form.level}
            onChange={set('level')}
            required
            disabled={isSubmitting}
            error={errors.level}
          >
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {SKILL_LEVEL_LABEL[level]}
              </option>
            ))}
          </SelectField>

          <Field label="Note" id="skill-assignment-note">
            <textarea
              id="skill-assignment-note"
              value={form.note}
              onChange={set('note')}
              disabled={isSubmitting}
              rows={3}
              placeholder="Context, project experience, certifications..."
              className="input-field resize-none"
            />
          </Field>
        </Modal.Body>

        <ModalFormActions
          onCancel={onClose}
          cancelDisabled={isSubmitting}
          isPending={isSubmitting}
          submitLabel={mode === 'edit' ? 'Save skill' : 'Add skill'}
          pendingLabel={mode === 'edit' ? 'Saving...' : 'Adding...'}
        />
      </form>
    </Modal>
  )
}

function SkillRow({
  skill,
  canManage,
  isRemoving,
  onEdit,
  onRemove,
}: {
  skill: EmployeeSkill
  canManage: boolean
  isRemoving: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const levelKey = skill.level as keyof typeof SKILL_LEVEL_META
  const levelMeta = SKILL_LEVEL_META[levelKey]

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border-subtle p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-text-primary">{skill.skillName}</p>
          <span className="badge-outline text-[11px]">{categoryLabel(skill.skillCategory)}</span>
          <span className={clsx('badge text-[11px]', levelMeta?.badge || 'badge-neutral')}>
            {levelMeta?.label || skill.level}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-text-muted flex-wrap">
          {skill.note && <span className="truncate">{skill.note}</span>}
        </div>
      </div>

      {canManage && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label={`Edit ${skill.skillName}`}
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
            aria-label={`Remove ${skill.skillName}`}
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function UserSkillsPanel({ userId }: UserSkillsPanelProps) {
  const can = useCan()
  const canManage = can.manageEmployeeSkills
  const { data: skills = [], isLoading: skillsLoading } = useSkills()
  const { data: userSkills = [], isLoading, isError, error, refetch } = useUserSkills(userId)
  const addSkill = useAddUserSkill()
  const updateSkill = useUpdateUserSkill()
  const removeSkill = useRemoveUserSkill()
  const [modalMode, setModalMode] = useState<SkillModalMode>('add')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<EmployeeSkill | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const sortedUserSkills = useMemo(
    () => [...userSkills].sort((a, b) => a.skillName.localeCompare(b.skillName)),
    [userSkills],
  )

  const closeModal = () => {
    if (addSkill.isPending || updateSkill.isPending) return
    setModalOpen(false)
    setEditingSkill(null)
  }

  const openAdd = () => {
    setModalMode('add')
    setEditingSkill(null)
    setModalOpen(true)
  }

  const openEdit = (skill: EmployeeSkill) => {
    setModalMode('edit')
    setEditingSkill(skill)
    setModalOpen(true)
  }

  const handleSubmit = (data: EmployeeSkillRequest) => {
    if (modalMode === 'edit' && editingSkill) {
      updateSkill.mutate(
        { userId, employeeSkillId: editingSkill.id, data },
        { onSuccess: () => closeModal() },
      )
      return
    }

    addSkill.mutate(
      { userId, data },
      { onSuccess: () => closeModal() },
    )
  }

  const handleRemove = async (skill: EmployeeSkill) => {
    const ok = await confirm({
      title: `Remove "${skill.skillName}"?`,
      description: 'This skill will be removed from the user profile.',
      confirmLabel: 'Remove skill',
    })
    if (!ok) return
    removeSkill.mutate({ userId, employeeSkillId: skill.id })
  }

  if (isLoading) return <LiveLoading label="Loading skills..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />

  const isSubmitting = addSkill.isPending || updateSkill.isPending

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-text-primary">Skills</p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openAdd}
            disabled={skillsLoading || skills.length === 0}
            className="btn-secondary text-[12px] py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            Add skill
          </button>
        )}
      </div>

      {sortedUserSkills.length === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-bg-subtle/40 p-4 text-center text-[12.5px] text-text-muted">
          No skills recorded.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedUserSkills.map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              canManage={canManage}
              isRemoving={removeSkill.isPending}
              onEdit={() => openEdit(skill)}
              onRemove={() => handleRemove(skill)}
            />
          ))}
        </div>
      )}

      <SkillAssignmentModal
        open={canManage && modalOpen}
        mode={modalMode}
        employeeSkill={editingSkill}
        skills={skills}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
      {confirmDialog}
    </div>
  )
}
