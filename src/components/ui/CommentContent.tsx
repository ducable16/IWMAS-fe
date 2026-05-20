import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { Id } from '@/types'

type MentionMap = Record<string, Id> | Map<string, Id>

interface CommentContentProps {
  content?: string | null
  mentionMap?: MentionMap | null | undefined
  className?: string | undefined
}

interface MentionPart {
  type: 'text' | 'mention'
  value: string
}

function mentionLookup(mentionMap: MentionMap | null | undefined, name: string): Id | null {
  if (!mentionMap) return null
  if (mentionMap instanceof Map) return mentionMap.get(name) ?? null
  return mentionMap[name] ?? null
}

export default function CommentContent({ content, mentionMap, className }: CommentContentProps) {
  if (!content) return null

  const parts = parseMentions(content, mentionMap || {})

  return (
    <p className={clsx('text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed', className)}>
      {parts.map((part, i) =>
        part.type === 'mention' ? (
          <MentionBadge key={i} name={part.value} mentionMap={mentionMap} />
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </p>
  )
}

function MentionBadge({ name, mentionMap }: { name: string; mentionMap?: MentionMap | null | undefined }) {
  const userId = mentionLookup(mentionMap, name)

  const cls = clsx(
    'inline-flex items-center gap-0.5',
    'text-accent font-semibold rounded-md',
    'bg-accent/10 px-1 py-0 text-[12.5px]',
    'border border-accent/15',
    'select-text',
    userId && 'cursor-pointer hover:bg-accent/20 hover:border-accent/30 transition-colors',
    !userId && 'cursor-default',
  )

  const inner: ReactNode = <>@{name}</>

  if (userId) {
    return (
      <Link to={`/users/${userId}`} className={cls} title={`View ${name}'s profile`}>
        {inner}
      </Link>
    )
  }

  return (
    <span className={cls} title={name}>
      {inner}
    </span>
  )
}

function parseMentions(text: string, mentionMap: MentionMap = {}): MentionPart[] {
  const mentionRe = /@([\w\u00C0-\u1EF9]+(?:\s[\w\u00C0-\u1EF9]+)*)/g
  const parts: MentionPart[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = mentionRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    const greedyName = match[1] ?? ''
    if (!greedyName) continue
    let resolvedName = greedyName
    const words = greedyName.split(' ')
    for (let len = words.length; len >= 1; len--) {
      const candidate = words.slice(0, len).join(' ')
      if (mentionLookup(mentionMap, candidate) !== null) {
        resolvedName = candidate
        break
      }
    }

    parts.push({ type: 'mention', value: resolvedName })
    lastIndex = match.index + 1 + resolvedName.length
    mentionRe.lastIndex = lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }]
}
