import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-canvas flex">
      {/* Left panel — muted brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-sidebar border-r border-border-subtle flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-sm font-semibold leading-none">I</span>
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-text-primary">IWAS</p>
            <p className="text-[12px] text-text-muted mt-0.5">Intelligent Workload Allocation</p>
          </div>
        </div>

        <div className="space-y-10 max-w-md">
          <div>
            <h2 className="font-serif font-medium text-4xl text-text-primary leading-tight tracking-tight text-balance">
              Smart workload. Balanced teams.
            </h2>
            <p className="mt-5 text-[15px] text-text-secondary leading-relaxed">
              AI-powered sprint allocation that prevents burnout before it happens.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Prediction accuracy', value: '94%' },
              { label: 'vs manual assignment', value: '3.2×' },
              { label: 'Team velocity', value: '+28%' },
              { label: 'Fairness index', value: '0.12' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-bg-surface border border-border-subtle rounded-xl p-4"
              >
                <p className="stat-number text-2xl">{stat.value}</p>
                <p className="text-text-muted text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-text-muted text-xs">© 2025 IWAS — Intelligent Workload Allocation System</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white text-[13px] font-semibold leading-none">I</span>
            </div>
            <span className="font-semibold text-text-primary tracking-tight">IWAS</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
