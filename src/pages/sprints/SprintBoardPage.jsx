import { useState } from 'react'
import { Plus, GripVertical, Clock, MessageSquare } from 'lucide-react'
import clsx from 'clsx'

const INITIAL_COLUMNS = {
  todo: {
    id: 'todo',
    label: 'To do',
    dot: 'bg-text-muted',
    tasks: [
      { id: 't1', title: 'Design OAuth2 callback page', priority: 'high', assignee: 'SC', tags: ['frontend', 'auth'], comments: 2, estimate: '3h' },
      { id: 't2', title: 'Write migration scripts for v2 schema', priority: 'medium', assignee: 'JP', tags: ['backend', 'db'], comments: 0, estimate: '5h' },
      { id: 't3', title: 'Set up CI pipeline for staging', priority: 'low', assignee: 'AK', tags: ['devops'], comments: 1, estimate: '2h' },
    ],
  },
  inprogress: {
    id: 'inprogress',
    label: 'In progress',
    dot: 'bg-accent',
    tasks: [
      { id: 't4', title: 'Implement workload scoring algorithm', priority: 'high', assignee: 'MR', tags: ['backend', 'ai'], comments: 5, estimate: '8h' },
      { id: 't5', title: 'Sprint board drag-and-drop feature', priority: 'high', assignee: 'SC', tags: ['frontend'], comments: 3, estimate: '6h' },
      { id: 't6', title: 'API endpoint for smart assign', priority: 'medium', assignee: 'JP', tags: ['backend', 'api'], comments: 1, estimate: '4h' },
    ],
  },
  review: {
    id: 'review',
    label: 'In review',
    dot: 'bg-info',
    tasks: [
      { id: 't7', title: 'Notification bell component', priority: 'low', assignee: 'HL', tags: ['frontend'], comments: 2, estimate: '3h' },
      { id: 't8', title: 'User profile settings API', priority: 'medium', assignee: 'TD', tags: ['backend'], comments: 4, estimate: '5h' },
    ],
  },
  done: {
    id: 'done',
    label: 'Done',
    dot: 'bg-success',
    tasks: [
      { id: 't9', title: 'Login / Register pages', priority: 'high', assignee: 'PN', tags: ['frontend', 'auth'], comments: 6, estimate: '10h', done: true },
      { id: 't10', title: 'Database schema v1', priority: 'high', assignee: 'MR', tags: ['backend', 'db'], comments: 3, estimate: '8h', done: true },
      { id: 't11', title: 'Docker compose dev setup', priority: 'medium', assignee: 'AK', tags: ['devops'], comments: 1, estimate: '3h', done: true },
    ],
  },
}

const PRIORITY_DOT = { high: 'bg-danger', medium: 'bg-warning', low: 'bg-border-strong' }

function TaskCard({ task, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={clsx(
        'card p-3 cursor-grab active:cursor-grabbing group hover:border-border transition-colors',
        task.done && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', PRIORITY_DOT[task.priority])} />
        <p
          className={clsx(
            'text-[13px] text-text-primary flex-1 leading-snug',
            task.done && 'line-through text-text-muted',
          )}
        >
          {task.title}
        </p>
        <GripVertical
          className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
          strokeWidth={1.75}
        />
      </div>

      {task.tags && (
        <div className="flex flex-wrap gap-1 mb-2.5 ml-3.5">
          {task.tags.map((tag) => (
            <span key={tag} className="badge-neutral">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 ml-3.5">
        <div className="flex-1 flex items-center gap-2.5 text-[11px] text-text-muted">
          {task.comments > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" strokeWidth={1.75} />
              {task.comments}
            </span>
          )}
          {task.estimate && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {task.estimate}
            </span>
          )}
        </div>
        <div className="w-5 h-5 rounded-full bg-bg-subtle border border-border-subtle flex items-center justify-center text-[9px] font-semibold text-text-primary">
          {task.assignee}
        </div>
      </div>
    </div>
  )
}

export default function SprintBoardPage() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS)
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  const handleDragStart = (taskId, fromCol) => {
    setDragging({ taskId, fromCol })
  }

  const handleDrop = (toCol) => {
    if (!dragging || dragging.fromCol === toCol) return

    setColumns((prev) => {
      const from = { ...prev[dragging.fromCol] }
      const to = { ...prev[toCol] }
      const taskIdx = from.tasks.findIndex((t) => t.id === dragging.taskId)
      if (taskIdx === -1) return prev

      const [task] = from.tasks.splice(taskIdx, 1)
      task.done = toCol === 'done'
      to.tasks = [task, ...to.tasks]

      return { ...prev, [dragging.fromCol]: from, [toCol]: to }
    })
    setDragging(null)
    setDragOver(null)
  }

  const totalTasks = Object.values(columns).reduce((a, c) => a + c.tasks.length, 0)
  const doneTasks = columns.done.tasks.length
  const pct = Math.round((doneTasks / totalTasks) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
            Sprint 15
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">
            Apr 15 – Apr 29, 2025 · {doneTasks}/{totalTasks} tasks complete
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="h-1 w-36 bg-bg-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[12px] text-text-secondary tabular-nums">{pct}%</span>
          </div>
          <button className="btn-primary">
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            Add task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.values(columns).map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(col.id)
            }}
            onDrop={() => handleDrop(col.id)}
            onDragLeave={() => setDragOver(null)}
            className="flex flex-col gap-2 min-h-96"
          >
            <div className="flex items-center gap-2 px-1 h-8">
              <span className={clsx('dot', col.dot)} />
              <span className="text-[13px] font-semibold text-text-primary">{col.label}</span>
              <span className="ml-auto text-[11px] text-text-muted bg-bg-subtle border border-border-subtle px-1.5 py-0.5 rounded-md tabular-nums">
                {col.tasks.length}
              </span>
            </div>

            <div
              className={clsx(
                'flex-1 space-y-2 p-2 rounded-xl border border-dashed transition-colors min-h-32',
                dragOver === col.id
                  ? 'border-accent bg-accent-subtle/30'
                  : 'border-border-subtle bg-bg-subtle/50',
              )}
            >
              {col.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={() => handleDragStart(task.id, col.id)}
                />
              ))}
              {col.tasks.length === 0 && (
                <div className="flex items-center justify-center h-20 text-text-muted text-[12px] text-center">
                  Drop tasks here
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-text-muted hover:text-text-primary transition-colors rounded-md hover:bg-bg-hover">
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
              Add task
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
