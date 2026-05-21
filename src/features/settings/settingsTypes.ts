import type { LucideIcon } from 'lucide-react'

export type SettingsSectionId = 'profile' | 'workspace' | 'security' | 'notifications'

export interface SettingsSection {
  id: SettingsSectionId
  label: string
  icon: LucideIcon
}

export interface ProfileForm {
  name: string
  email: string
  phone: string
  position: string
}

export type ProfileErrors = Partial<Record<keyof ProfileForm, string | null>>

export interface SecurityForm {
  current: string
  next: string
  confirm: string
}

export type SecurityErrors = Partial<Record<keyof SecurityForm, string | null>>

export interface NotificationPreference {
  id: 'burnout' | 'sprint_risk' | 'task_assign' | 'daily_digest'
  label: string
  desc: string
  enabled: boolean
}
