import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { mentionDisplayName, parseMentionContent } from '@/utils/mentions'
import type { UserPublicView } from '@/types'

interface CommentContentProps {
  content?: string | null
  mentions?: Record<string, UserPublicView> | null | undefined
  className?: string | undefined
}

export default function CommentContent({ content, mentions, className }: CommentContentProps) {
  if (!content) return null

  const parts = parseMentionContent(content, mentions || {})

  return (
    <p className={clsx('text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed', className)}>
      {parts.map((part, i) =>
        part.type === 'mention' && part.user ? (
          <MentionBadge key={`${part.id}-${i}`} user={part.user} />
        ) : (
          <span key={i}>{part.type === 'mention' ? part.token : part.value}</span>
        ),
      )}
    </p>
  )
}

function MentionBadge({ user }: { user: UserPublicView }) {
  const name = mentionDisplayName(user)
  const cls = clsx(
    'inline text-accent font-semibold',
    'select-text cursor-pointer hover:underline underline-offset-2 transition-colors',
  )

  return (
    <Link to={`/users/${user.id}`} className={cls} title={`View ${name}'s profile`}>
      {name}
    </Link>
  )
}
