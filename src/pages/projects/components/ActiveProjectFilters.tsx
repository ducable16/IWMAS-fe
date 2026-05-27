import ActiveFilterChips from '@/components/ui/ActiveFilterChips'
import { PROJECT_STATUS_META } from '@/constants/enums'
import type { ActiveFilterChip } from '@/components/ui/ActiveFilterChips'
import type { MemberView } from '@/types'
import type { ProjectFilterChange, ProjectFilterParams } from '../projectsPageConfig'

type ActiveProjectFiltersProps = {
  filters: ProjectFilterParams
  users: MemberView[]
  onChange: ProjectFilterChange
  onClearAll: () => void
}

const STATUS_META_BY_KEY = PROJECT_STATUS_META as Record<string, { label: string }>

export default function ActiveProjectFilters({
  filters,
  users,
  onChange,
  onClearAll,
}: ActiveProjectFiltersProps) {
  const chips: ActiveFilterChip[] = []

  ;(filters.statuses || []).forEach((status) =>
    chips.push({
      key: `status-${status}`,
      label: STATUS_META_BY_KEY[status]?.label ?? status,
      clear: () => onChange('statuses', filters.statuses.filter((item) => item !== status)),
    }),
  )

  if (filters.managerId) {
    const manager = users.find((item) => item.id === filters.managerId)
    chips.push({
      key: 'managerId',
      label: `Manager: ${manager?.fullName ?? filters.managerId}`,
      clear: () => onChange('managerId', null),
    })
  }

  if (filters.startDateFrom || filters.startDateTo) {
    chips.push({
      key: 'startDate',
      label: `Start: ${filters.startDateFrom ?? '...'} -> ${filters.startDateTo ?? '...'}`,
      clear: () => {
        onChange('startDateFrom', null)
        onChange('startDateTo', null)
      },
    })
  }

  if (filters.endDateFrom || filters.endDateTo) {
    chips.push({
      key: 'endDate',
      label: `End: ${filters.endDateFrom ?? '...'} -> ${filters.endDateTo ?? '...'}`,
      clear: () => {
        onChange('endDateFrom', null)
        onChange('endDateTo', null)
      },
    })
  }

  return <ActiveFilterChips chips={chips} onClearAll={onClearAll} />
}
