import { Link } from 'react-router-dom'
import clsx from 'clsx'

/**
 * Renders a comment's text content, parsing @mention tokens and highlighting them.
 *
 * @mention format stored in the DB: "@Nguyen Van A" (full name, may contain spaces and
 * Vietnamese characters).
 *
 * Props:
 *   content    — raw comment string from the server
 *   mentionMap — optional Map/object: { [fullName]: userId }
 *                When provided, mention badges become clickable <Link to="/users/:id">
 *   className  — optional additional classes on the wrapper
 */
export default function CommentContent({ content, mentionMap, className }) {
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

function MentionBadge({ name, mentionMap }) {
  const userId = mentionMap?.[name] ?? mentionMap?.get?.(name) ?? null

  const cls = clsx(
    'inline-flex items-center gap-0.5',
    'text-accent font-semibold rounded-md',
    'bg-accent/10 px-1 py-0 text-[12.5px]',
    'border border-accent/15',
    'select-text',
    userId && 'cursor-pointer hover:bg-accent/20 hover:border-accent/30 transition-colors',
    !userId && 'cursor-default',
  )

  const inner = <>@{name}</>

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

/**
 * Parse `content` into an array of { type: 'text' | 'mention', value: string }.
 *
 * Strategy:
 *   Split by a regex that captures mention tokens.
 *   A mention token: '@' followed by one or more name-words.
 *   Name-word chars: letters (including Vietnamese A-ỹ), digits, underscore, hyphen.
 *   Words in a name are separated by a single space followed by another name-word char.
 */
// mentionMap is passed in so we can resolve greedy multi-word matches back to a
// known name. Without this, "@Nguyen Van A vui long review" would be parsed as
// a single unknown mention token instead of name="Nguyen Van A" + text=" vui long review".
function parseMentions(text, mentionMap = {}) {
  // [\w\u00C0-\u1EF9] covers A-Z, a-z, 0-9, _, and the full Vietnamese unicode block.
  const MENTION_RE = /@([\w\u00C0-\u1EF9]+(?:\s[\w\u00C0-\u1EF9]+)*)/g

  const parts = []
  let lastIndex = 0
  let match

  while ((match = MENTION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    // Regex is greedy \u2014 it captures all following words, not just the name.
    // Walk backwards from the full match to find the longest prefix that is a
    // known name in mentionMap. Falls back to the full greedy string (unknown
    // user badge) when mentionMap is empty or has no match.
    const greedyName = match[1]
    let resolvedName = greedyName
    const words = greedyName.split(' ')
    for (let len = words.length; len >= 1; len--) {
      const candidate = words.slice(0, len).join(' ')
      if (mentionMap[candidate] !== undefined) {
        resolvedName = candidate
        break
      }
    }

    parts.push({ type: 'mention', value: resolvedName })

    // Advance past only the resolved name (@ + name), not the full greedy match,
    // so the trailing words remain available as plain text.
    lastIndex = match.index + 1 + resolvedName.length
    MENTION_RE.lastIndex = lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }]
}
