import clsx from 'clsx'
import { VIEW_MODES } from '../tasksPageConfig'
import type { ViewMode } from '../tasksPageConfig'

type TasksViewTabsProps = {
  viewMode: ViewMode
  onChange: (viewMode: ViewMode) => void
}

export default function TasksViewTabs({ viewMode, onChange }: TasksViewTabsProps) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-bg-subtle border border-border-subtle rounded-lg self-start w-fit">
      {VIEW_MODES.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          title={label}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-all duration-150',
            viewMode === key
              ? 'bg-bg-surface text-text-primary shadow-sm border border-border-subtle'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
          {label}
        </button>
      ))}
    </div>
  )
}
