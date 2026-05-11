import { useMyWorkload } from '@/features/workforce/hooks/useWorkload'
import WorkloadTaskList from './WorkloadTaskList'

export default function MyTasksWidget() {
  const { data, isLoading, isError, error } = useMyWorkload()

  return (
    <div className="card p-5">
      <h3 className="section-title text-[13px] mb-3">My tasks this week</h3>
      <WorkloadTaskList
        tasks={data?.tasks || []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyLabel="No tasks due this week."
      />
    </div>
  )
}
