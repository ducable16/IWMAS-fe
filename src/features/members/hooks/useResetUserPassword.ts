import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/memberService'
import type { Id } from '@/types'

interface ResetPasswordVariables {
  id: Id
  newPassword: string
}

interface ResetPasswordOptions {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}

/**
 * §2.4 Admin reset user password.
 *
 * Usage:
 *   const { mutate, isPending, error } = useResetUserPassword()
 *   mutate({ id: userId, newPassword: '...' }, { onSuccess: () => ... })
 */
export function useResetUserPassword(options: ResetPasswordOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newPassword }: ResetPasswordVariables) =>
      userService.resetPassword(id, { newPassword }),

    onSuccess: (_, variables) => {
      // Invalidate that user's cache so any stale data is refreshed
      queryClient.invalidateQueries({ queryKey: ['members', variables.id] })
      options.onSuccess?.()
    },

    ...(options.onError ? { onError: options.onError } : {}),
  })
}
