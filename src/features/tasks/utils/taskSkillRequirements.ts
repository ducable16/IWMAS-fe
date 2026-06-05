import { SKILL_LEVELS } from '@/constants/enums'
import type { EmployeeSkill, Id, TaskSkillRequirementRequest } from '@/types'

const DEFAULT_MINIMUM_LEVEL = 'BEGINNER'

type SkillRequirementLike = {
  skillId: Id
  minimumLevel?: string | null | undefined
  isRequired?: boolean | null | undefined
}

function skillKey(id: Id | null | undefined) {
  return id == null ? '' : String(id)
}

function normalizeLevel(level: string | null | undefined) {
  return level || DEFAULT_MINIMUM_LEVEL
}

function levelRank(level: string | null | undefined) {
  const index = SKILL_LEVELS.indexOf(normalizeLevel(level) as (typeof SKILL_LEVELS)[number])
  return index >= 0 ? index : SKILL_LEVELS.indexOf(DEFAULT_MINIMUM_LEVEL)
}

export function getRequiredSkillRequirements(
  requirements: SkillRequirementLike[] | null | undefined,
): TaskSkillRequirementRequest[] {
  return (requirements ?? [])
    .filter((item) => !!skillKey(item.skillId) && item.isRequired !== false)
    .map((item) => ({
      skillId: item.skillId,
      minimumLevel: normalizeLevel(item.minimumLevel),
      isRequired: true,
    }))
}

export function normalizeTaskSkillRequirements(
  requirements: SkillRequirementLike[] | null | undefined,
): TaskSkillRequirementRequest[] {
  return (requirements ?? [])
    .filter((item) => !!skillKey(item.skillId))
    .map((item) => ({
      skillId: item.skillId,
      minimumLevel: normalizeLevel(item.minimumLevel),
      isRequired: item.isRequired ?? false,
    }))
}

export function serializeRequiredSkills(
  requirements: SkillRequirementLike[] | null | undefined,
) {
  const required = getRequiredSkillRequirements(requirements)
  if (!required.length) return undefined
  return required
    .map((item) => `${item.skillId}:${normalizeLevel(item.minimumLevel)}`)
    .join(',')
}

export function getMissingRequiredSkills(
  employeeSkills: EmployeeSkill[] | null | undefined,
  requirements: SkillRequirementLike[] | null | undefined,
): TaskSkillRequirementRequest[] {
  const skillRanks = new Map<string, number>()
  for (const skill of employeeSkills ?? []) {
    const key = skillKey(skill.skillId)
    const rank = levelRank(skill.level)
    const current = skillRanks.get(key)
    if (current == null || rank > current) skillRanks.set(key, rank)
  }

  return getRequiredSkillRequirements(requirements).filter((requirement) => {
    const requiredRank = levelRank(requirement.minimumLevel)
    const userRank = skillRanks.get(skillKey(requirement.skillId))
    return userRank == null || userRank < requiredRank
  })
}

export function meetsRequiredSkills(
  employeeSkills: EmployeeSkill[] | null | undefined,
  requirements: SkillRequirementLike[] | null | undefined,
) {
  return getMissingRequiredSkills(employeeSkills, requirements).length === 0
}
