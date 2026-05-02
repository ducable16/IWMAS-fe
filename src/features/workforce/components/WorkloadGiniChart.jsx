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
  if (score >= 80) return '#B43A18'
  if (score >= 60) return '#DD5B00'
  if (score >= 40) return '#DD5B00'
  return '#1AAE39'
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
          <CartesianGrid vertical={false} stroke="rgba(0, 0, 0, 0.06)" strokeDasharray="0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#A39E98', fontFamily: 'NotionInter, Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#A39E98', fontFamily: 'NotionInter, Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
          <ReferenceLine
            y={avg}
            stroke="#615D59"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{ value: `avg ${avg}`, fill: '#615D59', fontSize: 10, fontFamily: 'NotionInter, Inter, sans-serif' }}
          />
          <ReferenceLine
            y={80}
            stroke="#B43A18"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{ value: 'burnout', fill: '#B43A18', fontSize: 10, fontFamily: 'NotionInter, Inter, sans-serif' }}
          />
          <Bar dataKey="score" shape={<CustomBar />} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border-subtle">
        {[
          { color: '#1AAE39', label: 'Safe (0–39)' },
          { color: '#DD5B00', label: 'Medium (40–59)' },
          { color: '#DD5B00', label: 'High (60–79)' },
          { color: '#B43A18', label: 'Critical (80+)' },
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
