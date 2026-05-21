import { ExternalLink, Pencil, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Id } from '@/types'

type UserDrawerHeaderProps = {
  userId: Id
  canEdit: boolean
  isEditing: boolean
  onEdit: () => void
  onClose: () => void
}

export default function UserDrawerHeader({
  userId,
  canEdit,
  isEditing,
  onEdit,
  onClose,
}: UserDrawerHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-bg-surface/95 backdrop-blur-sm border-b border-border-subtle px-5 py-4 flex items-center justify-between">
      <h3 className="text-[15px] font-semibold text-text-primary">
        User details
      </h3>
      <div className="flex items-center gap-1.5">
        <Link
          to={`/users/${userId}`}
          onClick={onClose}
          className="btn-ghost text-[12.5px] py-1.5 px-2.5 gap-1"
          title="View full profile"
          id="drawer-view-profile-btn"
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
          Profile
        </Link>
        {canEdit && !isEditing && (
          <button
            onClick={onEdit}
            className="btn-ghost text-[12.5px] py-1.5 px-2.5"
            id="drawer-edit-btn"
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
            Edit
          </button>
        )}
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-md hover:bg-bg-subtle"
          aria-label="Close drawer"
          id="drawer-close-btn"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
