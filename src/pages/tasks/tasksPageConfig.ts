import { CalendarDays, Columns, GanttChart, LayoutList } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TaskFilters } from '@/types'

export type ViewMode = 'list' | 'board' | 'calendar' | 'timeline'

export interface ViewModeOption {
  key: ViewMode
  label: string
  Icon: LucideIcon
}

export const VIEW_MODES: ViewModeOption[] = [
  { key: 'list', label: 'List', Icon: LayoutList },
  { key: 'board', label: 'Board', Icon: Columns },
  { key: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { key: 'timeline', label: 'Timeline', Icon: GanttChart },
]

export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  projectId: null,
  skillId: null,
  statuses: [],
  priorities: [],
  types: [],
  assigneeId: null,
  reporterId: null,
  labels: [],
  sprint: null,
  dueDateFrom: null,
  dueDateTo: null,
  customFields: {},
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  page: 0,
  size: 20,
}
