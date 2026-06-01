import { ChangeEvent, ReactNode } from 'react'
import { Calendar, Lock } from 'lucide-react'
import {
  toOptions,
  PROJECT_STATUS_LABEL,
} from '@/constants/enums'
import { fmtDate } from '@/utils/date'
import { ProjectStatusBadge } from '@/components/ui/Badge'
import type { Project } from '@/types'

const STATUS_OPTIONS = toOptions(PROJECT_STATUS_LABEL)

type ProjectDetailForm = {
  name: string
  code: string
  description: string
  status: string
  startDate: string
  endDate: string
  managerId: string
}

interface InfoRowProps {
  label: string
  children: ReactNode
}

interface FieldProps {
  label: string
  required?: boolean
  error?: ReactNode
  children: ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-[12px] text-text-muted font-medium w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-[13px] text-text-primary">{children}</span>
    </div>
  )
}

function Field({ label, required, error, children }: FieldProps) {
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

interface ProjectOverviewTabProps {
  project: Project
  isEditing: boolean
  form: ProjectDetailForm
  set: (key: keyof ProjectDetailForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  managerName: string
}

export function ProjectOverviewTab({
  project,
  isEditing,
  form,
  set,
  managerName,
}: ProjectOverviewTabProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-5 mb-6">
      {/* Left — Details card */}
      <div className="card p-5">
        <h3 className="text-[13px] font-semibold text-text-primary mb-3 uppercase tracking-wide">
          Details
        </h3>

        {isEditing ? (
          /* ── Edit mode ── */
          <div className="space-y-3">
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className="field">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Manager">
              <div className="input-readonly flex items-center justify-between gap-2">
                <span className="truncate">{managerName}</span>
                <Lock className="w-3 h-3 shrink-0 text-text-muted" strokeWidth={1.75} aria-label="Manager cannot be changed" />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={set('startDate')}
                  className="field"
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={set('endDate')}
                  className="field"
                />
              </Field>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <div className="divide-y divide-border-subtle">
            <InfoRow label="Status">
              <ProjectStatusBadge status={String(project.status || 'PLANNING')} />
            </InfoRow>

            <InfoRow label="Manager">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-[10px] font-semibold text-accent">
                  {managerName[0]?.toUpperCase() ?? '?'}
                </span>
                {managerName}
              </span>
            </InfoRow>
            <InfoRow label="Start Date">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                {fmtDate(project.startDate)}
              </span>
            </InfoRow>
            <InfoRow label="End Date">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                {fmtDate(project.endDate)}
              </span>
            </InfoRow>
            {project.actualEndDate && (
              <InfoRow label="Actual End">{fmtDate(project.actualEndDate)}</InfoRow>
            )}
            <InfoRow label="Created">{fmtDate(project.createdAt)}</InfoRow>
          </div>
        )}
      </div>

      {/* Right — Description card */}
      <div className="card p-5">
        <h3 className="text-[13px] font-semibold text-text-primary mb-3 uppercase tracking-wide">
          Description
        </h3>
        {isEditing ? (
          <textarea
            value={form.description}
            onChange={set('description')}
            placeholder="Brief description of the project…"
            rows={8}
            className="field resize-none w-full"
          />
        ) : (
          <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
            {project.description || 'No description provided.'}
          </p>
        )}
      </div>
    </div>
  )
}
