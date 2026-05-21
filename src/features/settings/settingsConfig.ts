import { Bell, Building2, Shield, User as UserIcon } from 'lucide-react'
import type { NotificationPreference, SettingsSection } from './settingsTypes'

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export const TIMEZONES = [
  'UTC+7 (Ho Chi Minh City)',
  'UTC+0 (London)',
  'UTC-5 (New York)',
  'UTC+8 (Singapore)',
  'UTC+9 (Tokyo)',
]

export const DEFAULT_NOTIFICATIONS: NotificationPreference[] = [
  {
    id: 'burnout',
    label: 'Burnout alerts',
    desc: 'When a member exceeds workload threshold',
    enabled: true,
  },
  {
    id: 'sprint_risk',
    label: 'Sprint risk warnings',
    desc: 'When AI detects sprint deadline risk',
    enabled: true,
  },
  {
    id: 'task_assign',
    label: 'Task assignment',
    desc: 'When AI suggests or assigns tasks',
    enabled: true,
  },
  {
    id: 'daily_digest',
    label: 'Daily digest',
    desc: 'Daily summary of team workload',
    enabled: false,
  },
]
