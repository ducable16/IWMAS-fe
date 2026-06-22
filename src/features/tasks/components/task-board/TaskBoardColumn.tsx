import { Clock, GripVertical, Plus } from 'lucide-react'
import clsx from 'clsx'
import { TaskTypeBadge } from '@/components/ui/Badge'
import { TASK_TYPE_META as TYPE_META } from '@/constants/enums'
import type { NavigateFunction } from 'react-router-dom'
import type { Id, TaskListItem } from '@/types'
import type { COLUMN_CONFIG } from './taskBoardTypes'

type TaskCardProps = {
  task: TaskListItem
  canDrag: boolean
  onDragStart: () => void
  onClick: () => void
}

type BoardColumnProps = {
  col: typeof COLUMN_CONFIG[number]
  tasks: TaskListItem[]
  isDragOver: boolean
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  onDragStart: (taskId: Id) => void
  canDragTask: (task: TaskListItem) => boolean
  navigate: NavigateFunction
  onStartAdd: () => void
  canCreate?: boolean
}

const TYPE_META_BY_KEY = TYPE_META as Record<string, { label: string; color: string }>

function TaskCard({ task, canDrag, onDragStart, onClick }: TaskCardProps) {
  const hasKnownType = Boolean(TYPE_META_BY_KEY[task.type])
  const isDone = task.status === 'DONE'
  const isCxl = task.status === 'CANCELLED'

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault()
          return
        }
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onClick={onClick}
      className={clsx(
        'card p-3 group hover:border-border transition-colors select-none',
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
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
        {canDrag && (
          <GripVertical
            className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
            strokeWidth={1.75}
          />
        )}
      </div>

      {hasKnownType && (
        <div className="flex flex-wrap gap-1 mb-2.5 ml-3.5">
          <TaskTypeBadge type={task.type} className="text-[9px] py-0 px-1" />
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

export default function TaskBoardColumn({
  col,
  tasks,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  canDragTask,
  navigate,
  onStartAdd,
  canCreate = false,
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
            canDrag={canDragTask(task)}
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

      {canCreate ? (
        <button
          onClick={onStartAdd}
          className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-text-muted hover:text-text-primary transition-colors rounded-md hover:bg-bg-hover"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
          Add task
        </button>
      ) : null}
    </div>
  )
}
