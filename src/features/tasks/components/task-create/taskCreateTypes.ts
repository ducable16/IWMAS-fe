import type { Id } from '@/types'

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
  startDate: '',
  dueDate: '',
  estimatedHours: '',
}

export function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
