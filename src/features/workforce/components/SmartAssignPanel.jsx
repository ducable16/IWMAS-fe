import { Sparkles, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const SUGGESTIONS = [
  {
    task: 'TASK-203: Implement OAuth2 flow',
    candidates: [
      { name: 'Sarah Chen', score: 34, match: 97, reason: 'Low workload + OAuth expertise' },
      { name: 'Jamie Park', score: 41, match: 89, reason: 'Available capacity + backend skills' },
      { name: 'Priya Nair', score: 38, match: 85, reason: 'Low workload, learning opportunity' },
    ],
  },
  {
    task: 'TASK-207: DB schema migration',
    candidates: [
      { name: 'Jamie Park', score: 41, match: 94, reason: 'DB expertise + optimal workload' },
      { name: 'Alex Kim', score: 29, match: 91, reason: 'Very low workload + infrastructure skills' },
    ],
  },
]

export default function SmartAssignPanel() {
  const [assigned, setAssigned] = useState({})
  const [activeTask, setActiveTask] = useState(0)

  const task = SUGGESTIONS[activeTask]

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.75} />
        <h3 className="section-title text-[13px]">Smart assign</h3>
        <span className="badge-accent ml-auto">AI</span>
      </div>

      <div className="flex gap-1.5 mb-4">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveTask(i)}
            className={clsx(
              'text-[11.5px] px-2 py-1 rounded-md border transition-colors',
              activeTask === i
                ? 'bg-bg-subtle border-border text-text-primary'
                : 'bg-transparent border-transparent text-text-muted hover:text-text-secondary hover:bg-bg-hover',
            )}
          >
            {s.task.split(':')[0]}
          </button>
        ))}
      </div>

      <p className="text-[11.5px] text-text-muted mb-3 font-mono">{task.task}</p>

      <div className="space-y-1.5">
        {task.candidates.map((c, i) => (
          <div
            key={c.name}
            className={clsx(
              'flex items-center gap-3 p-2.5 rounded-lg border transition-colors',
              assigned[task.task] === c.name
                ? 'border-success/30 bg-success-subtle/50'
                : i === 0
                ? 'border-accent/20 bg-accent-subtle/50'
                : 'border-border-subtle bg-bg-subtle/50',
            )}
          >
            <div
              className={clsx(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0',
                i === 0 ? 'bg-accent text-white' : 'bg-white border border-border text-text-muted',
              )}
            >
              {i + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-text-primary truncate">{c.name}</span>
                <span
                  className={clsx(
                    'text-[11px] tabular-nums',
                    i === 0 ? 'text-accent font-medium' : 'text-text-muted',
                  )}
                >
                  {c.match}%
                </span>
              </div>
              <p className="text-[11.5px] text-text-muted mt-0.5 truncate">{c.reason}</p>
            </div>

            {assigned[task.task] === c.name ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" strokeWidth={1.75} />
            ) : (
              <button
                onClick={() => setAssigned((prev) => ({ ...prev, [task.task]: c.name }))}
                className={clsx(
                  'shrink-0 text-[11.5px] font-medium px-2 py-1 rounded-md border transition-colors',
                  i === 0
                    ? 'bg-accent text-white border-accent hover:bg-accent-hover'
                    : 'bg-white border-border text-text-secondary hover:border-border-strong hover:text-text-primary',
                )}
              >
                Assign
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
