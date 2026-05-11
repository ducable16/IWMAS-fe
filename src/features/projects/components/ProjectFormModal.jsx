import { useState, useEffect, useRef } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { X, Loader2, Plus, Wand2, Lock } from 'lucide-react'
import clsx from 'clsx'
import {
  useCreateProject,
  useUpdateProject,
  useUserEffortRemaining,
  useSuggestProjectCode,
} from '../hooks/useProjects'
import { useUser, normaliseUser } from '@/features/members/hooks/useMembers'
import { userService } from '@/features/members/services/memberService'
import { useAuthStore } from '@/features/auth/store/authStore'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import {
  PROJECT_STATUS_LABEL,
  toOptions,
} from '@/constants/enums'

/**
 * Modal for §3.4 Suggest Project Code, §3.5 Create Project, §3.6 Update Project.
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
  managerEffortPercent: '0',
}

const STATUS_OPTIONS = toOptions(PROJECT_STATUS_LABEL)

// ── Debounce hook ──────────────────────────────────────────────────────────────

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ── Manager autocomplete ───────────────────────────────────────────────────────

function useManagerAutocomplete(query, params = {}) {
  const trimmed = (query ?? '').trim()
  const enabled = trimmed.length >= 2
  const allowedIds = params.allowedIds

  return useQuery({
    queryKey: ['members', 'manager-autocomplete', trimmed, allowedIds],
    enabled,
    queryFn: async () => {
      const res = await userService.getAll({ search: trimmed, size: 10 })
      const raw = res.data ?? {}
      const items = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.content)
        ? raw.content
        : []
      const users = items.map(normaliseUser)
      const filtered = users.filter(
        (u) => (u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN') &&
          (!allowedIds || allowedIds.includes(u.id)),
      )
      return {
        suggestions: filtered.map((u) => ({
          term: u.fullName,
          entityId: u.id,
          user: u,
        })),
      }
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

// ── Manager suggestion item ────────────────────────────────────────────────────

function ManagerSuggestion({ item, startDate, endDate }) {
  const user = item.user
  const { data, isLoading } = useUserEffortRemaining(
    user?.id,
    { startDate: startDate || undefined, endDate: endDate || undefined },
    !!user?.id,
  )

  const remaining = data?.remainingPercent

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="truncate">{user?.fullName || item.term}</span>
      <span className="shrink-0 text-[11px] text-text-muted tabular-nums">
        {isLoading ? '…' : remaining !== undefined ? `${remaining}% free` : ''}
      </span>
    </div>
  )
}

// ── Manager effort panel ───────────────────────────────────────────────────────

function ManagerEffortPanel({ userId, startDate, endDate, requestedEffort }) {
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
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-secondary font-medium">
          {data.userName}&apos;s availability
        </span>
        <div className="text-right shrink-0">
          <span className="text-text-muted">Peak used: </span>
          <span className="font-semibold text-text-primary">{peakAllocatedPercent}%</span>
        </div>
      </div>

      <div className="flex justify-between">
        <span className="text-text-muted">Remaining capacity</span>
        <span className={clsx(
          'font-semibold',
          remainingPercent < 20 ? 'text-danger' :
          remainingPercent < 50 ? 'text-warning' : 'text-success',
        )}>
          {remainingPercent}% free
        </span>
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

      {willExceed && (
        <p className="text-danger text-[11.5px] font-medium">
          Requested {requested}% exceeds remaining capacity of {remainingPercent}%. The server will reject this.
        </p>
      )}
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────────

export default function ProjectFormModal({ open, project, onClose }) {
  const isEdit = !!project
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})

  /**
   * Track whether the user has manually edited the code field.
   * If true, auto-suggest will NOT overwrite the user's value.
   */
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false)

  const currentUser = useAuthStore((s) => s.user)
  const isPmSelfOnly = currentUser?.role === 'PROJECT_MANAGER'
  const allowedManagerIds = isPmSelfOnly && currentUser?.id ? [currentUser.id] : null

  const selectedManagerId = form.managerId ? Number(form.managerId) : null
  const { data: selectedManager } = useUser(selectedManagerId)

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const isPending = createProject.isPending || updateProject.isPending

  // ── Suggest-code (Create mode only) ───────────────────────────────────────
  // Debounce the project name before calling the suggest-code API
  const debouncedName = useDebounce(form.name, 400)

  const { data: suggestedCode, isFetching: isSuggestingCode } = useSuggestProjectCode(
    debouncedName,
    !isEdit && open, // only active in Create mode
  )

  // Auto-fill code field when suggestion arrives, unless user manually edited it
  const prevSuggestedCode = useRef(null)
  useEffect(() => {
    if (isEdit) return
    if (suggestedCode && suggestedCode !== prevSuggestedCode.current) {
      prevSuggestedCode.current = suggestedCode
      if (!codeManuallyEdited) {
        setForm((f) => ({ ...f, code: suggestedCode }))
        setErrors((prev) => ({ ...prev, code: null }))
      }
    }
  }, [suggestedCode, codeManuallyEdited, isEdit])

  // ── Populate form when opening ─────────────────────────────────────────────
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
        managerEffortPercent: '0',
      })
    } else {
      setForm({
        ...BLANK,
        managerId: isPmSelfOnly && currentUser?.id ? String(currentUser.id) : '',
      })
    }
    setErrors({})
    setCodeManuallyEdited(false)
    prevSuggestedCode.current = null
  }, [open, project, isPmSelfOnly, currentUser?.id])

  // ── Generic field setters ──────────────────────────────────────────────────
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  const setCodeField = (e) => {
    setCodeManuallyEdited(true)
    set('code')(e)
  }

  const setValue = (key, value) => {
    setForm((f) => ({ ...f, [key]: value ? String(value) : '' }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const next = {}
    if (!form.name.trim())    next.name      = 'Project name is required.'
    if (!form.managerId)      next.managerId = 'Manager is required.'
    if (!isEdit) {
      if (
        form.managerEffortPercent === '' ||
        isNaN(form.managerEffortPercent) ||
        Number(form.managerEffortPercent) < 0 ||
        Number(form.managerEffortPercent) > 100
      ) {
        next.managerEffortPercent = 'Must be between 0 and 100.'
      }
    }
    return next
  }

  // ── Re-trigger suggest-code after a 4002 race condition ───────────────────
  const retriggerSuggestCode = () => {
    setCodeManuallyEdited(false)
    prevSuggestedCode.current = null
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
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

    const handleApiError = (err) => {
      // Axios interceptor rejects with { code, message } (already unwrapped)
      const code = err?.code
      if (code === 4002) {
        // Code is taken — re-trigger suggest-code so the field refreshes
        setErrors((prev) => ({ ...prev, code: 'This code is already taken. A new suggestion is loading…' }))
        retriggerSuggestCode()
      } else if (code === 4006) {
        setErrors((prev) => ({ ...prev, code: 'Code must be 2–10 uppercase letters, digits, or hyphens (e.g. HRM, PRJ-2).' }))
      } else if (code === 4007) {
        // Should not happen in normal usage (we send the original code on edit)
        setErrors((prev) => ({ ...prev, code: 'Project code cannot be changed after creation.' }))
      }
      // For other errors the mutation's own onError toast fires
    }

    if (isEdit) {
      updateProject.mutate(
        { id: project.id, data: payload },
        {
          onSuccess: onClose,
          onError: handleApiError,
        },
      )
    } else {
      createProject.mutate(
        { data: payload, managerEffortPercent: form.managerEffortPercent },
        {
          onSuccess: onClose,
          onError: handleApiError,
        },
      )
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
          {errors.name && (
            <p className="text-[11px] text-danger -mt-2">{errors.name}</p>
          )}

          {/* Code and Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Project Code
              </label>

              {isEdit ? (
                /* ── Edit mode: code is immutable ── */
                <div className="relative">
                  <input
                    value={form.code}
                    readOnly
                    tabIndex={-1}
                    className="input-field w-full text-[12.5px] bg-bg-subtle/60 text-text-muted cursor-not-allowed pr-7"
                  />
                  <Lock className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                </div>
              ) : (
                /* ── Create mode: auto-filled by suggest-code ── */
                <div className="relative">
                  <input
                    value={form.code}
                    onChange={setCodeField}
                    placeholder="e.g. RTP (optional)"
                    className={clsx(
                      'input-field w-full text-[12.5px]',
                      errors.code && 'input-field-error',
                      isSuggestingCode && 'pr-7',
                    )}
                  />
                  {isSuggestingCode && (
                    <Wand2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-accent animate-pulse pointer-events-none" />
                  )}
                </div>
              )}

              {isEdit && (
                <p className="text-[10.5px] text-text-muted mt-0.5">
                  Code cannot be changed after creation
                </p>
              )}
              {errors.code && (
                <p className="text-[11px] text-danger mt-0.5">{errors.code}</p>
              )}
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
          <AutocompleteSelect
            id="project-manager"
            label="Project Manager"
            required
            placeholder="Search by name or email..."
            value={form.managerId}
            onChange={(val) => setValue('managerId', val)}
            useSearchHook={useManagerAutocomplete}
            searchParams={{ allowedIds: allowedManagerIds }}
            initialDisplay={selectedManager?.fullName || (isPmSelfOnly ? currentUser?.fullName : '')}
            error={errors.managerId}
            noResultsText="No managers found"
            disabled={isPmSelfOnly}
            renderOption={(item) => (
              <ManagerSuggestion item={item} startDate={form.startDate} endDate={form.endDate} />
            )}
          />

          {!isEdit && form.managerId && (
            <ManagerEffortPanel
              userId={Number(form.managerId)}
              startDate={form.startDate}
              endDate={form.endDate}
              requestedEffort={form.managerEffortPercent}
            />
          )}

          {!isEdit && (
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">Manager Effort (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.managerEffortPercent}
                onChange={set('managerEffortPercent')}
                className={clsx(
                  'input-field w-full text-[12.5px]',
                  errors.managerEffortPercent && 'input-field-error',
                )}
              />
              {errors.managerEffortPercent && (
                <p className="text-[11px] text-danger mt-0.5">{errors.managerEffortPercent}</p>
              )}
            </div>
          )}

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
