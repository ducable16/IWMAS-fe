import { useEffect, useMemo, useState } from 'react'
import { BarChart3, FolderTree, Loader2, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Field from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import SelectField from '@/components/ui/SelectField'
import { Avatar } from '@/components/ui/Avatar'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { SKILL_LEVEL_LABEL, SKILL_LEVELS } from '@/constants/enums'
import {
  useCreateSkill,
  useCreateSkillCategory,
  useDeleteSkill,
  useDeleteSkillCategory,
  useSkillCategories,
  useSkillMembers,
  useSkills,
  useSkillStats,
  useUpdateSkill,
  useUpdateSkillCategory,
} from '@/features/skills/hooks/useSkills'
import { useCan } from '@/utils/permissions'
import type { ChangeEvent, FormEvent } from 'react'
import type { ApiError, Id, Skill, SkillCategory, SkillCategoryRequest, SkillRequest } from '@/types'

type SkillForm = {
  name: string
  categoryId: string
  description: string
}

type CategoryForm = {
  name: string
  description: string
}

type SkillFormErrors = Partial<Record<keyof SkillForm, string>>
type CategoryFormErrors = Partial<Record<keyof CategoryForm, string>>
type DeleteBlockReason = 'tasks' | 'members'

interface DeleteBlockState {
  skill: Skill
  reason: DeleteBlockReason
}

const EMPTY_SKILL_FORM: SkillForm = {
  name: '',
  categoryId: '',
  description: '',
}

const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: '',
  description: '',
}

function categoryLabel(name: string | null | undefined) {
  return name?.trim() || 'Uncategorized'
}

function buildSkillPayload(form: SkillForm): SkillRequest {
  const description = form.description.trim()

  return {
    name: form.name.trim(),
    categoryId: Number(form.categoryId),
    ...(description ? { description } : {}),
  }
}

function buildCategoryPayload(form: CategoryForm): SkillCategoryRequest {
  const description = form.description.trim()

  return {
    name: form.name.trim(),
    ...(description ? { description } : {}),
  }
}

function SkillFormModal({
  open,
  skill,
  categories,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean
  skill: Skill | null
  categories: SkillCategory[]
  isPending: boolean
  onClose: () => void
  onSubmit: (data: SkillRequest) => void
}) {
  const [form, setForm] = useState<SkillForm>(EMPTY_SKILL_FORM)
  const [errors, setErrors] = useState<SkillFormErrors>({})

  useEffect(() => {
    if (!open) return
    setForm(skill
      ? {
        name: skill.name || '',
        categoryId: String(skill.categoryId),
        description: skill.description || '',
      }
      : {
        ...EMPTY_SKILL_FORM,
        categoryId: categories[0]?.id == null ? '' : String(categories[0].id),
      })
    setErrors({})
  }, [categories, open, skill])

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: SkillFormErrors = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (form.name.trim().length > 100) next.name = 'Name must be at most 100 characters.'
    if (!form.categoryId) next.categoryId = 'Category is required.'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    onSubmit(buildSkillPayload(form))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={skill ? 'Edit skill' : 'Create skill'}
      maxWidth="max-w-[460px]"
      persistent={isPending}
    >
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <Field label="Name" id="catalog-skill-name" required error={errors.name}>
            <input
              id="catalog-skill-name"
              value={form.name}
              onChange={set('name')}
              disabled={isPending}
              maxLength={100}
              placeholder="React"
              className={errors.name ? 'input-field-error' : 'input-field'}
            />
          </Field>

          <SelectField
            label="Category"
            id="catalog-skill-category"
            value={form.categoryId}
            onChange={set('categoryId')}
            disabled={isPending}
            required
            error={errors.categoryId}
          >
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </SelectField>

          <Field label="Description" id="catalog-skill-description">
            <textarea
              id="catalog-skill-description"
              value={form.description}
              onChange={set('description')}
              disabled={isPending}
              rows={3}
              placeholder="Short description"
              className="input-field resize-none"
            />
          </Field>
        </Modal.Body>

        <ModalFormActions
          onCancel={onClose}
          cancelDisabled={isPending}
          isPending={isPending}
          submitLabel={skill ? 'Save skill' : 'Create skill'}
          pendingLabel={skill ? 'Saving...' : 'Creating...'}
        />
      </form>
    </Modal>
  )
}

