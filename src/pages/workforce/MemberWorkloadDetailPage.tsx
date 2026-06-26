import { useCallback, useEffect } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import MemberWorkloadLaneWorkspace from '@/features/workforce/components/member-workload-detail/MemberWorkloadLaneWorkspace'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMyWorkload, useUserWorkloadDetail } from '@/features/workforce/hooks/useWorkload'
import { useCan } from '@/utils/permissions'
import type { Id, MemberWorkloadResponse } from '@/types'

const parseQueryId = (value: string | null): Id | null => {
  if (!value) return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}

const keyOf = (id: Id) => String(id)

function WorkloadDetailContent({
  data,
  isSelf,
  selectedProjectId,
  onProjectChange,
}: {
  data: MemberWorkloadResponse
  isSelf: boolean
  selectedProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}) {

  const allocations = data.projectAllocations ?? []
  const activeAllocation = allocations.find(
    (allocation) => selectedProjectId != null
      && keyOf(allocation.projectId) === keyOf(selectedProjectId),
  ) ?? allocations[0] ?? null
  const activeProjectId = activeAllocation?.projectId ?? null

  useEffect(() => {
    if (
      activeProjectId != null
      && (selectedProjectId == null || keyOf(selectedProjectId) !== keyOf(activeProjectId))
    ) {
      onProjectChange(activeProjectId)
    }
  }, [activeProjectId, onProjectChange, selectedProjectId])

  return (
    <>
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/15 text-accent shrink-0">
              {data.userFullName
                ?.split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-semibold text-text-primary">
                  {data.userFullName}
                </h2>
                {isSelf && (
                  <span className="text-[10.5px] font-semibold text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              {data.email && (
                <p className="text-[13px] text-text-muted mt-0.5">{data.email}</p>
              )}
            </div>
          </div>
        </div>




      </div>

      <MemberWorkloadLaneWorkspace
        userId={data.userId}
        isSelf={isSelf}
        allocations={allocations}
        activeProjectId={activeProjectId}
        tasks={data.tasks ?? []}
        onProjectChange={onProjectChange}
      />
    </>
  )
}

function SelfWorkloadView({
  selectedProjectId,
  onProjectChange,
}: {
  selectedProjectId: Id | null
  onProjectChange: (projectId: Id) => void
}) {
  const { data, isLoading, isError, error, refetch } = useMyWorkload()

  if (isLoading) return <LiveLoading label="Loading your workload..." />
  if (isError) return <LiveError error={error} onRetry={refetch} />
  if (!data) return null

  return (
    <WorkloadDetailContent
      data={data}
      selectedProjectId={selectedProjectId}
      onProjectChange={onProjectChange}
      isSelf
    />
  )
}

function OtherUserWorkloadView({
  userId,
  selectedProjectId,
  onProjectChange,
}: {
  userId: Id
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
      data={data}
      selectedProjectId={selectedProjectId}
      onProjectChange={onProjectChange}
      isSelf={false}
    />
  )
}

export default function MemberWorkloadDetailPage() {
  const { userId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const can = useCan()
  const currentUser = useAuthStore((s) => s.user)

  const targetUserId = Number(userId)
  const isSelf = targetUserId === currentUser?.id
  const canViewOther = can.viewAllWorkload && !isSelf
  const selectedProjectId = parseQueryId(searchParams.get('projectId'))
  const handleProjectChange = useCallback((projectId: Id) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('projectId', String(projectId))
    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  if (can.isHr) return <Navigate to="/dashboard" replace />

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
          selectedProjectId={selectedProjectId}
          onProjectChange={handleProjectChange}
        />
      ) : (
        <SelfWorkloadView
          selectedProjectId={selectedProjectId}
          onProjectChange={handleProjectChange}
        />
      )}
    </div>
  )
}
