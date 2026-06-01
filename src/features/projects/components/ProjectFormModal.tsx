import { Plus } from 'lucide-react'
import clsx from 'clsx'
import { Modal } from '@/components/ui/Modal'
import ModalFormActions from '@/components/ui/ModalFormActions'
import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import { PROJECT_STATUS_LABEL, toOptions } from '@/constants/enums'
import ManagerEffortPanel from './project-form/ManagerEffortPanel'
import ProjectCodeField from './project-form/ProjectCodeField'
import { type ProjectFormModalProps } from './project-form/projectFormTypes'
import {
  useManagerAutocomplete,
  type ManagerSuggestionItem,
} from './project-form/useManagerAutocomplete'
import { useProjectFormModal } from './project-form/useProjectFormModal'

const STATUS_OPTIONS = toOptions(PROJECT_STATUS_LABEL)

function ManagerSuggestion({ item }: { item: ManagerSuggestionItem }) {
  return <span className="truncate">{item.user?.fullName || item.term}</span>
}

export default function ProjectFormModal({ open, project, onClose }: ProjectFormModalProps) {
  const {
    isEdit,
    form,
    errors,
    currentUser,
    isPmSelfOnly,
    allowedManagerIds,
    selectedManager,
    isPending,
    isSuggestingCode,
    set,
    setCodeField,
    setValue,
    handleSubmit,
  } = useProjectFormModal({ open, project, onClose })

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[500px]">
      <Modal.Header title={isEdit ? 'Edit Project' : 'New Project'} onClose={onClose} />

      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-3">
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

          <div className="grid grid-cols-2 gap-2">
            <ProjectCodeField
              value={form.code}
              isEdit={isEdit}
              isSuggestingCode={isSuggestingCode}
              error={errors.code}
              onChange={setCodeField}
            />

            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Status
              </label>
              <select
                value={form.status}
                onChange={set('status')}
                className="input-select w-full text-[12.5px]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

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
            disabled={isEdit || isPmSelfOnly}
            renderOption={(item) => <ManagerSuggestion item={item as ManagerSuggestionItem} />}
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
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Manager Effort (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.managerEffortPercent}
                onChange={set('managerEffortPercent')}
                className={clsx(
                  'input-field w-full text-[12.5px]',
                  errors.managerEffortPercent && 'input-field-error',
                )}
              />
              {errors.managerEffortPercent && (
                <p className="text-[11px] text-danger mt-0.5">
                  {errors.managerEffortPercent}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={set('startDate')}
                className="input-field w-full text-[12.5px]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={set('endDate')}
                className="input-field w-full text-[12.5px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Brief description of the project..."
              rows={3}
              className="input-field w-full resize-none text-[12.5px] leading-relaxed"
            />
          </div>
        </Modal.Body>

        <ModalFormActions
          onCancel={onClose}
          isPending={isPending}
          disabled={!form.name.trim() || (!isEdit && !form.managerId)}
          idleIcon={!isEdit && <Plus className="w-3.5 h-3.5" strokeWidth={2} />}
          pendingLabel="Saving..."
          submitLabel={isEdit ? 'Save changes' : 'Create project'}
        />
      </form>
    </Modal>
  )
}