function CategoryFormModal({
  open,
  category,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean
  category: SkillCategory | null
  isPending: boolean
  onClose: () => void
  onSubmit: (data: SkillCategoryRequest) => void
}) {
  const [form, setForm] = useState<CategoryForm>(EMPTY_CATEGORY_FORM)
  const [errors, setErrors] = useState<CategoryFormErrors>({})

  useEffect(() => {
    if (!open) return
    setForm(category
      ? { name: category.name || '', description: category.description || '' }
      : EMPTY_CATEGORY_FORM)
    setErrors({})
  }, [category, open])

  const set = (key: keyof CategoryForm) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: CategoryFormErrors = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (form.name.trim().length > 100) next.name = 'Name must be at most 100 characters.'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    onSubmit(buildCategoryPayload(form))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit category' : 'Create category'}
      maxWidth="max-w-[460px]"
      persistent={isPending}
    >
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <Field label="Name" id="skill-category-name" required error={errors.name}>
            <input
              id="skill-category-name"
              value={form.name}
              onChange={set('name')}
              disabled={isPending}
              maxLength={100}
              placeholder="Backend"
              className={errors.name ? 'input-field-error' : 'input-field'}
            />
          </Field>

          <Field label="Description" id="skill-category-description">
            <textarea
              id="skill-category-description"
              value={form.description}
              onChange={set('description')}
              disabled={isPending}
              rows={3}
              placeholder="Server-side development and infrastructure"
              className="input-field resize-none"
            />
          </Field>
        </Modal.Body>

        <ModalFormActions
          onCancel={onClose}
          cancelDisabled={isPending}
          isPending={isPending}
          submitLabel={category ? 'Save category' : 'Create category'}
          pendingLabel={category ? 'Saving...' : 'Creating...'}
        />
      </form>
    </Modal>
  )
}

