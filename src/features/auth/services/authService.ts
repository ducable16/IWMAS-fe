import api from '@/lib/axios'
import type { AuthPayload, LoginRequest, OtpRequest, RegisterRequest, ResetPasswordRequest, User } from '@/types'

export const authService = {
  register: (data: RegisterRequest) => api.post<User>('/auth/register', data),
  login: (credentials: LoginRequest) => api.post<AuthPayload>('/auth/login', credentials),
  refresh: () => api.post<AuthPayload>('/auth/refresh'),   // cookie sent automatically
  logout: () => api.post('/auth/logout'),      // cookie sent automatically
  sendOtp: (email: string) => api.post('/auth/send-otp', { email }),
  verifyEmailOtp: (data: OtpRequest) => api.post('/auth/verify-email-otp', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: ResetPasswordRequest) => api.post('/auth/reset-password', data),
}
