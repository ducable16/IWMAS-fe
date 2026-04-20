import BurnoutAlertBanner from '@/features/workforce/components/BurnoutAlertBanner'
import WorkloadScoreCard from '@/features/workforce/components/WorkloadScoreCard'
import WorkloadGiniChart from '@/features/workforce/components/WorkloadGiniChart'
import SmartAssignPanel from '@/features/workforce/components/SmartAssignPanel'
import SprintRiskPanel from '@/features/workforce/components/SprintRiskPanel'
import LLMExplainer from '@/features/workforce/components/LLMExplainer'
import { RefreshCw, Download } from 'lucide-react'
import clsx from 'clsx'

const MEMBERS = [
  { id: 1, name: 'Marcus Rivera', role: 'Senior Engineer', score: 89, tasksActive: 14, hoursThisWeek: 52, skills: ['React', 'Node.js', 'AWS'] },
  { id: 2, name: 'Tran Minh Duc', role: 'Backend Engineer', score: 81, tasksActive: 11, hoursThisWeek: 48, skills: ['Java', 'PostgreSQL', 'Docker'] },
  { id: 3, name: 'Chris Morgan', role: 'Full Stack Dev', score: 68, tasksActive: 9, hoursThisWeek: 44, skills: ['Vue', 'Python', 'Redis'] },
  { id: 4, name: 'Linh Nguyen', role: 'Frontend Dev', score: 61, tasksActive: 8, hoursThisWeek: 42, skills: ['React', 'TypeScript', 'Tailwind'] },
  { id: 5, name: 'David Torres', role: 'DevOps Engineer', score: 53, tasksActive: 7, hoursThisWeek: 40, skills: ['K8s', 'Terraform', 'CI/CD'] },
  { id: 6, name: 'Hana Lee', role: 'QA Engineer', score: 47, tasksActive: 6, hoursThisWeek: 38, skills: ['Cypress', 'Jest', 'Selenium'] },
  { id: 7, name: 'Jamie Park', role: 'Backend Engineer', score: 41, tasksActive: 6, hoursThisWeek: 37, skills: ['Go', 'gRPC', 'MongoDB'] },
  { id: 8, name: 'Priya Nair', role: 'Senior Engineer', score: 38, tasksActive: 5, hoursThisWeek: 35, skills: ['React', 'GraphQL', 'AWS'] },
  { id: 9, name: 'Sarah Chen', role: 'Frontend Dev', score: 34, tasksActive: 4, hoursThisWeek: 33, skills: ['React', 'CSS', 'Figma'] },
  { id: 10, name: 'Alex Kim', role: 'Infrastructure', score: 29, tasksActive: 3, hoursThisWeek: 30, skills: ['AWS', 'Linux', 'Python'] },
]

export default function WorkloadPage() {
  const atRisk = MEMBERS.filter((m) => m.score >= 60).length
  const avgScore = Math.round(MEMBERS.reduce((a, b) => a + b.score, 0) / MEMBERS.length)

  const stats = [
    { label: 'Avg workload', value: avgScore, suffix: '/100', tone: avgScore > 60 ? 'text-warning' : 'text-success' },
    { label: 'At risk (≥60)', value: atRisk, suffix: ` / ${MEMBERS.length}`, tone: atRisk > 2 ? 'text-danger' : 'text-warning' },
    { label: 'Gini coefficient', value: '0.38', suffix: '', tone: 'text-warning' },
    { label: 'Capacity used', value: '78%', suffix: '', tone: 'text-text-primary' },
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
          <button className="btn-secondary">
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
            {MEMBERS.map((m, i) => (
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
    </div>
  )
}
