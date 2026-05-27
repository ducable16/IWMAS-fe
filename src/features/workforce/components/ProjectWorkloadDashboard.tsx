import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, UserCheck } from 'lucide-react'
import WeekNavigator, { getCurrentWeekRange } from './WeekNavigator'
import MemberWorkloadRow from './MemberWorkloadRow'
import { useProjectWorkload } from '../hooks/useWorkload'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { Id, WorkloadMember } from '@/types'

type ProjectWorkloadDashboardProps = {
  projectId: Id | null | undefined
}

/**
 * Main PM view — shows team utilization for a single project.
 * Reusable: embedded in both WorkloadPage and ProjectDetailPage.
 * Clicking a row navigates to /workforce/members/:userId?weekStart=...&weekEnd=...
 */
export default function ProjectWorkloadDashboard({ projectId }: ProjectWorkloadDashboardProps) {
  const navigate = useNavigate()
  const [weekStart, setWeekStart] = useState(() => getCurrentWeekRange().weekStart)
  const [weekEnd, setWeekEnd]     = useState(() => getCurrentWeekRange().weekEnd)

  const { data: members = [], isLoading, isError, error, refetch } = useProjectWorkload(
    projectId,
  )

  const handleWeekChange = useCallback((ws: string, we: string) => {
    setWeekStart((prev) => (prev === ws ? prev : ws))
    setWeekEnd((prev) => (prev === we ? prev : we))
  }, [])

  const handleRowClick = (member: WorkloadMember) => {
    const params = new URLSearchParams()
    if (weekStart) params.set('weekStart', weekStart)
    if (weekEnd)   params.set('weekEnd',   weekEnd)
    navigate(`/workforce/members/${member.userId}?${params.toString()}`)
  }

  // Summary counts
  const workloadMembers = members as WorkloadMember[]
  const total      = workloadMembers.length
  const overloaded = workloadMembers.filter((m) => m.workloadLevel === 'OVERDUE' || m.workloadLevel === 'WILL_SLIP').length
  const available  = workloadMembers.filter((m) => m.workloadLevel === 'AVAILABLE' || m.workloadLevel === 'HEALTHY').length

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <WeekNavigator onChange={handleWeekChange} weekStart={weekStart} weekEnd={weekEnd} />
      </div>

      {/* Summary bar */}
      {!isLoading && !isError && total > 0 && (
        <div className="flex items-center gap-5 text-[12.5px]">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Users className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
            <span className="font-semibold">{total}</span> members
          </span>

          {overloaded > 0 && (
            <span className="flex items-center gap-1.5 text-danger font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              {overloaded} overloaded
            </span>
          )}

          <span className="flex items-center gap-1.5 text-success">
            <UserCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="font-medium">{available}</span> available
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LiveLoading label="Loading team workload…" />}

      {/* Error */}
      {isError && <LiveError error={error} onRetry={refetch} />}

      {/* Empty */}
      {!isLoading && !isError && total === 0 && (
        <LiveEmpty label="No team members in this project" />
      )}

      {/* Member rows */}
      {!isLoading && !isError && total > 0 && (
        <div className="space-y-2">
          {workloadMembers.map((m) => (
            <MemberWorkloadRow
              key={m.userId}
              member={m}
              onClick={() => handleRowClick(m)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
