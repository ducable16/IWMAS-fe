import type { RefObject } from 'react'
import type { EditableField } from '../taskDetail.types'
import type { MemberView, Task, UpdateTaskRequest } from '@/types'

export type DropdownRef = RefObject<HTMLDivElement | null>

export function activeDropdownRef(isActive: boolean, ref: DropdownRef) {
  return isActive ? (ref as RefObject<HTMLDivElement>) : undefined
}

export type EditorBaseProps = {
  canEdit: boolean
  editingField: EditableField | null
  setEditingField: (field: EditableField | null) => void
  dropdownRef: DropdownRef
}

export type AssigneeFieldProps = EditorBaseProps & {
  assignee: Task['assignee']
  members: MemberView[]
  memberSearch: string
  setMemberSearch: (value: string) => void
  save: (overrides: UpdateTaskRequest) => void
}

export type PriorityFieldProps = EditorBaseProps & {
  priority: string
  save: (overrides: UpdateTaskRequest) => void
}

export type TypeFieldProps = EditorBaseProps & {
  type: string | null | undefined
  save: (overrides: UpdateTaskRequest) => void
}

export type DateFieldProps = {
  field: 'startDate' | 'dueDate'
  value: string | null | undefined
  canEdit: boolean
  editingField: EditableField | null
  setEditingField: (field: EditableField | null) => void
  save: (overrides: UpdateTaskRequest) => void
  overdue?: boolean
}

export type EstimateFieldProps = {
  value: number | null | undefined
  canEdit: boolean
  editingField: EditableField | null
  setEditingField: (field: EditableField | null) => void
  save: (overrides: UpdateTaskRequest) => void
}

export type SprintFieldProps = {
  value: string | null | undefined
  canEdit: boolean
  editingField: EditableField | null
  setEditingField: (field: EditableField | null) => void
  save: (overrides: UpdateTaskRequest) => void
}

export type LabelsFieldProps = EditorBaseProps & {
  labels: string[]
  labelsDraft: string[] | null
  setLabelsDraft: (value: string[] | null | ((prev: string[] | null) => string[])) => void
  labelInput: string
  setLabelInput: (value: string) => void
  saveLabels: () => void
}
