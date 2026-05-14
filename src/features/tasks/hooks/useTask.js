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

export function useTaskAttachments(taskId) {
  return useQuery({
    queryKey: ['tasks', taskId, 'attachments'],
    queryFn: async () => {
      const res = await taskService.getAttachments(taskId)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!taskId,
    staleTime: 30_000,
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

/** §4.15 PUT /api/tasks/{taskId}/comments/{commentId} — author only */
export function useUpdateTaskComment(taskId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }) =>
      taskService.updateComment(taskId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to update comment'),
  })
}

/** §4.16 DELETE /api/tasks/{taskId}/comments/{commentId} — author only */
export function useDeleteTaskComment(taskId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId) => taskService.deleteComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete comment'),
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

export function useUploadTaskAttachment(taskId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => taskService.uploadAttachment(taskId, file),
    onSuccess: () => {
      toast.success('Attachment uploaded')
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to upload attachment'),
  })
}

export function useDeleteTaskAttachment(taskId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId) => taskService.deleteAttachment(taskId, attachmentId),
    onSuccess: () => {
      toast.success('Attachment deleted')
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete attachment'),
  })
}