function SkillDetail({
  skillId,
  canViewStats,
}: {
  skillId: Id | null
  canViewStats: boolean
}) {
  const [minLevel, setMinLevel] = useState('')
  const stats = useSkillStats(skillId, canViewStats)
  const members = useSkillMembers(skillId, minLevel ? { minLevel } : {})

  if (!skillId) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-subtle/40 p-4 text-[12.5px] text-text-muted">
        Select a skill to view usage and members.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canViewStats && (
        <div className="rounded-lg border border-border-subtle p-3">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            <p className="text-[12px] font-semibold text-text-primary">Usage stats</p>
          </div>
          {stats.isLoading && (
            <div className="flex items-center gap-2 text-[12px] text-text-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading stats...
            </div>
          )}
          {stats.isError && <p className="text-[12px] text-danger">Failed to load stats.</p>}
          {stats.data && (
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-md bg-bg-subtle/70 p-2">
                <p className="text-text-muted">Members</p>
                <p className="text-[18px] font-bold text-text-primary">{stats.data.memberCount}</p>
              </div>
              <div className="rounded-md bg-bg-subtle/70 p-2">
                <p className="text-text-muted">Open task demand</p>
                <p className="text-[18px] font-bold text-text-primary">
                  {stats.data.openTaskRequirementCount}
                </p>
              </div>
              {SKILL_LEVELS.map((level) => (
                <div key={level} className="flex items-center justify-between rounded-md bg-bg-subtle/50 px-2 py-1.5">
                  <span className="text-text-secondary">{SKILL_LEVEL_LABEL[level]}</span>
                  <span className="font-semibold text-text-primary">
                    {stats.data.levelDistribution[level] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border-subtle p-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            <p className="text-[12px] font-semibold text-text-primary">Members</p>
          </div>
          <select
            value={minLevel}
            onChange={(event) => setMinLevel(event.target.value)}
            className="input-select w-auto text-[11.5px] py-1 pl-2 pr-8"
          >
            <option value="">All levels</option>
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>{SKILL_LEVEL_LABEL[level]}+</option>
            ))}
          </select>
        </div>

        {members.isLoading && (
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading members...
          </div>
        )}
        {members.isError && <p className="text-[12px] text-danger">Failed to load members.</p>}
        {!members.isLoading && !members.isError && members.data?.length === 0 && (
          <p className="text-[12px] text-text-muted">No active members found.</p>
        )}
        <div className="space-y-2">
          {(members.data || []).map((member) => (
            <div key={member.userId} className="flex items-center gap-2">
              <Avatar name={member.fullName} avatarUrl={member.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-text-primary truncate">{member.fullName}</p>
                <p className="text-[11px] text-text-muted truncate">
                  {SKILL_LEVEL_LABEL[member.level as keyof typeof SKILL_LEVEL_LABEL] || member.level}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryManagement({
  categories,
  canManage,
}: {
  categories: SkillCategory[]
  canManage: boolean
}) {
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const createCategory = useCreateSkillCategory()
  const updateCategory = useUpdateSkillCategory()
  const deleteCategory = useDeleteSkillCategory()

  const closeModal = () => {
    if (createCategory.isPending || updateCategory.isPending) return
    setModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = (data: SkillCategoryRequest) => {
    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, data },
        { onSuccess: closeModal },
      )
      return
    }

    createCategory.mutate(data, { onSuccess: closeModal })
  }

  const handleDelete = (category: SkillCategory) => {
    const ok = window.confirm(`Delete ${category.name}? Active skills must be moved or deleted first.`)
    if (!ok) return
    deleteCategory.mutate(category.id)
  }

  return (
    <div className="rounded-lg border border-border-subtle p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-accent" strokeWidth={1.75} />
          <div>
            <p className="text-[13px] font-semibold text-text-primary">Skill categories</p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            className="btn-secondary text-[12px] py-1.5 px-3"
            onClick={() => {
              setEditingCategory(null)
              setModalOpen(true)
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            New category
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border border-border-subtle p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-text-primary">{category.name}</p>
                {category.description && (
                  <p className="text-[11.5px] text-text-muted mt-1 line-clamp-2">{category.description}</p>
                )}
              </div>
              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(category)
                      setModalOpen(true)
                    }}
                    className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    disabled={deleteCategory.isPending}
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CategoryFormModal
        open={modalOpen}
        category={editingCategory}
        isPending={createCategory.isPending || updateCategory.isPending}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function SkillDeleteBlockedModal({
  blocked,
  onClose,
}: {
  blocked: DeleteBlockState | null
  onClose: () => void
}) {
  if (!blocked) return null

  const isTaskBlock = blocked.reason === 'tasks'

  return (
    <Modal
      open={!!blocked}
      onClose={onClose}
      title="Skill cannot be deleted"
      maxWidth="max-w-[460px]"
    >
      <Modal.Body className="space-y-4">
        <div className="rounded-lg border border-warning/25 bg-warning/10 p-3">
          <p className="text-[13px] font-semibold text-text-primary">
            {blocked.skill.name} is still in use.
          </p>
          <p className="text-[12px] text-text-secondary mt-1">
            {isTaskBlock
              ? 'Remove this skill from active task requirements before deleting it from the catalog.'
              : 'Ask HR to remove this skill from member profiles before deleting it from the catalog.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isTaskBlock ? (
            <Link
              to={`/tasks?skillId=${blocked.skill.id}`}
              className="btn-secondary text-[12.5px] py-1.5 px-3"
              onClick={onClose}
            >
              Open tasks
            </Link>
          ) : (
            <button
              type="button"
              className="btn-secondary text-[12.5px] py-1.5 px-3"
              onClick={onClose}
            >
              View members below
            </button>
          )}
          <button type="button" className="btn-ghost text-[12.5px] py-1.5 px-3" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default function SkillCatalogSection() {
  const can = useCan()
  const canManageCatalog = can.manageSkillCatalog
  const canViewStats = can.isAdmin || can.isHr || can.isPm
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState<Id | null>(null)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [blockedDelete, setBlockedDelete] = useState<DeleteBlockState | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const params = useMemo(
    () => ({
      ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
    }),
    [categoryId, keyword],
  )
  const skills = useSkills(params)
  const categories = useSkillCategories()
  const createSkill = useCreateSkill()
  const updateSkill = useUpdateSkill()
  const deleteSkill = useDeleteSkill()
  const selectedSkill = (skills.data || []).find((skill) => skill.id === selectedSkillId) || null

  useEffect(() => {
    if (!skills.data?.length) {
      setSelectedSkillId(null)
      return
    }
    const firstSkill = skills.data[0]
    if (firstSkill && (!selectedSkillId || !skills.data.some((skill) => skill.id === selectedSkillId))) {
      setSelectedSkillId(firstSkill.id)
    }
  }, [selectedSkillId, skills.data])

  const closeSkillModal = () => {
    if (createSkill.isPending || updateSkill.isPending) return
    setModalOpen(false)
    setEditingSkill(null)
  }

  const handleSubmitSkill = (data: SkillRequest) => {
    if (editingSkill) {
      updateSkill.mutate(
        { id: editingSkill.id, data },
        { onSuccess: closeSkillModal },
      )
      return
    }

    createSkill.mutate(data, { onSuccess: closeSkillModal })
  }

  const handleDeleteSkill = (skill: Skill) => {
    const ok = window.confirm(`Delete ${skill.name} from the skill catalog?`)
    if (!ok) return
    deleteSkill.mutate(skill.id, {
      onError: (err: unknown) => {
        const code = (err as ApiError | undefined)?.code
        if (code === 3008 || code === 3009) {
          setSelectedSkillId(skill.id)
          setBlockedDelete({
            skill,
            reason: code === 3008 ? 'tasks' : 'members',
          })
        }
      },
    })
  }

  const categoryList = categories.data || []

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="section-title text-[15px]">Skills</h3>
          <p className="text-[12px] text-text-muted mt-1">
            Manage the skill taxonomy and review member coverage.
          </p>
        </div>
        {canManageCatalog && (
          <button
            type="button"
            className="btn-primary text-[12.5px] py-1.5 px-3"
            onClick={() => {
              setEditingSkill(null)
              setModalOpen(true)
            }}
            disabled={categoryList.length === 0}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            New skill
          </button>
        )}
      </div>

      {categories.isLoading && <LiveLoading label="Loading categories..." />}
      {categories.isError && <LiveError error={categories.error} onRetry={categories.refetch} />}

      {!categories.isLoading && !categories.isError && (
        <>
          {canManageCatalog && (
            <CategoryManagement categories={categoryList} canManage={canManageCatalog} />
          )}

          <div className="grid sm:grid-cols-[minmax(0,1fr)_220px] gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search name, category, description..."
                className="input-field pl-8"
              />
            </div>

            <select
              aria-label="Filter by category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="input-select h-[38px]"
            >
              <option value="">All categories</option>
              {categoryList.map((category) => (
                <option key={category.id} value={String(category.id)}>{category.name}</option>
              ))}
            </select>
          </div>

          {skills.isLoading && <LiveLoading label="Loading skills..." />}
          {skills.isError && <LiveError error={skills.error} onRetry={skills.refetch} />}

          {!skills.isLoading && !skills.isError && (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4">
              <div className="space-y-2">
                {(skills.data || []).length === 0 && (
                  <div className="rounded-lg border border-border-subtle bg-bg-subtle/40 p-4 text-center text-[12.5px] text-text-muted">
                    No skills found.
                  </div>
                )}
                {(skills.data || []).map((skill) => (
                  <div
                    key={skill.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSkillId(skill.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedSkillId(skill.id)
                      }
                    }}
                    className="w-full rounded-lg border border-border-subtle p-3 text-left hover:bg-bg-hover transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-semibold text-text-primary">{skill.name}</p>
                          <span className="badge-outline text-[11px]">{categoryLabel(skill.categoryName)}</span>
                        </div>
                        {skill.description && (
                          <p className="text-[12px] text-text-muted mt-1 line-clamp-2">{skill.description}</p>
                        )}
                      </div>

                      {canManageCatalog && (
                        <div className="flex items-center gap-1 shrink-0" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSkill(skill)
                              setModalOpen(true)
                            }}
                            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                            aria-label={`Edit ${skill.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill)}
                            disabled={deleteSkill.isPending}
                            className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
                            aria-label={`Delete ${skill.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <SkillDetail skillId={selectedSkill?.id ?? null} canViewStats={canViewStats} />
            </div>
          )}
        </>
      )}

      <SkillFormModal
        open={modalOpen}
        skill={editingSkill}
        categories={categoryList}
        isPending={createSkill.isPending || updateSkill.isPending}
        onClose={closeSkillModal}
        onSubmit={handleSubmitSkill}
      />
      <SkillDeleteBlockedModal blocked={blockedDelete} onClose={() => setBlockedDelete(null)} />
    </div>
  )
}
