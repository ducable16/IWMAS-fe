import { useState, useCallback, useDeferredValue, useEffect } from 'react'
import {
  UserPlus, Search, Shield, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import clsx from 'clsx'
import { useSearchParams } from 'react-router-dom'
import { useMembers } from '@/features/members/hooks/useMembers'
import { LiveLoading, LiveError, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import UserDrawer from '@/features/members/components/UserDrawer'
import InviteUserModal from '@/features/members/components/InviteUserModal'
import {
  USER_ROLES,
  USER_ROLE_SHORT_LABEL as ROLE_LABELS,
  USER_ROLE_LABEL,
  USER_STATUS_META,
} from '@/constants/enums'
import { useCan } from '@/utils/permissions'

/* ── Constants ─────────────────────────────────────────────── */

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  ...USER_ROLES.map((r) => ({ value: r, label: USER_ROLE_LABEL[r] })),
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Disabled' },
]

// Sort fields supported by the backend §2.6
const SORT_FIELDS = {
  fullName:    'fullName',
  email:       'email',
  createdAt:   'createdAt',
  lastActive:  'lastLoginAt',
}

const DEFAULT_PARAMS = {
  search:        '',
  role:          '',
  active:        '',   // '' | 'true' | 'false'
  sortBy:        'fullName',
  sortDirection: 'ASC',
  page:          0,
  size:          20,
}

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

/* ── Filter Dropdown ───────────────────────────────────────── */

function FilterSelect({ value, onChange, options }) {
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

function SortHeader({ label, field, params, onSort, className }) {
  const active = params.sortBy === SORT_FIELDS[field]
  const isDesc = params.sortDirection === 'DESC'
  const icon = active
    ? isDesc
      ? <ArrowDown className="w-3 h-3" strokeWidth={2} />
      : <ArrowUp className="w-3 h-3" strokeWidth={2} />
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

/* ── Pagination ─────────────────────────────────────────────── */

function Pagination({ page, totalPages, totalElements, size, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    const half = 3
    let start = Math.max(0, page - half)
    const end = Math.min(totalPages - 1, start + 6)
    start = Math.max(0, end - 6)
    return start + i
  }).filter((p) => p < totalPages)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle bg-bg-subtle/30">
      <span className="text-[12px] text-text-muted">
        Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of{' '}
        {totalElements} {totalElements === 1 ? 'user' : 'users'}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((pg) => (
          <button
            key={pg}
            onClick={() => onChange(pg)}
            className={clsx(
              'min-w-[28px] h-7 rounded-lg text-[12px] font-medium border transition-colors',
              pg === page
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:border-border-strong',
            )}
          >
            {pg + 1}
          </button>
        ))}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
          className="p-1.5 rounded-lg border border-border text-text-secondary hover:border-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */

export default function MembersPage() {
  const can = useCan()
  const isAdmin = can.manageUsers

  // Server-side filter/sort/page params
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  // Deep-link support: /members?userId=42 (from /search) auto-opens that drawer
  const [searchParams, setSearchParams] = useSearchParams()
  const deepUserId = searchParams.get('userId')

  // Defer search so we don't fire on every keystroke
  const deferredParams = useDeferredValue(params)

  const { data, isLoading, isError, error, refetch, isFetching } = useMembers(deferredParams)

  const members      = data?.members      ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages   = data?.totalPages   ?? 1

  const isStale = isFetching && !isLoading

  // ── Param helpers ──
  const set = useCallback((key, val) => {
    setParams((prev) => ({
      ...prev,
      [key]: val,
      // Reset to page 0 on any filter/sort change
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }, [])

  const reset = useCallback(() => setParams(DEFAULT_PARAMS), [])

  // ── Sort handler — maps UI field → backend sortBy ──
  const handleSort = useCallback((field) => {
    const backendField = SORT_FIELDS[field]
    setParams((prev) => ({
      ...prev,
      sortBy: backendField,
      sortDirection:
        prev.sortBy === backendField && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      page: 0,
    }))
  }, [])

  // Auto-open the drawer when arriving via /members?userId=...
  useEffect(() => {
    if (!deepUserId) return
    const id = Number(deepUserId)
    const match = members.find((u) => u.id === id)
    if (match) setSelectedUser(match)
  }, [deepUserId, members])

  // Keep drawer user synced with cache
  const drawerUser = selectedUser
    ? members.find((u) => u.id === selectedUser.id) || selectedUser
    : null

  const closeDrawer = () => {
    setSelectedUser(null)
    if (deepUserId) {
      // Clear the deep-link param so re-clicking a row works
      const next = new URLSearchParams(searchParams)
      next.delete('userId')
      setSearchParams(next, { replace: true })
    }
  }

  const hasFilters = params.search || params.role || params.active

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-subhead text-text-primary">All Users</h2>
          <p className="text-text-secondary text-[14px] mt-1">
            {isLoading
              ? 'Loading…'
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

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-[320px] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all">
          <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
          <input
            value={params.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search by name, email, position…"
            className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
            id="user-search-input"
          />
        </div>

        {/* Role filter */}
        <FilterSelect value={params.role} onChange={(v) => set('role', v)} options={ROLE_OPTIONS} />

        {/* Status filter */}
        <FilterSelect value={params.active} onChange={(v) => set('active', v)} options={STATUS_OPTIONS} />

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={reset}
            className="text-[11.5px] text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Clear filters
          </button>
        )}

        {/* Stale indicator */}
        {isStale && (
          <span className="text-[11px] text-text-muted animate-pulse">Updating…</span>
        )}
      </div>

      {/* ── States ── */}
      {isLoading && <LiveLoading label="Loading users…" />}
      {isError && <LiveError error={error} onRetry={refetch} />}

      {!isLoading && !isError && totalElements === 0 && !hasFilters && (
        <LiveEmpty label="No users yet. Invite your first team member." />
      )}

      {!isLoading && !isError && totalElements === 0 && hasFilters && (
        <LiveEmpty label="No users match your filters." />
      )}

      {/* ── Table ── */}
      {!isLoading && !isError && totalElements > 0 && (
        <div className={clsx('card overflow-hidden transition-opacity duration-200', isStale && 'opacity-70')}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle/50">
                  <SortHeader label="Name"        field="fullName"   params={params} onSort={handleSort} className="pl-5" />
                  <SortHeader label="Email"       field="email"      params={params} onSort={handleSort} />
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Role</th>
                  <th className="text-left text-[11.5px] font-semibold text-text-muted uppercase tracking-wider py-2.5 px-3">Status</th>
                  <SortHeader label="Last active" field="lastActive" params={params} onSort={handleSort} />
                  <SortHeader label="Joined"      field="createdAt"  params={params} onSort={handleSort} />
                  <th className="py-2.5 px-3 w-10"><span className="sr-only">Open</span></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {members.map((user) => (
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
                      <span className="badge badge-neutral">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-3">
                      {(() => {
                        const meta = USER_STATUS_META[user.status] || USER_STATUS_META.ACTIVE
                        return (
                          <span className={clsx('badge', meta.badge)}>
                            <span className={clsx('dot', meta.dot)} />
                            {meta.label}
                          </span>
                        )
                      })()}
                    </td>

                    {/* Last active */}
                    <td className="py-3 px-3">
                      <span className="text-[12.5px] text-text-muted tabular-nums">
                        {formatTimeAgo(user.lastActive)}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="py-3 px-3">
                      <span className="text-[12.5px] text-text-muted tabular-nums">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                    </td>

                    {/* Chevron */}
                    <td className="py-3 px-3 text-right">
                      <ChevronDown className="w-3.5 h-3.5 text-text-muted -rotate-90 inline-block" strokeWidth={1.75} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <Pagination
            page={params.page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={params.size}
            onChange={(pg) => set('page', pg)}
          />
        </div>
      )}

      {/* ── User Drawer ── */}
      <UserDrawer
        user={drawerUser}
        onClose={closeDrawer}
      />

      {/* ── Invite Modal ── */}
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  )
}
