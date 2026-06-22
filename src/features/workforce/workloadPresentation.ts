import { LOAD_LEVEL_SEVERITY } from '@/constants/enums'
import type { LoadLevel } from '@/constants/enums'
import type { MemberWorkloadResponse, ProjectAllocationItem } from '@/types'

const severityOf = (level: string): number =>
  LOAD_LEVEL_SEVERITY[level as LoadLevel] ?? Number.MAX_SAFE_INTEGER

export function compareMemberWorkload(
  left: MemberWorkloadResponse,
  right: MemberWorkloadResponse,
): number {
  return severityOf(String(left.loadLevel)) - severityOf(String(right.loadLevel))
    || (right.atRiskCount || 0) - (left.atRiskCount || 0)
    || left.userFullName.localeCompare(right.userFullName)
}

export function allocationAtRiskCount(allocation: ProjectAllocationItem): number {
  return (allocation.overdueCount || 0) + (allocation.predictedLateTaskCount || 0)
}
