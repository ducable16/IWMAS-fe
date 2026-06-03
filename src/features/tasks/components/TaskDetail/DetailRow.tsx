import type { DetailRowProps } from './taskDetail.types'

export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 py-2.5">
      <span className="text-[13px] text-text-muted truncate">{label}</span>
      <div className="min-w-0 max-w-full overflow-visible text-[13px] text-text-primary min-h-[20px]">
        {children}
      </div>
    </div>
  )
}
