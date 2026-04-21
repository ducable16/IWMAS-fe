import { useAppModeStore } from '@/store/appModeStore'
import { FlaskConical, Radio } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function AppModeToggle({ size = 'sm' }) {
  const mode = useAppModeStore((s) => s.mode)
  const setMode = useAppModeStore((s) => s.setMode)

  const switchTo = (next) => {
    if (next === mode) return
    setMode(next)
    toast.success(next === 'mock' ? 'Switched to Mock data' : 'Switched to Live API')
  }

  const isMock = mode === 'mock'

  return (
    <div
      role="group"
      aria-label="Data mode"
      className={clsx(
        'inline-flex items-center gap-0.5 p-0.5 border rounded-lg transition-colors',
        size === 'sm' ? 'text-[11.5px]' : 'text-[12.5px]',
        isMock
          ? 'bg-bg-subtle border-border-subtle'
          : 'bg-warning-subtle border-warning/30',
      )}
    >
      <button
        type="button"
        onClick={() => switchTo('mock')}
        aria-pressed={isMock}
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors',
          isMock
            ? 'bg-bg-surface text-text-primary border border-border-subtle'
            : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <FlaskConical className="w-3 h-3" strokeWidth={2} />
        Mock
      </button>
      <button
        type="button"
        onClick={() => switchTo('live')}
        aria-pressed={!isMock}
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors',
          !isMock
            ? 'bg-warning text-white'
            : 'text-text-muted hover:text-text-secondary',
        )}
      >
        <Radio className="w-3 h-3" strokeWidth={2} />
        Live
      </button>
    </div>
  )
}
