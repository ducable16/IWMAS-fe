import BurnoutAlertBanner from '@/features/workforce/components/BurnoutAlertBanner'
import WorkloadScoreCard from '@/features/workforce/components/WorkloadScoreCard'
import WorkloadGiniChart from '@/features/workforce/components/WorkloadGiniChart'
import SmartAssignPanel from '@/features/workforce/components/SmartAssignPanel'
import SprintRiskPanel from '@/features/workforce/components/SprintRiskPanel'
import LLMExplainer from '@/features/workforce/components/LLMExplainer'
import { RefreshCw, Download } from 'lucide-react'
import clsx from 'clsx'
import { useWorkloadTeam, useWorkloadKpis } from '@/features/workforce/hooks/useWorkload'
import { LiveLoading, LiveError } from '@/components/feedback/LiveStateOverlay'

export default function WorkloadPage() {
  const { data: members, isLoading, isError, error, refetch } = useWorkloadTeam()
  const { data: kpis } = useWorkloadKpis()

  const list = members || []
  const atRisk = list.filter((m) => m.score >= 60).length
  const avgScore = list.length
    ? Math.round(list.reduce((a, b) => a + (b.score || 0), 0) / list.length)
    : 0

  const stats = [
    { label: 'Avg workload', value: avgScore, suffix: '/100', tone: avgScore > 60 ? 'text-warning' : 'text-success' },
    { label: 'At risk (≥60)', value: atRisk, suffix: ` / ${list.length}`, tone: atRisk > 2 ? 'text-danger' : 'text-warning' },
    { label: 'Gini coefficient', value: (kpis?.giniCoefficient ?? 0).toFixed(2), suffix: '', tone: 'text-warning' },
    { label: 'Capacity used', value: `${kpis?.capacityUsedPct ?? 0}%`, suffix: '', tone: 'text-text-primary' },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
            Workload analytics
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">
            Real-time team capacity analysis with AI-powered assignment suggestions
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => refetch()} className="btn-secondary">
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            Refresh
          </button>
          <button className="btn-ghost">
            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
            Export
          </button>
        </div>
      </div>

      <BurnoutAlertBanner />

      {isLoading && <LiveLoading label="Loading workload data…" />}
      {isError && <LiveError error={error} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-4">
                <p className={clsx('stat-number text-2xl', stat.tone)}>
                  {stat.value}
                  <span className="text-text-muted text-sm ml-0.5">{stat.suffix}</span>
                </p>
                <p className="text-text-secondary text-[12.5px] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              <WorkloadGiniChart />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((m, i) => (
                  <WorkloadScoreCard key={m.id} member={m} delay={i * 30} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SmartAssignPanel />
              <SprintRiskPanel />
              <LLMExplainer />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
