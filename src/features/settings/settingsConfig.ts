import { Bell, Building2, Shield, User as UserIcon, Wrench } from 'lucide-react'
import type { NotificationPreference, SettingsSection } from './settingsTypes'

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export const DEFAULT_NOTIFICATIONS: NotificationPreference[] = [
  {
    id: 'burnout',
    label: 'Burnout alerts',
    desc: 'When a member exceeds workload threshold',
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
