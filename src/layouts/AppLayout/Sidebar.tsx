import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Clock,
  Users,
  Brain,
  ShieldAlert,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import clsx from 'clsx'
import type { PointerEvent as ReactPointerEvent } from 'react'

type NavItem = {
  label: string
  icon: LucideIcon
  to: string
}

type NavDivider = {
  divider: true
  label: string
}

type SidebarEntry = NavItem | NavDivider

const NAV_ITEMS: SidebarEntry[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Projects', icon: FolderKanban, to: '/projects' },
  { label: 'Tasks', icon: CheckSquare, to: '/tasks' },
  { label: 'Time Logs', icon: Clock, to: '/time-logs' },
  { divider: true, label: 'Workforce' },
  { label: 'Workload', icon: Brain, to: '/workforce' },
  { label: 'Sprint Risk', icon: ShieldAlert, to: '/workforce/sprint-risk' },
  { divider: true, label: 'Workspace' },
  { label: 'Members', icon: Users, to: '/members' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

const COLLAPSED_WIDTH = 60
const DEFAULT_WIDTH = 232
const MIN_WIDTH = 200
const MAX_WIDTH = 360

function clampSidebarWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
}

function isDivider(item: SidebarEntry): item is NavDivider {
  return 'divider' in item && item.divider
}

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const sidebarWidth = useUIStore((s) => s.sidebarWidth)
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth)
  const toggle = useUIStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const [resizing, setResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(DEFAULT_WIDTH)
  const displayName = user?.fullName || user?.email || 'User'
  const userInitial = displayName[0]?.toUpperCase() || 'U'
  const expandedWidth = clampSidebarWidth(sidebarWidth || DEFAULT_WIDTH)

  useEffect(() => {
    if (collapsed || !resizing) return

    const handlePointerMove = (event: PointerEvent) => {
      const delta = event.clientX - startXRef.current
      setSidebarWidth(clampSidebarWidth(startWidthRef.current + delta))
    }

    const handlePointerUp = () => {
      setResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [collapsed, resizing, setSidebarWidth])

  const startResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (collapsed) return
    event.preventDefault()
    startXRef.current = event.clientX
    startWidthRef.current = expandedWidth
    setResizing(true)
  }, [collapsed, expandedWidth])

  return (
    <aside
      className={clsx(
        'relative shrink-0 flex flex-col bg-bg-sidebar border-r border-border-subtle',
        !resizing && 'transition-[width] duration-200 ease-out',
      )}
      style={{ width: collapsed ? COLLAPSED_WIDTH : expandedWidth }}
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center h-[52px] px-3 shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold text-text-primary tracking-tight">IWAS</span>
            </div>
            <button
              onClick={toggle}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={toggle}
            className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors flex items-center justify-center"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        )}
      </div>



      {/* Nav */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          if (isDivider(item)) {
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
            item.to === '/dashboard' || item.to === '/workforce'
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/')

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={() =>
                clsx(
                  'sidebar-link',
                  isActive && 'active',
                  collapsed && 'justify-center px-2',
                )
              }
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
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-text-primary truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-text-muted truncate leading-tight mt-0.5">
                {user?.role || 'Member'}
              </p>
            </div>
          </div>
        </div>
      )}

      {!collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          title="Drag to resize sidebar"
          onPointerDown={startResize}
          onDoubleClick={() => setSidebarWidth(DEFAULT_WIDTH)}
          className={clsx(
            'absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize',
            'after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent',
            'hover:after:bg-accent/60',
            resizing && 'after:bg-accent',
          )}
        />
      )}

    </aside>
  )
}
