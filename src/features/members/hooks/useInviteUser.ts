import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'
import { getErrorMessage } from '@/utils/apiError'
import { ERR_ADD_USER } from '@/utils/errorMessages'
import type { CreateUserRequest } from '@/types'

/**
 * POST /users — add / create a new user (admin only).
 */
export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),

    onSuccess: () => {
      toast.success('User added successfully')
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, ERR_ADD_USER))
    },
  })
}
