import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { authService } from '@/features/auth/services/authService'
import FullPageSpinner from '@/components/feedback/FullPageSpinner'

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setInitialized = useAuthStore((s) => s.setInitialized)

  // On app startup, try to restore the session via the refresh-token cookie.
  // If it succeeds we get a fresh access token; if it fails we redirect to login.
  useEffect(() => {
    if (isInitialized || isAuthenticated) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await authService.refresh()
        if (!cancelled) {
          setAuth(res.data.user, res.data.accessToken)
        }
      } catch {
        // No valid refresh token — user will be sent to /login below
      } finally {
        if (!cancelled) setInitialized()
      }
    })()

    return () => { cancelled = true }
  }, [isInitialized, isAuthenticated, setAuth, setInitialized])

  // Still attempting startup refresh — show spinner
  if (!isInitialized && !isAuthenticated) {
    return <FullPageSpinner />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
