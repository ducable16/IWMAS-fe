import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskService } from '../services/taskService'
import type { ApiError, CreateTaskRequest, Id, UpdateTaskRequest, UpdateTaskStatusRequest } from '@/types'

interface UpdateCommentVariables {
  commentId: Id
  content: string
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

export function useTask(id: Id | null | undefined) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const res = await taskService.getById(id as Id)
      return res.data
    },
    enabled: !!id,
  })
}

export function useTaskHistory(id: Id | null | undefined) {
  return useQuery({
    queryKey: ['tasks', id, 'history'],
    queryFn: async () => {
      const res = await taskService.getHistory(id as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!id,
  })
}

export function useTaskAttachments(taskId: Id | null | undefined) {
  return useQuery({
    queryKey: ['tasks', taskId, 'attachments'],
    queryFn: async () => {
      const res = await taskService.getAttachments(taskId as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!taskId,
    staleTime: 30_000,
  })
}

export function useUpdateTaskStatus(id: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTaskStatusRequest) => taskService.updateStatus(id as Id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board'] })
      queryClient.invalidateQueries({ queryKey: ['sprint-board'] })
    },
  })
}

export function useAddTaskComment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => taskService.addComment(taskId as Id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

export function useUpdateTaskComment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentVariables) =>
      taskService.updateComment(taskId as Id, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to update comment')),
  })
}

export function useDeleteTaskComment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: Id) => taskService.deleteComment(taskId as Id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to delete comment')),
  })
}

export function useUpdateTask(id: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => taskService.update(id as Id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to update task')),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),
    onSuccess: () => {
      toast.success('Task created')
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to create task')),
  })
}

export function useUploadTaskAttachment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => taskService.uploadAttachment(taskId as Id, file),
    onSuccess: () => {
      toast.success('Attachment uploaded')
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to upload attachment')),
  })
}

export function useDeleteTaskAttachment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: Id) => taskService.deleteAttachment(taskId as Id, attachmentId),
    onSuccess: () => {
      toast.success('Attachment deleted')
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to delete attachment')),
  })
}
