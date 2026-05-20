import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantStore } from '@/store/tenantStore'
import type { ApiEnvelope, User } from '@/types'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshPayload {
  accessToken: string
  user: User
}

type FailedQueueItem = {
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api',
  timeout: 15000,
  withCredentials: true, // send HttpOnly refresh-token cookie
})

function setHeader(config: InternalAxiosRequestConfig, key: string, value: string) {
  const headers = config.headers as InternalAxiosRequestConfig['headers'] & {
    set?: (name: string, value: string) => void
    [key: string]: unknown
  }

  if (typeof headers.set === 'function') {
    headers.set(key, value)
  } else {
    headers[key] = value
  }
}

function deleteHeader(config: InternalAxiosRequestConfig, key: string) {
  const headers = config.headers as InternalAxiosRequestConfig['headers'] & {
    delete?: (name: string) => void
    [key: string]: unknown
  }

  if (typeof headers.delete === 'function') {
    headers.delete(key)
  } else {
    delete headers[key]
    delete headers[key.toLowerCase()]
  }
}

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  const tenantId = useTenantStore.getState().tenantId

  if (config.data instanceof FormData && config.headers) {
    // Let browser set multipart/form-data with boundary automatically.
    deleteHeader(config, 'Content-Type')
  }

  if (token && config.headers) setHeader(config, 'Authorization', `Bearer ${token}`)
  if (tenantId && config.headers) setHeader(config, 'X-Tenant-ID', tenantId)

  return config
})

let isRefreshing = false
let failedQueue: FailedQueueItem[] = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

instance.interceptors.response.use(
  // Success: unwrap backend ApiResponse envelope
  (response) => {
    // 204 No Content - DELETE, PATCH /read-all: no body
    if (response.status === 204) return response

    const body = response.data as ApiEnvelope | unknown
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      const envelope = body as ApiEnvelope
      // Business error inside 2xx - reject as ApiResponse
      if (envelope.code !== 200) {
        return Promise.reject(envelope)
      }
      return { ...response, data: envelope.data }
    }
    return response
  },

  // Error: handle 401 with silent refresh
  async (error: AxiosError<ApiEnvelope>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const body = error.response?.data

    if (!originalRequest) {
      return Promise.reject(body ?? error)
    }

    // Auth endpoints (/auth/*) - let errors propagate normally, no auto-refresh
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(body ?? error)
    }

    // Only handle 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(body ?? error)
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        if (token) setHeader(originalRequest, 'Authorization', `Bearer ${token}`)
        return instance(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const res = await instance.post<RefreshPayload>('/auth/refresh')
      const newToken = res.data.accessToken
      useAuthStore.getState().setAuth(res.data.user, newToken)
      processQueue(null, newToken)
      setHeader(originalRequest, 'Authorization', `Bearer ${newToken}`)
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
