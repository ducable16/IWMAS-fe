import type { DetailRowProps } from './taskDetail.types'

export function DetailRow({ icon: Icon, label, children }: DetailRowProps) {
  return (
    <div className="grid grid-cols-[minmax(86px,112px)_minmax(0,1fr)] items-start gap-2 py-2 border-b border-border-subtle last:border-0">
      <div className="flex min-w-0 items-center gap-1.5 text-[12px] text-text-muted pt-0.5">
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
        <span className="truncate">{label}</span>
      </div>
      <div className="min-w-0 max-w-full overflow-hidden text-[13px] text-text-primary min-h-[20px]">
        {children}
      </div>
    </div>
  )
}
