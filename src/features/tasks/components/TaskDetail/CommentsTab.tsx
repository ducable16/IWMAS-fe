import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAddTaskComment } from '@/features/tasks/hooks/useTask'
import { useAuthStore } from '@/features/auth/store/authStore'
import MentionTextarea from '@/components/ui/MentionTextarea'
import { Avatar } from './Avatar'
import { CommentItem } from './CommentItem'
import type { CommentsTabProps } from './taskDetail.types'

export function CommentsTab({ taskId, comments = [], projectId }: CommentsTabProps) {
  const [content, setContent] = useState('')
  const { mutate, isPending } = useAddTaskComment(taskId)
  const user = useAuthStore(s => s.user)

  const handleSubmit = () => {
    if (!content.trim() || isPending) return
    mutate(content, { onSuccess: () => setContent('') })
  }

  return (
    <div className="space-y-6">
      {comments.length > 0 ? (
        <div className="space-y-5">
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              taskId={taskId}
              currentUserId={user?.id}
              projectId={projectId}
            />
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-text-muted italic">No comments yet.</p>
      )}

      <div className="flex items-start gap-3">
        <Avatar name={user?.fullName || user?.email} avatarUrl={user?.avatarUrl} size="sm" />
        <div className="flex-1 min-w-0 space-y-2">
          <MentionTextarea
            value={content}
            onChange={setContent}
            onSubmit={handleSubmit}
            projectId={projectId}
            placeholder="Add a comment... (type @ to mention)"
            rows={2}
            disabled={isPending}
          />
          <div className="flex items-center justify-end">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              className="btn-primary text-[12px] px-4 py-1.5 disabled:opacity-40"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
