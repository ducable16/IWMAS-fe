import { ChangeEvent } from 'react'
import { Paperclip, Upload, Download, Trash2 } from 'lucide-react'
import { fmtDateTime } from '@/utils/date'
import { formatFileSize } from '@/utils/file'
import { LiveLoading, LiveEmpty } from '@/components/feedback/LiveStateOverlay'
import type { ProjectDocument, User, Id } from '@/types'

interface ProjectDocumentsTabProps {
  documents: ProjectDocument[]
  documentsLoading: boolean
  canUploadDocuments: boolean
  isUploadingDocument: boolean
  isDeletingDocument: boolean
  onUploadDocument: (e: ChangeEvent<HTMLInputElement>) => void
  onDeleteDocument: (docId: Id) => void
  user: User | null
  isOwnProject: boolean
  isAdmin: boolean
}

export function ProjectDocumentsTab({
  documents,
  documentsLoading,
  canUploadDocuments,
  isUploadingDocument,
  isDeletingDocument,
  onUploadDocument,
  onDeleteDocument,
  user,
  isOwnProject,
  isAdmin,
}: ProjectDocumentsTabProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <h3 className="text-[13px] font-semibold text-text-primary uppercase tracking-wide flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-text-muted" />
          Project Documents
          <span className="text-[11px] text-text-muted font-normal ml-1">
            ({documents.length})
          </span>
        </h3>
        {canUploadDocuments && (
          <label className="btn-ghost text-[12px] h-8 px-3 cursor-pointer">
            <Upload className="w-3.5 h-3.5 mr-1" />
            {isUploadingDocument ? 'Uploading…' : 'Upload Document'}
            <input
              type="file"
              className="hidden"
              disabled={isUploadingDocument}
              onChange={onUploadDocument}
            />
          </label>
        )}
      </div>

      {documentsLoading ? (
        <div className="p-8"><LiveLoading label="Loading documents…" /></div>
      ) : documents.length === 0 ? (
        <div className="p-8">
          <LiveEmpty label="No documents uploaded yet." />
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {documents.map((doc) => {
            const canDeleteDoc = isAdmin || isOwnProject || doc.uploadedBy === user?.id
            return (
              <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                <Paperclip className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-text-primary truncate">{doc.fileName}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {formatFileSize(doc.fileSize)} · Uploaded {doc.createdAt ? fmtDateTime(doc.createdAt) : '—'}
                    {doc.uploadedBy ? ` · by #${doc.uploadedBy}` : ''}
                  </p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost text-[12px] h-8 px-2.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Open
                </a>
                {canDeleteDoc && (
                  <button
                    type="button"
                    onClick={() => onDeleteDocument(doc.id)}
                    disabled={isDeletingDocument}
                    className="btn-ghost text-[12px] h-8 px-2.5 text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
