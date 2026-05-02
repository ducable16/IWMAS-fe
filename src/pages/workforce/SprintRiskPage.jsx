import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'
import { useVelocityData, useSprintRisks } from '@/features/workforce/hooks/useWorkload'

const LEVEL_STYLE = {
  critical: { badge: 'badge-danger', dot: 'bg-danger' },
  high:     { badge: 'badge-warning', dot: 'bg-warning' },
  medium:   { badge: 'badge-warning', dot: 'bg-warning' },
  low:      { badge: 'badge-neutral', dot: 'bg-border-strong' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-surface border border-border rounded-lg px-3 py-2">
      <p className="text-[11.5px] text-text-secondary mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-[12.5px] tabular-nums" style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.value ?? '—'}</span>
        </p>
      ))}
    </div>
  )
}

export default function SprintRiskPage() {
  const { data: velocity } = useVelocityData()
  const { data: risks } = useSprintRisks()

  const velocityData = velocity || []
  const risksList = risks || []

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <div>
        <h2 className="text-subhead">Sprint risk forecast</h2>
        <p className="text-caption-light text-text-secondary mt-1">Predictive analysis for Sprint 15</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="section-title text-[13px]">Velocity trend</h3>
            <p className="text-[11.5px] text-text-muted mt-0.5">Planned vs actual story points</p>
          </div>
          <div className="flex items-center gap-4 text-[11.5px] text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-text-secondary rounded inline-block" /> Planned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-success rounded inline-block" /> Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 inline-block"
                style={{ borderTop: '1.5px dashed #B43A18' }}
              />{' '}
              Forecast
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={velocityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#615D59" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#615D59" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1AAE39" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#1AAE39" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0, 0, 0, 0.06)" vertical={false} strokeDasharray="0" />
            <XAxis
              dataKey="sprint"
              tick={{ fontSize: 11, fill: '#A39E98', fontFamily: 'NotionInter, Inter, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#A39E98', fontFamily: 'NotionInter, Inter, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="planned"  stroke="#615D59" strokeWidth={1.5} fill="url(#gradPlanned)" name="Planned" />
            <Area type="monotone" dataKey="actual"   stroke="#1AAE39" strokeWidth={2}   fill="url(#gradActual)"  name="Actual" />
            <Area type="monotone" dataKey="forecast" stroke="#B43A18" strokeWidth={2}   fill="none" strokeDasharray="4 3" name="Forecast" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <h3 className="section-title text-[13px] mt-2">Risk factors</h3>
        {risksList.map((risk, i) => {
          const s = LEVEL_STYLE[risk.level] || LEVEL_STYLE.low
          return (
            <div key={i} className="card p-4 flex gap-3">
              <div className="shrink-0 pt-1">
                <span className={clsx('dot', s.dot)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13.5px] font-semibold text-text-primary">{risk.title}</span>
                  <span className={clsx(s.badge, 'capitalize')}>{risk.level}</span>
                </div>
                <p className="text-[12.5px] text-text-secondary mb-2 leading-relaxed">{risk.desc}</p>
                <div className="flex gap-4">
                  <span className="text-[11.5px] text-text-muted">
                    Impact: <span className="text-text-secondary">{risk.impact}</span>
                  </span>
                  <span className="text-[11.5px] text-text-muted">{risk.effort}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
