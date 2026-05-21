import type { ApiError } from '@/types'

export const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback
