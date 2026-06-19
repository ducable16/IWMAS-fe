import type { ReactNode } from 'react'
import type { Id, TaskComment } from '@/types'

export type AvatarSize = 'xs' | 'sm' | 'md'
export type EditableField = 'assignee' | 'priority' | 'type' | 'startDate' | 'dueDate' | 'estimate'
export interface AvatarProps {
  name?: string | null | undefined
  avatarUrl?: string | null | undefined
  size?: AvatarSize
}

export interface DetailRowProps {
  label: ReactNode
  children: ReactNode
}

export interface StatusDropdownProps {
  current: string
  taskId?: Id | null
  canChange?: boolean
}

export interface HistoryTabProps {
  taskId?: Id | null | undefined
}

export interface CommentItemProps {
  comment: TaskComment
  taskId?: Id | null | undefined
  currentUserId?: Id | null | undefined
  projectId?: Id | null | undefined
}

export interface CommentsTabProps {
  taskId?: Id | null | undefined
  comments?: TaskComment[] | undefined
  projectId?: Id | null | undefined
}
