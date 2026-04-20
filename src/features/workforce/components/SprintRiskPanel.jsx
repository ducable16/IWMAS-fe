import { ShieldAlert, Clock, Users, TrendingDown, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

const RISK_DATA = {
  overall: 'medium',
  score: 62,
  factors: [
    { icon: Clock, label: 'Deadline pressure', severity: 'high', detail: '5 days left, 38% remaining' },
    { icon: Users, label: 'Team capacity', severity: 'medium', detail: '2 members overloaded' },
    { icon: TrendingDown, label: 'Velocity trend', severity: 'low', detail: 'On track vs last sprint' },
    { icon: AlertCircle, label: 'Dependency blocks', severity: 'high', detail: '3 tasks blocked externally' },
  ],
}

const SEVERITY = {
  low: { text: 'text-success', bg: 'bg-success-subtle', bar: 'bg-success' },
  medium: { text: 'text-warning', bg: 'bg-warning-subtle', bar: 'bg-warning' },
  high: { text: 'text-danger', bg: 'bg-danger-subtle', bar: 'bg-danger' },
}

export default function SprintRiskPanel() {
  const risk = SEVERITY[RISK_DATA.overall]

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-4 h-4 text-warning" strokeWidth={1.75} />
        <h3 className="section-title text-[13px]">Sprint risk</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={clsx('dot', risk.bar)} />
          <span className={clsx('text-[11px] font-semibold uppercase tracking-wide', risk.text)}>
            {RISK_DATA.overall}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-bg-subtle border border-border-subtle mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-[11.5px] text-text-muted">Risk score</span>
          <span className="text-[12px] text-text-primary tabular-nums">{RISK_DATA.score}/100</span>
        </div>
        <div className="h-1.5 bg-white rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', risk.bar)}
            style={{ width: `${RISK_DATA.score}%` }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {RISK_DATA.factors.map((factor) => {
          const s = SEVERITY[factor.severity]
          return (
            <div key={factor.label} className="flex items-center gap-3">
              <div className={clsx('w-6 h-6 rounded-md flex items-center justify-center shrink-0', s.bg)}>
                <factor.icon className={clsx('w-3 h-3', s.text)} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium text-text-primary">{factor.label}</span>
                  <span className={clsx('text-[10px] uppercase tracking-wide font-semibold', s.text)}>
                    {factor.severity}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">{factor.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
