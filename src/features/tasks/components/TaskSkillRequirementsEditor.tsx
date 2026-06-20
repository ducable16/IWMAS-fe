import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { SKILL_LEVEL_LABEL, SKILL_LEVELS } from '@/constants/enums'
import { useSkills } from '@/features/skills/hooks/useSkills'
import type { Id, Skill, TaskSkillRequirementRequest } from '@/types'

type TaskSkillRequirementsEditorProps = {
  value: TaskSkillRequirementRequest[]
  onChange: (value: TaskSkillRequirementRequest[]) => void
  disabled?: boolean
}

const DEFAULT_LEVEL = 'INTERMEDIATE'
const SKILL_MENU_GAP = 4
const SKILL_MENU_MAX_HEIGHT = 240
const VIEWPORT_PADDING = 8

type SkillMenuPosition = {
  left: number
  top?: number
  bottom?: number
  width: number
  maxHeight: number
}

function skillKey(id: Id | null | undefined) {
  return id == null ? '' : String(id)
}

function getSkillLabel(skill: Skill | undefined, fallbackId: Id) {
  if (!skillKey(fallbackId)) return ''
  if (!skill) return `Skill #${fallbackId}`
  return `${skill.name} - ${skill.categoryName || 'Uncategorized'}`
}

function matchesSkillSearch(skill: Skill, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return [skill.name, skill.categoryName, skill.description]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized))
}

export function toTaskSkillRequirementRequest(
  requirements: Array<{
    skillId: Id
    minimumLevel?: string | null | undefined
    isRequired?: boolean | null | undefined
  }> = [],
): TaskSkillRequirementRequest[] {
  return requirements
    .filter((item) => !!skillKey(item.skillId))
    .map((item) => ({
      skillId: item.skillId,
      minimumLevel: item.minimumLevel || DEFAULT_LEVEL,
      isRequired: item.isRequired ?? true,
    }))
}

