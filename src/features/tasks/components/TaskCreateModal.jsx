import { useState, useEffect } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { useCreateTask } from '@/features/tasks/hooks/useTask'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useMembers } from '@/features/members/hooks/useMembers'
import {
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_TYPES,
  TASK_TYPE_LABEL,
} from '@/constants/enums'

const EMPTY = {
  title:       '',
  description: '',
  status:      'TODO',
  priority:    'MEDIUM',
  type:        'TASK',
  projectId:   '',
  assigneeId:  '',
  dueDate:     '',
}

export default function TaskCreateModal({ open, onClose, defaultStatus, defaultProjectId }) {
  const [form, setForm] = useState(EMPTY)
  const { mutate: createTask, isPending } = useCreateTask()
  const { data: projectsData } = useProjects({ size: 100 })
  const projects = projectsData?.projects ?? []
  const { data: membersData } = useMembers({ size: 100 })
  const members = membersData?.members ?? []

  // Apply defaults whenever the modal opens
  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY,
        status:    defaultStatus    || 'TODO',
        projectId: defaultProjectId || '',
      })
    }
  }, [open, defaultStatus, defaultProjectId])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!form.title.trim() || isPending) return
    createTask(
      {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        status:      form.status,
        priority:    form.priority,
        type:        form.type,
        projectId:   form.projectId   || null,
        assigneeId:  form.assigneeId  || null,
        dueDate:     form.dueDate     || null,
      },
      { onSuccess: onClose },
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-bg-surface border border-border rounded-2xl shadow-deep w-full max-w-[520px] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-[15px] font-semibold text-text-primary">Create task</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 -mr-1">
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Title */}
          <input
            autoFocus
            value={form.title}
            onChange={e => set('title', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit() }}
            placeholder="Task title *"
            className="input-field w-full text-[14px]"
          />

          {/* Status · Priority · Type */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="input-select w-full text-[12.5px]"
              >
                {TASK_STATUSES.map(s => (
                  <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Priority</label>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="input-select w-full text-[12.5px]"
              >
                {TASK_PRIORITIES.map(p => (
                  <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Type</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="input-select w-full text-[12.5px]"
              >
                {TASK_TYPES.map(t => (
                  <option key={t} value={t}>{TASK_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project · Assignee */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Project</label>
              <select
                value={form.projectId}
                onChange={e => set('projectId', e.target.value)}
                className="input-select w-full text-[12.5px]"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Assignee</label>
              <select
                value={form.assigneeId}
                onChange={e => set('assigneeId', e.target.value)}
                className="input-select w-full text-[12.5px]"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
              className="input-field text-[12.5px]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional description…"
              rows={3}
              className="input-field w-full resize-none text-[12.5px] leading-relaxed"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost text-[13px]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || isPending}
              className="btn-primary text-[13px] gap-1.5 disabled:opacity-50"
            >
              {isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              }
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
