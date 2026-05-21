import type { Project } from '@/types'
import type { ProjectStatus } from '@/constants/enums'

export type ProjectFormState = {
  name: string
  code: string
  description: string
  status: ProjectStatus | string
  startDate: string
  endDate: string
  managerId: string
  managerEffortPercent: string
}

export type ProjectFormErrors = Partial<Record<keyof ProjectFormState, string | null>>

export type ProjectFormModalProps = {
  open: boolean
  project?: Project | null | undefined
  onClose: () => void
}

export const BLANK_PROJECT_FORM: ProjectFormState = {
  name: '',
  code: '',
  description: '',
  status: 'PLANNING',
  startDate: '',
  endDate: '',
  managerId: '',
  managerEffortPercent: '0',
}
