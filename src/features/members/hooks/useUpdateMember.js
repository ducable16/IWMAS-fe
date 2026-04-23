import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/memberService'

export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => {
      return userService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
