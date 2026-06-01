import { Plus } from 'lucide-react'

type TasksPageHeaderProps = {
  subtitle: string
  canCreate: boolean
  onCreate: () => void
}

export default function TasksPageHeader({
  subtitle,
  canCreate,
  onCreate,
}: TasksPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-subhead text-text-primary">Tasks</h2>
        <p className="text-text-secondary text-[14px] mt-0.5">{subtitle}</p>
      </div>
      {canCreate && (
        <button className="btn-primary flex-shrink-0" onClick={onCreate}>
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          New task
        </button>
      )}
    </div>
  )
}
