import { Pagination } from '@/components/ui/Pagination'
import type { TaskFilterChange } from '@/types'

type TaskListPaginationProps = {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onChange: TaskFilterChange
}

export default function TaskListPagination({
  page,
  totalPages,
  totalElements,
  size,
  onChange,
}: TaskListPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      size={size}
      onChange={(nextPage) => onChange('page', nextPage)}
      className="px-4 py-3 border-t border-border-subtle bg-bg-subtle/30"
    />
  )
}
