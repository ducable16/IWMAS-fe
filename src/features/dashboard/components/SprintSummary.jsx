import { Clock } from 'lucide-react'
import clsx from 'clsx'

const SPRINTS = [
  { name: 'Sprint 15', progress: 62, total: 34, done: 21, status: 'active', daysLeft: 5, risk: 'medium' },
  { name: 'Sprint 14', progress: 93, total: 28, done: 26, status: 'review', daysLeft: 0, risk: 'low' },
  { name: 'Sprint 13', progress: 100, total: 32, done: 32, status: 'done', daysLeft: 0, risk: 'low' },
]

const RISK_BADGE = {
  low: 'badge-success',
  medium: 'badge-warning',
  high: 'badge-danger',
}

const BAR_COLOR = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-danger',
}

export default function SprintSummary() {
  return (
    <div className="card p-5">
      <h3 className="section-title text-[13px] mb-4">Sprint overview</h3>
      <div className="space-y-4">
        {SPRINTS.map((sprint) => (
          <div key={sprint.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-text-primary">{sprint.name}</span>
                <span className={clsx(RISK_BADGE[sprint.risk], 'capitalize')}>{sprint.risk}</span>
              </div>
              <div className="flex items-center gap-3 text-[11.5px] text-text-muted tabular-nums">
                {sprint.daysLeft > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.75} />
                    {sprint.daysLeft}d left
                  </span>
                )}
                <span>
                  {sprint.done}/{sprint.total}
                </span>
              </div>
            </div>
            <div className="h-1 bg-bg-subtle rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  sprint.progress === 100 ? 'bg-success' : BAR_COLOR[sprint.risk] || 'bg-accent',
                )}
                style={{ width: `${sprint.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
