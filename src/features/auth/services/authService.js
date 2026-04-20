import api from '@/lib/axios'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyEmailOtp: (data) => api.post('/auth/verify-email-otp', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}
