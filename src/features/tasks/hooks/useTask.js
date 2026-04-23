import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/taskService'

export function useTask(id) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const res = await taskService.getById(id)
      return res.data
    },
    enabled: !!id,
  })
}

export function useTaskHistory(id) {
  return useQuery({
    queryKey: ['tasks', id, 'history'],
    queryFn: async () => {
      const res = await taskService.getHistory(id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!id,
  })
}

export function useUpdateTaskStatus(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => taskService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
    },
  })
}

export function useAddTaskComment(taskId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content) => taskService.addComment(taskId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}
