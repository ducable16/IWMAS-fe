import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useUpdateTaskComment, useDeleteTaskComment } from '@/features/tasks/hooks/useTask'
import CommentContent from '@/components/ui/CommentContent'
import { Avatar } from './Avatar'
import { fmtDateTime } from '@/utils/date'
import type { CommentItemProps } from './taskDetail.types'

export function CommentItem({ comment, taskId, currentUserId, mentionMap }: CommentItemProps) {
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState('')
  const [confirming, setConfirming] = useState(false)

  const { mutate: updateComment, isPending: isUpdating } = useUpdateTaskComment(taskId)
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteTaskComment(taskId)

  const isOwn = comment.author?.id === currentUserId

  const startEdit = () => {
    setDraft(comment.content || '')
    setEditing(true)
    setConfirming(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft('')
  }

  const submitEdit = () => {
    const trimmed = draft.trim()
    if (!trimmed || isUpdating) return
    updateComment(
      { commentId: comment.id, content: trimmed },
      { onSuccess: () => setEditing(false) },
    )
  }

  const confirmDelete = () => {
    deleteComment(comment.id, { onSuccess: () => setConfirming(false) })
  }

  return (
    <div className="flex items-start gap-3 group">
      <Avatar name={comment.author?.fullName} avatarUrl={comment.author?.avatarUrl} size="sm" />
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-text-primary">
              {comment.author?.fullName || 'Unknown'}
            </span>
            <span className="text-[11px] text-text-muted">
              {fmtDateTime(comment.createdAt)}
              {comment.updatedAt !== comment.createdAt && (
                <span className="ml-1 italic">(edited)</span>
              )}
            </span>
          </div>

          {/* Actions — only visible when hovering and isOwn */}
          {isOwn && !editing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={startEdit}
                className="text-[11px] text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors"
              >
                Edit
              </button>
              {!confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="text-[11px] text-text-muted hover:text-danger px-1.5 py-0.5 rounded hover:bg-danger/10 transition-colors"
                >
                  Delete
                </button>
              ) : (
                <span className="flex items-center gap-1">
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="text-[11px] text-danger font-medium px-1.5 py-0.5 rounded hover:bg-danger/10 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? '…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-[11px] text-text-muted px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content or edit textarea */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit()
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitEdit()
              }}
              rows={3}
              className="w-full text-[13px] text-text-primary bg-bg-surface border border-accent/40 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-accent leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={submitEdit}
                disabled={!draft.trim() || isUpdating}
                className="btn-primary text-[12px] px-3 py-1 flex items-center gap-1.5 disabled:opacity-40"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" strokeWidth={2.5} />}
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="btn-ghost text-[12px] px-3 py-1"
              >
                Cancel
              </button>
              <span className="text-[11px] text-text-muted ml-auto">Ctrl+Enter to save</span>
            </div>
          </div>
        ) : (
          <CommentContent content={comment.content} mentionMap={mentionMap} />
        )}
      </div>
    </div>
  )
}
