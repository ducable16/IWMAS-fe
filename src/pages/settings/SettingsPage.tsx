import { useState } from 'react'
import clsx from 'clsx'
import NotificationsSection from '@/features/settings/components/NotificationsSection'
import ProfileSection from '@/features/settings/components/ProfileSection'
import SecuritySection from '@/features/settings/components/SecuritySection'
import SkillCatalogSection from '@/features/settings/components/SkillCatalogSection'
import WorkspaceSection from '@/features/settings/components/WorkspaceSection'
import { SETTINGS_SECTIONS } from '@/features/settings/settingsConfig'
import type { SettingsSectionId } from '@/features/settings/settingsTypes'

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSectionId>('profile')

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h2 className="text-subhead text-text-primary">Settings</h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Manage your account and workspace preferences
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="w-52 shrink-0">
          <nav className="space-y-0.5">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                className={clsx('sidebar-link w-full', active === section.id && 'active')}
              >
                <section.icon className="w-4 h-4" strokeWidth={1.75} />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {active === 'profile' && <ProfileSection />}
          {active === 'workspace' && <WorkspaceSection />}
          {active === 'skills' && <SkillCatalogSection />}
          {active === 'security' && <SecuritySection />}
          {active === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  )
}
