import { useState, useEffect } from 'react'
import { X, Loader2, Plus, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import { useAddProjectMember, useUserEffortRemaining } from '../hooks/useProjects'
import { useAutocomplete, useDebouncedValue } from '@/features/search/hooks/useSearch'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import { PROJECT_ROLES, PROJECT_ROLE_LABEL } from '@/constants/enums'

const BLANK = {
  userId:                 '',
  roleInProject:          'MEMBER',
  allocatedEffortPercent: '',
  joinDate:               new Date().toISOString().split('T')[0],
  note:                   '',
}

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

/** Visual effort bar + badge */
function EffortBar({ percent, className }) {
  const color =
    percent >= 50 ? 'bg-success' :
    percent >= 20 ? 'bg-warning' :
    'bg-danger'
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <span className={clsx(
        'text-[11.5px] font-semibold tabular-nums',
        percent >= 50 ? 'text-success' : percent >= 20 ? 'text-warning' : 'text-danger',
      )}>
        {percent}%
      </span>
    </div>
  )
}

/** Remaining Effort info panel shown after a user is selected */
function RemainingEffortPanel({ userId, startDate, endDate, requestedEffort }) {
  const [expanded, setExpanded] = useState(false)

  const { data, isLoading } = useUserEffortRemaining(
    userId,
    { startDate: startDate || undefined, endDate: endDate || undefined },
    !!userId,
  )

  if (!userId) return null

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-text-muted py-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking effort availability…
      </div>
    )
  }

  if (!data) return null

  const {
    remainingPercent,
    peakAllocatedPercent,
    overlappingAllocations = [],
    futureAvailabilityNotes = [],
  } = data
  const requested = Number(requestedEffort) || 0
  const willExceed = requested > remainingPercent

  const formatAvailableFrom = (value) =>
    value === '9999-12-31' ? 'No end date' : value

  return (
    <div className={clsx(
      'rounded-lg border p-3 space-y-2 text-[12px] transition-colors',
      willExceed ? 'border-danger/40 bg-danger/5' : 'border-border-subtle bg-bg-subtle/50',
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {willExceed && (
            <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
          )}
          <span className="text-text-secondary font-medium">
            {data.userName}&apos;s availability
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-text-muted">Peak used: </span>
          <span className="font-semibold text-text-primary">{peakAllocatedPercent}%</span>
        </div>
      </div>

      {/* Remaining bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-text-muted">Remaining capacity</span>
          <span className={clsx(
            'font-semibold',
            remainingPercent < 20 ? 'text-danger' :
            remainingPercent < 50 ? 'text-warning' : 'text-success',
          )}>
            {remainingPercent}% free
          </span>
        </div>
        <EffortBar percent={remainingPercent} />
      </div>

      {futureAvailabilityNotes.length > 0 && (
        <div className="text-[11.5px] text-text-muted">
          <p className="font-medium text-text-secondary">Upcoming free capacity</p>
          <ul className="mt-1 space-y-0.5">
            {futureAvailabilityNotes.map((note) => (
              <li key={`${note.availableFrom}-${note.cumulativeRemainingPercent}`} className="flex items-center justify-between gap-2">
                <span className="truncate">Free from {formatAvailableFrom(note.availableFrom)}</span>
                <span className="shrink-0 tabular-nums">
                  +{note.additionalFreePercent}% (total {note.cumulativeRemainingPercent}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning when requested > remaining */}
      {willExceed && (
        <p className="text-danger text-[11.5px] font-medium">
          Requested {requested}% exceeds remaining capacity of {remainingPercent}%. The server will reject this.
        </p>
      )}

      {/* Overlapping allocations — collapsible */}
      {overlappingAllocations.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors"
          >
            {expanded
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDown className="w-3 h-3" />}
            {overlappingAllocations.length} active allocation{overlappingAllocations.length !== 1 ? 's' : ''} in period
          </button>

          {expanded && (
            <ul className="mt-1.5 space-y-1 pl-1">
              {overlappingAllocations.map((a) => (
                <li key={a.projectId} className="flex items-center justify-between gap-2">
                  <span className="text-text-secondary truncate">
                    <span className="font-mono text-text-muted mr-1">{a.projectCode}</span>
                    {a.projectName}
                  </span>
                  <span className="shrink-0 text-text-muted tabular-nums text-right">
                    {a.allocatedPercent}%
                    {a.projectEndDate && (
                      <span className="ml-2 text-text-muted">free {a.projectEndDate}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectAddMemberModal({ open, projectId, onClose }) {
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})

  const addMember = useAddProjectMember(projectId)
  const isPending = addMember.isPending

  useEffect(() => {
    if (open) {
      setForm(BLANK)
      setErrors({})
    }
  }, [open])

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.userId) next.userId = 'Please select a user.'
    if (
      form.allocatedEffortPercent === '' ||
      isNaN(form.allocatedEffortPercent) ||
      Number(form.allocatedEffortPercent) < 0 ||
      Number(form.allocatedEffortPercent) > 100
    ) {
      next.allocatedEffortPercent = 'Must be between 0 and 100.'
    }
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    const payload = {
      userId:                 Number(form.userId),
      roleInProject:          form.roleInProject,
      allocatedEffortPercent: Number(form.allocatedEffortPercent),
      joinDate:               form.joinDate || undefined,
      note:                   form.note.trim() || undefined,
    }

    addMember.mutate(payload, { onSuccess: onClose })
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
      <div className="relative bg-bg-surface border border-border rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-deep animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-[15px] font-semibold text-text-primary">
            Add Project Member
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 -mr-1"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* User autocomplete */}
          <AutocompleteSelect
            id="add-member-userId"
            label="User"
            required
            placeholder="Search by name, email..."
            value={form.userId}
            onChange={(val) => set('userId', val)}
            useSearchHook={useAutocomplete}
            error={errors.userId}
          />

          {/* Remaining effort panel (shown after user selected) */}
          {form.userId && (
            <RemainingEffortPanel
              userId={Number(form.userId)}
              startDate={form.joinDate}
              endDate={undefined}
              requestedEffort={form.allocatedEffortPercent}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" required>
              <select
                value={form.roleInProject}
                onChange={(e) => set('roleInProject', e.target.value)}
                className="input-select w-full text-[13px]"
              >
                {PROJECT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {PROJECT_ROLE_LABEL[role] || role}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Effort (%)" required error={errors.allocatedEffortPercent}>
              <input
                type="number"
                min="0"
                max="100"
                value={form.allocatedEffortPercent}
                onChange={(e) => set('allocatedEffortPercent', e.target.value)}
                className={clsx(
                  'input-field w-full text-[13px]',
                  errors.allocatedEffortPercent && 'border-danger focus:border-danger',
                )}
              />
            </Field>
          </div>

          <Field label="Join Date">
            <input
              type="date"
              value={form.joinDate}
              onChange={(e) => set('joinDate', e.target.value)}
              className="input-field w-full text-[13px]"
            />
          </Field>

          <Field label="Note">
            <textarea
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="E.g., responsibilities, role details..."
              rows={2}
              className="input-field w-full text-[13px] resize-none leading-relaxed"
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn-ghost text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary text-[13px] gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              {isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
