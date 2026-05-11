import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board'] })
      queryClient.invalidateQueries({ queryKey: ['sprint-board'] })
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

export function useUpdateTask(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to update task'),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => taskService.create(data),
    onSuccess: () => {
      toast.success('Task created')
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to create task'),
  })
}
