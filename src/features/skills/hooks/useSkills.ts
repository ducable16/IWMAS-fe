import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { employeeSkillService } from '@/features/members/services/memberService'
import { skillCategoryService, skillService } from '../services/skillService'
import { getErrorMessage, getApiErrorCode } from '@/utils/apiError'
import {
  ERR_CREATE_SKILL,
  ERR_UPDATE_SKILL,
  ERR_DELETE_SKILL,
  ERR_CREATE_CATEGORY,
  ERR_UPDATE_CATEGORY,
  ERR_DELETE_CATEGORY,
  ERR_ADD_EMP_SKILL,
  ERR_UPDATE_EMP_SKILL,
  ERR_REMOVE_EMP_SKILL,
  ERR_CATEGORY_HAS_SKILLS,
  ERR_SKILL_HAS_TASKS,
  ERR_SKILL_HAS_MEMBERS,
} from '@/utils/errorMessages'
import { ERROR_CODES } from '@/constants/errorCodes'
import type {
  EmployeeSkillRequest,
  Id,
  SkillCategoryRequest,
  SkillMembersQuery,
  SkillQuery,
  SkillRequest,
} from '@/types'

export const skillKeys = {
  all: ['skills'] as const,
  list: (params: SkillQuery = {}) => ['skills', 'list', params] as const,
  categories: () => ['skills', 'categories'] as const,
  detail: (id: Id | null | undefined) => ['skills', 'detail', id] as const,
  members: (id: Id | null | undefined, params: SkillMembersQuery = {}) =>
    ['skills', 'members', id, params] as const,
  stats: (id: Id | null | undefined) => ['skills', 'stats', id] as const,
}

export const skillCategoryKeys = {
  all: ['skill-categories'] as const,
  list: () => ['skill-categories', 'list'] as const,
  detail: (id: Id | null | undefined) => ['skill-categories', 'detail', id] as const,
}

export const employeeSkillKeys = {
  all: ['employee-skills'] as const,
  mine: () => ['employee-skills', 'me'] as const,
  user: (userId: Id | null | undefined) => ['employee-skills', 'user', userId] as const,
}

export function useSkills(params: SkillQuery = {}) {
  return useQuery({
    queryKey: skillKeys.list(params),
    queryFn: async () => {
      const res = await skillService.getAll(params)
      return res.data
    },
    staleTime: 60_000,
  })
}

export function useSkillCategories() {
  return useQuery({
    queryKey: skillCategoryKeys.list(),
    queryFn: async () => {
      const res = await skillCategoryService.getAll()
      return res.data
    },
    staleTime: 120_000,
  })
}

export function useSkillMembers(
  skillId: Id | null | undefined,
  params: SkillMembersQuery = {},
  enabled = true,
) {
  return useQuery({
    queryKey: skillKeys.members(skillId, params),
    queryFn: async () => {
      const res = await skillService.getMembers(skillId as Id, params)
      return res.data
    },
    enabled: !!skillId && enabled,
    staleTime: 30_000,
  })
}

export function useSkillStats(skillId: Id | null | undefined, enabled = true) {
  return useQuery({
    queryKey: skillKeys.stats(skillId),
    queryFn: async () => {
      const res = await skillService.getStats(skillId as Id)
      return res.data
    },
    enabled: !!skillId && enabled,
    staleTime: 30_000,
  })
}

export function useCreateSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SkillRequest) => skillService.create(data),
    onSuccess: () => {
      toast.success('Skill created')
      queryClient.invalidateQueries({ queryKey: skillKeys.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_CREATE_SKILL)),
  })
}

export function useUpdateSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: Id; data: SkillRequest }) => skillService.update(id, data),
    onSuccess: (_res, variables) => {
      toast.success('Skill updated')
      queryClient.invalidateQueries({ queryKey: skillKeys.all })
      queryClient.invalidateQueries({ queryKey: skillKeys.detail(variables.id) })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPDATE_SKILL)),
  })
}

