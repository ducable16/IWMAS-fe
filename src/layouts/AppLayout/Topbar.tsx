import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import NotificationBell from '@/features/notifications/components/NotificationBell'
import { USER_ROLE_SHORT_LABEL } from '@/constants/enums'
import type { User as AuthUser } from '@/types'
import clsx from 'clsx'
import { Avatar } from '@/components/ui/Avatar'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/sprints': 'Sprint Board',
  '/tasks': 'Tasks',
  '/time-logs': 'Time Logs',
  '/workforce': 'Workload Analytics',
  '/workforce/sprint-risk': 'Sprint Risk Forecast',
  '/members': 'Team Members',
  '/notifications': 'Notifications',
  '/search': 'Search',
  '/settings': 'Settings',
}

type ProfileDropdownProps = {
  user: AuthUser | null
  onLogout: () => void
}

function getUserDisplayName(user: AuthUser | null) {
  return user?.fullName || user?.email || 'User'
}

function getUserRoleLabel(user: AuthUser | null) {
  const role = user?.role
  if (!role) return '-'

  return USER_ROLE_SHORT_LABEL[role as keyof typeof USER_ROLE_SHORT_LABEL] || role
}

function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const displayName = getUserDisplayName(user)
  const roleLabel = getUserRoleLabel(user)

  useEffect(() => {
    if (!open) return

    const handler = (event: MouseEvent) => {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        id="user-menu-btn"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 -m-1',
          'hover:bg-bg-hover transition-colors',
          open && 'bg-bg-hover',
        )}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        <Avatar name={getUserDisplayName(user)} avatarUrl={user?.avatarUrl} size="sm" />
        <div className="hidden lg:block leading-tight text-left">
          <p className="text-[12.5px] font-medium text-text-primary">
            {displayName}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {roleLabel}
          </p>
        </div>
        <ChevronDown
          className={clsx(
            'hidden lg:block w-3.5 h-3.5 text-text-muted transition-transform duration-150',
            open && 'rotate-180',
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          className={clsx(
            'absolute right-0 top-[calc(100%+8px)] w-[220px] z-50',
            'bg-bg-surface border border-border rounded-xl shadow-card overflow-hidden',
            'animate-in fade-in zoom-in-95 duration-150',
          )}
          role="menu"
        >
          <div className="px-4 py-3 border-b border-border-subtle bg-bg-subtle/40">
            <div className="flex items-center gap-2.5">
              <Avatar name={getUserDisplayName(user)} avatarUrl={user?.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-text-muted truncate mt-0.5">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1.5">
            <Link
              id="user-menu-profile"
              role="menuitem"
              to={`/users/${user?.id ?? ''}`}
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <User className="w-4 h-4 shrink-0 text-text-muted" strokeWidth={1.75} />
              My Profile
            </Link>

            <Link
              id="user-menu-settings"
              role="menuitem"
              to="/settings"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <Settings className="w-4 h-4 shrink-0 text-text-muted" strokeWidth={1.75} />
              Settings
            </Link>
          </div>

          <div className="border-t border-border-subtle py-1.5">
            <button
              id="user-menu-logout"
              role="menuitem"
              onClick={() => { close(); onLogout() }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-danger/80 hover:text-danger hover:bg-danger/5 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Topbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const entry = Object.entries(ROUTE_LABELS)
    .sort(([a], [b]) => b.length - a.length)
    .find(([path]) => location.pathname === path || location.pathname.startsWith(path + '/'))
  const pageTitle = entry?.[1] || 'IWAS'

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <header className="h-[52px] border-b border-border-subtle bg-bg-canvas/80 backdrop-blur-sm flex items-center px-4 lg:px-6 gap-3 lg:gap-4 sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-text-primary tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      <NotificationBell />

      <div className="w-px h-5 bg-border-subtle" />

      <ProfileDropdown
        user={user}
        onLogout={handleLogout}
      />
    </header>
  )
}
