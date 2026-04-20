import clsx from 'clsx'

const ICON_VARIANT = {
  default: 'text-text-secondary bg-bg-subtle',
  accent: 'text-accent bg-accent-subtle',
  success: 'text-success bg-success-subtle',
  warning: 'text-warning bg-warning-subtle',
  danger: 'text-danger bg-danger-subtle',
}

export default function StatCard({ icon: Icon, label, value, sub, trend, variant = 'default', delay = 0 }) {
  return (
    <div
      className="card p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            ICON_VARIANT[variant],
          )}
        >
          {Icon && <Icon className="w-4 h-4" strokeWidth={1.75} />}
        </div>
        {trend !== undefined && (
          <span
            className={clsx(
              'text-[11px] font-medium tabular-nums',
              trend >= 0 ? 'text-success' : 'text-danger',
            )}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <p className="stat-number text-[26px] leading-none">{value}</p>
      <p className="text-text-secondary text-[13px] mt-2">{label}</p>
      {sub && <p className="text-text-muted text-[12px] mt-1">{sub}</p>}
    </div>
  )
}
