import { useRecentActivity } from '../hooks/useDashboard'

const TONE_STYLES = {
  accent: 'text-accent bg-accent-subtle',
  success: 'text-success bg-success-subtle',
  warning: 'text-warning bg-warning-subtle',
  danger: 'text-danger bg-danger-subtle',
  info: 'text-info bg-info-subtle',
}

export default function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity()
  const list = activities || []

  return (
    <div className="card p-5">
      <h3 className="section-title text-[13px] mb-4">Recent activity</h3>
      {isLoading ? (
        <p className="text-[12.5px] text-text-muted py-4">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-[12.5px] text-text-muted py-4">No recent activity.</p>
      ) : (
        <div className="space-y-0">
          {list.map((item, i) => (
            <div
              key={i}
              className="flex gap-3 items-start py-2.5 border-b border-border-subtle last:border-0"
            >
              <div className={`shrink-0 w-7 h-7 rounded-md ${TONE_STYLES[item.tone] || TONE_STYLES.info} flex items-center justify-center mt-0.5`}>
                {item.icon ? <item.icon className="w-3.5 h-3.5" strokeWidth={1.75} /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary leading-snug">{item.text}</p>
                <p className="text-[11.5px] text-text-muted mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
