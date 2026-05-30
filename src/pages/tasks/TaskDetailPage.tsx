import { lazy, Suspense, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Link2, Loader2, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import AttachmentsSection from '@/features/tasks/components/AttachmentsSection'
import { ActivitySection } from '@/features/tasks/components/TaskDetail/ActivitySection'
import { DetailsSidebar } from '@/features/tasks/components/TaskDetail/DetailsSidebar'
import { SectionBlock } from '@/features/tasks/components/TaskDetail/SectionBlock'
import TaskSkillRequirementsEditor, {
  toTaskSkillRequirementRequest,
} from '@/features/tasks/components/TaskSkillRequirementsEditor'
import { useDeleteTask, useTask, useUpdateTask } from '@/features/tasks/hooks/useTask'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useCan } from '@/utils/permissions'
import type { UpdateTaskRequest } from '@/types'

const DescriptionEditor = lazy(() => import('@/features/tasks/components/DescriptionEditor'))

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('comments')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleRef = useRef<HTMLTextAreaElement | null>(null)

  const { data: task, isLoading, isError, error, refetch } = useTask(id)
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(id)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()
  const user = useAuthStore((s) => s.user)
  const can = useCan()

  const isAssignee = !!user && !!task && user.id === task.assignee?.id
  const canEditTask = can.isAdmin || can.isPm || isAssignee
  const canUploadAttachments = can.isAdmin || can.isPm || can.isTm
  const canDeleteAsManager = can.isAdmin || can.isPm

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto pt-6">
        <LiveLoading label="Loading task..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[1200px] mx-auto pt-6">
        <LiveError error={error} onRetry={refetch} />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="max-w-[1200px] mx-auto pt-6">
        <LiveError error={{ message: 'Task not found' }} onRetry={refetch} />
      </div>
    )
  }

  const buildPayload = (overrides: UpdateTaskRequest = {}): UpdateTaskRequest => ({
    title: task.title,
    description: task.description || null,
    status: task.status,
    priority: task.priority,
    type: task.type,
    startDate: task.startDate || null,
    dueDate: task.dueDate || null,
    estimatedHours: task.estimatedHours || null,
    actualHours: task.actualHours || null,
    assigneeId: task.assignee?.id || null,
    labels: task.labels || [],
    projectId: task.projectId || null,
    sprint: task.sprint || null,
    skillRequirements: toTaskSkillRequirementRequest(task.skillRequirements || []),
    ...overrides,
  })

  const skillRequirements = toTaskSkillRequirementRequest(task.skillRequirements || [])

  const saveTitle = () => {
    const nextTitle = titleDraft.trim()
    if (nextTitle && nextTitle !== task.title) {
      updateTask(buildPayload({ title: nextTitle }))
    }
    setEditingTitle(false)
  }

  const handleDeleteTask = () => {
    const ok = window.confirm(`Delete task "${task.title || task.id}"?`)
    if (!ok) return
    deleteTask(task.id, {
      onSuccess: () => navigate('/tasks'),
    })
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
          Back
        </button>
        <span>/</span>
        <Link to="/tasks" className="hover:text-text-primary transition-colors">
          Tasks
        </Link>
        <span>/</span>
        <span className="text-text-primary font-mono">{task.id}</span>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-5">
          {editingTitle ? (
            <textarea
              ref={titleRef}
              autoFocus
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  saveTitle()
                }
                if (event.key === 'Escape') {
                  setEditingTitle(false)
                  setTitleDraft(task.title)
                }
              }}
              onBlur={saveTitle}
              className="w-full text-[22px] font-semibold text-text-primary leading-tight tracking-tight bg-bg-surface border border-accent/40 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-accent"
              rows={2}
            />
          ) : (
            <h1
              onClick={
                canEditTask
                  ? () => {
                      setTitleDraft(task.title || '')
                      setEditingTitle(true)
                    }
                  : undefined
              }
              title={canEditTask ? 'Click to edit' : undefined}
              className={clsx(
                'text-[22px] font-semibold text-text-primary leading-tight tracking-tight rounded-lg px-3 py-2 -mx-3 transition-colors',
                canEditTask && 'cursor-text hover:bg-bg-hover/50',
              )}
            >
              {task.title || 'Untitled task'}
            </h1>
          )}

          <div className="flex items-center gap-2">
            {(isUpdating || isDeleting) && (
              <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isDeleting ? 'Deleting...' : 'Saving...'}
              </span>
            )}
            {canDeleteAsManager && (
              <button
                type="button"
                className="btn-secondary text-[12.5px] px-2.5 py-1.5 ml-auto text-danger hover:text-danger"
                onClick={handleDeleteTask}
                disabled={isDeleting}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                Delete task
              </button>
            )}
          </div>

          <SectionBlock title="Description">
            <Suspense fallback={<LiveLoading label="Loading description editor..." />}>
              <DescriptionEditor
                taskId={task.id}
                initialContent={task.description}
                onSave={(json) => updateTask(buildPayload({ description: json }))}
                readOnly={!canEditTask}
                isSaving={isUpdating}
              />
            </Suspense>
          </SectionBlock>

          {(skillRequirements.length > 0 || canEditTask) && (
            <SectionBlock title="Skill requirements">
              <TaskSkillRequirementsEditor
                value={skillRequirements}
                onChange={(next) => updateTask(buildPayload({ skillRequirements: next }))}
                disabled={!canEditTask || isUpdating || isDeleting}
              />
            </SectionBlock>
          )}

          <AttachmentsSection
            taskId={task.id}
            canUpload={canUploadAttachments}
            canDeleteAsManager={canDeleteAsManager}
            currentUserId={user?.id}
          />

          <SectionBlock
            title="Linked items"
            actions={
              <button
                type="button"
                className="flex items-center gap-1 text-[12px] text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded-md hover:bg-bg-hover"
              >
                <Link2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                Link
              </button>
            }
          >
            <p className="text-[13px] text-text-muted italic py-1">No linked items.</p>
          </SectionBlock>

          <ActivitySection
            activeTab={activeTab}
            onTabChange={setActiveTab}
            taskId={task.id}
            comments={task.comments}
            projectId={task.projectId}
          />
        </div>

        <DetailsSidebar
          task={task}
          canEdit={canEditTask}
          onSave={(overrides) => updateTask(buildPayload(overrides))}
        />
      </div>
    </div>
  )
}
