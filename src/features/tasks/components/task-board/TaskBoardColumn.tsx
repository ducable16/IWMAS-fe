import { useEffect, useRef, useState } from 'react'
import { Check, Clock, GripVertical, Plus, X } from 'lucide-react'
import clsx from 'clsx'
import { TaskTypeBadge } from '@/components/ui/Badge'
import { TASK_TYPE_META as TYPE_META } from '@/constants/enums'
import type { NavigateFunction } from 'react-router-dom'
import type { Id, TaskListItem } from '@/types'
import type { COLUMN_CONFIG } from './taskBoardTypes'

type TaskCardProps = {
  task: TaskListItem
  onDragStart: () => void
  onClick: () => void
}

type AddTaskFormProps = {
  onSubmit: (title: string) => void
  onCancel: () => void
}

type BoardColumnProps = {
  col: typeof COLUMN_CONFIG[number]
  tasks: TaskListItem[]
  isDragOver: boolean
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  onDragStart: (taskId: Id) => void
  navigate: NavigateFunction
  isAdding: boolean
  onStartAdd: () => void
  onCancelAdd: () => void
  onSubmitAdd: (title: string) => void
}

const TYPE_META_BY_KEY = TYPE_META as Record<string, { label: string; color: string }>

function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const hasKnownType = Boolean(TYPE_META_BY_KEY[task.type])
  const isDone = task.status === 'DONE'
  const isCxl = task.status === 'CANCELLED'

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onClick={onClick}
      className={clsx(
        'card p-3 cursor-grab active:cursor-grabbing group hover:border-border transition-colors select-none',
        (isDone || isCxl) && 'opacity-55',
      )}
    >
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

      {(hasKnownType || task.labels.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-2.5 ml-3.5">
          {hasKnownType && (
            <TaskTypeBadge type={task.type} className="text-[9px] py-0 px-1" />
          )}
          {task.labels.slice(0, 2).map((label) => (
            <span key={label} className="badge-neutral">#{label}</span>
          ))}
          {task.labels.length > 2 && (
            <span className="text-[10px] text-text-muted">+{task.labels.length - 2}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 ml-3.5">
        <div className="flex-1 flex items-center gap-2.5 text-[11px] text-text-muted">
          {task.estimate && task.estimate !== '-' && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {task.estimate}
            </span>
          )}
          {task.sprint && task.sprint !== '-' && (
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

function AddTaskForm({ onSubmit, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('')
  const ref = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const handle = () => {
    const nextTitle = title.trim()
    if (!nextTitle) return
    onSubmit(nextTitle)
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-bg-surface p-2.5 space-y-2 shadow-card">
      <textarea
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handle()
          }
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

export default function TaskBoardColumn({
  col,
  tasks,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  navigate,
  isAdding,
  onStartAdd,
  onCancelAdd,
  onSubmitAdd,
}: BoardColumnProps) {
  return (
    <div className="flex-shrink-0 w-[272px] flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1 h-8">
        <span className={clsx('dot', col.dot)} />
        <span className="text-[13px] font-semibold text-text-primary">{col.label}</span>
        <span className="ml-auto text-[11px] text-text-muted bg-bg-subtle border border-border-subtle px-1.5 py-0.5 rounded-md tabular-nums">
          {tasks.length}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          onDragOver()
        }}
        onDrop={onDrop}
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
