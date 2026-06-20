import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'
import { getErrorMessage } from '@/utils/apiError'
import { ERR_UPDATE_STATUS } from '@/utils/errorMessages'
import type { Id, MemberView } from '@/types'

interface ActivateMemberVariables {
  id: Id
  active: boolean
}

/**
 * Activate or deactivate a user (admin only).
 * Uses optimistic update for instant UI feedback.
 */
export function useActivateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: ActivateMemberVariables) =>
      active ? userService.activate(id) : userService.deactivate(id),

    onMutate: async ({ id, active }: ActivateMemberVariables) => {
      await queryClient.cancelQueries({ queryKey: ['members'] })
      const previous = queryClient.getQueryData(['members'])

      queryClient.setQueryData(['members'], (old: unknown) => {
        if (!Array.isArray(old)) return old
        return old.map((u: MemberView) =>
          u.id === id ? { ...u, status: active ? 'ACTIVE' : 'DISABLED' } : u,
        )
      })

      return { previous }
    },

    onError: (err: unknown, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['members'], context.previous)
      }
      toast.error(getErrorMessage(err, ERR_UPDATE_STATUS))
    },

    onSuccess: (_data, { active }: ActivateMemberVariables) => {
      toast.success(active ? 'User activated' : 'User deactivated')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
