import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckSquare,
  ChevronLeft,
  ExternalLink,
  FileText,
  LayoutGrid,
  Loader2,
  Mail,
  Phone,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import {
  useUser,
  useUserAssignedTasks,
  useUserReportedTasks,
} from '@/features/members/hooks/useMembers'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LiveEmpty, LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import {
  USER_ROLE_LABEL,
  USER_STATUS_META,
} from '@/constants/enums'
import { useCan } from '@/utils/permissions'
import { canParticipateInDelivery } from '@/utils/permissions'
import { UserStatusBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { fmtDate, fmtRelative } from '@/utils/date'
import {
  ActivityFeed,
  ProjectsPanel,
  StatCard,
  TasksPanel,
  type MainTab,
} from '@/features/members/components/user-profile/UserProfilePanels'
import UserSkillsPanel from '@/features/members/components/user-profile/UserSkillsPanel'

const MAIN_TABS = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: LayoutGrid },
  { id: 'skills', label: 'Skills', icon: Award },
] satisfies Array<{ id: MainTab; label: string; icon: LucideIcon }>

export default function UserProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = Number(id)
  const currentUser = useAuthStore((state) => state.user)
  const can = useCan()
  const [activeTab, setActiveTab] = useState<MainTab>('tasks')

  const { data: user, isLoading, isError, error, refetch } = useUser(userId)
  const isOperationsViewer = can.isAdmin || can.isHr
  const showDeliverySections = !isOperationsViewer && canParticipateInDelivery(user?.role)
  const { data: assignedData } = useUserAssignedTasks(
    userId,
    { size: 1 },
    !!userId && showDeliverySections,
  )
  const { data: reportedData } = useUserReportedTasks(
    userId,
    { size: 1 },
    !!userId && showDeliverySections,
  )
  const { data: inProgressData } = useUserAssignedTasks(
    userId,
    { statuses: ['IN_PROGRESS'], size: 1 },
    !!userId && showDeliverySections,
  )

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto pt-8">
        <LiveLoading label="Loading profile..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[1100px] mx-auto pt-8">
        <LiveError error={error} onRetry={refetch} />
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === userId
  const canSeeRestrict = can.isAdmin || can.isHr

  if (!user) {
    return (
      <div className="max-w-[1100px] mx-auto pt-8">
        <LiveEmpty label="User profile not found." />
      </div>
    )
  }

  const roleMeta = USER_ROLE_LABEL[user.role as keyof typeof USER_ROLE_LABEL] || user.role
  const statusMeta = USER_STATUS_META[user.status as keyof typeof USER_STATUS_META] || null

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          Back
        </button>
        <span>/</span>
        <Link to="/members" className="hover:text-text-primary transition-colors">Members</Link>
        <span>/</span>
        <span className="text-text-primary">{user.fullName}</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-5">
          <div className="card p-5">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="xl" />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-[20px] font-bold text-text-primary leading-tight">
                      {user.fullName}
                    </h1>
                    {user.position && (
                      <p className="text-[13px] text-text-secondary mt-0.5">{user.position}</p>
                    )}
                  </div>

                  {isOwnProfile && (
                    <Link
                      to="/settings"
                      className="btn-ghost text-[12px] gap-1.5 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Edit profile
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="badge badge-neutral text-[11.5px]">{roleMeta}</span>
                  {canSeeRestrict && statusMeta && (
                    <UserStatusBadge status={user.status} />
                  )}
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                    <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                    <a href={`mailto:${user.email}`} className="hover:text-accent transition-colors">
                      {user.email}
                    </a>
                  </div>

                  {canSeeRestrict && user.phone && (
                    <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                      <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                      {user.phone}
                    </div>
                  )}

                  {user.position && (
                    <div className="flex items-center gap-2 text-[12.5px] text-text-secondary">
                      <Briefcase className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
                      {user.position}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showDeliverySections && (
            <div className="card p-4">
              <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">
                Recent Activity
              </h3>
              <ActivityFeed userId={userId} />
            </div>
          )}

          <div className="card p-4">
            {showDeliverySections ? (
              <>
                <div className="flex items-center gap-1 border-b border-border-subtle mb-4">
                  {MAIN_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 pb-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors',
                        activeTab === tab.id
                          ? 'border-accent text-accent'
                          : 'border-transparent text-text-muted hover:text-text-secondary',
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'tasks' && <TasksPanel userId={userId} />}
                {activeTab === 'projects' && <ProjectsPanel userId={userId} />}
                {activeTab === 'skills' && <UserSkillsPanel userId={userId} />}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                  <Award className="w-4 h-4 text-accent" strokeWidth={1.75} />
                  <h3 className="text-[13px] font-semibold text-text-primary">Employee skills</h3>
                </div>
                <UserSkillsPanel userId={userId} />
              </>
            )}
          </div>
        </div>

        <div className="w-full xl:w-[240px] xl:shrink-0 space-y-4 xl:sticky xl:top-[68px]">
          {showDeliverySections && (
            <div className="card p-4 space-y-2.5">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                Stats
              </p>
              <StatCard
                icon={CheckSquare}
                label="Assigned tasks"
                value={assignedData?.totalElements ?? '-'}
                color="text-accent"
              />
              <StatCard
                icon={Loader2}
                label="In progress"
                value={inProgressData?.totalElements ?? '-'}
                color="text-warning"
              />
              <StatCard
                icon={FileText}
                label="Reported tasks"
                value={reportedData?.totalElements ?? '-'}
                color="text-info"
              />
            </div>
          )}

          {canSeeRestrict && (
            <div className="card p-4 space-y-2">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                Account
              </p>
              {user.createdAt && (
                <div className="text-[12px]">
                  <p className="text-text-muted">Joined</p>
                  <p className="text-text-primary font-medium">
                    {fmtDate(user.createdAt)}
                  </p>
                </div>
              )}
              {user.lastActive && (
                <div className="text-[12px]">
                  <p className="text-text-muted">Last active</p>
                  <p className="text-text-primary font-medium">
                    {fmtRelative(user.lastActive)}
                  </p>
                </div>
              )}
              <div className="text-[12px]">
                <p className="text-text-muted">Verified</p>
                <p className={clsx(
                  'font-medium',
                  user.verified ? 'text-success' : 'text-warning',
                )}>
                  {user.verified ? 'Yes' : 'Pending'}
                </p>
              </div>
            </div>
          )}

          <Link
            to="/members"
            className="flex items-center gap-2 text-[12px] text-text-muted hover:text-accent transition-colors px-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            All members
          </Link>
        </div>
      </div>
    </div>
  )
}
