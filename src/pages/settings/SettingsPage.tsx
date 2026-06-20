import { useState } from 'react'
import clsx from 'clsx'
import ProfileSection from '@/features/settings/components/ProfileSection'
import SecuritySection from '@/features/settings/components/SecuritySection'
import SkillCatalogSection from '@/features/settings/components/SkillCatalogSection'
import { SETTINGS_SECTIONS } from '@/features/settings/settingsConfig'
import type { SettingsSectionId } from '@/features/settings/settingsTypes'

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSectionId>('profile')

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h2 className="text-subhead text-text-primary">Settings</h2>
        <p className="text-text-secondary text-[14px] mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
        <aside className="w-full lg:w-52 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-0.5 lg:overflow-visible lg:pb-0">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                className={clsx(
                  'sidebar-link shrink-0 lg:w-full',
                  active === section.id && 'active',
                )}
              >
                <section.icon className="w-4 h-4" strokeWidth={1.75} />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {active === 'profile' && <ProfileSection />}
          {active === 'skills' && <SkillCatalogSection />}
          {active === 'security' && <SecuritySection />}
        </div>
      </div>
    </div>
  )
}
