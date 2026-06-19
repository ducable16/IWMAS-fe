import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskService } from '../services/taskService'
import type {
  ApiError,
  CreateTaskRequest,
  Id,
  Task,
  TaskComment,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@/types'

interface UpdateCommentVariables {
  commentId: Id
  content: string
}

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as ApiError | undefined)?.message || fallback

const getTaskWriteErrorMessage = (err: unknown, fallback: string) => {
  const code = (err as ApiError | undefined)?.code
  if (code === 5005) {
    return getErrorMessage(err, 'Start date must not be after due date')
  }
  if (code === 5006) {
    return getErrorMessage(err, 'Enter a start date or due date')
  }
  if (code === 5007) {
    return getErrorMessage(
      err,
      'Assignee does not meet the required skill level for this task',
    )
  }
  return getErrorMessage(err, fallback)
}

const taskQueryKey = (id: Id | null | undefined) =>
  ['tasks', id == null ? id : String(id)] as const

function appendComment(task: Task | undefined, comment: TaskComment): Task | undefined {
  if (!task) return task
  const comments = task.comments || []
  if (comments.some((item) => item.id === comment.id)) return task
  return { ...task, comments: [...comments, comment] }
}

function replaceComment(task: Task | undefined, comment: TaskComment): Task | undefined {
  if (!task) return task
  const comments = task.comments || []
  return {
    ...task,
    comments: comments.map((item) => item.id === comment.id ? comment : item),
  }
}

function removeComment(task: Task | undefined, commentId: Id): Task | undefined {
  if (!task) return task
  return {
    ...task,
    comments: (task.comments || []).filter((item) => item.id !== commentId),
  }
}

export function useTask(id: Id | null | undefined) {
  return useQuery({
    queryKey: taskQueryKey(id),
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
      queryClient.invalidateQueries({ queryKey: taskQueryKey(id) })
      queryClient.invalidateQueries({ queryKey: ['tasks', id, 'history'] })
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
    onSuccess: (res) => {
      if (res.data) {
        queryClient.setQueryData<Task | undefined>(
          taskQueryKey(taskId),
          (task) => appendComment(task, res.data),
        )
      }
      queryClient.invalidateQueries({ queryKey: taskQueryKey(taskId) })
    },
  })
}

export function useUpdateTaskComment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }: UpdateCommentVariables) =>
      taskService.updateComment(taskId as Id, commentId, { content }),
    onSuccess: (res) => {
      if (res.data) {
        queryClient.setQueryData<Task | undefined>(
          taskQueryKey(taskId),
          (task) => replaceComment(task, res.data),
        )
      }
      queryClient.invalidateQueries({ queryKey: taskQueryKey(taskId) })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to update comment')),
  })
}

export function useDeleteTaskComment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: Id) => taskService.deleteComment(taskId as Id, commentId),
    onSuccess: (_res, commentId) => {
      queryClient.setQueryData<Task | undefined>(
        taskQueryKey(taskId),
        (task) => removeComment(task, commentId),
      )
      queryClient.invalidateQueries({ queryKey: taskQueryKey(taskId) })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to delete comment')),
  })
}

export function useUpdateTask(id: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => taskService.update(id as Id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKey(id) })
      queryClient.invalidateQueries({ queryKey: ['tasks', id, 'history'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board'] })
    },
    onError: (err: unknown) => toast.error(getTaskWriteErrorMessage(err, 'Failed to update task')),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),
    onSuccess: (res) => {
      toast.success('Task created')
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
      if (res.data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'board', res.data.projectId] })
      }
    },
    onError: (err: unknown) => toast.error(getTaskWriteErrorMessage(err, 'Failed to create task')),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => taskService.remove(id),
    onSuccess: (_res, id) => {
      toast.success('Task deleted')
      queryClient.removeQueries({ queryKey: taskQueryKey(id) })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'board'] })
      queryClient.invalidateQueries({ queryKey: ['sprint-board'] })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to delete task')),
  })
}

export function useUploadTaskAttachment(taskId: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => taskService.uploadAttachment(taskId as Id, file),
    onSuccess: () => {
      toast.success('Attachment uploaded')
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'history'] })
      queryClient.invalidateQueries({ queryKey: taskQueryKey(taskId) })
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
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'history'] })
      queryClient.invalidateQueries({ queryKey: taskQueryKey(taskId) })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, 'Failed to delete attachment')),
  })
}
