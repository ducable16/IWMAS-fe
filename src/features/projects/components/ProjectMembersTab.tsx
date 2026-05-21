import { Link } from 'react-router-dom'
import { Users, Plus, Edit2, X } from 'lucide-react'
import { PROJECT_ROLE_LABEL } from '@/constants/enums'
import { fmtDate } from '@/utils/date'
import { LiveLoading, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { ProjectMember } from '@/types'

interface ProjectMembersTabProps {
  members: ProjectMember[]
  membersLoading: boolean
  canManageMembers: boolean
  onAddMemberClick: () => void
  onEditMemberClick: (member: ProjectMember) => void
  onRemoveMemberClick: (member: ProjectMember) => void
}

export function ProjectMembersTab({
  members,
  membersLoading,
  canManageMembers,
  onAddMemberClick,
  onEditMemberClick,
  onRemoveMemberClick,
}: ProjectMembersTabProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <h3 className="text-[13px] font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4 text-text-muted" />
          Project Members
          <span className="text-[11px] text-text-muted font-normal ml-1">
            ({members.length})
          </span>
        </h3>
        {canManageMembers && (
          <button
            onClick={onAddMemberClick}
            className="btn-ghost text-[12px] h-8 px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Member
          </button>
        )}
      </div>

      {membersLoading ? (
        <div className="p-8"><LiveLoading label="Loading members…" /></div>
      ) : members.length === 0 ? (
        <div className="p-8">
          <LiveEmpty label="No members assigned to this project yet." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-subtle/50 border-b border-border-subtle">
                <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3 pl-5">Member</th>
                <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Role</th>
                <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Effort %</th>
                <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Joined</th>
                <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Left</th>
                <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Note</th>
                {canManageMembers && (
                  <th className="py-2.5 px-3 w-20"><span className="sr-only">Actions</span></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-bg-subtle/50 transition-colors group">
                  <td className="py-3 px-3 pl-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[10px] font-semibold text-accent shrink-0">
                        {m.userFullName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <Link
                        to={`/users/${m.userId}`}
                        className="text-[13px] font-medium text-text-primary truncate max-w-[160px] hover:text-accent hover:underline transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {m.userFullName}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="badge badge-neutral">
                      {PROJECT_ROLE_LABEL[m.roleInProject as keyof typeof PROJECT_ROLE_LABEL] || m.roleInProject}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${m.allocatedEffortPercent ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-text-secondary tabular-nums">
                        {m.allocatedEffortPercent ?? 0}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[12.5px] text-text-muted tabular-nums">
                      {fmtDate(m.joinDate)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[12.5px] text-text-muted tabular-nums">
                      {m.leaveDate ? fmtDate(m.leaveDate) : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[12.5px] text-text-muted truncate block max-w-[150px]">
                      {m.note || '—'}
                    </span>
                  </td>
                  {canManageMembers && (
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditMemberClick(m)}
                          className="text-text-muted hover:text-accent transition-colors p-1 rounded"
                          title="Edit member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveMemberClick(m)}
                          className="text-text-muted hover:text-danger transition-colors p-1 rounded"
                          title="Remove member"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
