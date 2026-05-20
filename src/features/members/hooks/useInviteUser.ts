import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'
import type { ApiError, CreateUserRequest } from '@/types'

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

/**
 * POST /users — invite / create a new user (admin only).
 */
export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),

    onSuccess: () => {
      toast.success('User invited successfully')
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Failed to invite user'))
    },
  })
}
