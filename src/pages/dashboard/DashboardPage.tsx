import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  Settings,
  UserRound,
  Users,
  UserX,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '@/features/dashboard/components/StatCard'
import RecentActivity from '@/features/dashboard/components/RecentActivity'
import MyTasksWidget from '@/features/dashboard/components/MyTasksWidget'
import TeamWorkloadPanel from '@/features/dashboard/components/TeamWorkloadPanel'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useProjects } from '@/features/projects/hooks/useProjects'
import {
  useSearchTasks,
  useUnassignedTasks,
  useUnestimatedTasks,
} from '@/features/tasks/hooks/useTasks'
import MyWorkloadWidget from '@/features/workforce/components/MyWorkloadWidget'
import { TASK_STATUSES } from '@/constants/enums'
import type { User } from '@/types'

const ACTIVE_TASK_STATUSES: string[] = TASK_STATUSES.filter(
  (status) => status !== 'DONE' && status !== 'CANCELLED',
)

const ACTIVE_PROJECT_STATUSES: string[] = ['PLANNING', 'IN_PROGRESS']

function greetingName(user: User | null) {
  return (user?.fullName || user?.email || '').split(' ')[0] || 'there'
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function DashboardGreeting({
  user,
  description,
}: {
  user: User | null
  description: string
}) {
  return (
    <div>
      <h2 className="text-subhead text-text-primary">
        Good morning, {greetingName(user)}.
      </h2>
      <p className="text-text-secondary text-[14px] mt-1">{description}</p>
    </div>
  )
}

function OperationsDashboard({ role }: { role: 'ADMIN' | 'HR' }) {
  const user = useAuthStore((state) => state.user)
  const totalUsers = useMembers({ page: 0, size: 1 })
  const activeUsers = useMembers({ active: true, page: 0, size: 1 })
  const disabledUsers = useMembers({ active: false, page: 0, size: 1 })
  const isAdmin = role === 'ADMIN'

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <DashboardGreeting
        user={user}
        description={
          isAdmin
            ? 'Manage workspace accounts and system configuration.'
            : 'Manage employee records and workforce skills.'
        }
      />

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
      <DashboardGreeting
        user={user}
        description="Here is your workload and task overview for this week."
      />

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

  const activeProjects = useProjects({
    statuses: ACTIVE_PROJECT_STATUSES,
    page: 0,
    size: 100,
    sortBy: 'name',
    sortDirection: 'ASC',
  })
  const { data: overdueTasks } = useSearchTasks({
    dueDateTo: toDateInput(today),
    statuses: ACTIVE_TASK_STATUSES,
    page: 0,
    size: 1,
  })
  const unestimatedTasks = useUnestimatedTasks()
  const unassignedTasks = useUnassignedTasks()

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <DashboardGreeting
        user={user}
        description="Here's what's happening across your projects today."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Active projects"
          value={activeProjects.data?.totalElements ?? 0}
          variant="accent"
        />
        <StatCard
          icon={AlertCircle}
          label="Unestimated tasks"
          value={unestimatedTasks.isLoading ? '-' : unestimatedTasks.data?.length ?? 0}
          variant="warning"
        />
        <StatCard
          icon={UserX}
          label="Unassigned tasks"
          value={unassignedTasks.isLoading ? '-' : unassignedTasks.data?.length ?? 0}
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
        projects={activeProjects.data?.projects ?? []}
        isLoading={activeProjects.isLoading}
        isError={activeProjects.isError}
        error={activeProjects.error}
        onRetry={() => { void activeProjects.refetch() }}
        emptyLabel="No active projects to display."
      />
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
