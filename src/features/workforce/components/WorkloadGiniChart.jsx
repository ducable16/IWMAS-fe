import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const DATA = [
  { name: 'Alex K', score: 29 },
  { name: 'Sarah C', score: 34 },
  { name: 'Priya N', score: 38 },
  { name: 'Jamie P', score: 41 },
  { name: 'Hana L', score: 47 },
  { name: 'David T', score: 53 },
  { name: 'Linh N', score: 61 },
  { name: 'Chris M', score: 68 },
  { name: 'Tran D', score: 81 },
  { name: 'Marcus R', score: 89 },
]

const getBarColor = (score) => {
  if (score >= 80) return '#B54232'
  if (score >= 60) return '#C0552F'
  if (score >= 40) return '#A8740F'
  return '#2F7D5B'
}

const CustomBar = (props) => {
  const { x, y, width, height, score } = props
  return <rect x={x} y={y} width={width} height={height} fill={getBarColor(score)} rx={2} />
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const score = payload[0].value
  return (
    <div className="bg-bg-surface border border-border rounded-lg px-3 py-2">
      <p className="text-[11.5px] text-text-secondary font-medium">{label}</p>
      <p className="text-[13px] text-text-primary mt-0.5 tabular-nums">
        Score:{' '}
        <span style={{ color: getBarColor(score) }} className="font-semibold">
          {score}
        </span>
      </p>
    </div>
  )
}

export default function WorkloadGiniChart() {
  const avg = Math.round(DATA.reduce((a, b) => a + b.score, 0) / DATA.length)
  const gini = 0.38

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title text-[13px]">Workload distribution</h3>
          <p className="text-[11.5px] text-text-muted mt-0.5">Team workload scores — lower is better</p>
        </div>
        <div className="text-right">
          <p className="stat-number text-xl text-warning">{gini}</p>
          <p className="text-[11px] text-text-muted">Gini coefficient</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke="#EEEBE2" strokeDasharray="0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#8C8A82', fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#8C8A82', fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(31, 30, 28, 0.04)' }} />
          <ReferenceLine
            y={avg}
            stroke="#5A5955"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{ value: `avg ${avg}`, fill: '#5A5955', fontSize: 10, fontFamily: 'Inter' }}
          />
          <ReferenceLine
            y={80}
            stroke="#B54232"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{ value: 'burnout', fill: '#B54232', fontSize: 10, fontFamily: 'Inter' }}
          />
          <Bar dataKey="score" shape={<CustomBar />} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border-subtle">
        {[
          { color: '#2F7D5B', label: 'Safe (0–39)' },
          { color: '#A8740F', label: 'Medium (40–59)' },
          { color: '#C0552F', label: 'High (60–79)' },
          { color: '#B54232', label: 'Critical (80+)' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[11px] text-text-muted">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