function SkillSearchSelect({
  value,
  skills,
  currentSkill,
  usedSkillIds,
  disabled,
  isLoading,
  autoFocus = false,
  onChange,
}: {
  value: Id
  skills: Skill[]
  currentSkill: Skill | undefined
  usedSkillIds: Set<string>
  disabled: boolean
  isLoading: boolean
  autoFocus?: boolean
  onChange: (skill: Skill) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuPosition, setMenuPosition] = useState<SkillMenuPosition | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const skipNextFocusOpenRef = useRef(false)
  const selectedSkillKey = skillKey(value)
  const selectedLabel = getSkillLabel(currentSkill, value)

  useEffect(() => {
    if (!open) setQuery(selectedLabel)
  }, [open, selectedLabel])

  useEffect(() => {
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!autoFocus || disabled || isLoading) return
    setQuery('')
    skipNextFocusOpenRef.current = true
    inputRef.current?.focus()
  }, [autoFocus, disabled, isLoading])

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null)
      return
    }

    const updateMenuPosition = () => {
      const input = inputRef.current
      if (!input) return

      const rect = input.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom - SKILL_MENU_GAP - VIEWPORT_PADDING
      const spaceAbove = rect.top - SKILL_MENU_GAP - VIEWPORT_PADDING
      const openUp = spaceBelow < SKILL_MENU_MAX_HEIGHT && spaceAbove > spaceBelow
      const availableHeight = Math.max(80, openUp ? spaceAbove : spaceBelow)

      setMenuPosition({
        left: Math.max(VIEWPORT_PADDING, Math.min(rect.left, window.innerWidth - rect.width - VIEWPORT_PADDING)),
        width: rect.width,
        maxHeight: Math.min(SKILL_MENU_MAX_HEIGHT, availableHeight),
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + SKILL_MENU_GAP }
          : { top: rect.bottom + SKILL_MENU_GAP }),
      })
    }

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    const resizeObserver = new ResizeObserver(updateMenuPosition)
    if (inputRef.current) resizeObserver.observe(inputRef.current)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
      resizeObserver.disconnect()
    }
  }, [open])

  const options = useMemo(
    () =>
      skills.filter((skill) => {
        const optionKey = skillKey(skill.id)
        const available = optionKey === selectedSkillKey || !usedSkillIds.has(optionKey)
        return available && matchesSkillSearch(skill, open ? query : '')
      }),
    [open, query, selectedSkillKey, skills, usedSkillIds],
  )

  return (
    <div ref={rootRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
      <input
        ref={inputRef}
        value={open ? query : selectedLabel}
        onChange={(event) => {
          setQuery(event.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          if (skipNextFocusOpenRef.current) {
            skipNextFocusOpenRef.current = false
            return
          }
          setOpen(true)
          setQuery('')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            const firstOption = options[0]
            if (firstOption) {
              onChange(firstOption)
              setOpen(false)
            }
          }
          if (event.key === 'Escape') setOpen(false)
        }}
        disabled={disabled || isLoading}
        placeholder="Search skills..."
        className="input-field h-[36px] pl-8 text-[12.5px]"
        aria-label="Search skill"
        autoComplete="off"
      />

      {open && !disabled && menuPosition && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            left: menuPosition.left,
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
            zIndex: 1000,
          }}
          className="overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-popover"
        >
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-text-muted">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading skills...
            </div>
          )}

          {!isLoading && options.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-text-muted">
              No skills found.
            </div>
          )}

          {!isLoading && options.map((skill) => {
            const selected = skillKey(skill.id) === selectedSkillKey
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => {
                  onChange(skill)
                  setOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-bg-hover ${
                  selected ? 'bg-accent/5 text-accent' : 'text-text-primary'
                }`}
              >
                <span className="block font-medium">{skill.name}</span>
                <span className="block text-[11px] text-text-muted">
                  {skill.categoryName || 'Uncategorized'}
                </span>
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default function TaskSkillRequirementsEditor({
  value,
  onChange,
  disabled = false,
}: TaskSkillRequirementsEditorProps) {
  const skillsQuery = useSkills()
  const skills = useMemo(() => skillsQuery.data ?? [], [skillsQuery.data])

  const skillById = useMemo(
    () => new Map(skills.map((skill) => [skillKey(skill.id), skill])),
    [skills],
  )

  const usedSkillIds = useMemo(
    () => new Set(value.map((item) => skillKey(item.skillId)).filter(Boolean)),
    [value],
  )

  const addRequirement = () => {
    onChange([
      ...value,
      {
        skillId: '',
        minimumLevel: DEFAULT_LEVEL,
        isRequired: true,
      },
    ])
  }

  const updateRequirement = (
    index: number,
    patch: Partial<TaskSkillRequirementRequest>,
  ) => {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  const removeRequirement = (index: number) => {
    onChange(value.filter((_item, itemIndex) => itemIndex !== index))
  }

  const canAdd = !disabled && skills.some((skill) => !usedSkillIds.has(skillKey(skill.id)))
    && value.every((item) => !!skillKey(item.skillId))

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-subtle/30 p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-text-primary">Requirement skills</p>
          <p className="text-[11.5px] text-text-muted">Skills needed to complete this task.</p>
        </div>
        {!disabled && (
          <button
            type="button"
            className="btn-secondary text-[12px] py-1.5 px-2.5"
            onClick={addRequirement}
            disabled={!canAdd || skillsQuery.isLoading}
          >
            {skillsQuery.isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
            Add skill
          </button>
        )}
      </div>

      {skillsQuery.isError && (
        <p className="text-[12px] text-danger">Failed to load skill catalog.</p>
      )}

      {value.length === 0 && (
        <p className="rounded-md border border-dashed border-border-subtle px-3 py-2 text-[12px] text-text-muted">
          No skill requirements.
        </p>
      )}

      <div className="space-y-2">
        {value.map((requirement, index) => {
          const currentSkillKey = skillKey(requirement.skillId)
          const currentSkill = skillById.get(currentSkillKey)
          return (
            <div
              key={`${currentSkillKey}-${index}`}
              className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_150px_88px_32px] gap-2 items-center"
            >
              <SkillSearchSelect
                value={requirement.skillId}
                skills={skills}
                currentSkill={currentSkill}
                usedSkillIds={usedSkillIds}
                disabled={disabled}
                isLoading={skillsQuery.isLoading}
                autoFocus={!currentSkillKey}
                onChange={(skill) => updateRequirement(index, { skillId: skill.id })}
              />

              <select
                value={requirement.minimumLevel || DEFAULT_LEVEL}
                onChange={(event) => updateRequirement(index, { minimumLevel: event.target.value })}
                disabled={disabled}
                className="input-select h-[36px] text-[12.5px]"
                aria-label="Minimum level"
              >
                {SKILL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {SKILL_LEVEL_LABEL[level]}
                  </option>
                ))}
              </select>

              <label className="flex h-[36px] items-center gap-2 rounded-md border border-border-subtle px-2 text-[12px] text-text-secondary">
                <input
                  type="checkbox"
                  checked={requirement.isRequired ?? true}
                  onChange={(event) => updateRequirement(index, { isRequired: event.target.checked })}
                  disabled={disabled}
                  className="h-3.5 w-3.5"
                />
                Required
              </label>

              {!disabled ? (
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="h-[36px] w-full sm:w-[32px] inline-flex items-center justify-center rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
                  aria-label="Remove skill requirement"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
