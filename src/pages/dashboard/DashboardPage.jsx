import {
  FolderKanban, Layers, CheckSquare, Users, Sparkles, TrendingUp, AlertTriangle, Brain,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '@/features/dashboard/components/StatCard'
import RecentActivity from '@/features/dashboard/components/RecentActivity'
import SprintSummary from '@/features/dashboard/components/SprintSummary'
import { useAuthStore } from '@/features/auth/store/authStore'
import BurnoutAlertBanner from '@/features/workforce/components/BurnoutAlertBanner'
import { useDashboardStats, useAiInsight } from '@/features/dashboard/hooks/useDashboard'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] || 'there'
  const { data: stats } = useDashboardStats()
  const { data: insight } = useAiInsight()

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Welcome */}
      <div>
        <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
          Good morning, {firstName}.
        </h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Here's what's happening across your workspace today.
        </p>
      </div>

      <BurnoutAlertBanner compact />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Active projects"
          value={String(stats?.activeProjects ?? '—')}
          trend={stats?.activeProjectsTrend}
          variant="accent"
          delay={0}
        />
        <StatCard
          icon={Layers}
          label="Current sprint"
          value={stats?.currentSprint || '—'}
          sub={stats?.currentSprintProgress}
          variant="default"
          delay={40}
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks this week"
          value={String(stats?.tasksThisWeek ?? '—')}
          trend={stats?.tasksThisWeekTrend}
          variant="default"
          delay={80}
        />
        <StatCard
          icon={Users}
          label="Team members"
          value={String(stats?.teamMembers ?? '—')}
          sub={stats?.teamAtRisk ? `${stats.teamAtRisk} at risk` : undefined}
          variant="warning"
          delay={120}
        />
      </div>

      {/* AI insight strip */}
      {insight && (
        <div className="flex items-start gap-3 bg-accent-subtle/50 border border-accent/15 rounded-xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" strokeWidth={1.75} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-text-primary leading-snug">
              <span className="font-semibold">AI insight: </span>
              <span className="text-text-secondary">{insight}</span>
            </p>
          </div>
          <Link
            to="/workforce"
            className="text-[12.5px] text-accent hover:text-accent-hover font-medium whitespace-nowrap shrink-0"
          >
            View analysis →
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-4">
          <SprintSummary />

          <div className="card p-5">
            <h3 className="section-title text-[13px] mb-3">Quick actions</h3>
            <div className="space-y-0.5 -mx-2">
              {[
                { icon: Brain, label: 'Run workload analysis', to: '/workforce' },
                { icon: AlertTriangle, label: 'View sprint risks', to: '/workforce/sprint-risk' },
                { icon: TrendingUp, label: 'Sprint board', to: '/sprints' },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary"
                >
                  <action.icon className="w-4 h-4 text-text-muted" strokeWidth={1.75} />
                  <span className="text-[13px]">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
