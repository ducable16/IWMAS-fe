import {
  AlertTriangle,
  Brain,
  CheckSquare,
  CheckCircle2,
  FolderKanban,
  Settings,
  UserRound,
  Users,
  UserX,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import StatCard from '@/features/dashboard/components/StatCard'
import RecentActivity from '@/features/dashboard/components/RecentActivity'
import MyTasksWidget from '@/features/dashboard/components/MyTasksWidget'
import TeamWorkloadPanel from '@/features/dashboard/components/TeamWorkloadPanel'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useMyProjects, useProjects } from '@/features/projects/hooks/useProjects'
import { projectService } from '@/features/projects/services/projectService'
import { useSearchTasks } from '@/features/tasks/hooks/useTasks'
import MyWorkloadWidget from '@/features/workforce/components/MyWorkloadWidget'
import { TASK_STATUSES } from '@/constants/enums'
import type { Id, ProjectMember, User } from '@/types'

type DashboardMember = {
  id: Id
  fullName: string
  position?: string
}

function greetingName(user: User | null) {
  return (user?.fullName || user?.email || '').split(' ')[0] || 'there'
}

function OperationsDashboard({ role }: { role: 'ADMIN' | 'HR' }) {
  const user = useAuthStore((state) => state.user)
  const totalUsers = useMembers({ page: 0, size: 1 })
  const activeUsers = useMembers({ active: true, page: 0, size: 1 })
  const disabledUsers = useMembers({ active: false, page: 0, size: 1 })
  const isAdmin = role === 'ADMIN'

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-subhead text-text-primary">
          Good morning, {greetingName(user)}.
        </h2>
        <p className="text-text-secondary text-[14px] mt-1">
          {isAdmin
            ? 'Manage workspace accounts and system configuration.'
            : 'Manage employee records and workforce skills.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={UserRound}
          label="Total users"
          value={totalUsers.isLoading ? '-' : totalUsers.data?.totalElements ?? 0}
          variant="accent"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active users"
          value={activeUsers.isLoading ? '-' : activeUsers.data?.totalElements ?? 0}
          variant="success"
        />
        <StatCard
          icon={UserX}
          label="Disabled users"
          value={disabledUsers.isLoading ? '-' : disabledUsers.data?.totalElements ?? 0}
          variant="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="card p-5 self-start">
          <h3 className="section-title text-[13px] mb-3">Quick actions</h3>
          <div className="space-y-0.5 -mx-2">
            <Link
              to="/members"
              className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary"
            >
              <Users className="w-4 h-4 text-text-muted" strokeWidth={1.75} />
              <span className="text-[13px]">
                {isAdmin ? 'Manage user accounts' : 'Manage employee records'}
              </span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary"
            >
              <Settings className="w-4 h-4 text-text-muted" strokeWidth={1.75} />
              <span className="text-[13px]">
                {isAdmin ? 'Manage skill catalog' : 'View skill catalog'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamMemberDashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div>
        <h2 className="text-subhead text-text-primary">
          Good morning, {greetingName(user)}.
        </h2>
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

function ProjectManagerDashboard() {
  const user = useAuthStore((state) => state.user)
  const today = new Date()
  const day = today.getDay() || 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - day + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const toDateInput = (date: Date) => date.toISOString().slice(0, 10)
  const activeTaskStatuses: string[] = TASK_STATUSES.filter(
    (status) => status !== 'DONE' && status !== 'CANCELLED',
  )
  const activeProjectStatuses: string[] = ['PLANNING', 'IN_PROGRESS']

  const { data: projects } = useProjects({
    statuses: activeProjectStatuses,
    page: 0,
    size: 1,
  })
  const { data: tasksThisWeek } = useSearchTasks({
    dueDateFrom: toDateInput(monday),
    dueDateTo: toDateInput(sunday),
    page: 0,
    size: 1,
  })
  const { data: overdueTasks } = useSearchTasks({
    dueDateTo: toDateInput(today),
    statuses: activeTaskStatuses,
    page: 0,
    size: 1,
  })
  const { data: myProjectsData } = useMyProjects({ size: 100 })
  const managedProjects = (myProjectsData?.projects ?? []).filter(
    (project) => project.managerId === user?.id,
  )
  const memberQueries = useQueries({
    queries: managedProjects.map((project) => ({
      queryKey: ['projects', project.id, 'members'],
      queryFn: async () => {
        const response = await projectService.getMembers(project.id)
        return Array.isArray(response.data) ? response.data : []
      },
      staleTime: 30_000,
    })),
  })
  const projectMembers = memberQueries.flatMap(
    (query) => (query.data || []) as ProjectMember[],
  )
  const memberMap = new Map<Id, DashboardMember>()

  projectMembers.forEach((member) => {
    memberMap.set(member.userId, {
      id: member.userId,
      fullName: member.userFullName || `User ${member.userId}`,
    })
  })
  if (user?.id) {
    memberMap.set(user.id, {
      id: user.id,
      fullName: user.fullName || user.email,
      position: user.position || '',
    })
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-subhead text-text-primary">
          Good morning, {greetingName(user)}.
        </h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Here's what's happening across your projects today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Active projects"
          value={projects?.totalElements ?? 0}
          variant="accent"
        />
        <StatCard
          icon={CheckSquare}
          label="Tasks this week"
          value={tasksThisWeek?.totalElements ?? 0}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue tasks"
          value={overdueTasks?.totalElements ?? 0}
          variant="danger"
        />
      </div>

      <TeamWorkloadPanel
        title="Team workload & tasks"
        members={Array.from(memberMap.values())}
        isLoading={memberQueries.some((query) => query.isLoading)}
        emptyLabel="No members in your managed projects."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-4">
          <MyWorkloadWidget />
          <div className="card p-5">
            <h3 className="section-title text-[13px] mb-3">Quick actions</h3>
            <Link
              to="/workforce"
              className="flex items-center gap-2.5 px-2 py-2 -mx-2 rounded-md hover:bg-bg-hover transition-colors text-text-secondary hover:text-text-primary"
            >
              <Brain className="w-4 h-4 text-text-muted" strokeWidth={1.75} />
              <span className="text-[13px]">Run workload analysis</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role)

  if (role === 'ADMIN' || role === 'HR') {
    return <OperationsDashboard role={role} />
  }
  if (role === 'TEAM_MEMBER') {
    return <TeamMemberDashboard />
  }
  return <ProjectManagerDashboard />
}
