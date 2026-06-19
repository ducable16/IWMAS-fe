import { Check } from 'lucide-react'
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
  const assigneeName = assignee?.fullName || assignee?.email || 'Unknown'

  return (
    <div className="relative min-w-0 max-w-full" ref={activeDropdownRef(editingField === 'assignee', dropdownRef)}>
      <button
        type="button"
        onClick={canEdit
          ? () => {
              setEditingField(editingField === 'assignee' ? null : 'assignee')
              setMemberSearch('')
            }
          : undefined}
        className={clsx(
          'flex min-w-0 items-center gap-2 w-full text-left rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors',
          canEdit ? 'hover:bg-bg-hover cursor-pointer' : 'cursor-default',
        )}
      >
        {assignee ? (
          <>
            <Avatar name={assigneeName} avatarUrl={assignee.avatarUrl} size="xs" />
            <span className="min-w-0 flex-1 truncate text-[13px]">
              {assigneeName}
            </span>
          </>
        ) : (
          <span className="text-text-muted text-[13px]">Unassigned</span>
        )}
      </button>

      {editingField === 'assignee' && (
        <div className="absolute top-full right-0 mt-1.5 z-50 w-[min(240px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-bg-surface border border-border rounded-lg shadow-card animate-fade-in p-1.5 space-y-1.5">
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
            {members.map((member) => {
              const memberName = member.fullName || member.email || 'Unknown'
              return (
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
                  <Avatar name={memberName} avatarUrl={member.avatarUrl} size="xs" />
                  <span className="truncate flex-1">{memberName}</span>
                  {member.id === assignee?.id && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
