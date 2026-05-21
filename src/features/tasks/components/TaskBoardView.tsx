import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import { taskService } from '@/features/tasks/services/taskService'
import { TASK_STATUSES } from '@/constants/enums'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import TaskBoardColumn from './task-board/TaskBoardColumn'
import {
  COLUMN_CONFIG,
  type BoardStatus,
  type DraggingTask,
  type GroupedTasks,
  type UpdateStatusVariables,
} from './task-board/taskBoardTypes'
import type { ApiError, CreateTaskRequest, Id, TaskFilters, TaskListItem } from '@/types'

type TaskBoardViewProps = {
  filters: TaskFilters
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

function computeGrouped(tasks: TaskListItem[]): GroupedTasks {
  return TASK_STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status)
    return acc
  }, {} as GroupedTasks)
}

export default function TaskBoardView({ filters }: TaskBoardViewProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const boardRef = useRef<HTMLDivElement | null>(null)

  const params = { ...filters, size: 200, page: 0 }
  const { data, isLoading, isError, error, refetch } = useSearchTasks(params)
  const tasks = useMemo(() => data?.tasks ?? [], [data?.tasks])

  const [localGrouped, setLocalGrouped] = useState<GroupedTasks | null>(null)
  const [dragging, setDragging] = useState<DraggingTask | null>(null)
  const [dragOver, setDragOver] = useState<BoardStatus | null>(null)
  const [addingIn, setAddingIn] = useState<BoardStatus | null>(null)

  useEffect(() => {
    setLocalGrouped(null)
  }, [tasks])

  const serverGrouped = useMemo(() => computeGrouped(tasks), [tasks])
  const grouped = localGrouped ?? serverGrouped

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: UpdateStatusVariables) =>
      taskService.updateStatus(taskId, { status }),
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to update status'))
      setLocalGrouped(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      toast.success('Task created')
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to create task')),
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
    setDragging({ taskId: String(taskId), fromCol: colKey })
  }

  const handleDrop = (toColKey: BoardStatus) => {
    if (!dragging || dragging.fromCol === toColKey) {
      setDragging(null)
      setDragOver(null)
      return
    }

    const { taskId, fromCol } = dragging
    setDragging(null)
    setDragOver(null)

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

  const handleAddTask = (colKey: BoardStatus, title: string) => {
    setAddingIn(null)
    createMutation.mutate({
      title,
      status: colKey,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    })
  }

  if (isLoading) return <LiveLoading label="Loading board..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />

  const totalTasks = tasks.length
  const doneTasks = (grouped.DONE || []).length
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-4">
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
        {COLUMN_CONFIG.map((col) => (
          <TaskBoardColumn
            key={col.key}
            col={col}
            tasks={grouped[col.key] || []}
            isDragOver={dragOver === col.key}
            onDragOver={() => setDragOver(col.key)}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col.key)}
            onDragStart={(taskId) => handleDragStart(taskId, col.key)}
            navigate={navigate}
            isAdding={addingIn === col.key}
            onStartAdd={() => setAddingIn(col.key)}
            onCancelAdd={() => setAddingIn(null)}
            onSubmitAdd={(title) => handleAddTask(col.key, title)}
          />
        ))}
      </div>
    </div>
  )
}
