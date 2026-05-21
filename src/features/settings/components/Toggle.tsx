import clsx from 'clsx'

interface ToggleProps {
  enabled: boolean
  onChange?: (enabled: boolean) => void
}

export default function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!enabled)}
      className={clsx('toggle', enabled ? 'toggle-on' : 'toggle-off')}
      aria-pressed={enabled}
    >
      <span className={clsx('toggle-thumb', enabled ? 'toggle-thumb-on' : 'toggle-thumb-off')} />
    </button>
  )
}
