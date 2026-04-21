import { CheckCircle2, GitPullRequest, UserPlus, AlertTriangle, Sparkles } from 'lucide-react'

export const DASHBOARD_STATS = {
  activeProjects: 8,
  activeProjectsTrend: 12,
  currentSprint: 'Sprint 15',
  currentSprintProgress: '62% complete',
  tasksThisWeek: 47,
  tasksThisWeekTrend: -3,
  teamMembers: 12,
  teamAtRisk: 2,
}

export const AI_INSIGHT =
  'Sprint 15 has a medium risk of missing its deadline. Marcus Rivera is near burnout threshold. Consider redistributing 3 tasks to Sarah Chen (workload: 34/100).'

export const RECENT_ACTIVITIES = [
  { icon: Sparkles, tone: 'accent', text: 'AI assigned TASK-142 to Sarah Chen based on workload score 34/100', time: '2m ago' },
  { icon: CheckCircle2, tone: 'success', text: 'Sprint 14 completed — 26/28 tasks done (93% velocity)', time: '1h ago' },
  { icon: AlertTriangle, tone: 'warning', text: 'Burnout risk detected for Marcus Rivera (score: 89/100)', time: '3h ago' },
  { icon: GitPullRequest, tone: 'info', text: 'PR #234 merged: Feature/user-auth-flow by Jamie Park', time: '4h ago' },
  { icon: UserPlus, tone: 'success', text: 'New member added: Priya Nair (Senior Engineer)', time: '1d ago' },
  { icon: AlertTriangle, tone: 'danger', text: 'Sprint 15 risk forecast: HIGH — deadline conflict detected', time: '1d ago' },
]

export const SPRINTS_OVERVIEW = [
  { name: 'Sprint 15', progress: 62, total: 34, done: 21, status: 'active', daysLeft: 5, risk: 'medium' },
  { name: 'Sprint 14', progress: 93, total: 28, done: 26, status: 'review', daysLeft: 0, risk: 'low' },
  { name: 'Sprint 13', progress: 100, total: 32, done: 32, status: 'done', daysLeft: 0, risk: 'low' },
]
