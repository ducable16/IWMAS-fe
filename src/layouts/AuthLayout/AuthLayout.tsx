import { Activity, Gauge, UserCheck } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const PRINCIPLES = [
  {
    label: 'Capacity-aware planning',
    description: 'Plan delivery around the capacity people actually have.',
    icon: Gauge,
  },
  {
    label: 'Skill-aligned assignments',
    description: 'Connect work with the people best prepared to take it on.',
    icon: UserCheck,
  },
  {
    label: 'Early workload signals',
    description: 'See delivery pressure before it becomes a missed deadline.',
    icon: Activity,
  },
] as const

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-canvas flex">
      <div className="hidden lg:flex lg:w-1/2 bg-bg-sidebar border-r border-border-subtle flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-sm font-semibold leading-none">I</span>
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-text-primary">IWMAS</p>
            <p className="text-[12px] text-text-muted mt-0.5">Intelligent Workload Management and Allocation System</p>
          </div>
        </div>

        <div className="space-y-8 max-w-md">
          <div>
            <h2 className="text-section text-text-primary text-balance">
              Clear plans. Sustainable workloads.
            </h2>
            <p className="mt-5 text-body-base text-text-secondary leading-relaxed">
              A shared workspace for coordinating people, skills, projects, and delivery capacity.
            </p>
          </div>

          <div className="border-y border-border-subtle divide-y divide-border-subtle">
            {PRINCIPLES.map((principle) => (
              <div key={principle.label} className="flex items-start gap-3 py-4">
                <div className="w-8 h-8 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <principle.icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text-primary">
                    {principle.label}
                  </p>
                  <p className="text-[12px] text-text-muted leading-relaxed mt-0.5">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-text-muted text-xs">
          IWMAS {new Date().getFullYear()} | Authorized access only
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white text-[13px] font-semibold leading-none">I</span>
            </div>
            <span className="font-semibold text-text-primary tracking-tight">IWMAS</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
