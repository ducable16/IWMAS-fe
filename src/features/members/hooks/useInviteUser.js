import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'

/**
 * POST /users — invite / create a new user (admin only).
 */
export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => userService.create(data),

    onSuccess: () => {
      toast.success('User invited successfully')
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },

    onError: (err) => {
      toast.error(err?.message || 'Failed to invite user')
    },
  })
}
