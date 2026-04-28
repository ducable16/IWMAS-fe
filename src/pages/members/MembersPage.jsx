import { useState, useMemo, useCallback } from 'react'
import {
  UserPlus, Search, Shield, ChevronDown,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import clsx from 'clsx'
import { useMembers } from '@/features/members/hooks/useMembers'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import UserDrawer from '@/features/members/components/UserDrawer'
import InviteUserModal from '@/features/members/components/InviteUserModal'

/* ── Constants ─────────────────────────────────────────────── */

const ROLE_LABELS = {
  TEAM_MEMBER: 'Member',
  PROJECT_MANAGER: 'PM',
  HR: 'HR',
  ADMIN: 'Admin',
}

const ROLE_BADGE = {
  ADMIN: 'badge-danger',
  HR: 'badge-warning',
  PROJECT_MANAGER: 'badge-accent',
  TEAM_MEMBER: 'badge-neutral',
}

const STATUS_BADGE = {
  ACTIVE: 'badge-success',
  DISABLED: 'badge-danger',
  INVITED: 'badge-info',
}

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'HR', label: 'HR' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'TEAM_MEMBER', label: 'Team Member' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
]

/* ── Helpers ───────────────────────────────────────────────── */

function formatTimeAgo(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ── Debounce hook ─────────────────────────────────────────── */

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useMemo(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/* ── Filter Dropdown ───────────────────────────────────────── */

function FilterSelect({ value, onChange, options, icon: Icon }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 text-[12.5px] text-text-primary hover:border-border-strong focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none"
        strokeWidth={1.75}
      />
    </div>
  )
}

/* ── Sortable Column Header ────────────────────────────────── */

function SortHeader({ label, field, sort, onSort, className }) {
  const active = sort.field === field
  const icon = active
    ? sort.dir === 'asc'
      ? <ArrowUp className="w-3 h-3" strokeWidth={2} />
      : <ArrowDown className="w-3 h-3" strokeWidth={2} />
    : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" strokeWidth={1.75} />

  return (
    <th
      className={clsx(
        'text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3 cursor-pointer select-none group transition-colors hover:text-text-secondary',
        className,
      )}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={clsx('transition-opacity', active ? 'text-accent' : 'text-text-muted')}>
          {icon}
        </span>
      </span>
    </th>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */

export default function MembersPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR'

  // Data
  const { data: members, isLoading, isError, error, refetch } = useMembers()

  // Local state
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState({ field: 'fullName', dir: 'asc' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  // Sort handler
  const handleSort = useCallback((field) => {
    setSort((prev) => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  // Filtered + sorted list
  const list = members || []
  const filtered = useMemo(() => {
    let result = list

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.position?.toLowerCase().includes(q),
      )
    }

    // Role filter
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter)
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((u) => u.status === statusFilter)
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aVal = (a[sort.field] || '').toString().toLowerCase()
      const bVal = (b[sort.field] || '').toString().toLowerCase()
      const cmp = aVal.localeCompare(bVal)
      return sort.dir === 'asc' ? cmp : -cmp
    })

    return result
  }, [list, debouncedSearch, roleFilter, statusFilter, sort])

  // Keep drawer user synced with cache (handles status changes while drawer is open)
  const drawerUser = selectedUser
    ? list.find((u) => u.id === selectedUser.id) || selectedUser
    : null

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif font-medium text-[26px] text-text-primary tracking-tight leading-tight">
            All Users
          </h2>
          <p className="text-text-secondary text-[14px] mt-1">
            {list.length} {list.length === 1 ? 'user' : 'users'} in workspace
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

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 max-w-[320px] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all">
          <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, position…"
            className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
            id="user-search-input"
          />
        </div>

        {/* Filters */}
        <FilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />

        {/* Active filter count */}
        {(roleFilter || statusFilter) && (
          <button
            onClick={() => { setRoleFilter(''); setStatusFilter('') }}
            className="text-[11.5px] text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── States ── */}
      {isLoading && <LiveLoading label="Loading users…" />}
      {isError && <LiveError error={error} onRetry={refetch} />}

      {!isLoading && !isError && list.length === 0 && (
        <LiveEmpty label="No users yet. Invite your first team member." />
      )}

      {/* ── Table ── */}
      {!isLoading && !isError && list.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle/50">
                  <SortHeader label="Name" field="fullName" sort={sort} onSort={handleSort} className="pl-5" />
                  <SortHeader label="Email" field="email" sort={sort} onSort={handleSort} />
                  <SortHeader label="Role" field="role" sort={sort} onSort={handleSort} />
                  <SortHeader label="Status" field="status" sort={sort} onSort={handleSort} />
                  <SortHeader label="Last active" field="lastActive" sort={sort} onSort={handleSort} />
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3 w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[13px] text-text-muted">
                      No users match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={clsx(
                        'cursor-pointer transition-colors hover:bg-bg-subtle/70',
                        drawerUser?.id === user.id && 'bg-accent/[0.04]',
                      )}
                      id={`user-row-${user.id}`}
                    >
                      {/* Name + avatar */}
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

                      {/* Email */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-secondary truncate block max-w-[200px]">
                          {user.email}
                        </span>
                      </td>

                      {/* Role badge */}
                      <td className="py-3 px-3">
                        <span className={clsx('badge', ROLE_BADGE[user.role] || 'badge-neutral')}>
                          <Shield className="w-3 h-3" strokeWidth={1.75} />
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-3 px-3">
                        <span className={clsx('badge', STATUS_BADGE[user.status] || 'badge-neutral')}>
                          <span className={clsx(
                            'dot',
                            user.status === 'ACTIVE' ? 'bg-success'
                              : user.status === 'DISABLED' ? 'bg-danger'
                              : 'bg-info',
                          )} />
                          {user.status === 'ACTIVE' ? 'Active'
                            : user.status === 'DISABLED' ? 'Disabled'
                            : 'Invited'}
                        </span>
                      </td>

                      {/* Last active */}
                      <td className="py-3 px-3">
                        <span className="text-[12.5px] text-text-muted tabular-nums">
                          {formatTimeAgo(user.lastActive)}
                        </span>
                      </td>

                      {/* Actions arrow */}
                      <td className="py-3 px-3 text-right">
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted -rotate-90 inline-block" strokeWidth={1.75} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with count */}
          <div className="border-t border-border-subtle bg-bg-subtle/30 px-5 py-2.5">
            <p className="text-[11.5px] text-text-muted">
              Showing {filtered.length} of {list.length} {list.length === 1 ? 'user' : 'users'}
              {(debouncedSearch || roleFilter || statusFilter) && ' (filtered)'}
            </p>
          </div>
        </div>
      )}

      {/* ── User Drawer ── */}
      <UserDrawer
        user={drawerUser}
        onClose={() => setSelectedUser(null)}
      />

      {/* ── Invite Modal ── */}
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  )
}
