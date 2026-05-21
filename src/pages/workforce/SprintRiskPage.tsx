import { lazy, Suspense } from 'react'
import clsx from 'clsx'
import { useSprintRisks, useVelocityData } from '@/features/workforce/hooks/useWorkload'
import type { VelocityDatum } from '@/features/workforce/components/sprint-risk/SprintVelocityChart'

const SprintVelocityChart = lazy(
  () => import('@/features/workforce/components/sprint-risk/SprintVelocityChart'),
)

type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

type SprintRisk = {
  level: RiskLevel
  title: string
  desc: string
  impact: string
  effort: string
}

const LEVEL_STYLE = {
  critical: { badge: 'badge-danger', dot: 'bg-danger' },
  high: { badge: 'badge-warning', dot: 'bg-warning' },
  medium: { badge: 'badge-warning', dot: 'bg-warning' },
  low: { badge: 'badge-neutral', dot: 'bg-border-strong' },
}

function SprintVelocityChartSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="section-title text-[13px]">Velocity trend</h3>
          <p className="text-[11.5px] text-text-muted mt-0.5">Planned vs actual story points</p>
        </div>
      </div>
      <div className="h-[220px] rounded-xl bg-bg-subtle animate-pulse" />
    </div>
  )
}

export default function SprintRiskPage() {
  const { data: velocity } = useVelocityData()
  const { data: risks } = useSprintRisks()

  const velocityData = (velocity || []) as VelocityDatum[]
  const risksList = (risks || []) as SprintRisk[]

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <div>
        <h2 className="text-subhead">Sprint risk forecast</h2>
        <p className="text-caption-light text-text-secondary mt-1">
          Predictive analysis for Sprint 15
        </p>
      </div>

      <Suspense fallback={<SprintVelocityChartSkeleton />}>
        <SprintVelocityChart data={velocityData} />
      </Suspense>

      <div className="space-y-3">
        <h3 className="section-title text-[13px] mt-2">Risk factors</h3>
        {risksList.map((risk, index) => {
          const style = LEVEL_STYLE[risk.level] || LEVEL_STYLE.low
          return (
            <div key={`${risk.title}-${index}`} className="card p-4 flex gap-3">
              <div className="shrink-0 pt-1">
                <span className={clsx('dot', style.dot)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13.5px] font-semibold text-text-primary">
                    {risk.title}
                  </span>
                  <span className={clsx(style.badge, 'capitalize')}>{risk.level}</span>
                </div>
                <p className="text-[12.5px] text-text-secondary mb-2 leading-relaxed">
                  {risk.desc}
                </p>
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
