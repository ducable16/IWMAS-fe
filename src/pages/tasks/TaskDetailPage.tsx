import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useConfirm } from '@/hooks/useConfirm'
import AttachmentsSection from '@/features/tasks/components/AttachmentsSection'
import { ActivitySection } from '@/features/tasks/components/TaskDetail/ActivitySection'
import { DetailsSidebar } from '@/features/tasks/components/TaskDetail/DetailsSidebar'
import { SectionBlock } from '@/features/tasks/components/TaskDetail/SectionBlock'
import TaskSkillRequirementsEditor, {
  toTaskSkillRequirementRequest,
} from '@/features/tasks/components/TaskSkillRequirementsEditor'
import { useDeleteTask, useTask, useUpdateTask } from '@/features/tasks/hooks/useTask'
import { useUserSkills } from '@/features/skills/hooks/useSkills'
import {
  getMissingRequiredSkills,
  getRequiredSkillRequirements,
  normalizeTaskSkillRequirements,
  serializeRequiredSkills,
} from '@/features/tasks/utils/taskSkillRequirements'
import { LiveError, LiveLoading } from '@/components/feedback/LiveStateOverlay'
import { useAuthStore } from '@/features/auth/store/authStore'
import { canModifyTask, useCan } from '@/utils/permissions'
import type { TaskSkillRequirementRequest, UpdateTaskRequest } from '@/types'

const DescriptionEditor = lazy(() => import('@/features/tasks/components/DescriptionEditor'))

function areSkillRequirementsEqual(
  left: TaskSkillRequirementRequest[],
  right: TaskSkillRequirementRequest[],
) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('comments')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [skillDraft, setSkillDraft] = useState<TaskSkillRequirementRequest[]>([])
  const titleRef = useRef<HTMLTextAreaElement | null>(null)

  const { data: task, isLoading, isError, error, refetch } = useTask(id)
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(id)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()
  const user = useAuthStore((s) => s.user)
  const can = useCan()
  const { confirm, dialog: confirmDialog } = useConfirm()

  const canEditTask = canModifyTask(
    user?.role,
    user?.id,
    task?.assignee?.id ?? task?.assigneeId,
  )
  const canUploadAttachments = can.isPm || can.isTm
  const canDeleteAsManager = can.isPm
  const skillRequirements = toTaskSkillRequirementRequest(task?.skillRequirements || [])
  const isSkillDraftDirty = !areSkillRequirementsEqual(skillDraft, skillRequirements)
  const hasIncompleteSkillDraft = skillDraft.some((item) => !String(item.skillId ?? '').trim())
  const requiredSkillDraft = getRequiredSkillRequirements(skillDraft)
  const shouldValidateSkillDraftAssignee = !!task?.assignee?.id && requiredSkillDraft.length > 0
  const draftAssigneeSkills = useUserSkills(
    shouldValidateSkillDraftAssignee ? task?.assignee?.id : null,
  )
  const missingRequiredSkillDraft = shouldValidateSkillDraftAssignee
    ? getMissingRequiredSkills(draftAssigneeSkills.data, skillDraft)
    : []
  const isCheckingSkillDraftAssignee = shouldValidateSkillDraftAssignee && draftAssigneeSkills.isLoading
  const hasSkillDraftMismatch = shouldValidateSkillDraftAssignee
    && !isCheckingSkillDraftAssignee
    && missingRequiredSkillDraft.length > 0

  useEffect(() => {
    if (!task) return
    setSkillDraft(toTaskSkillRequirementRequest(task.skillRequirements || []))
  }, [task])

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
    priority: task.priority,
    type: task.type,
    ...(task.startDate ? { startDate: task.startDate } : {}),
    ...(task.dueDate ? { dueDate: task.dueDate } : {}),
    estimatedHours: task.estimatedHours || null,
    assigneeId: task.assignee?.id || null,
    ...(task.projectId ? { projectId: task.projectId } : {}),
    skillRequirements: toTaskSkillRequirementRequest(task.skillRequirements || []),
    ...overrides,
  })

  const saveTitle = () => {
    const nextTitle = titleDraft.trim()
    if (nextTitle && nextTitle !== task.title) {
      updateTask(buildPayload({ title: nextTitle }))
    }
    setEditingTitle(false)
  }

  const handleDeleteTask = async () => {
    const ok = await confirm({
      title: `Delete "${task.title || task.id}"?`,
      description: 'This task and all its data will be permanently removed.',
      confirmLabel: 'Delete task',
    })
    if (!ok) return
    deleteTask(task.id, {
      onSuccess: () => navigate('/tasks'),
    })
  }

  const saveSkillRequirements = () => {
    if (
      !isSkillDraftDirty
      || hasIncompleteSkillDraft
      || isCheckingSkillDraftAssignee
      || hasSkillDraftMismatch
    ) return
    updateTask(buildPayload({ skillRequirements: normalizeTaskSkillRequirements(skillDraft) }))
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

      <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-start">
        <div className="w-full flex-1 min-w-0 space-y-5">
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

          {(skillDraft.length > 0 || canEditTask) && (
            <SectionBlock
              title="Skill requirements"
              actions={canEditTask && (
                <>
                  <button
                    type="button"
                    className="btn-ghost text-[12px] px-2 py-1 disabled:opacity-50"
                    onClick={() => setSkillDraft(skillRequirements)}
                    disabled={!isSkillDraftDirty || isUpdating || isDeleting}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn-primary text-[12px] px-3 py-1 disabled:opacity-50"
                    onClick={saveSkillRequirements}
                    disabled={
                      !isSkillDraftDirty
                      || isUpdating
                      || isDeleting
                      || hasIncompleteSkillDraft
                      || isCheckingSkillDraftAssignee
                      || hasSkillDraftMismatch
                    }
                  >
                    Save
                  </button>
                </>
              )}
            >
              <TaskSkillRequirementsEditor
                value={skillDraft}
                onChange={setSkillDraft}
                disabled={!canEditTask || isUpdating || isDeleting}
              />
              {hasSkillDraftMismatch && (
                <p className="mt-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-[12px] text-danger">
                  Current assignee does not meet the draft required skills. Change assignee, unassign, or adjust requirements before saving.
                </p>
              )}
              {hasIncompleteSkillDraft && (
                <p className="mt-2 rounded-md border border-border-subtle bg-bg-subtle px-3 py-2 text-[12px] text-text-muted">
                  Select a skill before saving this requirement.
                </p>
              )}
            </SectionBlock>
          )}

          <AttachmentsSection
            taskId={task.id}
            canUpload={canUploadAttachments}
            canDeleteAsManager={canDeleteAsManager}
            currentUserId={user?.id}
          />

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
          requiredSkills={serializeRequiredSkills(skillDraft)}
          onSave={(overrides) => updateTask(buildPayload(overrides))}
        />
      </div>
      {confirmDialog}
    </div>
  )
}
