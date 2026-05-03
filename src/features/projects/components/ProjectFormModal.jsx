import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { useCreateProject, useUpdateProject } from '../hooks/useProjects'
import { useMembers } from '@/features/members/hooks/useMembers'
import {
  PROJECT_STATUS_LABEL,
  PROJECT_PRIORITY_LABEL,
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
const PRIORITY_OPTIONS = toOptions(PROJECT_PRIORITY_LABEL)

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-text-secondary mb-1">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-danger mt-0.5">{error}</p>}
    </div>
  )
}

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
        priority:    project.priority    || 'MEDIUM',

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
      priority:    form.priority,

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-surface border border-border rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-[15px] font-semibold text-text-primary">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <Field label="Project Name" required error={errors.name}>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. RoamTrip Platform"
              className={clsx('field', errors.name && 'field-error')}
            />
          </Field>

          {/* Code */}
          <Field label="Project Code" error={errors.code}>
            <input
              value={form.code}
              onChange={set('code')}
              placeholder="e.g. RTP (optional, unique)"
              className="field"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of the project…"
              rows={2}
              className="field resize-none"
            />
          </Field>

          {/* Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className="field">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select value={form.priority} onChange={set('priority')} className="field">
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date">
              <input type="date" value={form.startDate} onChange={set('startDate')} className="field" />
            </Field>
            <Field label="End Date">
              <input type="date" value={form.endDate} onChange={set('endDate')} className="field" />
            </Field>
          </div>

          {/* Manager */}
          <Field label="Project Manager" required error={errors.managerId}>
            <select
              value={form.managerId}
              onChange={set('managerId')}
              className={clsx('field', errors.managerId && 'field-error')}
            >
              <option value="">Select a manager…</option>
              {managers.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
