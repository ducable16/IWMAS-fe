import { ChevronDown } from 'lucide-react'
import type { FilterOption } from './memberListTypes'

type FilterSelectProps = {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
}

export default function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 text-[12.5px] text-text-primary hover:border-border-strong focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none"
        strokeWidth={1.75}
      />
    </div>
  )
}
