import clsx from 'clsx'

function scoreColor(score) {
  if (score >= 80) return '#B54232'
  if (score >= 60) return '#C0552F'
  if (score >= 40) return '#A8740F'
  return '#2F7D5B'
}

function CircularScore({ score, size = 72 }) {
  const radius = 26
  const circ = 2 * Math.PI * radius
  const pct = Math.min(Math.max(score, 0), 100) / 100
  const offset = circ * (1 - pct)
  const color = scoreColor(score)

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="#EEEBE2" strokeWidth="4" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fill="#1F1E1C"
        fontSize="14"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
      >
        {score}
      </text>
    </svg>
  )
}

const RISK_LABEL = (s) =>
  s >= 80 ? { label: 'Critical', cls: 'badge-danger' } :
  s >= 60 ? { label: 'High', cls: 'badge bg-[#F4EAE3] text-[#C0552F]' } :
  s >= 40 ? { label: 'Medium', cls: 'badge-warning' } :
  { label: 'Safe', cls: 'badge-success' }

export default function WorkloadScoreCard({ member, delay = 0 }) {
  const { score, name, role, tasksActive, hoursThisWeek, skills } = member
  const risk = RISK_LABEL(score)

  return (
    <div
      className="card p-4 flex flex-col gap-3 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-bg-subtle border border-border-subtle flex items-center justify-center text-[12px] font-semibold text-text-primary shrink-0">
          {name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary truncate">{name}</p>
          <p className="text-[11.5px] text-text-muted truncate">{role}</p>
        </div>
        <span className={risk.cls}>{risk.label}</span>
      </div>

      <div className="flex items-center gap-4">
        <CircularScore score={score} />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-[11.5px] text-text-muted">Active tasks</span>
            <span className="text-[12px] text-text-primary tabular-nums">{tasksActive}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11.5px] text-text-muted">Hours this week</span>
            <span
              className={clsx('text-[12px] tabular-nums', hoursThisWeek > 45 ? 'text-danger' : 'text-text-primary')}
            >
              {hoursThisWeek}h
            </span>
          </div>
          <div className="h-1 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, background: scoreColor(score) }}
            />
          </div>
        </div>
      </div>

      {skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-3 border-t border-border-subtle">
          {skills.slice(0, 3).map((s) => (
            <span key={s} className="badge-neutral">{s}</span>
          ))}
          {skills.length > 3 && <span className="badge-neutral">+{skills.length - 3}</span>}
        </div>
      )}
    </div>
  )
}
