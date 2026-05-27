import { X } from 'lucide-react'

export interface ActiveFilterChip {
  key: string
  label: string
  clear: () => void
}

type ActiveFilterChipsProps = {
  chips: ActiveFilterChip[]
  onClearAll: () => void
}

export default function ActiveFilterChips({ chips, onClearAll }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/25"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.clear}
            className="text-accent/60 hover:text-accent transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] text-text-muted hover:text-danger transition-colors ml-1"
      >
        Clear all
      </button>
    </div>
  )
}
