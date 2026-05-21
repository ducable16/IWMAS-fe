import type { Id } from '@/types'

export interface TaskCreateForm {
  title: string
  description: string
  status: string
  priority: string
  type: string
  projectId: Id | ''
  assigneeId: Id | ''
  dueDate: string
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
  type: 'TASK',
  projectId: '',
  assigneeId: '',
  dueDate: '',
}
