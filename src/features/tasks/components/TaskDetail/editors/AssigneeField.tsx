import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { Avatar } from '../Avatar'
import { activeDropdownRef } from './editorTypes'
import type { AssigneeFieldProps } from './editorTypes'

export function AssigneeField({
  assignee,
  members,
  memberSearch,
  setMemberSearch,
  canEdit,
  editingField,
  setEditingField,
  dropdownRef,
  save,
}: AssigneeFieldProps) {
  const filteredMembers = memberSearch
    ? members.filter((member) =>
        member.fullName.toLowerCase().includes(memberSearch.toLowerCase()),
      )
    : members.slice(0, 8)

  return (
    <div className="relative" ref={activeDropdownRef(editingField === 'assignee', dropdownRef)}>
      <button
        type="button"
        onClick={canEdit
          ? () => {
              setEditingField(editingField === 'assignee' ? null : 'assignee')
              setMemberSearch('')
            }
          : undefined}
        className={clsx(
          'flex items-center gap-2 w-full text-left rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors',
          canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
        )}
      >
        {assignee ? (
          <>
            <Avatar name={assignee.fullName} avatarUrl={assignee.avatarUrl} size="xs" />
            <Link
              to={`/users/${assignee.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] truncate hover:text-accent hover:underline transition-colors"
            >
              {assignee.fullName}
            </Link>
          </>
        ) : (
          <span className="text-text-muted text-[13px]">Unassigned</span>
        )}
      </button>

      {editingField === 'assignee' && (
        <div className="absolute top-full right-0 mt-1.5 z-50 w-[240px] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-1.5 space-y-1.5">
          <input
            autoFocus
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditingField(null)
                setMemberSearch('')
              }
            }}
            placeholder="Search members..."
            className="w-full text-[12px] bg-bg-subtle border border-border rounded-md px-2 py-1.5 focus:outline-none focus:border-border-strong"
          />
          <div className="max-h-[180px] overflow-y-auto space-y-0.5">
            <button
              type="button"
              onClick={() => {
                save({ assigneeId: null })
                setMemberSearch('')
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[12px] text-text-muted hover:bg-bg-hover transition-colors"
            >
              Unassigned
            </button>
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  save({ assigneeId: member.id })
                  setMemberSearch('')
                }}
                className={clsx(
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[12px] hover:bg-bg-hover transition-colors text-left',
                  member.id === assignee?.id
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-text-secondary',
                )}
              >
                <Avatar name={member.fullName} avatarUrl={member.avatarUrl} size="xs" />
                <span className="truncate flex-1">{member.fullName}</span>
                {member.id === assignee?.id && (
                  <Check className="w-3.5 h-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
