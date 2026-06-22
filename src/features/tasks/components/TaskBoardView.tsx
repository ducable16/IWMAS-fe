import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/features/auth/store/authStore'
import { canModifyTask } from '@/utils/permissions'
import { invalidateTaskPlanningQueries } from '@/features/tasks/utils/planningQueryInvalidation'
import { useTaskBoard } from '@/features/tasks/hooks/useTaskViews'
import { taskService } from '@/features/tasks/services/taskService'
import { formatEstimate } from '@/utils/date'
import { TASK_STATUS_TRANSITIONS, TASK_STATUSES } from '@/constants/enums'
import { LiveEmpty, LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import TaskCreateModal from './TaskCreateModal'
import TaskBoardColumn from './task-board/TaskBoardColumn'
import {
  COLUMN_CONFIG,
  type BoardStatus,
  type DraggingTask,
  type GroupedTasks,
  type UpdateStatusVariables,
} from './task-board/taskBoardTypes'
import { getErrorMessage } from '@/utils/apiError'
import { ERR_TASK_UPDATE_STATUS, ERR_INVALID_TRANSITION } from '@/utils/errorMessages'
import { filterTasksByStatuses, isTaskStatusSelected } from '../utils/taskStatusFilter'
import type { Id, Task, TaskFilters, TaskListItem } from '@/types'

type TaskBoardViewProps = {
  filters: TaskFilters
  canCreate?: boolean
}

function normaliseTask(t: Task): TaskListItem {
  const assigneeName = t.assignee?.fullName || t.assignee?.email || '?'
  const reporterName = t.reporter?.fullName || t.reporter?.email || '?'
  return {
    id: t.id,
    title: t.title || 'Untitled',
    status: t.status ? String(t.status).toUpperCase() : 'TODO',
    priority: t.priority ? String(t.priority).toUpperCase() : 'MEDIUM',
    type: String(t.type || 'FEATURE'),
    assignee: assigneeName.substring(0, 2).toUpperCase(),
    assigneeFull: assigneeName,
    assigneeEmail: t.assignee?.email || '-',
    assigneeId: t.assignee?.id ?? null,
    reporterFull: reporterName,
    reporterId: t.reporter?.id ?? null,
    due: t.dueDate || null,
    estimate: formatEstimate(t.estimatedHours),
    projectId: t.projectId,
    projectName: t.projectName ?? null,
    projectCode: t.projectCode ?? null,
    startDate: t.startDate || null,
    createdAt: t.createdAt || null,
  }
}

function emptyGrouped(): GroupedTasks {
  return TASK_STATUSES.reduce((acc, status) => {
    acc[status] = []
    return acc
  }, {} as GroupedTasks)
}

export default function TaskBoardView({ filters, canCreate = false }: TaskBoardViewProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const boardRef = useRef<HTMLDivElement | null>(null)
  const currentUser = useAuthStore((state) => state.user)

  const projectId = filters.projectId
  const { data, isLoading, isError, error, refetch } = useTaskBoard(projectId)

  const [localGrouped, setLocalGrouped] = useState<GroupedTasks | null>(null)
  const [dragging, setDragging] = useState<DraggingTask | null>(null)
  const [dragOver, setDragOver] = useState<BoardStatus | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const statusFilterKey = filters.statuses.join(',')

  useEffect(() => {
    setLocalGrouped(null)
  }, [data, statusFilterKey])

  const serverGrouped = useMemo(() => {
    const grouped = emptyGrouped()
    for (const column of data?.columns ?? []) {
      const status = String(column.status).toUpperCase() as BoardStatus
      grouped[status] = filterTasksByStatuses(column.tasks || [], filters.statuses).map(normaliseTask)
    }
    return grouped
  }, [data, filters.statuses])
  const grouped = localGrouped ?? serverGrouped
  const tasks = useMemo(() => Object.values(grouped).flat(), [grouped])

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: UpdateStatusVariables) =>
      taskService.updateStatus(taskId, { status }),
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, ERR_TASK_UPDATE_STATUS))
      setLocalGrouped(null)
    },
    onSuccess: (_res, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board', projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'history'] })
      invalidateTaskPlanningQueries(queryClient)
    },
  })

  useEffect(() => {
    if (!dragging) return

    let scrollRAF: number | null = null
    let currentDy = 0
    let currentDx = 0

    const scrollLoop = () => {
      if (currentDy !== 0 || currentDx !== 0) {
        const main = document.querySelector('main')
        if (main && currentDy !== 0) {
          main.scrollBy({ top: currentDy, behavior: 'auto' })
        }

        if (boardRef.current && currentDx !== 0) {
          boardRef.current.scrollBy({ left: currentDx, behavior: 'auto' })
        }
      }
      scrollRAF = requestAnimationFrame(scrollLoop)
    }
    scrollRAF = requestAnimationFrame(scrollLoop)

    const handleDragOver = (e: DragEvent) => {
      const threshold = 80
      const speed = 12
      const { clientX, clientY } = e

      currentDy = 0
      if (clientY < threshold) currentDy = -speed
      else if (window.innerHeight - clientY < threshold) currentDy = speed

      currentDx = 0
      if (clientX < threshold) currentDx = -speed
      else if (window.innerWidth - clientX < threshold) currentDx = speed
    }

    window.addEventListener('dragover', handleDragOver)
    return () => {
      window.removeEventListener('dragover', handleDragOver)
      if (scrollRAF !== null) cancelAnimationFrame(scrollRAF)
    }
  }, [dragging])

  const handleDragStart = (taskId: Id, colKey: BoardStatus) => {
    const task = tasks.find((item) => String(item.id) === String(taskId))
    if (!task || !canModifyTask(currentUser?.role, currentUser?.id, task.assigneeId)) return
    setDragging({ taskId: String(taskId), fromCol: colKey })
  }

  const canDragTask = (task: TaskListItem) =>
    canModifyTask(currentUser?.role, currentUser?.id, task.assigneeId)

  const handleDrop = (toColKey: BoardStatus) => {
    if (!dragging || dragging.fromCol === toColKey) {
      setDragging(null)
      setDragOver(null)
      return
    }

    const { taskId, fromCol } = dragging
    setDragging(null)
    setDragOver(null)

    const allowed = (TASK_STATUS_TRANSITIONS as Record<string, readonly string[]>)[fromCol] || []
    if (!allowed.includes(toColKey)) {
      toast.error(ERR_INVALID_TRANSITION)
      return
    }

    const fromTasks = [...(grouped[fromCol] || [])]
    const toTasks = [...(grouped[toColKey] || [])]
    const idx = fromTasks.findIndex((task) => String(task.id) === taskId)
    if (idx === -1) return

    const moved = fromTasks.splice(idx, 1)[0]
    if (!moved) return
    toTasks.unshift({ ...moved, status: toColKey })

    setLocalGrouped({ ...grouped, [fromCol]: fromTasks, [toColKey]: toTasks })
    statusMutation.mutate({ taskId, status: toColKey })
  }

  if (!projectId) {
    return <LiveEmpty label="Select a project to view the board." />
  }

  if (isLoading) return <LiveLoading label="Loading board..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />

  const totalTasks = tasks.length
  const doneTasks = (grouped.DONE || []).length
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-4">
      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultProjectId={projectId}
      />

      {totalTasks > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[12px] text-text-secondary tabular-nums shrink-0">
            {doneTasks}/{totalTasks} done - {pct}%
          </span>
        </div>
      )}

      <div ref={boardRef} className="flex gap-4 overflow-x-auto pb-4 items-start">
        {COLUMN_CONFIG.filter((column) =>
          isTaskStatusSelected(column.key, filters.statuses),
        ).map((col) => (
          <TaskBoardColumn
            key={col.key}
            col={col}
            tasks={grouped[col.key] || []}
            isDragOver={dragOver === col.key}
            onDragOver={() => setDragOver(col.key)}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col.key)}
            onDragStart={(taskId) => handleDragStart(taskId, col.key)}
            canDragTask={canDragTask}
            navigate={navigate}
            onStartAdd={() => setCreateOpen(true)}
            canCreate={canCreate}
          />
        ))}
      </div>
    </div>
  )
}
