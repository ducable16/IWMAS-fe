import { useState } from 'react'
import { Download, Loader2, Trash2 } from 'lucide-react'
import { fmtDateTime } from '@/utils/date'
import FileTypeIcon from './FileTypeIcon'
import { isImageFile } from './attachmentUtils'
import type { Id, TaskAttachment } from '@/types'

type AttachmentCardProps = {
  item: TaskAttachment
  canDelete: boolean
  onDelete: (attachmentId: Id) => void
  isDeleting: boolean
  onClickImage: (attachment: TaskAttachment) => void
}

export default function AttachmentCard({
  item,
  canDelete,
  onDelete,
  isDeleting,
  onClickImage,
}: AttachmentCardProps) {
  const [hovered, setHovered] = useState(false)
  const isImage = isImageFile(item)

  const handleClick = () => {
    if (isImage) onClickImage(item)
    else if (item.url) window.open(item.url, '_blank', 'noreferrer')
  }

  return (
    <div
      className="relative flex flex-col rounded-lg border border-border-subtle bg-bg-surface overflow-hidden hover:border-border transition-colors cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: 120 }}
    >
      <div
        className="w-full bg-bg-subtle flex items-center justify-center overflow-hidden"
        style={{ height: 80 }}
        onClick={handleClick}
      >
        {isImage ? (
          <img
            src={item.url}
            alt={item.fileName || 'Attachment'}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileTypeIcon item={item} />
        )}
      </div>

      <div className="px-2 py-1.5 flex-1" onClick={handleClick}>
        <p className="text-[11px] text-text-primary font-medium truncate leading-tight">
          {item.fileName || 'Unnamed'}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5 leading-tight">
          {fmtDateTime(item.createdAt)}
        </p>
      </div>

      {(hovered || isDeleting) && (
        <div className="absolute top-1 right-1 flex flex-col gap-1">
          <a
            href={item.url}
            download={item.fileName}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded bg-black/40 hover:bg-black/60 text-white transition-colors"
            title="Download"
          >
            <Download className="w-3 h-3" strokeWidth={1.75} />
          </a>
          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              disabled={isDeleting}
              className="p-1 rounded bg-black/40 hover:bg-red-500/80 text-white transition-colors disabled:opacity-50"
              title="Delete"
            >
              {isDeleting
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Trash2 className="w-3 h-3" strokeWidth={1.75} />}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
