import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, UserCheck } from 'lucide-react'
import WeekNavigator from './WeekNavigator'
import MemberWorkloadRow from './MemberWorkloadRow'
import { useProjectWorkload } from '../hooks/useWorkload'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'

/**
 * Main PM view — shows team utilization for a single project.
 * Reusable: embedded in both WorkloadPage and ProjectDetailPage.
 * Clicking a row navigates to /workforce/members/:userId?weekStart=...&weekEnd=...
 */
export default function ProjectWorkloadDashboard({ projectId }) {
  const navigate = useNavigate()
  const [weekStart, setWeekStart] = useState('')
  const [weekEnd, setWeekEnd]     = useState('')

  const { data: members = [], isLoading, isError, error, refetch } = useProjectWorkload(
    projectId, weekStart, weekEnd,
  )

  const handleWeekChange = (ws, we) => {
    setWeekStart(ws)
    setWeekEnd(we)
  }

  const handleRowClick = (member) => {
    const params = new URLSearchParams()
    if (weekStart) params.set('weekStart', weekStart)
    if (weekEnd)   params.set('weekEnd',   weekEnd)
    navigate(`/workforce/members/${member.userId}?${params.toString()}`)
  }

  // Summary counts
  const total      = members.length
  const overloaded = members.filter((m) => m.workloadLevel === 'OVERLOADED').length
  const available  = members.filter((m) => m.workloadLevel === 'AVAILABLE').length

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
          {members.map((m) => (
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
