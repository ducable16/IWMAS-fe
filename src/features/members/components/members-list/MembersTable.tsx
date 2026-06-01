import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { UserStatusBadge } from '@/components/ui/Badge'
import SortableHeader from '@/components/ui/SortableHeader'
import { USER_ROLE_SHORT_LABEL as ROLE_LABELS } from '@/constants/enums'
import { fmtDate, fmtRelative } from '@/utils/date'
import MembersPagination from './MembersPagination'
import { SORT_FIELDS } from './memberListTypes'
import type { MemberView } from '@/types'
import type { MemberFilterParams, SortField } from './memberListTypes'

type MembersTableProps = {
  members: MemberView[]
  drawerUser: MemberView | null
  params: MemberFilterParams
  totalPages: number
  totalElements: number
  isStale: boolean
  onSort: (field: SortField) => void
  onPageChange: (page: number) => void
  onSelectUser: (user: MemberView) => void
}

export default function MembersTable({
  members,
  drawerUser,
  params,
  totalPages,
  totalElements,
  isStale,
  onSort,
  onPageChange,
  onSelectUser,
}: MembersTableProps) {
  return (
    <div className={clsx('card overflow-hidden transition-opacity duration-200', isStale && 'opacity-70')}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle/50">
              <SortableHeader
                label="Name"
                active={params.sortBy === SORT_FIELDS.fullName}
                direction={params.sortDirection}
                onClick={() => onSort('fullName')}
                className="pl-5"
              />
              <SortableHeader
                label="Email"
                active={params.sortBy === SORT_FIELDS.email}
                direction={params.sortDirection}
                onClick={() => onSort('email')}
              />
              <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Role</th>
              <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Status</th>
              <SortableHeader
                label="Last active"
                active={params.sortBy === SORT_FIELDS.lastActive}
                direction={params.sortDirection}
                onClick={() => onSort('lastActive')}
              />
              <SortableHeader
                label="Joined"
                active={params.sortBy === SORT_FIELDS.createdAt}
                direction={params.sortDirection}
                onClick={() => onSort('createdAt')}
              />
              <th className="py-2.5 px-3 w-10"><span className="sr-only">Open</span></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle">
            {members.map((user) => (
              <tr
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={clsx(
                  'cursor-pointer transition-colors hover:bg-bg-subtle/70',
                  drawerUser?.id === user.id && 'bg-accent/[0.04]',
                )}
                id={`user-row-${user.id}`}
              >
                <td className="py-3 px-3 pl-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center text-[12px] font-semibold text-accent shrink-0">
                      {user.fullName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate max-w-[180px]">
                        {user.fullName}
                      </p>
                      {user.position && (
                        <p className="text-[11px] text-text-muted truncate max-w-[180px]">
                          {user.position}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <span className="text-[12.5px] text-text-secondary truncate block max-w-[200px]">
                    {user.email}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="badge badge-neutral">
                    {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <UserStatusBadge status={user.status} />
                </td>

                <td className="py-3 px-3">
                  <span className="text-[12.5px] text-text-muted tabular-nums">
                    {fmtRelative(user.lastActive)}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="text-[12.5px] text-text-muted tabular-nums">
                    {fmtDate(user.createdAt)}
                  </span>
                </td>

                <td className="py-3 px-3 text-right">
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted -rotate-90 inline-block" strokeWidth={1.75} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MembersPagination
        page={params.page}
        totalPages={totalPages}
        totalElements={totalElements}
        size={params.size}
        onChange={onPageChange}
      />
    </div>
  )
}
