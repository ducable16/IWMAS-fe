import { Bell, Search, LogOut } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/sprints': 'Sprint Board',
  '/tasks': 'Tasks',
  '/workforce': 'Workload Analytics',
  '/workforce/sprint-risk': 'Sprint Risk Forecast',
  '/members': 'Team Members',
  '/settings': 'Settings',
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
    <header className="h-[52px] border-b border-border-subtle bg-bg-canvas/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-text-primary tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-bg-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 w-[260px] focus-within:border-border focus-within:bg-bg-surface transition-colors">
        <Search className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full"
        />
      </div>



      {/* Notifications */}
      <button
        className="relative w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" strokeWidth={1.75} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
      </button>

      {/* User menu */}
      <div className="flex items-center gap-2 pl-3 border-l border-border-subtle">
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[11px] font-semibold text-white">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="hidden lg:block leading-tight">
          <p className="text-[12.5px] font-medium text-text-primary">{user?.name || 'Demo User'}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{user?.role || 'PM'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-1 text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-bg-hover"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}
