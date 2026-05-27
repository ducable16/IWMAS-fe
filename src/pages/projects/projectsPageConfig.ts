import type { ProjectStatus } from '@/constants/enums'
import type { Id } from '@/types'

export const PROJECT_SORT_FIELDS = [
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
] as const

export type ProjectSortField = typeof PROJECT_SORT_FIELDS[number]['value']
export type ProjectSortDirection = 'ASC' | 'DESC'

export interface ProjectFilterParams {
  search: string
  statuses: ProjectStatus[]
  managerId: Id | null
  startDateFrom: string | null
  startDateTo: string | null
  endDateFrom: string | null
  endDateTo: string | null
  sortBy: ProjectSortField
  sortDirection: ProjectSortDirection
  page: number
  size: number
}

export type ProjectFilterKey = keyof ProjectFilterParams
export type ProjectFilterChange = <K extends ProjectFilterKey>(
  key: K,
  value: ProjectFilterParams[K],
) => void

export const DEFAULT_PROJECT_FILTERS: ProjectFilterParams = {
  search: '',
  statuses: [],
  managerId: null,
  startDateFrom: null,
  startDateTo: null,
  endDateFrom: null,
  endDateTo: null,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  page: 0,
  size: 20,
}

export function getActiveProjectFilterCount(filters: ProjectFilterParams): number {
  return [
    (filters.statuses || []).length,
    filters.managerId ? 1 : 0,
    filters.startDateFrom || filters.startDateTo ? 1 : 0,
    filters.endDateFrom || filters.endDateTo ? 1 : 0,
  ].reduce((total, count) => total + count, 0)
}

export function hasProjectQueryFilters(filters: ProjectFilterParams): boolean {
  return Boolean(filters.search || getActiveProjectFilterCount(filters) > 0)
}
