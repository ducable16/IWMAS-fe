import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { timeLogService, type TimeLogRangeParams } from '../services/timeLogService'
import { getErrorMessage } from '@/utils/apiError'
import { ERR_LOG_WORK, ERR_UPDATE_TIME_LOG, ERR_DELETE_TIME_LOG } from '@/utils/errorMessages'
import type { Id, TimeLogRequest } from '@/types'

function invalidateTimeLogDependents(queryClient: ReturnType<typeof useQueryClient>, taskId?: Id | null) {
  queryClient.invalidateQueries({ queryKey: ['time-logs'] })
  queryClient.invalidateQueries({ queryKey: ['workload'] })
  queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] })
  queryClient.invalidateQueries({ queryKey: ['tasks', 'search'] })
  queryClient.invalidateQueries({ queryKey: ['tasks', 'board'] })
  if (taskId) {
    queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
  }
}

export function useMyTimeLogs(params?: TimeLogRangeParams) {
  return useQuery({
    queryKey: ['time-logs', 'mine', params],
    queryFn: async () => {
      const res = await timeLogService.getMine(params)
      return Array.isArray(res.data) ? res.data : []
    },
  })
}

export function useTaskTimeLogs(taskId: Id | null | undefined) {
  return useQuery({
    queryKey: ['time-logs', 'task', taskId],
    queryFn: async () => {
      const res = await timeLogService.getByTask(taskId as Id)
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: !!taskId,
  })
}

export function useCreateTimeLog(taskId?: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TimeLogRequest) => timeLogService.create(data),
    onSuccess: (_res, variables) => {
      toast.success('Work logged')
      invalidateTimeLogDependents(queryClient, taskId ?? variables.taskId)
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_LOG_WORK)),
  })
}

export function useUpdateTimeLog(taskId?: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: Id; data: TimeLogRequest }) => timeLogService.update(id, data),
    onSuccess: (_res, variables) => {
      toast.success('Time log updated')
      invalidateTimeLogDependents(queryClient, taskId ?? variables.data.taskId)
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPDATE_TIME_LOG)),
  })
}

export function useDeleteTimeLog(taskId?: Id | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => timeLogService.remove(id),
    onSuccess: () => {
      toast.success('Time log deleted')
      invalidateTimeLogDependents(queryClient, taskId)
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_DELETE_TIME_LOG)),
  })
}
