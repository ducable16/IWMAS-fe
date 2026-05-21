import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import SearchInput from '@/components/ui/SearchInput'
import { useMembers } from '@/features/members/hooks/useMembers'
import { LiveEmpty, LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import UserDrawer from '@/features/members/components/UserDrawer'
import InviteUserModal from '@/features/members/components/InviteUserModal'
import FilterSelect from '@/features/members/components/members-list/FilterSelect'
import MembersTable from '@/features/members/components/members-list/MembersTable'
import {
  DEFAULT_MEMBER_PARAMS,
  SORT_FIELDS,
  type MemberFilterParams,
  type SortField,
} from '@/features/members/components/members-list/memberListTypes'
import {
  USER_ROLES,
  USER_ROLE_LABEL,
} from '@/constants/enums'
import { useCan } from '@/utils/permissions'
import type { MemberView } from '@/types'

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  ...USER_ROLES.map((role) => ({ value: role, label: USER_ROLE_LABEL[role] })),
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Disabled' },
]

export default function MembersPage() {
  const can = useCan()
  const isAdmin = can.manageUsers

  const [params, setParams] = useState(DEFAULT_MEMBER_PARAMS)
  const [selectedUser, setSelectedUser] = useState<MemberView | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const deepUserId = searchParams.get('userId')
  const deferredParams = useDeferredValue(params)

  const { data, isLoading, isError, error, refetch, isFetching } = useMembers(deferredParams)

  const members = useMemo(() => data?.members ?? [], [data?.members])
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1
  const isStale = isFetching && !isLoading

  const set = useCallback(<K extends keyof MemberFilterParams>(
    key: K,
    val: MemberFilterParams[K],
  ) => {
    setParams((prev) => ({
      ...prev,
      [key]: val,
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }, [])

  const reset = useCallback(() => setParams(DEFAULT_MEMBER_PARAMS), [])

  const handleSort = useCallback((field: SortField) => {
    const backendField = SORT_FIELDS[field]
    setParams((prev) => ({
      ...prev,
      sortBy: backendField,
      sortDirection:
        prev.sortBy === backendField && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      page: 0,
    }))
  }, [])

  useEffect(() => {
    if (!deepUserId) return
    const match = members.find((user) => String(user.id) === deepUserId)
    if (match) setSelectedUser(match)
  }, [deepUserId, members])

  const drawerUser = selectedUser
    ? members.find((user) => user.id === selectedUser.id) || selectedUser
    : null

  const closeDrawer = () => {
    setSelectedUser(null)
    if (deepUserId) {
      const next = new URLSearchParams(searchParams)
      next.delete('userId')
      setSearchParams(next, { replace: true })
    }
  }

  const hasFilters = params.search || params.role || params.active

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-subhead text-text-primary">All Users</h2>
          <p className="text-text-secondary text-[14px] mt-1">
            {isLoading
              ? 'Loading...'
              : `${totalElements.toLocaleString()} ${totalElements === 1 ? 'user' : 'users'} in workspace`}
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn-primary"
            onClick={() => setInviteOpen(true)}
            id="invite-user-btn"
          >
            <UserPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
            Invite user
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SearchInput
          id="user-search-input"
          value={params.search}
          onChange={(value) => set('search', value)}
          placeholder="Search by name, email, position..."
        />

        <FilterSelect
          value={params.role}
          onChange={(value) => set('role', value as MemberFilterParams['role'])}
          options={ROLE_OPTIONS}
        />

        <FilterSelect
          value={params.active}
          onChange={(value) => set('active', value as MemberFilterParams['active'])}
          options={STATUS_OPTIONS}
        />

        {hasFilters && (
          <button
            onClick={reset}
            className="text-[11.5px] text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Clear filters
          </button>
        )}

        {isStale && (
          <span className="text-[11px] text-text-muted animate-pulse">Updating...</span>
        )}
      </div>

      {isLoading && <LiveLoading label="Loading users..." />}
      {isError && <LiveError error={error} onRetry={refetch} />}

      {!isLoading && !isError && totalElements === 0 && !hasFilters && (
        <LiveEmpty label="No users yet. Invite your first team member." />
      )}

      {!isLoading && !isError && totalElements === 0 && hasFilters && (
        <LiveEmpty label="No users match your filters." />
      )}

      {!isLoading && !isError && totalElements > 0 && (
        <MembersTable
          members={members}
          drawerUser={drawerUser}
          params={params}
          totalPages={totalPages}
          totalElements={totalElements}
          isStale={isStale}
          onSort={handleSort}
          onPageChange={(page) => set('page', page)}
          onSelectUser={setSelectedUser}
        />
      )}

      <UserDrawer user={drawerUser} onClose={closeDrawer} />

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  )
}
