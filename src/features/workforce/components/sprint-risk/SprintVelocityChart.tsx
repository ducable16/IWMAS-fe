import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

export type VelocityDatum = {
  sprint: string
  planned?: number
  actual?: number
  forecast?: number
}

interface SprintVelocityChartProps {
  data: VelocityDatum[]
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-surface border border-border rounded-lg px-3 py-2">
      <p className="text-[11.5px] text-text-secondary mb-1 font-medium">{label}</p>
      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="text-[12.5px] tabular-nums"
          style={{ color: item.color }}
        >
          {item.name}: <span className="font-medium">{item.value ?? '-'}</span>
        </p>
      ))}
    </div>
  )
}

export default function SprintVelocityChart({ data }: SprintVelocityChartProps) {
  return (
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
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
          <Area
            type="monotone"
            dataKey="planned"
            stroke="#615D59"
            strokeWidth={1.5}
            fill="url(#gradPlanned)"
            name="Planned"
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#1AAE39"
            strokeWidth={2}
            fill="url(#gradActual)"
            name="Actual"
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#B43A18"
            strokeWidth={2}
            fill="none"
            strokeDasharray="4 3"
            name="Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
