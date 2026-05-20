import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/memberService'
import type { ApiError, Id, MemberView, UpdateUserRequest } from '@/types'

interface UpdateMemberVariables {
  id: Id
  data: UpdateUserRequest
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

/**
 * PATCH /users/{id} with optimistic cache update.
 * On error → rollback cache + show toast.
 */
export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateMemberVariables) => userService.update(id, data),

    onMutate: async ({ id, data }: UpdateMemberVariables) => {
      // Cancel any outgoing refetch so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['members'] })

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData(['members'])

      // Optimistically update cache
      queryClient.setQueryData(['members'], (old: unknown) => {
        if (!Array.isArray(old)) return old
        return old.map((u: MemberView) => (u.id === id ? { ...u, ...data } : u))
      })

      return { previous }
    },

    onError: (err: unknown, _vars, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['members'], context.previous)
      }
      toast.error(getErrorMessage(err, 'Failed to update user'))
    },

    onSuccess: () => {
      toast.success('User updated')
    },

    onSettled: () => {
      // Always refetch to get server truth
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
