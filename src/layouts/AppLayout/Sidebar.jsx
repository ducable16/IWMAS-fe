import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  CheckSquare,
  Users,
  Brain,
  ShieldAlert,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Projects', icon: FolderKanban, to: '/projects' },
  { label: 'Sprint Board', icon: Layers, to: '/sprints' },
  { label: 'Tasks', icon: CheckSquare, to: '/tasks' },
  { divider: true, label: 'Workforce' },
  { label: 'Workload', icon: Brain, to: '/workforce' },
  { label: 'Sprint Risk', icon: ShieldAlert, to: '/workforce/sprint-risk' },
  { divider: true, label: 'Workspace' },
  { label: 'Members', icon: Users, to: '/members' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  return (
    <aside
      className={clsx(
        'relative flex flex-col bg-bg-sidebar border-r border-border-subtle',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-[60px]' : 'w-[232px]',
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center h-[52px] px-3 shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <div className={clsx('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <span className="text-white text-[13px] font-semibold leading-none">I</span>
          </div>
          {!collapsed && (
            <span className="text-[14px] font-semibold text-text-primary tracking-tight">IWAS</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New action */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>New task</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          if (item.divider) {
            return collapsed ? (
              <div key={idx} className="my-2 mx-2 border-t border-border-subtle" />
            ) : (
              <div
                key={idx}
                className="mt-4 mb-1 px-2.5 text-[11px] font-medium tracking-wide uppercase text-text-muted"
              >
                {item.label}
              </div>
            )
          }

          const isActive =
            item.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={clsx(
                'sidebar-link',
                isActive && 'active',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      {!collapsed && user && (
        <div className="p-2 border-t border-border-subtle">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-bg-hover transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-accent/90 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-text-primary truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-text-muted truncate leading-tight mt-0.5">
                {user?.role || 'Member'}
              </p>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <button
          onClick={toggle}
          className="m-2 p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors flex items-center justify-center"
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  )
}
