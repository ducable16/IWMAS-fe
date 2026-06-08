import { Pagination } from '@/components/ui/Pagination'

type MembersPaginationProps = {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onChange: (page: number) => void
}

export default function MembersPagination({
  page,
  totalPages,
  totalElements,
  size,
  onChange,
}: MembersPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      size={size}
      onChange={onChange}
      label={totalElements === 1 ? 'user' : 'users'}
      className="px-5 py-3 border-t border-border-subtle bg-bg-subtle/30"
    />
  )
}
