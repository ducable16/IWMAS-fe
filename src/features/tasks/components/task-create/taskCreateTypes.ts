import type { Id, TaskSkillRequirementRequest } from '@/types'

export interface TaskCreateForm {
  title: string
  description: string
  status: string
  priority: string
  type: string
  projectId: Id | ''
  assigneeId: Id | ''
  startDate: string
  dueDate: string
  estimatedHours: string
  skillRequirements: TaskSkillRequirementRequest[]
}

export interface Suggestion {
  entityId: Id
  term: string
}

export interface SuggestionResult {
  suggestions: Suggestion[]
}

export type SetTaskCreateField = <K extends keyof TaskCreateForm>(
  key: K,
  value: TaskCreateForm[K],
) => void

export const EMPTY_TASK_CREATE_FORM: TaskCreateForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  type: 'FEATURE',
  projectId: '',
  assigneeId: '',
  startDate: '',
  dueDate: '',
  estimatedHours: '',
  skillRequirements: [],
}
