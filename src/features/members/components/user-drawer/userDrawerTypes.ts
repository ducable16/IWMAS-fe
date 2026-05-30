import type { UserRole } from '@/constants/enums'

export type UserDrawerForm = {
  fullName: string
  email: string
  phone: string
  position: string
  role: UserRole | string
}
