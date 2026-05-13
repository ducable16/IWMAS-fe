import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import NotificationBell from '@/features/notifications/components/NotificationBell'
import { USER_ROLE_SHORT_LABEL } from '@/constants/enums'
import clsx from 'clsx'

const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/sprints': 'Sprint Board',
  '/tasks': 'Tasks',
  '/workforce': 'Workload Analytics',
  '/workforce/sprint-risk': 'Sprint Risk Forecast',
  '/members': 'Team Members',
  '/notifications': 'Notifications',
  '/search': 'Search',
  '/settings': 'Settings',
}

// ── User avatar initials ──────────────────────────────────────────────────────

function UserAvatar({ user, size = 'sm' }) {
  const initials = (user?.fullName || user?.name || 'U')[0]?.toUpperCase() || 'U'
  const sizeClass = size === 'lg' ? 'w-9 h-9 text-[13px]' : 'w-7 h-7 text-[11px]'
  return (
    <div className={clsx(
      'rounded-full bg-accent flex items-center justify-center font-semibold text-white shrink-0',
      sizeClass,
    )}>
      {initials}
    </div>
  )
}

// ── Profile dropdown ──────────────────────────────────────────────────────────

function ProfileDropdown({ user, onViewProfile, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={ref} className="relative flex items-center">
      {/* Trigger button */}
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
        <UserAvatar user={user} />
        <div className="hidden lg:block leading-tight text-left">
          <p className="text-[12.5px] font-medium text-text-primary">
            {user?.fullName || user?.name || 'Demo User'}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {USER_ROLE_SHORT_LABEL[user?.role] || user?.role || '—'}
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

      {/* Dropdown panel */}
      {open && (
        <div
          className={clsx(
            'absolute right-0 top-[calc(100%+8px)] w-[220px] z-50',
            'bg-bg-surface border border-border rounded-xl shadow-card overflow-hidden',
            'animate-in fade-in zoom-in-95 duration-150',
          )}
          role="menu"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border-subtle bg-bg-subtle/40">
            <div className="flex items-center gap-2.5">
              <UserAvatar user={user} size="lg" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary truncate">
                  {user?.fullName || user?.name || 'Demo User'}
                </p>
                <p className="text-[11px] text-text-muted truncate mt-0.5">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              id="user-menu-profile"
              role="menuitem"
              to={`/users/${user?.id}`}
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

          {/* Divider + logout */}
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

// ── Topbar ────────────────────────────────────────────────────────────────────

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
    <header className="h-[52px] border-b border-border-subtle bg-bg-canvas/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-text-primary tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Notifications */}
      <NotificationBell />

      {/* Separator */}
      <div className="w-px h-5 bg-border-subtle" />

      {/* User dropdown */}
      <ProfileDropdown
        user={user}
        onLogout={handleLogout}
      />
    </header>
  )
}
