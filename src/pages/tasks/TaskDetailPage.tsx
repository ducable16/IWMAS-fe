import { lazy, Suspense, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal, Link2, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import AttachmentsSection from '@/features/tasks/components/AttachmentsSection'
import { useTask, useUpdateTask } from '@/features/tasks/hooks/useTask'
import { LiveLoading, LiveError } from '@/components/feedback/LiveStateOverlay'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCan } from '@/utils/permissions'
import { DetailsSidebar } from '@/features/tasks/components/TaskDetail/DetailsSidebar'
import { ActivitySection } from '@/features/tasks/components/TaskDetail/ActivitySection'
import { SectionBlock } from '@/features/tasks/components/TaskDetail/SectionBlock'
import type { UpdateTaskRequest } from '@/types'

const DescriptionEditor = lazy(() => import('@/features/tasks/components/DescriptionEditor'))

export default function TaskDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('comments')

  // Title inline editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft]     = useState('')
  const titleRef = useRef<HTMLTextAreaElement | null>(null)

  const { data: task, isLoading, isError, error, refetch } = useTask(id)
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(id)
  const user = useAuthStore(s => s.user)
  const can  = useCan()

  // §4.8 / §4.9: ADMIN, project manager, or task assignee may edit / change status
  const isAssignee  = !!user && !!task && user.id === task.assignee?.id
  const canEditTask = can.isAdmin || can.isPm || isAssignee
  const canUploadAttachments = can.isAdmin || can.isPm || can.isTm
  const canDeleteAsManager   = can.isAdmin || can.isPm

  if (isLoading) return (
    <div className="max-w-[1200px] mx-auto pt-6"><LiveLoading label="Loading task…" /></div>
  )
  if (isError) return (
    <div className="max-w-[1200px] mx-auto pt-6"><LiveError error={error} onRetry={refetch} /></div>
  )
  if (!task) return (
    <div className="max-w-[1200px] mx-auto pt-6"><LiveError error={{ message: 'Task not found' }} onRetry={refetch} /></div>
  )

  // Build a full PUT payload, merging in any override fields
  const buildPayload = (overrides: UpdateTaskRequest = {}): UpdateTaskRequest => ({
    title:          task.title,
    description:    task.description     || null,
    status:         task.status,
    priority:       task.priority,
    type:           task.type,
    startDate:      task.startDate       || null,
    dueDate:        task.dueDate         || null,
    estimatedHours: task.estimatedHours  || null,
    actualHours:    task.actualHours     || null,
    assigneeId:     task.assignee?.id    || null,
    labels:         task.labels          || [],
    projectId:      task.projectId       || null,
    sprint:         task.sprint          || null,
    ...overrides,
  })

  const skillRequirements = task.skillRequirements ?? []

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          Back
        </button>
        <span>/</span>
        <Link to="/tasks" className="hover:text-text-primary transition-colors">Tasks</Link>
        <span>/</span>
        <span className="text-text-primary font-mono">{task?.id}</span>
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Editable title */}
          {editingTitle ? (
            <textarea
              ref={titleRef}
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  const t = titleDraft.trim()
                  if (t && t !== task.title) updateTask(buildPayload({ title: t }))
                  setEditingTitle(false)
                }
                if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(task.title) }
              }}
              onBlur={() => {
                const t = titleDraft.trim()
                if (t && t !== task.title) updateTask(buildPayload({ title: t }))
                setEditingTitle(false)
              }}
              className="w-full text-[22px] font-semibold text-text-primary leading-tight tracking-tight bg-bg-surface border border-accent/40 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-accent"
              rows={2}
            />
          ) : (
            <h1
              onClick={canEditTask ? () => { setTitleDraft(task?.title || ''); setEditingTitle(true) } : undefined}
              title={canEditTask ? 'Click to edit' : undefined}
              className={clsx(
                'text-[22px] font-semibold text-text-primary leading-tight tracking-tight rounded-lg px-3 py-2 -mx-3 transition-colors',
                canEditTask && 'cursor-text hover:bg-bg-hover/50',
              )}
            >
              {task?.title || 'Untitled task'}
            </h1>
          )}

          {/* Action strip */}
          <div className="flex items-center gap-2">
            {isUpdating && (
              <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving…
              </span>
            )}
            <button className="btn-ghost text-[12.5px] px-2.5 py-1.5 ml-auto">
              <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>

          {/* ── Description ── */}
          <SectionBlock title="Description">
            <Suspense fallback={<LiveLoading label="Loading description editor..." />}>
              <DescriptionEditor
                taskId={task.id}
                initialContent={task?.description}
                onSave={(json) => updateTask(buildPayload({ description: json }))}
                readOnly={!canEditTask}
                isSaving={isUpdating}
              />
            </Suspense>
          </SectionBlock>

          {/* ── Skill requirements ── */}
          {skillRequirements.length > 0 && (
            <SectionBlock title="Skill requirements">
              <div className="flex flex-wrap gap-2">
                {skillRequirements.map((sr) => (
                  <div
                    key={sr.id}
                    className="flex items-center gap-1.5 bg-bg-subtle border border-border-subtle rounded-md px-2.5 py-1"
                  >
                    <span className="text-[12px] font-medium text-text-primary">{sr.skillName}</span>
                    <span className="text-[11px] text-text-muted">·</span>
                    <span className="text-[11px] text-text-muted">{sr.minimumLevel}</span>
                    {sr.isRequired && (
                      <span className="text-[10px] font-semibold text-accent ml-0.5">required</span>
                    )}
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {/* ── Attachments ── */}
          <AttachmentsSection
            taskId={task.id}
            canUpload={canUploadAttachments}
            canDeleteAsManager={canDeleteAsManager}
            currentUserId={user?.id}
          />

          {/* ── Linked items ── */}
          <SectionBlock
            title="Linked items"
            actions={
              <button className="flex items-center gap-1 text-[12px] text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded-md hover:bg-bg-hover">
                <Link2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                Link
              </button>
            }
          >
            <p className="text-[13px] text-text-muted italic py-1">No linked items.</p>
          </SectionBlock>

          {/* ── Activity ── */}
          <ActivitySection
            activeTab={activeTab}
            onTabChange={setActiveTab}
            taskId={task.id}
            comments={task.comments}
            projectId={task.projectId}
          />
        </div>

        {/* ── Right sidebar ── */}
        <DetailsSidebar
          task={task}
          canEdit={canEditTask}
          onSave={(overrides) => updateTask(buildPayload(overrides))}
        />
      </div>
    </div>
  )
}
