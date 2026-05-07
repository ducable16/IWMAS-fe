import { useState, useEffect } from 'react'
import { X, Loader2, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useCreateProject, useUpdateProject } from '../hooks/useProjects'
import { useMembers } from '@/features/members/hooks/useMembers'
import {
  PROJECT_STATUS_LABEL,
  toOptions,
} from '@/constants/enums'

/**
 * Modal for §3.4 Create Project and §3.5 Update Project.
 *
 * Props:
 *   open     — boolean
 *   project  — null (create) | ProjectResponse (edit)
 *   onClose  — () => void
 */

const BLANK = {
  name:        '',
  code:        '',
  description: '',
  status:      'PLANNING',

  startDate:   '',
  endDate:     '',
  managerId:   '',
}

const STATUS_OPTIONS   = toOptions(PROJECT_STATUS_LABEL)



export default function ProjectFormModal({ open, project, onClose }) {
  const isEdit = !!project
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})

  const { data: membersData } = useMembers()
  const managers = (membersData?.members ?? []).filter(
    (u) => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN',
  )

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const isPending = createProject.isPending || updateProject.isPending

  // Populate form when editing
  useEffect(() => {
    if (!open) return
    if (project) {
      setForm({
        name:        project.name        || '',
        code:        project.code        || '',
        description: project.description || '',
        status:      project.status      || 'PLANNING',

        startDate:   project.startDate   || '',
        endDate:     project.endDate     || '',
        managerId:   project.managerId   ? String(project.managerId) : '',
      })
    } else {
      setForm(BLANK)
    }
    setErrors({})
  }, [open, project])

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim())    next.name      = 'Project name is required.'
    if (!form.managerId)      next.managerId = 'Manager is required.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      name:        form.name.trim(),
      code:        form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      status:      form.status,

      startDate:   form.startDate || undefined,
      endDate:     form.endDate   || undefined,
      managerId:   Number(form.managerId),
    }

    if (isEdit) {
      updateProject.mutate({ id: project.id, data: payload }, { onSuccess: onClose })
    } else {
      createProject.mutate(payload, { onSuccess: onClose })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-[500px] bg-bg-surface border border-border rounded-xl shadow-card overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle bg-bg-subtle/30">
          <h2 className="text-[14px] font-semibold text-text-primary tracking-tight">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Name */}
          <input
            autoFocus
            value={form.name}
            onChange={set('name')}
            placeholder="Project name *"
            className={clsx('input-field w-full text-[14px]', errors.name && 'input-field-error')}
          />

          {/* Code and Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Project Code</label>
              <input
                value={form.code}
                onChange={set('code')}
                placeholder="e.g. RTP (optional)"
                className={clsx('input-field w-full text-[12.5px]', errors.code && 'input-field-error')}
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={set('status')}
                className="input-select w-full text-[12.5px]"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Manager */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Project Manager *</label>
            <select
              value={form.managerId}
              onChange={set('managerId')}
              className={clsx('input-select w-full text-[12.5px]', errors.managerId && 'input-field-error')}
            >
              <option value="">Select a manager…</option>
              {managers.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={set('startDate')}
                className="input-field w-full text-[12.5px]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={set('endDate')}
                className="input-field w-full text-[12.5px]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of the project…"
              rows={3}
              className="input-field w-full resize-none text-[12.5px] leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost text-[13px]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || !form.managerId || isPending}
              className="btn-primary text-[13px] gap-1.5 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {!isPending && !isEdit && <Plus className="w-3.5 h-3.5" strokeWidth={2} />}
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
