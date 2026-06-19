import { useState, useCallback, useDeferredValue } from 'react'
import { useProjects, useMyProjects } from '@/features/projects/hooks/useProjects'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import TaskFilterDrawer from '@/features/tasks/components/TaskFilterDrawer'
import TaskListView from '@/features/tasks/components/TaskListView'
import TaskBoardView from '@/features/tasks/components/TaskBoardView'
import TaskCalendarView from '@/features/tasks/components/TaskCalendarView'
import TaskTimelineView from '@/features/tasks/components/TaskTimelineView'
import TaskCreateModal from '@/features/tasks/components/TaskCreateModal'
import { useCan } from '@/utils/permissions'
import ActiveTaskFilters from './components/ActiveTaskFilters'
import TasksPageHeader from './components/TasksPageHeader'
import TasksToolbar from './components/TasksToolbar'
import TasksViewTabs from './components/TasksViewTabs'
import { DEFAULT_FILTERS, VIEW_MODES } from './tasksPageConfig'
import { getActiveTaskFilterCount } from './tasksPageFilters'
import type { TaskFilterChange, TaskFilters } from '@/types'
import type { ViewMode } from './tasksPageConfig'

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [createOpen, setCreateOpen] = useState(false)

  const deferredFilters = useDeferredValue(filters)

  const { data, isLoading, isError, error, refetch, isFetching } =
    useSearchTasks(deferredFilters, viewMode === 'list')

  const can = useCan()
  const allProjQ = useProjects({}, !can.isTm)
  const myProjQ = useMyProjects({}, can.isTm)
  const { data: projectsData } = can.isTm ? myProjQ : allProjQ
  const projects = projectsData?.projects ?? []
  const { data: membersData } = useMembers()
  const users = membersData?.members ?? []

  const tasks = data?.tasks ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1

  const set = useCallback<TaskFilterChange>((key, val) => {
    setFilters((prev) => ({
      ...prev,
      [key]: val,
      ...(key !== 'page' ? { page: 0 } : {}),
    }) as TaskFilters)
  }, [])

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const activeCount = getActiveTaskFilterCount(filters)
  const isStale = isFetching && !isLoading
  const subtitle =
    viewMode === 'list'
      ? isLoading
        ? 'Loading...'
        : `${totalElements.toLocaleString()} task${totalElements !== 1 ? 's' : ''} found`
      : `${VIEW_MODES.find((mode) => mode.key === viewMode)?.label} view`

  return (
    <>
      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultProjectId={filters.projectId}
        defaultProjectName={projects.find((p) => String(p.id) === String(filters.projectId))?.name || ''}
      />

      <TaskFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={set}
        onReset={reset}
        projects={projects}
        users={users}
      />

      <div className="space-y-5 max-w-[1400px] mx-auto">
        <TasksPageHeader
          subtitle={subtitle}
          canCreate={can.createTask}
          onCreate={() => setCreateOpen(true)}
        />

        <TasksViewTabs viewMode={viewMode} onChange={setViewMode} />

        <div className="space-y-2.5">
          <TasksToolbar
            filters={filters}
            viewMode={viewMode}
            activeCount={activeCount}
            isStale={isStale}
            onChange={set}
            onOpenFilters={() => setDrawerOpen(true)}
          />

          <ActiveTaskFilters
            filters={filters}
            users={users}
            projects={projects}
            onChange={set}
            onClearAll={reset}
          />
        </div>

        {viewMode === 'list' && (
          <TaskListView
            tasks={tasks}
            projects={projects}
            filters={filters}
            onChange={set}
            totalElements={totalElements}
            totalPages={totalPages}
            isLoading={isLoading}
            isError={isError}
            error={error}
            refetch={refetch}
            isStale={isStale}
          />
        )}

        {viewMode === 'board' && <TaskBoardView filters={deferredFilters} canCreate={can.createTask} />}
        {viewMode === 'calendar' && <TaskCalendarView filters={deferredFilters} />}
        {viewMode === 'timeline' && <TaskTimelineView filters={deferredFilters} />}
      </div>
    </>
  )
}
