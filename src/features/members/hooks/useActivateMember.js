import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'

/**
 * Activate or deactivate a user (admin only).
 * Uses optimistic update for instant UI feedback.
 */
export function useActivateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }) =>
      active ? userService.activate(id) : userService.deactivate(id),

    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ['members'] })
      const previous = queryClient.getQueryData(['members'])

      queryClient.setQueryData(['members'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map((u) =>
          u.id === id ? { ...u, status: active ? 'ACTIVE' : 'DISABLED' } : u,
        )
      })

      return { previous }
    },

    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['members'], context.previous)
      }
      toast.error(err?.message || 'Failed to update status')
    },

    onSuccess: (_data, { active }) => {
      toast.success(active ? 'User activated' : 'User deactivated')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
