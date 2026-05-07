import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, GripVertical, Clock, Check, X } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import { taskService } from '@/features/tasks/services/taskService'
import {
  TASK_STATUSES,
  TASK_PRIORITY_META as PRIORITY_META,
  TASK_TYPE_META as TYPE_META,
} from '@/constants/enums'
import { TaskTypeBadge } from '@/components/ui/Badge'
import { LiveLoading, LiveError } from '@/components/feedback/LiveStateOverlay'

// ─── Column config ─────────────────────────────────────────────────────────────
const COLUMN_CONFIG = [
  { key: 'TODO',        label: 'To Do',       dot: 'bg-text-muted' },
  { key: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-accent'     },
  { key: 'IN_REVIEW',   label: 'In Review',   dot: 'bg-info'       },
  { key: 'DONE',        label: 'Done',        dot: 'bg-success'    },
  { key: 'CANCELLED',   label: 'Cancelled',   dot: 'bg-danger'     },
]

function computeGrouped(tasks) {
  return TASK_STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s)
    return acc
  }, {})
}

// ─── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onDragStart, onClick }) {
  const prio    = PRIORITY_META[task.priority] || { dot: 'bg-border-strong', label: task.priority }
  const type    = TYPE_META[task.type] || null
  const isDone  = task.status === 'DONE'
  const isCxl   = task.status === 'CANCELLED'

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onClick={onClick}
      className={clsx(
        'card p-3 cursor-grab active:cursor-grabbing group hover:border-border transition-colors select-none',
        (isDone || isCxl) && 'opacity-55',
      )}
    >
      {/* Title + grip */}
      <div className="flex items-start gap-2 mb-2">
        <p
          className={clsx(
            'text-[13px] text-text-primary flex-1 leading-snug',
            (isDone || isCxl) && 'line-through text-text-muted',
          )}
        >
          {task.title}
        </p>
        <GripVertical
          className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
          strokeWidth={1.75}
        />
      </div>

      {/* Type badge + labels */}
      {(type || task.labels.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-2.5 ml-3.5">
          {type && (
            <TaskTypeBadge type={task.type} className="text-[9px] py-0 px-1" />
          )}
          {task.labels.slice(0, 2).map((l) => (
            <span key={l} className="badge-neutral">#{l}</span>
          ))}
          {task.labels.length > 2 && (
            <span className="text-[10px] text-text-muted">+{task.labels.length - 2}</span>
          )}
        </div>
      )}

      {/* Bottom row: estimate · sprint · assignee */}
      <div className="flex items-center gap-2 ml-3.5">
        <div className="flex-1 flex items-center gap-2.5 text-[11px] text-text-muted">
          {task.estimate && task.estimate !== '—' && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {task.estimate}
            </span>
          )}
          {task.sprint && task.sprint !== '—' && (
            <span className="truncate max-w-[80px]">{task.sprint}</span>
          )}
        </div>
        <div
          className="w-5 h-5 rounded-full bg-bg-subtle border border-border-subtle flex items-center justify-center text-[9px] font-semibold text-text-primary shrink-0"
          title={task.assigneeFull}
        >
          {task.assignee}
        </div>
      </div>
    </div>
  )
}

