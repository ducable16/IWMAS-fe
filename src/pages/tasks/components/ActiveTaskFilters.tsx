import ActiveFilterChips from '@/components/ui/ActiveFilterChips'
import {
  PRIORITY_META,
  STATUS_META,
  TYPE_META,
} from '@/features/tasks/components/TaskFilterDrawer'
import type { ActiveFilterChip } from '@/components/ui/ActiveFilterChips'
import type { MemberView, Project, QueryValue, TaskFilterChange, TaskFilters } from '@/types'

type ActiveTaskFiltersProps = {
  filters: TaskFilters
  users: MemberView[]
  projects: Project[]
  onChange: TaskFilterChange
  onClearAll: () => void
}

const STATUS_META_BY_KEY = STATUS_META as Record<string, { label: string }>
const PRIORITY_META_BY_KEY = PRIORITY_META as Record<string, { label: string }>
const TYPE_META_BY_KEY = TYPE_META as Record<string, { label: string }>

export default function ActiveTaskFilters({
  filters,
  users,
  projects,
  onChange,
  onClearAll,
}: ActiveTaskFiltersProps) {
  const chips: ActiveFilterChip[] = []

  if (filters.projectId) {
    const project = projects.find((item) => item.id === filters.projectId)
    chips.push({
      key: 'projectId',
      label: `Project: ${project?.name ?? filters.projectId}`,
      clear: () => onChange('projectId', null),
    })
  }

  if (filters.skillId) {
    chips.push({
      key: 'skillId',
      label: `Skill: #${filters.skillId}`,
      clear: () => onChange('skillId', null),
    })
  }

  ;(filters.statuses || []).forEach((status) =>
    chips.push({
      key: `status-${status}`,
      label: STATUS_META_BY_KEY[status]?.label ?? status,
      clear: () => onChange('statuses', filters.statuses.filter((item) => item !== status)),
    }),
  )

  ;(filters.priorities || []).forEach((priority) =>
    chips.push({
      key: `priority-${priority}`,
      label: PRIORITY_META_BY_KEY[priority]?.label ?? priority,
      clear: () => onChange('priorities', filters.priorities.filter((item) => item !== priority)),
    }),
  )

  ;(filters.types || []).forEach((type) =>
    chips.push({
      key: `type-${type}`,
      label: TYPE_META_BY_KEY[type]?.label ?? type,
      clear: () => onChange('types', filters.types.filter((item) => item !== type)),
    }),
  )

  if (filters.assigneeId) {
    const user = users.find((item) => item.id === filters.assigneeId)
    chips.push({
      key: 'assigneeId',
      label: `Assignee: ${user?.fullName ?? filters.assigneeId}`,
      clear: () => onChange('assigneeId', null),
    })
  }

  if (filters.reporterId) {
    const user = users.find((item) => item.id === filters.reporterId)
    chips.push({
      key: 'reporterId',
      label: `Reporter: ${user?.fullName ?? filters.reporterId}`,
      clear: () => onChange('reporterId', null),
    })
  }

  if (filters.sprint) {
    chips.push({
      key: 'sprint',
      label: `Sprint: ${filters.sprint}`,
      clear: () => onChange('sprint', null),
    })
  }

  if (filters.dueDateFrom || filters.dueDateTo) {
    chips.push({
      key: 'due',
      label: `Due: ${filters.dueDateFrom ?? '...'} -> ${filters.dueDateTo ?? '...'}`,
      clear: () => {
        onChange('dueDateFrom', null)
        onChange('dueDateTo', null)
      },
    })
  }

  ;(filters.labels || []).forEach((label) =>
    chips.push({
      key: `label-${label}`,
      label: `#${label}`,
      clear: () => onChange('labels', filters.labels.filter((item) => item !== label)),
    }),
  )

  Object.entries(filters.customFields || {}).forEach(([key, value]) =>
    chips.push({
      key: `cf-${key}`,
      label: `${key}=${value}`,
      clear: () => {
        const next: Record<string, QueryValue> = { ...filters.customFields }
        delete next[key]
        onChange('customFields', next)
      },
    }),
  )

  return <ActiveFilterChips chips={chips} onClearAll={onClearAll} />
}
