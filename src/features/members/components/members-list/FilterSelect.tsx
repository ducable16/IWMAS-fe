import SelectField from '@/components/ui/SelectField'
import type { FilterOption } from './memberListTypes'

type FilterSelectProps = {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
}

export default function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <SelectField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter"
      className="pl-3 pr-8 py-1.5 text-[12.5px] cursor-pointer"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  )
}
