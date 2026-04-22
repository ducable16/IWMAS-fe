import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/memberService'
import { useAppMode } from '@/store/appModeStore'

export function useUpdateMember() {
  const queryClient = useQueryClient()
  const mode = useAppMode()

  return useMutation({
    mutationFn: ({ id, data }) => {
      if (mode === 'mock') {
        // Mock mode: simulate success
        return Promise.resolve({ data: { id, ...data } })
      }
      return userService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
