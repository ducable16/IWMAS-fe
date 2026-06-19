import { useState, useRef, useCallback } from 'react'
import { ChevronDown, Loader2, MoreHorizontal, Plus, Upload } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { useTaskAttachments, useUploadTaskAttachment, useDeleteTaskAttachment } from '@/features/tasks/hooks/useTask'
import { LiveLoading } from '@/components/feedback/LiveStateOverlay'
import ImageLightbox from '@/components/ui/ImageLightbox'
import AttachmentCard from './attachments/AttachmentCard'
import { getAttachmentUploaderId } from './attachments/attachmentUtils'
import type { ChangeEvent } from 'react'
import type { Id, TaskAttachment } from '@/types'

interface AttachmentsSectionProps {
  taskId: Id | null | undefined
  canUpload: boolean
  canDeleteAsManager: boolean
  currentUserId?: Id | null | undefined
}

interface LightboxState {
  src: string
  alt: string
}

const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024
const ATTACHMENT_ACCEPT = [
  'image/*',
  'application/pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  'text/plain',
].join(',')

function isAllowedAttachmentType(file: File) {
  if (file.type.startsWith('image/')) return true
  if (file.type === 'application/pdf' || file.type === 'text/plain') return true
  if (
    [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].includes(file.type)
  ) return true
  return /\.(docx?|xlsx?|pdf|txt)$/i.test(file.name)
}

export default function AttachmentsSection({
  taskId,
  canUpload,
  canDeleteAsManager,
  currentUserId,
}: AttachmentsSectionProps) {
  const [open, setOpen] = useState(true)
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: attachments = [], isLoading } = useTaskAttachments(taskId)
  const { mutate: upload, isPending: isUploading } = useUploadTaskAttachment(taskId)
  const { mutate: destroy, isPending: isDeleting } = useDeleteTaskAttachment(taskId)

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast.error('Attachment must be 20 MB or smaller')
      e.target.value = ''
      return
    }
    if (!isAllowedAttachmentType(file)) {
      toast.error('File type is not allowed')
      e.target.value = ''
      return
    }
    upload(file, { onSettled: () => { e.target.value = '' } })
  }, [upload])

  const handleDelete = useCallback((attachmentId: Id) => {
    destroy(attachmentId)
  }, [destroy])

  const canDeleteAttachment = useCallback((item: TaskAttachment) => {
    return canDeleteAsManager || (!!currentUserId && getAttachmentUploaderId(item) === currentUserId)
  }, [canDeleteAsManager, currentUserId])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-1.5 text-left flex-1 min-w-0"
        >
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-text-muted shrink-0 transition-transform',
              !open && '-rotate-90',
            )}
            strokeWidth={1.75}
          />
          <span className="text-[14px] font-semibold text-text-primary">Attachments</span>
          {attachments.length > 0 && (
            <span className="ml-1 text-[11px] font-semibold bg-bg-subtle text-text-muted rounded px-1.5 py-0.5 tabular-nums">
              {attachments.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button className="p-1.5 rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
          </button>
          {canUpload && (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isUploading}
              className="p-1.5 rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors disabled:opacity-40"
              title="Upload attachment"
            >
              {isUploading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Plus className="w-4 h-4" strokeWidth={1.75} />}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ATTACHMENT_ACCEPT}
            className="hidden"
            disabled={isUploading}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {open && (
        <div className="pl-5">
          {isLoading ? (
            <LiveLoading label="Loading attachments..." />
          ) : attachments.length === 0 ? (
            canUpload ? (
              <button
                type="button"
                onClick={openFilePicker}
                className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-primary transition-colors py-1"
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
                Add attachment
              </button>
            ) : (
              <p className="text-[13px] text-text-muted italic">No attachments.</p>
            )
          ) : (
            <div className="flex flex-wrap gap-3">
              {attachments.map((item) => (
                <AttachmentCard
                  key={item.id}
                  item={item}
                  canDelete={canDeleteAttachment(item)}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                  onClickImage={(attachment) => {
                    if (attachment.url) {
                      setLightbox({
                        src: attachment.url,
                        alt: attachment.fileName || 'Attachment',
                      })
                    }
                  }}
                />
              ))}
              {canUpload && (
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isUploading}
                  className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-bg-subtle hover:border-border hover:bg-bg-hover transition-colors text-text-muted disabled:opacity-40"
                  style={{ width: 120, height: 120 }}
                  title="Upload more"
                >
                  {isUploading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Plus className="w-5 h-5" strokeWidth={1.5} />}
                  <span className="text-[11px] mt-1">Upload</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
