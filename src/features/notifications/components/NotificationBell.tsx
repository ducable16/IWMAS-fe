import { useRef, useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useUnreadCount } from '../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { data: count = 0 } = useUnreadCount()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-accent rounded-full flex items-center justify-center px-0.5">
            <span className="text-[9px] font-semibold text-white leading-none">
              {count > 99 ? '99+' : count}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50">
          <NotificationPanel onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
