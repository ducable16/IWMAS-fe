import type { UserRole } from '@/constants/enums'

export type UserDrawerForm = {
  fullName: string
  phone: string
  position: string
  role: UserRole | string
}
