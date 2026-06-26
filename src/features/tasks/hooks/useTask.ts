import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { taskService } from '../services/taskService'
import { getErrorMessage, getApiErrorCode } from '@/utils/apiError'
import {
  ERR_UPDATE_COMMENT,
  ERR_DELETE_COMMENT,
  ERR_UPDATE_TASK,
  ERR_CREATE_TASK,
  ERR_DELETE_TASK,
  ERR_UPLOAD_ATTACHMENT,
  ERR_DELETE_ATTACHMENT,
  ERR_TASK_DATE_REVERSED,
  ERR_TASK_DATE_REQUIRED,
  ERR_TASK_MANAGER_ASSIGNEE,
  ERR_TASK_SKILL_MISMATCH,
} from '@/utils/errorMessages'
import { ERROR_CODES } from '@/constants/errorCodes'
import { invalidateTaskPlanningQueries } from '../utils/planningQueryInvalidation'
import type {
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

const getTaskWriteErrorMessage = (err: unknown, fallback: string) => {
  const code = getApiErrorCode(err)
  if (code === ERROR_CODES.TASK_DATE_REVERSED)          return getErrorMessage(err, ERR_TASK_DATE_REVERSED)
  if (code === ERROR_CODES.TASK_DATE_REQUIRED)          return getErrorMessage(err, ERR_TASK_DATE_REQUIRED)
  if (code === ERROR_CODES.TASK_ASSIGNEE_SKILL_MISSING) return getErrorMessage(err, ERR_TASK_SKILL_MISMATCH)
  if (code === ERROR_CODES.TASK_MANAGER_NOT_ASSIGNABLE) return getErrorMessage(err, ERR_TASK_MANAGER_ASSIGNEE)
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
      invalidateTaskPlanningQueries(queryClient)
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPDATE_COMMENT)),
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_DELETE_COMMENT)),
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
      invalidateTaskPlanningQueries(queryClient)
    },
    onError: (err: unknown) => toast.error(getTaskWriteErrorMessage(err, ERR_UPDATE_TASK)),
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
      invalidateTaskPlanningQueries(queryClient)
    },
    onError: (err: unknown) => toast.error(getTaskWriteErrorMessage(err, ERR_CREATE_TASK)),
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
      invalidateTaskPlanningQueries(queryClient)
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_DELETE_TASK)),
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPLOAD_ATTACHMENT)),
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
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_DELETE_ATTACHMENT)),
  })
}
