import type {
  MemberWorkloadResponse,
  ProjectAllocationItem,
  ProjectMemberWorkloadResponse,
} from '@/types'

const backlogDaysOf = (days: number | null | undefined): number =>
  days ?? Number.NEGATIVE_INFINITY

export function compareMemberWorkload(
  left: MemberWorkloadResponse,
  right: MemberWorkloadResponse,
): number {
  return (right.atRiskCount || 0) - (left.atRiskCount || 0)
    || backlogDaysOf(right.worstBacklogDays) - backlogDaysOf(left.worstBacklogDays)
    || left.userFullName.localeCompare(right.userFullName)
}

export function allocationAtRiskCount(allocation: ProjectAllocationItem): number {
  return (allocation.overdueCount || 0) + (allocation.predictedLateTaskCount || 0)
}

export function compareProjectMemberWorkload(
  left: ProjectMemberWorkloadResponse,
  right: ProjectMemberWorkloadResponse,
): number {
  return allocationAtRiskCount(right.projectAllocation)
    - allocationAtRiskCount(left.projectAllocation)
    || backlogDaysOf(right.projectAllocation.backlogDays)
      - backlogDaysOf(left.projectAllocation.backlogDays)
    || left.userFullName.localeCompare(right.userFullName)
}
