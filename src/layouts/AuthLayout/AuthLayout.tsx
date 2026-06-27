import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-canvas flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white text-[13px] font-semibold leading-none">I</span>
            </div>
            <span className="font-semibold text-text-primary tracking-tight">IWMAS</span>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
