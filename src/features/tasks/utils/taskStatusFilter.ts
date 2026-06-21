type TaskWithStatus = {
  status?: string | null | undefined
}

export function filterTasksByStatuses<T extends TaskWithStatus>(
  tasks: T[],
  statuses: string[] = [],
): T[] {
  if (statuses.length === 0) return tasks

  const selected = new Set(statuses.map((status) => status.toUpperCase()))
  return tasks.filter((task) => selected.has(String(task.status || '').toUpperCase()))
}

export function isTaskStatusSelected(status: string, statuses: string[] = []): boolean {
  if (statuses.length === 0) return true
  return statuses.some((selected) => selected.toUpperCase() === status.toUpperCase())
}
