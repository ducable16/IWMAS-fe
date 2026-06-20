import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { canAccessPage } from '@/utils/permissions'
import type { PageCapability } from '@/utils/permissions'

type CapabilityRouteProps = {
  capability: PageCapability
}

export default function CapabilityRoute({ capability }: CapabilityRouteProps) {
  const role = useAuthStore((state) => state.user?.role)

  return canAccessPage(role, capability)
    ? <Outlet />
    : <Navigate to="/dashboard" replace />
}
