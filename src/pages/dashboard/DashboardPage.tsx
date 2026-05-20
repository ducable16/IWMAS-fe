import { TrendingUp, AlertTriangle, Brain, FolderKanban, CheckSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import StatCard from '@/features/dashboard/components/StatCard'
import RecentActivity from '@/features/dashboard/components/RecentActivity'
import { useAuthStore } from '@/features/auth/store/authStore'
import MyWorkloadWidget from '@/features/workforce/components/MyWorkloadWidget'
import MyTasksWidget from '@/features/dashboard/components/MyTasksWidget'
import TeamWorkloadPanel from '@/features/dashboard/components/TeamWorkloadPanel'
import { useWorkloadTeam } from '@/features/workforce/hooks/useWorkload'
import { useMyProjects, useProjects } from '@/features/projects/hooks/useProjects'
import { projectService } from '@/features/projects/services/projectService'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import { TASK_STATUSES } from '@/constants/enums'
import type { Id, ProjectMember } from '@/types'

type DashboardMember = {
  id: Id
  fullName: string
  position?: string
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = (user?.fullName || user?.email || '').split(' ')[0] || 'there'
  const role = user?.role
  const isAdmin = role === 'ADMIN'
  const isPm = role === 'PROJECT_MANAGER'
  const isMember = role === 'TEAM_MEMBER'

  const today = new Date()
  const day = today.getDay() || 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - day + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const toDateInput = (d: Date) => d.toISOString().slice(0, 10)
  const weekStart = toDateInput(monday)
  const weekEnd = toDateInput(sunday)
  const todayStr = toDateInput(today)

  const activeTaskStatuses: string[] = TASK_STATUSES.filter(
    (s) => s !== 'DONE' && s !== 'CANCELLED',
  )
  const activeProjectStatuses: string[] = ['PLANNING', 'IN_PROGRESS']

  const { data: teamSnapshot, isLoading: isTeamLoading } = useWorkloadTeam(isAdmin || isPm)

  const { data: allProjects } = useProjects(
    { statuses: activeProjectStatuses, page: 0, size: 1 },
    isAdmin || isPm,
  )
  const { data: myProjects } = useMyProjects(
    { statuses: activeProjectStatuses, page: 0, size: 1 },
    !isAdmin,
  )
  const activeProjectsCount = isAdmin
    ? allProjects?.totalElements ?? 0
    : myProjects?.totalElements ?? 0

  const { data: tasksThisWeek } = useSearchTasks({
    dueDateFrom: weekStart,
    dueDateTo: weekEnd,
    page: 0,
    size: 1,
  })

  const { data: overdueTasks } = useSearchTasks({
    dueDateTo: todayStr,
    statuses: activeTaskStatuses,
    page: 0,
    size: 1,
  })

  const tasksThisWeekCount = tasksThisWeek?.totalElements ?? 0
  const overdueCount = overdueTasks?.totalElements ?? 0

  const { data: myProjectsData } = useMyProjects({ size: 100 }, isPm)
  const managedProjects = isPm
    ? (myProjectsData?.projects ?? []).filter((p) => p.managerId === user?.id)
    : []

  const memberQueries = useQueries({
    queries: managedProjects.map((project) => ({
      queryKey: ['projects', project.id, 'members'],
      queryFn: async () => {
        const res = await projectService.getMembers(project.id)
        return Array.isArray(res.data) ? res.data : []
      },
      enabled: isPm,
      staleTime: 30_000,
    })),
  })

  const projectMembers = memberQueries.flatMap((q) => (q.data || []) as ProjectMember[])
  const isMembersLoading = isPm && memberQueries.some((q) => q.isLoading)

  const pmMemberMap = new Map<Id, DashboardMember>()
  projectMembers.forEach((m) => {
    pmMemberMap.set(m.userId, {
      id: m.userId,
      fullName: m.userFullName || `User ${m.userId}`,
    })
  })

  if (user?.id && isPm) {
    pmMemberMap.set(user.id, {
      id: user.id,
      fullName: user.fullName || user.email,
      position: user.position || '',
    })
  }

  const teamMembers: DashboardMember[] = isAdmin
    ? (teamSnapshot || []).map((m) => ({
      id: m.id,
      fullName: m.name || 'Unknown',
      position: m.role || '',
    }))
    : Array.from(pmMemberMap.values())


  if (isMember) {
    return (
      <div className="space-y-6 max-w-[900px] mx-auto">
        <div>
          <h2 className="text-subhead text-text-primary">Good morning, {firstName}.</h2>
          <p className="text-text-secondary text-[14px] mt-1">
            Here is your workload and task overview for this week.
          </p>
        </div>

        <div className="grid gap-5">
          <MyWorkloadWidget />
          <MyTasksWidget />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Welcome */}
      <div>
        <h2 className="text-subhead text-text-primary">Good morning, {firstName}.</h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Here's what's happening across your workspace today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Active projects"
          value={String(activeProjectsCount || '—')}
          variant="accent"
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks this week"
          value={String(tasksThisWeekCount || '—')}
          variant="default"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue tasks"
          value={String(overdueCount || '—')}
          variant="danger"
        />
      </div>

      {(isAdmin || isPm) && (
        <TeamWorkloadPanel
          title="Team workload & tasks"
          members={teamMembers}
          isLoading={isAdmin ? isTeamLoading : isMembersLoading}
          emptyLabel={isPm ? 'No members in your managed projects.' : 'No team workload data.'}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-4">
          <MyWorkloadWidget />
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
