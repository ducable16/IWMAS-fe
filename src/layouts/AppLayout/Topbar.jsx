import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import UserProfileModal from '@/features/auth/components/UserProfileModal'
import NotificationBell from '@/features/notifications/components/NotificationBell'
import { USER_ROLE_SHORT_LABEL } from '@/constants/enums'

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

export default function Topbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

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

      {/* User menu */}
      <div className="flex items-center gap-2 pl-3 border-l border-border-subtle">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 rounded-md p-1 -m-1 hover:bg-bg-hover transition-colors"
          title="View profile"
          aria-label="View profile"
        >
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[11px] font-semibold text-white">
            {(user?.fullName || user?.name)?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden lg:block leading-tight text-left">
            <p className="text-[12.5px] font-medium text-text-primary">{user?.fullName || user?.name || 'Demo User'}</p>
            <p className="text-[11px] text-text-muted mt-0.5">{USER_ROLE_SHORT_LABEL[user?.role] || user?.role || '—'}</p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="ml-1 text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-bg-hover"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  )
}
