import type { Id, UserPublicView } from '@/types'

export type MentionUserMap = Record<string, UserPublicView>

export type MentionPart =
  | { type: 'text'; value: string }
  | { type: 'mention'; id: string; token: string; user?: UserPublicView | undefined }

export const MENTION_TOKEN_PATTERN = /@\[uid:(\d+)\]/g

export function mentionToken(userId: Id) {
  return `@[uid:${userId}]`
}

export function mentionKey(userId: Id) {
  return String(userId)
}

export function mentionDisplayName(user?: UserPublicView | null | undefined, fallback?: string) {
  return user?.fullName || user?.email || fallback || 'Unknown user'
}

export function parseMentionContent(
  content: string | null | undefined,
  mentions: MentionUserMap | null | undefined = {},
): MentionPart[] {
  if (!content) return []

  const parts: MentionPart[] = []
  const mentionRe = new RegExp(MENTION_TOKEN_PATTERN)
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = mentionRe.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }

    const id = match[1] ?? ''
    const token = match[0] ?? mentionToken(id)
    const user = mentions?.[id]
    parts.push({ type: 'mention', id, token, user })
    lastIndex = match.index + token.length
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: content }]
}
