import type { UserRole } from '@/constants/enums'

export const SORT_FIELDS = {
  fullName: 'fullName',
  email: 'email',
  createdAt: 'createdAt',
  lastActive: 'lastLoginAt',
} as const

export type SortField = keyof typeof SORT_FIELDS
export type SortDirection = 'ASC' | 'DESC'

export type MemberFilterParams = {
  search: string
  role: '' | UserRole
  active: '' | 'true' | 'false'
  sortBy: typeof SORT_FIELDS[SortField]
  sortDirection: SortDirection
  page: number
  size: number
}

export type FilterOption = {
  value: string
  label: string
}

export const DEFAULT_MEMBER_PARAMS: MemberFilterParams = {
  search: '',
  role: '',
  active: '',
  sortBy: 'fullName',
  sortDirection: 'ASC',
  page: 0,
  size: 20,
}
