import AutocompleteSelect from '@/components/ui/AutocompleteSelect'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  TASK_TYPES,
  TASK_TYPE_LABEL,
} from '@/constants/enums'
import { useAssigneeSuggestions, useProjectSuggestions } from './useTaskCreateSuggestions'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { TaskCreateForm, SetTaskCreateField } from './taskCreateTypes'

type TaskCreateFieldsProps = {
  form: TaskCreateForm
  setField: SetTaskCreateField
  defaultProjectName?: string | undefined
  onSubmit: () => void
}

type SelectFieldProps = {
  label: string
  value: string
  options: readonly string[]
  labels: Record<string, string>
  onChange: (value: string) => void
}

function SelectField({ label, value, options, labels, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-[11px] text-text-muted mb-1 font-medium uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-select w-full text-[12.5px]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function TaskCreateFields({
  form,
  setField,
  defaultProjectName,
  onSubmit,
}: TaskCreateFieldsProps) {
  return (
    <>
      <input
        autoFocus
        value={form.title}
        onChange={(e) => setField('title', e.target.value)}
        onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) onSubmit()
        }}
        placeholder="Task title *"
        className="input-field w-full text-[14px]"
      />

      <div className="grid grid-cols-3 gap-2">
        <SelectField
          label="Status"
          value={form.status}
          options={TASK_STATUSES}
          labels={TASK_STATUS_LABEL}
          onChange={(value) => setField('status', value)}
        />
        <SelectField
          label="Priority"
          value={form.priority}
          options={TASK_PRIORITIES}
          labels={TASK_PRIORITY_LABEL}
          onChange={(value) => setField('priority', value)}
        />
        <SelectField
          label="Type"
          value={form.type}
          options={TASK_TYPES}
          labels={TASK_TYPE_LABEL}
          onChange={(value) => setField('type', value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AutocompleteSelect
          id="projectId"
          label="Project"
          placeholder="Search projects..."
          value={form.projectId}
          onChange={(value) => setField('projectId', value)}
          useSearchHook={useProjectSuggestions}
          initialDisplay={defaultProjectName || ''}
        />
        <AutocompleteSelect
          id="assigneeId"
          label="Assignee"
          placeholder="Search user..."
          value={form.assigneeId}
          onChange={(value) => setField('assigneeId', value)}
          useSearchHook={useAssigneeSuggestions}
          searchParams={form.projectId}
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
            className="input-field w-full text-[12.5px]"
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
            className="input-field w-full text-[12.5px]"
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
    </>
  )
}
