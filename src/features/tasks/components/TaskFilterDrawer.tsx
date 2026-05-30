import { useCallback, useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_META as PRIORITY_META,
  TASK_STATUSES,
  TASK_STATUS_META as STATUS_META,
  TASK_TYPES,
  TASK_TYPE_META as TYPE_META,
} from '@/constants/enums'
import type { FilterSelectOption } from './task-filter/SearchableFilterSelect'
import {
  ChipSection,
  Divider,
  DrawerFooter,
  DrawerHeader,
  DueDateRangeSection,
  PageSizeSection,
  SelectSection,
  SortSection,
} from './task-filter/TaskFilterDrawerSections'
import type { Id, MemberView, Project, TaskFilterChange, TaskFilters } from '@/types'

export { TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES, STATUS_META, PRIORITY_META, TYPE_META }

export const SORT_FIELDS = [
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
]

type MultiFilterKey = 'statuses' | 'priorities' | 'types'

type TaskFilterDrawerProps = {
  open: boolean
  onClose: () => void
  filters: TaskFilters
  onChange: TaskFilterChange
  onReset: () => void
  projects?: Project[]
  users?: MemberView[]
}

function toUserOptions(users: MemberView[]): FilterSelectOption[] {
  return users.map((user) => ({
    id: user.id,
    label: user.fullName || `#${user.id}`,
  }))
}

function toProjectOptions(projects: Project[]): FilterSelectOption[] {
  return projects.map((project) => ({
    id: project.id,
    label: project.name || `#${project.id}`,
  }))
}

function getActiveCount(filters: TaskFilters): number {
  return [
    filters.projectId ? 1 : 0,
    filters.skillId ? 1 : 0,
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

export default function TaskFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  projects = [],
  users = [],
}: TaskFilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null)

  const userOptions = useMemo(() => toUserOptions(users), [users])
  const projectOptions = useMemo(() => toProjectOptions(projects), [projects])
  const activeCount = useMemo(() => getActiveCount(filters), [filters])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (open) drawerRef.current?.focus()
  }, [open])

  const toggle = useCallback((key: MultiFilterKey, value: string) => {
    const arr = filters[key] || []
    onChange(key, arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value])
  }, [filters, onChange])

  const selectId = useCallback((key: 'projectId' | 'assigneeId' | 'reporterId') =>
    (id: Id | null) => onChange(key, id), [onChange])

  return (
    <>
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      <div
        ref={drawerRef}
        tabIndex={-1}
        className={clsx(
          'fixed top-0 right-0 h-full w-[380px] max-w-[95vw] bg-bg-surface border-l border-border z-40',
          'flex flex-col transition-transform duration-300 ease-out outline-none',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <DrawerHeader activeCount={activeCount} onReset={onReset} onClose={onClose} />

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <SelectSection
            label="Project"
            selectedId={filters.projectId ?? null}
            options={projectOptions}
            placeholder="Search project by name..."
            emptyText="No projects available"
            noResultsText="No projects found"
            onChange={selectId('projectId')}
          />

          <Divider />

          <ChipSection
            label="Status"
            options={TASK_STATUSES}
            selected={filters.statuses || []}
            meta={STATUS_META}
            onToggle={(status) => toggle('statuses', status)}
          />

          <Divider />

          <ChipSection
            label="Priority"
            options={TASK_PRIORITIES}
            selected={filters.priorities || []}
            meta={PRIORITY_META}
            onToggle={(priority) => toggle('priorities', priority)}
            getActiveColor={(meta) => `bg-bg-hover ${meta.color}`}
          />

          <Divider />

          <ChipSection
            label="Type"
            options={TASK_TYPES}
            selected={filters.types || []}
            meta={TYPE_META}
            onToggle={(type) => toggle('types', type)}
          />

          <Divider />

          <SelectSection
            label="Assignee"
            selectedId={filters.assigneeId ?? null}
            options={userOptions}
            placeholder="Search by name..."
            emptyText="No users available"
            noResultsText="No users found"
            onChange={selectId('assigneeId')}
          />

          <Divider />

          <SelectSection
            label="Reporter"
            selectedId={filters.reporterId ?? null}
            options={userOptions}
            placeholder="Search by name..."
            emptyText="No users available"
            noResultsText="No users found"
            onChange={selectId('reporterId')}
          />

          <Divider />

          <DueDateRangeSection filters={filters} onChange={onChange} />

          <SortSection filters={filters} sortFields={SORT_FIELDS} onChange={onChange} />

          <Divider />

          <PageSizeSection size={filters.size} onChange={onChange} />
        </div>

        <DrawerFooter onReset={onReset} onClose={onClose} />
      </div>
    </>
  )
}
