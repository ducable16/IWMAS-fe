import { useState, useRef, useCallback } from 'react'
import {
  File, FileText, FileSpreadsheet, FileImage,
  Trash2, Upload, MoreHorizontal, Plus, Download, Loader2,
} from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useTaskAttachments, useUploadTaskAttachment, useDeleteTaskAttachment } from '@/features/tasks/hooks/useTask'
import { LiveLoading } from '@/components/feedback/LiveStateOverlay'
import ImageLightbox from '@/components/ui/ImageLightbox'

/* ─── File type helpers ───────────────────────────────────────────────────── */

function isImageFile(item) {
  if (item.contentType?.startsWith('image/')) return true
  if (/\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$/i.test(item.fileName || '')) return true
  return false
}

function FileTypeIcon({ item }) {
  const ct = item.contentType || ''
  const name = item.fileName || ''
  if (ct.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(name)) {
    return <FileImage className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
  }
  if (ct === 'application/pdf' || /\.pdf$/i.test(name)) {
    return <FileText className="w-8 h-8 text-red-400" strokeWidth={1.5} />
  }
  if (/spreadsheet|excel|\.xls/i.test(ct + name)) {
    return <FileSpreadsheet className="w-8 h-8 text-green-500" strokeWidth={1.5} />
  }
  return <File className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const val = bytes / 1024 ** exp
  return `${val >= 10 ? val.toFixed(0) : val.toFixed(1)} ${units[exp]}`
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ─── Thumbnail card ──────────────────────────────────────────────────────── */

function AttachmentCard({ item, canDelete, onDelete, isDeleting, onClickImage }) {
  const [hovered, setHovered] = useState(false)
  const isImage = isImageFile(item)

  const handleClick = () => {
    if (isImage) onClickImage(item)
    else window.open(item.url, '_blank', 'noreferrer')
  }

  return (
    <div
      className="relative flex flex-col rounded-lg border border-border-subtle bg-bg-surface overflow-hidden hover:border-border transition-colors cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: 120 }}
    >
      {/* Thumbnail / icon */}
      <div
        className="w-full bg-bg-subtle flex items-center justify-center overflow-hidden"
        style={{ height: 80 }}
        onClick={handleClick}
      >
        {isImage ? (
          <img
            src={item.url}
            alt={item.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileTypeIcon item={item} />
        )}
      </div>

      {/* Info */}
      <div
        className="px-2 py-1.5 flex-1"
        onClick={handleClick}
      >
        <p className="text-[11px] text-text-primary font-medium truncate leading-tight">
          {item.fileName || 'Unnamed'}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5 leading-tight">
          {formatDate(item.createdAt)}
        </p>
      </div>

      {/* Actions overlay */}
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
              onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
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

/* ─── Main component ──────────────────────────────────────────────────────── */

/**
 * AttachmentsSection — Jira-style collapsible attachment block.
 *
 * @param {string|number} taskId
 * @param {boolean}       canUpload          – can current user upload?
 * @param {boolean}       canDeleteAsManager – ADMIN / PM can delete any
 * @param {number}        currentUserId      – for "uploader can delete" rule
 */
export default function AttachmentsSection({
  taskId,
  canUpload,
  canDeleteAsManager,
  currentUserId,
}) {
  const [open, setOpen]           = useState(true)
  const [lightbox, setLightbox]   = useState(null) // { src, alt }
  const fileInputRef              = useRef(null)

  const { data: attachments = [], isLoading }        = useTaskAttachments(taskId)
  const { mutate: upload,  isPending: isUploading }  = useUploadTaskAttachment(taskId)
  const { mutate: destroy, isPending: isDeleting }   = useDeleteTaskAttachment(taskId)

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    upload(file, { onSettled: () => { e.target.value = '' } })
  }, [upload])

  const handleDelete = useCallback((attachmentId) => {
    destroy(attachmentId)
  }, [destroy])

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setOpen((v) => !v)}
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

        {/* Header actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="p-1.5 rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
          </button>
          {canUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors disabled:opacity-40"
              title="Upload attachment"
            >
              {isUploading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Plus className="w-4 h-4" strokeWidth={1.75} />}
            </button>
          )}
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={isUploading}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="pl-5">
          {isLoading ? (
            <LiveLoading label="Loading attachments…" />
          ) : attachments.length === 0 ? (
            canUpload ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                  canDelete={canDeleteAsManager || item.uploadedBy === currentUserId}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                  onClickImage={(att) => setLightbox({ src: att.url, alt: att.fileName })}
                />
              ))}
              {/* Upload more tile */}
              {canUpload && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
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

      {/* Lightbox */}
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
