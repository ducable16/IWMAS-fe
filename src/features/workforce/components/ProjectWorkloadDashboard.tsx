import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle } from 'lucide-react'
import MemberWorkloadRow from './MemberWorkloadRow'
import { useProjectWorkload } from '../hooks/useWorkload'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { Id, ProjectMemberWorkloadResponse } from '@/types'
import {
  allocationAtRiskCount,
  compareProjectMemberWorkload,
} from '../workloadPresentation'

type ProjectWorkloadDashboardProps = {
  projectId: Id | null | undefined
}

/**
 * Main PM view showing real-time workload for one project.
 * Reusable: embedded in both WorkloadPage and ProjectDetailPage.
 * Clicking a row navigates to the member workload detail page.
 */
export default function ProjectWorkloadDashboard({ projectId }: ProjectWorkloadDashboardProps) {
  const navigate = useNavigate()

  const { data: members = [], isLoading, isError, error, refetch } = useProjectWorkload(
    projectId,
  )

  const handleRowClick = (member: ProjectMemberWorkloadResponse) => {
    const params = new URLSearchParams()
    if (projectId) params.set('projectId', String(projectId))
    const query = params.toString()
    navigate(`/workforce/members/${member.userId}${query ? `?${query}` : ''}`)
  }

  // Summary counts
  const workloadMembers = [...members].sort(compareProjectMemberWorkload)
  const total      = workloadMembers.length
  const atRisk = workloadMembers.filter(
    (member) => allocationAtRiskCount(member.projectAllocation) > 0,
  ).length

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {!isLoading && !isError && total > 0 && (
        <div className="flex items-center gap-5 text-[12.5px]">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Users className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
            <span className="font-semibold">{total}</span> members
          </span>

          {atRisk > 0 && (
            <span className="flex items-center gap-1.5 text-danger font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              {atRisk} at risk
            </span>
          )}
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

      {/* Shared column labels replace repeated labels inside every member row. */}
      {!isLoading && !isError && total > 0 && (
        <div
          aria-hidden="true"
          className="hidden gap-4 px-4 text-[12px] font-medium text-text-primary xl:grid xl:grid-cols-[minmax(240px,1.2fr)_minmax(300px,1fr)_100px]"
        >
          <span>Member</span>
          <span>Selected project</span>
          <span className="text-right">Tasks</span>
        </div>
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
