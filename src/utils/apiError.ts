import type { ApiError } from '@/types'

/**
 * Extract the human-readable message from a backend ApiError,
 * falling back to `fallback` when none is available.
 *
 * Previously duplicated in every feature hook — now the single source.
 */
export const getErrorMessage = (err: unknown, fallback: string): string =>
  (err as ApiError | undefined)?.message || fallback

/**
 * Extract the numeric business error code from a backend ApiError (§12).
 * Use with ERROR_CODES constants for specific handling.
 */
export const getApiErrorCode = (err: unknown): number | undefined =>
  (err as ApiError | undefined)?.code
