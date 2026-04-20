import { CheckCircle2, GitPullRequest, UserPlus, AlertTriangle, Sparkles } from 'lucide-react'

const ACTIVITIES = [
  { icon: Sparkles, tone: 'accent', text: 'AI assigned TASK-142 to Sarah Chen based on workload score 34/100', time: '2m ago' },
  { icon: CheckCircle2, tone: 'success', text: 'Sprint 14 completed — 26/28 tasks done (93% velocity)', time: '1h ago' },
  { icon: AlertTriangle, tone: 'warning', text: 'Burnout risk detected for Marcus Rivera (score: 89/100)', time: '3h ago' },
  { icon: GitPullRequest, tone: 'info', text: 'PR #234 merged: Feature/user-auth-flow by Jamie Park', time: '4h ago' },
  { icon: UserPlus, tone: 'success', text: 'New member added: Priya Nair (Senior Engineer)', time: '1d ago' },
  { icon: AlertTriangle, tone: 'danger', text: 'Sprint 15 risk forecast: HIGH — deadline conflict detected', time: '1d ago' },
]

const TONE_STYLES = {
  accent: 'text-accent bg-accent-subtle',
  success: 'text-success bg-success-subtle',
  warning: 'text-warning bg-warning-subtle',
  danger: 'text-danger bg-danger-subtle',
  info: 'text-info bg-info-subtle',
}

export default function RecentActivity() {
  return (
    <div className="card p-5">
      <h3 className="section-title text-[13px] mb-4">Recent activity</h3>
      <div className="space-y-0">
        {ACTIVITIES.map((item, i) => (
          <div
            key={i}
            className="flex gap-3 items-start py-2.5 border-b border-border-subtle last:border-0"
          >
            <div className={`shrink-0 w-7 h-7 rounded-md ${TONE_STYLES[item.tone]} flex items-center justify-center mt-0.5`}>
              <item.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-text-primary leading-snug">{item.text}</p>
              <p className="text-[11.5px] text-text-muted mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
