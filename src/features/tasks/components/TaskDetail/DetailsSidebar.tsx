import { useEffect, useRef, useState } from 'react'
import { Calendar, CheckSquare, Flag, GitBranch, Tag, Timer, User } from 'lucide-react'
import { Link } from 'react-router-dom'
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
    <div className="w-[280px] shrink-0 space-y-4 sticky top-[68px]">
      <StatusDropdown current={status} taskId={task.id} canChange={canEdit} />

      <div className="card p-4 space-y-0">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
          Details
        </p>

        <DetailRow icon={User} label="Assignee">
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

        <DetailRow icon={Flag} label="Priority">
          <PriorityField
            priority={String(priority)}
            canEdit={canEdit}
            editingField={editingField}
            setEditingField={setEditingField}
            dropdownRef={dropdownRef}
            save={save}
          />
        </DetailRow>

        <DetailRow icon={GitBranch} label="Type">
          <TypeField
            type={task.type}
            canEdit={canEdit}
            editingField={editingField}
            setEditingField={setEditingField}
            dropdownRef={dropdownRef}
            save={save}
          />
        </DetailRow>

        <DetailRow icon={Calendar} label="Start date">
          <DateField
            field="startDate"
            value={task.startDate}
            canEdit={canEdit}
            editingField={editingField}
            setEditingField={setEditingField}
            save={save}
          />
        </DetailRow>

        <DetailRow icon={Calendar} label="Due date">
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

        <DetailRow icon={Timer} label="Estimate">
          <EstimateField
            value={task.estimatedHours}
            canEdit={canEdit}
            editingField={editingField}
            setEditingField={setEditingField}
            save={save}
          />
        </DetailRow>

        <DetailRow icon={CheckSquare} label="Actual">
          <span className="text-text-secondary text-[13px]">
            {task.actualHours ? `${task.actualHours}h` : '-'}
          </span>
        </DetailRow>

        <DetailRow icon={Tag} label="Labels">
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

        <DetailRow icon={User} label="Reporter">
          {task.reporter ? (
            <div className="flex items-center gap-2">
              <Avatar name={task.reporter.fullName} avatarUrl={task.reporter.avatarUrl} />
              <Link
                to={`/users/${task.reporter.id}`}
                className="text-[13px] hover:text-accent hover:underline transition-colors"
              >
                {task.reporter.fullName}
              </Link>
            </div>
          ) : (
            <span className="text-text-muted text-[13px]">-</span>
          )}
        </DetailRow>
      </div>

      <div className="text-[11px] text-text-muted space-y-0.5 px-1">
        {task.createdAt && <p>Created {fmtDateTime(task.createdAt)}</p>}
        {task.completedAt && <p>Completed {fmtDateTime(task.completedAt)}</p>}
      </div>
    </div>
  )
}