export function useDeleteSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: Id) => skillService.remove(id),
    onMutate: () => toast.loading('Deleting skill...'),
    onSuccess: (_res, _variables, toastId) => {
      toast.success('Skill deleted', toastId ? { id: toastId } : undefined)
      queryClient.invalidateQueries({ queryKey: skillKeys.all })
    },
    onError: (err: unknown, _variables, toastId) => {
      const code = getApiErrorCode(err)
      const fallback =
        code === ERROR_CODES.SKILL_HAS_TASK_REQUIREMENTS  ? ERR_SKILL_HAS_TASKS   :
        code === ERROR_CODES.SKILL_HAS_MEMBER_ASSIGNMENTS ? ERR_SKILL_HAS_MEMBERS :
        ERR_DELETE_SKILL

      toast.error(getErrorMessage(err, fallback), toastId ? { id: toastId } : undefined)
    },
  })
}

export function useCreateSkillCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SkillCategoryRequest) => skillCategoryService.create(data),
    onSuccess: () => {
      toast.success('Category created')
      queryClient.invalidateQueries({ queryKey: skillCategoryKeys.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_CREATE_CATEGORY)),
  })
}

export function useUpdateSkillCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: Id; data: SkillCategoryRequest }) =>
      skillCategoryService.update(id, data),
    onSuccess: (_res, variables) => {
      toast.success('Category updated')
      queryClient.invalidateQueries({ queryKey: skillCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: skillCategoryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: skillKeys.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPDATE_CATEGORY)),
  })
}

export function useDeleteSkillCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: Id) => skillCategoryService.remove(id),
    onMutate: () => toast.loading('Deleting category...'),
    onSuccess: (_res, _variables, toastId) => {
      toast.success('Category deleted', toastId ? { id: toastId } : undefined)
      queryClient.invalidateQueries({ queryKey: skillCategoryKeys.all })
      queryClient.invalidateQueries({ queryKey: skillKeys.all })
    },
    onError: (err: unknown, _variables, toastId) => {
      const code = getApiErrorCode(err)
      const fallback =
        code === ERROR_CODES.SKILL_CATEGORY_HAS_SKILLS ? ERR_CATEGORY_HAS_SKILLS :
        ERR_DELETE_CATEGORY

      toast.error(getErrorMessage(err, fallback), toastId ? { id: toastId } : undefined)
    },
  })
}

export function useMySkills() {
  return useQuery({
    queryKey: employeeSkillKeys.mine(),
    queryFn: async () => {
      const res = await employeeSkillService.getMine()
      return res.data
    },
    staleTime: 30_000,
  })
}

export function useUserSkills(userId: Id | null | undefined) {
  return useQuery({
    queryKey: employeeSkillKeys.user(userId),
    queryFn: async () => {
      const res = await employeeSkillService.getByUser(userId as Id)
      return res.data
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}

export function useAddUserSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: Id; data: EmployeeSkillRequest }) =>
      employeeSkillService.addForUser(userId, data),
    onSuccess: (_res, variables) => {
      toast.success('Skill added')
      queryClient.invalidateQueries({ queryKey: employeeSkillKeys.user(variables.userId) })
      queryClient.invalidateQueries({ queryKey: employeeSkillKeys.mine() })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_ADD_EMP_SKILL)),
  })
}

export function useUpdateUserSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      employeeSkillId,
      data,
    }: {
      userId: Id
      employeeSkillId: Id
      data: EmployeeSkillRequest
    }) => employeeSkillService.updateForUser(userId, employeeSkillId, data),
    onSuccess: (_res, variables) => {
      toast.success('Skill updated')
      queryClient.invalidateQueries({ queryKey: employeeSkillKeys.user(variables.userId) })
      queryClient.invalidateQueries({ queryKey: employeeSkillKeys.mine() })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_UPDATE_EMP_SKILL)),
  })
}

export function useRemoveUserSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, employeeSkillId }: { userId: Id; employeeSkillId: Id }) =>
      employeeSkillService.removeForUser(userId, employeeSkillId),
    onSuccess: (_res, variables) => {
      toast.success('Skill removed')
      queryClient.invalidateQueries({ queryKey: employeeSkillKeys.user(variables.userId) })
      queryClient.invalidateQueries({ queryKey: employeeSkillKeys.mine() })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, ERR_REMOVE_EMP_SKILL)),
  })
}
