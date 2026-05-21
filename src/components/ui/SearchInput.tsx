import { Search, X } from 'lucide-react'
import clsx from 'clsx'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string | undefined
  id?: string | undefined
  className?: string | undefined
  inputClassName?: string | undefined
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  id,
  className,
  inputClassName,
}: SearchInputProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 bg-bg-surface border border-border rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-[320px] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all',
        className,
      )}
    >
      <Search className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.75} />
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'bg-transparent text-[13px] text-text-primary placeholder-text-muted focus:outline-none w-full',
          inputClassName,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-text-muted hover:text-text-primary transition-colors shrink-0"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
