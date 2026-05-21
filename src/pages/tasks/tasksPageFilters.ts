import type { TaskFilters } from '@/types'

export function getActiveTaskFilterCount(filters: TaskFilters): number {
  return [
    filters.projectId ? 1 : 0,
    (filters.statuses || []).length,
    (filters.priorities || []).length,
    (filters.types || []).length,
    filters.assigneeId ? 1 : 0,
    filters.reporterId ? 1 : 0,
    filters.sprint ? 1 : 0,
    filters.dueDateFrom || filters.dueDateTo ? 1 : 0,
    (filters.labels || []).length,
    Object.keys(filters.customFields || {}).length,
  ].reduce((total, count) => total + count, 0)
}
