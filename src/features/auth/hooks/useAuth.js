import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ data }) => {
      // Refresh token is now set as HttpOnly cookie by the backend;
      // we only store the access token + user in memory.
      setAuth(data.user, data.accessToken)
      toast.success(`Welcome back, ${data.user.fullName || data.user.email}`)
      navigate('/dashboard')
    },
    onError: (err) => {
      toast.error(err?.message || 'Login failed')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return async () => {
    try {
      await authService.logout() // revokes refresh token + clears cookie
    } catch {
      // Even if the API call fails, clear local state
    }
    logout()
    navigate('/login')
    toast.success('Logged out')
  }
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset email sent')
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to send reset email')
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successful')
      navigate('/login')
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to reset password')
    },
  })
}
