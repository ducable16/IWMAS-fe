import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useMembers } from '@/features/members/hooks/useMembers'
import { StatusDropdown } from './StatusDropdown'
import { DetailRow } from './DetailRow'
import { Avatar } from './Avatar'
import { fmtDateTime, isOverdue } from '@/utils/date'
import {
  AssigneeField,
  DateField,
  EstimateField,
  LabelsField,
  PriorityField,
  SprintField,
  TypeField,
} from './DetailsSidebarEditors'
import type { EditableField } from './taskDetail.types'
import type { Task, UpdateTaskRequest } from '@/types'

type DetailsSidebarProps = {
  task: Task
  canEdit: boolean
  onSave: (overrides: UpdateTaskRequest) => void
}

export function DetailsSidebar({ task, canEdit, onSave }: DetailsSidebarProps) {
  const [editingField, setEditingField] = useState<EditableField | null>(null)
  const [memberSearch, setMemberSearch] = useState('')
  const [labelsDraft, setLabelsDraft] = useState<string[] | null>(null)
  const [labelInput, setLabelInput] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const { data: membersData } = useMembers({ size: 100 })
  const members = membersData?.members ?? []

  useEffect(() => {
    if (!editingField || !['assignee', 'priority', 'type', 'labels'].includes(editingField)) return
    const handler = (e: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEditingField(null)
        setMemberSearch('')
        setLabelsDraft(null)
        setLabelInput('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [editingField])

  const save = (overrides: UpdateTaskRequest) => {
    onSave(overrides)
    setEditingField(null)
  }

  const saveLabels = () => {
    if (labelsDraft !== null) onSave({ labels: labelsDraft })
    setEditingField(null)
    setLabelsDraft(null)
    setLabelInput('')
  }

  const status = task.status || 'TODO'
  const priority = task.priority || 'MEDIUM'
  const labels = task.labels ?? []
  const isDueOverdue = task.dueDate && task.status !== 'DONE' ? isOverdue(task.dueDate) : false

  return (
    <div className="w-full xl:w-[300px] xl:shrink-0 space-y-4 xl:sticky xl:top-[68px]">
      <StatusDropdown current={status} taskId={task.id} canChange={canEdit} />

      <div>
        {/* Collapsible header */}
        <div className="flex items-center pb-2 border-b border-border-subtle">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary hover:text-accent transition-colors"
          >
            <ChevronDown
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                collapsed && '-rotate-90',
              )}
              strokeWidth={1.75}
            />
            Details
          </button>
        </div>

        {/* Detail rows */}
        {!collapsed && (
          <div className="divide-y divide-border-subtle">
            <DetailRow label="Assignee">
              <AssigneeField
                assignee={task.assignee}
                members={members}
                memberSearch={memberSearch}
                setMemberSearch={setMemberSearch}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                dropdownRef={dropdownRef}
                save={save}
              />
            </DetailRow>

            <DetailRow label="Priority">
              <PriorityField
                priority={String(priority)}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                dropdownRef={dropdownRef}
                save={save}
              />
            </DetailRow>

            <DetailRow label="Type">
              <TypeField
                type={task.type}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                dropdownRef={dropdownRef}
                save={save}
              />
            </DetailRow>

            <DetailRow label="Due date">
              <DateField
                field="dueDate"
                value={task.dueDate}
                overdue={!!isDueOverdue}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                save={save}
              />
            </DetailRow>

            <DetailRow label="Labels">
              <LabelsField
                labels={labels}
                labelsDraft={labelsDraft}
                setLabelsDraft={setLabelsDraft}
                labelInput={labelInput}
                setLabelInput={setLabelInput}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                dropdownRef={dropdownRef}
                saveLabels={saveLabels}
              />
            </DetailRow>

            <DetailRow label="Start date">
              <DateField
                field="startDate"
                value={task.startDate}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                save={save}
              />
            </DetailRow>

            <DetailRow label="Sprint">
              <SprintField
                value={task.sprint}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                save={save}
              />
            </DetailRow>

            <DetailRow label="Estimate">
              <EstimateField
                value={task.estimatedHours}
                canEdit={canEdit}
                editingField={editingField}
                setEditingField={setEditingField}
                save={save}
              />
            </DetailRow>

            <DetailRow label="Actual">
              <span className="text-text-secondary text-[13px]">
                {task.actualHours ? `${task.actualHours}h` : 'None'}
              </span>
            </DetailRow>

            <DetailRow label="Reporter">
              {task.reporter ? (
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={task.reporter.fullName} avatarUrl={task.reporter.avatarUrl} />
                  <Link
                    to={`/users/${task.reporter.id}`}
                    className="min-w-0 flex-1 truncate text-[13px] hover:text-accent hover:underline transition-colors"
                  >
                    {task.reporter.fullName}
                  </Link>
                </div>
              ) : (
                <span className="text-text-muted text-[13px]">None</span>
              )}
            </DetailRow>
          </div>
        )}
      </div>

      <div className="text-[11px] text-text-muted space-y-0.5 px-1">
        {task.createdAt && <p>Created {fmtDateTime(task.createdAt)}</p>}
        {task.completedAt && <p>Completed {fmtDateTime(task.completedAt)}</p>}
      </div>
    </div>
  )
}
