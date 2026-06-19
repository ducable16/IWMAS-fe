import { useState } from 'react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useUpdateTaskStatus } from '@/features/tasks/hooks/useTask'
import {
  TASK_STATUSES,
  TASK_STATUS_DETAIL_META as STATUS_META,
  TASK_STATUS_TRANSITIONS,
} from '@/constants/enums'
import { TaskStatusBadge } from '@/components/ui/Badge'
import type { StatusDropdownProps } from './taskDetail.types'

const STATUS_META_BY_KEY = STATUS_META as Record<string, typeof STATUS_META.TODO>

export function StatusDropdown({ current, taskId, canChange = true }: StatusDropdownProps) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useUpdateTaskStatus(taskId)
  const meta = STATUS_META_BY_KEY[current] || STATUS_META.TODO
  const allowedStatuses = new Set([
    current,
    ...((TASK_STATUS_TRANSITIONS as Record<string, readonly string[]>)[current] || []),
  ])

  return (
    <div className="relative">
      <button
        onClick={() => canChange && setOpen(v => !v)}
        disabled={isPending || !canChange}
        className="flex items-center gap-1.5 transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isPending
          ? <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide', meta.cls)}><Loader2 className="w-3 h-3 animate-spin" /></span>
          : <TaskStatusBadge status={current} variant="detail" />}
        <ChevronDown className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute top-9 left-0 z-30 bg-bg-surface border border-border rounded-lg py-1 min-w-[160px] shadow-card animate-fade-in">
          {TASK_STATUSES.filter((s) => allowedStatuses.has(s)).map(s => (
            <button
              key={s}
              onClick={() => {
                if (s !== current) mutate({ status: s })
                setOpen(false)
              }}
              className={clsx(
                'flex items-center gap-2 w-full px-3 py-1.5 text-[12.5px] hover:bg-bg-subtle transition-colors',
                s === current ? 'font-semibold text-text-primary' : 'text-text-secondary',
              )}
            >
              <TaskStatusBadge status={s} variant="detail" className="text-[10px] py-0" />
              {s === current && <Check className="w-3 h-3 ml-auto text-accent" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
