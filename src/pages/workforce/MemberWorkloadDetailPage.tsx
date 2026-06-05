import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import clsx from 'clsx'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import ProjectAllocationsTable from '@/features/workforce/components/member-workload-detail/ProjectAllocationsTable'
import WorkloadTaskSections from '@/features/workforce/components/member-workload-detail/WorkloadTaskSections'
import TaskArrangementPanel from '@/features/workforce/components/TaskArrangementPanel'
import UtilizationBar from '@/features/workforce/components/UtilizationBar'
import WeekNavigator, { getCurrentWeekRange } from '@/features/workforce/components/WeekNavigator'
import WorkloadLevelBadge from '@/features/workforce/components/WorkloadLevelBadge'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMyWorkload, useUserWorkloadDetail } from '@/features/workforce/hooks/useWorkload'
import { useCan } from '@/utils/permissions'
import type { Id, WorkloadMember } from '@/types'

type WeekChangeHandler = (weekStart: string, weekEnd: string) => void

const parseQueryId = (value: string | null): Id | null => {
  if (!value) return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

function WorkloadDetailContent({
  data,
  weekStart,
  weekEnd,
  onWeekChange,
  isSelf,
  selectedProjectId,
  onProjectChange,
}: {
  data: WorkloadMember
  weekStart: string
  weekEnd: string
  onWeekChange: WeekChangeHandler
  isSelf: boolean
  selectedProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}) {
  const [showAllTasks, setShowAllTasks] = useState(false)
  const tasks = data.tasks ?? []
  const overdueTasks = tasks.filter((task) => task.overdue)
  const allocations = data.projectAllocations ?? []
  const activeProjectId = selectedProjectId ?? allocations[0]?.projectId ?? null

  return (
    <>
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/15 text-accent shrink-0">
              {(data.userFullName || data.fullName)
                ?.split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-semibold text-text-primary">
                  {data.userFullName || data.fullName}
                </h2>
                {isSelf && (
                  <span className="text-[10.5px] font-semibold text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              {data.position && (
                <p className="text-[13px] text-text-muted mt-0.5">{data.position}</p>
              )}
              <div className="mt-2">
                <WorkloadLevelBadge level={data.workloadLevel} />
              </div>
            </div>
          </div>

          <WeekNavigator onChange={onWeekChange} weekStart={weekStart} weekEnd={weekEnd} />
        </div>

        <div className="mt-5 pt-4 border-t border-border-subtle">
          <UtilizationBar
            utilizationPercent={data.nearTermPercent}
            workloadLevel={data.workloadLevel}
            weeklyRemainingHours={null}
            weeklyCapacityHours={null}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <button
            type="button"
            onClick={() => setShowAllTasks((value) => !value)}
            className="text-center p-3 bg-bg-subtle rounded-xl hover:bg-bg-hover transition-colors"
          >
            <p className="text-[20px] font-bold text-text-primary tabular-nums">
              {data.activeTaskCount ?? 0}
            </p>
            <p className="text-[11.5px] text-text-muted mt-0.5">Active tasks</p>
          </button>
          <div className="text-center p-3 bg-bg-subtle rounded-xl">
            <p
              className={clsx(
                'text-[20px] font-bold tabular-nums',
                overdueTasks.length > 0 ? 'text-danger' : 'text-text-primary',
              )}
            >
              {overdueTasks.length}
            </p>
            <p className="text-[11.5px] text-text-muted mt-0.5">Overdue</p>
          </div>
          <div className="text-center p-3 bg-bg-subtle rounded-xl">
            <p className="text-[20px] font-bold text-text-primary tabular-nums">
              {data.unestimatedTaskCount > 0 ? data.unestimatedTaskCount : '-'}
              <span className="text-[13px] font-normal text-text-muted"> h</span>
            </p>
            <p className="text-[11.5px] text-text-muted mt-0.5">Unestimated</p>
          </div>
        </div>
      </div>

      <ProjectAllocationsTable
        allocations={allocations}
        activeProjectId={activeProjectId}
        onSelectProject={onProjectChange}
      />
      <TaskArrangementPanel
        userId={data.userId}
        isSelf={isSelf}
        allocations={allocations}
        selectedProjectId={activeProjectId}
        onProjectChange={onProjectChange}
      />
      <WorkloadTaskSections tasks={tasks} showAllTasks={showAllTasks} variant="page" />

      <p className="text-[12px] text-text-muted text-center pb-4">
        <span className="font-semibold text-text-secondary">{data.activeTaskCount}</span>
        {' active tasks total across all weeks'}
      </p>
    </>
  )
}

function SelfWorkloadView({
  weekStart,
  weekEnd,
  onWeekChange,
  selectedProjectId,
  onProjectChange,
}: {
  weekStart: string
  weekEnd: string
  onWeekChange: WeekChangeHandler
  selectedProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}) {
  const { data, isLoading, isError, error, refetch } = useMyWorkload()

  if (isLoading) return <LiveLoading label="Loading your workload..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />
  if (!data) return null

  return (
    <WorkloadDetailContent
      data={data as WorkloadMember}
      weekStart={weekStart}
      weekEnd={weekEnd}
      onWeekChange={onWeekChange}
      selectedProjectId={selectedProjectId}
      onProjectChange={onProjectChange}
      isSelf
    />
  )
}

function OtherUserWorkloadView({
  userId,
  weekStart,
  weekEnd,
  onWeekChange,
  selectedProjectId,
  onProjectChange,
}: {
  userId: Id
  weekStart: string
  weekEnd: string
  onWeekChange: WeekChangeHandler
  selectedProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}) {
  const { data, isLoading, isError, error, refetch } = useUserWorkloadDetail(
    userId,
  )

  if (isLoading) return <LiveLoading label="Loading workload detail..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />
  if (!data) return null

  return (
    <WorkloadDetailContent
      data={data as WorkloadMember}
      weekStart={weekStart}
      weekEnd={weekEnd}
      onWeekChange={onWeekChange}
      selectedProjectId={selectedProjectId}
      onProjectChange={onProjectChange}
      isSelf={false}
    />
  )
}

export default function MemberWorkloadDetailPage() {
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const can = useCan()
  const currentUser = useAuthStore((s) => s.user)

  const targetUserId = Number(userId)
  const isSelf = targetUserId === currentUser?.id
  const canViewOther = can.viewAllWorkload && !isSelf

  const [weekStart, setWeekStart] = useState(
    () => searchParams.get('weekStart') || getCurrentWeekRange().weekStart,
  )
  const [weekEnd, setWeekEnd] = useState(
    () => searchParams.get('weekEnd') || getCurrentWeekRange().weekEnd,
  )
  const [selectedProjectId, setSelectedProjectId] = useState<Id | null>(
    () => parseQueryId(searchParams.get('projectId')),
  )

  const handleWeekChange = useCallback((ws: string, we: string) => {
    setWeekStart((prev) => (prev === ws ? prev : ws))
    setWeekEnd((prev) => (prev === we ? prev : we))
  }, [])

  return (
    <div className="max-w-[860px] mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {!isSelf && !canViewOther && (
        <div className="card p-4 border-warning/25 bg-warning/[0.04] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" strokeWidth={1.75} />
          <p className="text-[12.5px] text-text-secondary">
            You don't have permission to view other members' workload. Showing your own workload instead.
          </p>
        </div>
      )}

      {canViewOther ? (
        <OtherUserWorkloadView
          userId={targetUserId}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onWeekChange={handleWeekChange}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      ) : (
        <SelfWorkloadView
          weekStart={weekStart}
          weekEnd={weekEnd}
          onWeekChange={handleWeekChange}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      )}
    </div>
  )
}
