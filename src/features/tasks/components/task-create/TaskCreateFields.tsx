import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import SelectField from '@/components/ui/SelectField'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_TYPES,
  TASK_TYPE_LABEL,
} from '@/constants/enums'
import TaskSkillRequirementsEditor from '@/features/tasks/components/TaskSkillRequirementsEditor'
import { serializeRequiredSkills } from '@/features/tasks/utils/taskSkillRequirements'
import { useAssigneeSuggestions, useProjectSuggestions } from './useTaskCreateSuggestions'
import type { ReactNode } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { TaskCreateForm, SetTaskCreateField } from './taskCreateTypes'

type TaskCreateFieldsProps = {
  form: TaskCreateForm
  setField: SetTaskCreateField
  defaultProjectName?: string | undefined
  onSubmit: () => void
  titleError?: ReactNode
  projectError?: ReactNode
  assigneeError?: ReactNode
  dateError?: ReactNode
  assigneeDisabled?: boolean
}

export default function TaskCreateFields({
  form,
  setField,
  defaultProjectName,
  onSubmit,
  titleError,
  projectError,
  assigneeError,
  dateError,
  assigneeDisabled = false,
}: TaskCreateFieldsProps) {
  const assigneeSearchParams = {
    projectId: form.projectId,
    requiredSkills: serializeRequiredSkills(form.skillRequirements),
  }

  return (
    <>
      <input
        autoFocus
        value={form.title}
        maxLength={300}
        onChange={(e) => setField('title', e.target.value)}
        onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) onSubmit()
        }}
        placeholder="Task title *"
        aria-invalid={!!titleError}
        className={titleError ? 'input-field-error w-full text-[14px]' : 'input-field w-full text-[14px]'}
      />
      {titleError && <p className="text-[11.5px] text-danger">{titleError}</p>}

      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Priority"
          value={form.priority}
          onChange={(e) => setField('priority', e.target.value)}
          className="w-full text-[12.5px]"
        >
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_LABEL[priority]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Type"
          value={form.type}
          onChange={(e) => setField('type', e.target.value)}
          className="w-full text-[12.5px]"
        >
          {TASK_TYPES.map((type) => (
            <option key={type} value={type}>
              {TASK_TYPE_LABEL[type]}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AutocompleteSelect
          id="projectId"
          label="Project"
          required
          placeholder="Search projects..."
          value={form.projectId}
          onChange={(value) => setField('projectId', value)}
          useSearchHook={useProjectSuggestions}
          initialDisplay={defaultProjectName || ''}
          error={projectError}
        />
        <AutocompleteSelect
          id="assigneeId"
          label="Assignee"
          placeholder="Search user..."
          value={form.assigneeId}
          onChange={(value) => setField('assigneeId', value)}
          useSearchHook={useAssigneeSuggestions}
          searchParams={assigneeSearchParams}
          error={assigneeError}
          disabled={assigneeDisabled}
          noResultsText="No eligible project members found"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
            Start date
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setField('startDate', e.target.value)}
            aria-invalid={!!dateError}
            className={dateError ? 'input-field-error w-full text-[12.5px]' : 'input-field w-full text-[12.5px]'}
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
            Due date
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setField('dueDate', e.target.value)}
            aria-invalid={!!dateError}
            className={dateError ? 'input-field-error w-full text-[12.5px]' : 'input-field w-full text-[12.5px]'}
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
            Estimate
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.estimatedHours}
              onChange={(e) => setField('estimatedHours', e.target.value)}
              placeholder="0"
              className="input-field w-full pr-12 text-[12.5px]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-text-muted pointer-events-none">
              hrs
            </span>
          </div>
        </div>
      </div>
      {dateError && <p className="text-[11.5px] text-danger">{dateError}</p>}

      <div>
        <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Optional description..."
          rows={3}
          className="input-field w-full resize-none text-[12.5px] leading-relaxed"
        />
      </div>

      <TaskSkillRequirementsEditor
        value={form.skillRequirements}
        onChange={(value) => setField('skillRequirements', value)}
      />
    </>
  )
}
