import { TASK_TYPE_LABEL } from '@/constants/enums'

export const PRIORITY_META = {
  LOW: { label: 'Low', cls: 'text-text-muted' },
  MEDIUM: { label: 'Medium', cls: 'text-warning' },
  HIGH: { label: 'High', cls: 'text-danger' },
  CRITICAL: { label: 'Critical', cls: 'text-danger font-semibold' },
}

export const TASK_TYPE_LABEL_BY_KEY = TASK_TYPE_LABEL as Record<string, string>
