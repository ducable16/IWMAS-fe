export interface ApiEnvelope<T = unknown> {
  code: number
  message: string
  data: T | null
}

export interface ApiError {
  code?: number
  message?: string
  data?: null
  status?: number
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListResult<T> {
  page: number
  size: number
  totalElements: number
  totalPages: number
  [key: string]: T[] | number
}

export type Id = string | number
export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | QueryValue[] | Record<string, QueryValue>>

