import axios from 'axios'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantStore } from '@/store/tenantStore'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  const tenantId = useTenantStore.getState().tenantId

  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId

  return config
})

instance.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      return { ...response, data: body.data, meta: { code: body.code, message: body.message } }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default instance