// ─── Quick-add form ────────────────────────────────────────────────────────────
function AddTaskForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const ref = useRef(null)

  useEffect(() => { ref.current?.focus() }, [])

  const handle = () => {
    const t = title.trim()
    if (!t) return
    onSubmit(t)
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-bg-surface p-2.5 space-y-2 shadow-card">
      <textarea
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handle() }
          if (e.key === 'Escape') onCancel()
        }}
        placeholder="What needs to be done?"
        className="w-full text-[13px] text-text-primary bg-transparent focus:outline-none resize-none placeholder-text-muted leading-relaxed"
        rows={2}
      />
      <div className="flex items-center gap-1.5">
        <button
          onClick={handle}
          disabled={!title.trim()}
          className="btn-primary text-[12px] py-1 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Check className="w-3 h-3" strokeWidth={2.5} />
          Add
        </button>
        <button onClick={onCancel} className="btn-ghost text-[12px] py-1 px-2 flex items-center gap-1">
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Column ────────────────────────────────────────────────────────────────────
function BoardColumn({
  col, tasks, isDragOver,
  onDragOver, onDragLeave, onDrop,
  onDragStart, navigate,
  isAdding, onStartAdd, onCancelAdd, onSubmitAdd,
}) {
  return (
    <div className="flex-shrink-0 w-[272px] flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 h-8">
        <span className={clsx('dot', col.dot)} />
        <span className="text-[13px] font-semibold text-text-primary">{col.label}</span>
        <span className="ml-auto text-[11px] text-text-muted bg-bg-subtle border border-border-subtle px-1.5 py-0.5 rounded-md tabular-nums">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); onDragOver() }}
        onDrop={() => onDrop()}
        onDragLeave={onDragLeave}
        className={clsx(
          'flex-1 space-y-2 p-2 rounded-xl border border-dashed transition-colors min-h-32',
          isDragOver
            ? 'border-accent bg-accent/5'
            : 'border-border-subtle bg-bg-subtle/50',
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={() => onDragStart(task.id)}
            onClick={() => navigate(`/tasks/${task.id}`)}
          />
        ))}
        {tasks.length === 0 && !isDragOver && (
          <div className="flex items-center justify-center h-20 text-text-muted text-[12px]">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Quick-add */}
      {isAdding ? (
        <AddTaskForm onSubmit={onSubmitAdd} onCancel={onCancelAdd} />
      ) : (
        <button
          onClick={onStartAdd}
          className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-text-muted hover:text-text-primary transition-colors rounded-md hover:bg-bg-hover"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
          Add task
        </button>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function TaskBoardView({ filters }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const params = { ...filters, size: 200, page: 0 }
  const { data, isLoading, isError, error, refetch } = useSearchTasks(params)
  const tasks = data?.tasks ?? []

  // localGrouped: null = use server data, object = optimistic override
  const [localGrouped, setLocalGrouped] = useState(null)
  const [dragging, setDragging] = useState(null)   // { taskId, fromCol }
  const [dragOver, setDragOver]   = useState(null)  // column key
  const [addingIn, setAddingIn]   = useState(null)  // column key | null
  const boardRef = useRef(null)

  // When server data refreshes, clear any optimistic override
  useEffect(() => { setLocalGrouped(null) }, [tasks])

  const serverGrouped = useMemo(() => computeGrouped(tasks), [tasks])
  const grouped = localGrouped ?? serverGrouped

  // ── Status update mutation ──
  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }) => taskService.updateStatus(taskId, { status }),
    onError: (err) => {
      toast.error(err?.message || 'Failed to update status')
      setLocalGrouped(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
    },
  })

  // ── Create mutation ──
  const createMutation = useMutation({
    mutationFn: (data) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      toast.success('Task created')
    },
    onError: (err) => toast.error(err?.message || 'Failed to create task'),
  })

  // ── Auto-scroll when dragging near viewport edges ──
  useEffect(() => {
    if (!dragging) return

    let scrollRAF = null
    let currentDy = 0
    let currentDx = 0

    const scrollLoop = () => {
      if (currentDy !== 0 || currentDx !== 0) {
        // Scroll vertical on main layout
        const main = document.querySelector('main')
        if (main && currentDy !== 0) {
          main.scrollBy({ top: currentDy, behavior: 'auto' })
        }
        
        // Scroll horizontal on board container
        if (boardRef.current && currentDx !== 0) {
          boardRef.current.scrollBy({ left: currentDx, behavior: 'auto' })
        }
      }
      scrollRAF = requestAnimationFrame(scrollLoop)
    }
    scrollRAF = requestAnimationFrame(scrollLoop)

    const handleDragOver = (e) => {
      const THRESHOLD = 80
      const SPEED = 12
      const { clientX, clientY } = e
      
      currentDy = 0
      if (clientY < THRESHOLD) currentDy = -SPEED
      else if (window.innerHeight - clientY < THRESHOLD) currentDy = SPEED

      currentDx = 0
      if (clientX < THRESHOLD) currentDx = -SPEED
      else if (window.innerWidth - clientX < THRESHOLD) currentDx = SPEED
    }

    window.addEventListener('dragover', handleDragOver)
    return () => {
      window.removeEventListener('dragover', handleDragOver)
      cancelAnimationFrame(scrollRAF)
    }
  }, [dragging])

  // ── Drag handlers ──
  const handleDragStart = (taskId, colKey) => {
    setDragging({ taskId: String(taskId), fromCol: colKey })
  }

  const handleDrop = (toColKey) => {
    if (!dragging || dragging.fromCol === toColKey) {
      setDragging(null)
      setDragOver(null)
      return
    }

    const { taskId, fromCol } = dragging
    setDragging(null)
    setDragOver(null)

    const fromTasks = [...(grouped[fromCol] || [])]
    const toTasks   = [...(grouped[toColKey] || [])]
    const idx = fromTasks.findIndex((t) => String(t.id) === taskId)
    if (idx === -1) return

    const [moved] = fromTasks.splice(idx, 1)
    toTasks.unshift({ ...moved, status: toColKey })

    // Optimistic update
    setLocalGrouped({ ...grouped, [fromCol]: fromTasks, [toColKey]: toTasks })

    statusMutation.mutate({ taskId, status: toColKey })
  }

  // ── Add task ──
  const handleAddTask = (colKey, title) => {
    setAddingIn(null)
    createMutation.mutate({
      title,
      status: colKey,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    })
  }

  if (isLoading) return <LiveLoading label="Loading board…" />
  if (isError)   return <LiveError error={error} onRetry={refetch} />

  const totalTasks = tasks.length
  const doneTasks  = (grouped['DONE'] || []).length
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[12px] text-text-secondary tabular-nums shrink-0">
            {doneTasks}/{totalTasks} done · {pct}%
          </span>
        </div>
      )}

      {/* Kanban columns */}
      <div ref={boardRef} className="flex gap-4 overflow-x-auto pb-4 items-start">
        {COLUMN_CONFIG.map((col) => (
          <BoardColumn
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
