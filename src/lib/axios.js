import axios from 'axios'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantStore } from '@/store/tenantStore'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send HttpOnly refresh-token cookie
})

/* ── Request interceptor ───────────────────────────────────── */
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  const tenantId = useTenantStore.getState().tenantId

  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId

  return config
})

/* ── Refresh-token queue / lock ────────────────────────────── */
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token)
  })
  failedQueue = []
}

/* ── Response interceptor ──────────────────────────────────── */
instance.interceptors.response.use(
  // Success: unwrap backend ApiResponse envelope
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      return { ...response, data: body.data, meta: { code: body.code, message: body.message } }
    }
    return response
  },

  // Error: handle 401 with silent refresh
  async (error) => {
    const originalRequest = error.config

    // Auth endpoints (/auth/*) — let errors propagate normally, no auto-refresh
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error)
    }

    // Only handle 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return instance(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const res = await instance.post('/auth/refresh')
      const newToken = res.data.accessToken
      useAuthStore.getState().setAuth(res.data.user, newToken)
      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return instance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default instance
