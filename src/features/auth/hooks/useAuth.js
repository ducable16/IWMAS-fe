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
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success(`Welcome back, ${data.user.fullName || data.user.email}`)
      navigate('/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return () => {
    logout()
    navigate('/login')
    toast.success('Logged out')
  }
}
