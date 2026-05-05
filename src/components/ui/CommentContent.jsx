import clsx from 'clsx'

/**
 * Renders a comment's text content, parsing @mention tokens and highlighting them.
 *
 * @mention format stored in the DB: "@Nguyen Van A" (full name, may contain spaces and
 * Vietnamese characters). The regex matches:
 *   - Starts with '@'
 *   - Followed by one or more words (Latin + Vietnamese Unicode range À-ỹ)
 *   - Each word separated by a single space
 *   - Terminated by double-space, newline, end-of-string, or another '@'
 *
 * Props:
 *   content   — raw comment string from the server
 *   className — optional additional classes on the wrapper
 */
export default function CommentContent({ content, className }) {
  if (!content) return null

  const parts = parseMentions(content)

  return (
    <p className={clsx('text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed', className)}>
      {parts.map((part, i) =>
        part.type === 'mention' ? (
          <MentionBadge key={i} name={part.value} />
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </p>
  )
}

function MentionBadge({ name }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-0.5',
        'text-accent font-semibold rounded-md',
        'bg-accent/10 px-1 py-0 text-[12.5px]',
        'border border-accent/15',
        'cursor-default select-text',
      )}
      title={name}
    >
      @{name}
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
function parseMentions(text) {
  // Regex captures @mention groups.
  // [\w\u00C0-\u1EF9]  covers A-Z, a-z, 0-9, _, and the full Vietnamese unicode block.
  // The name can have internal spaces as long as each word starts with a name char.
  const MENTION_RE = /@([\w\u00C0-\u1EF9]+(?:\s[\w\u00C0-\u1EF9]+)*)/g

  const parts = []
  let lastIndex = 0
  let match

  while ((match = MENTION_RE.exec(text)) !== null) {
    // Text before this mention
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    // The mention itself (without the '@' prefix — badge renders it)
    parts.push({ type: 'mention', value: match[1] })
    lastIndex = match.index + match[0].length
  }

  // Remaining text after the last mention
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }]
}
