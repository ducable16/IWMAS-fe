import type { Id, TaskAttachment } from '@/types'

export function isImageFile(item: TaskAttachment): boolean {
  if (item.contentType?.startsWith('image/')) return true
  if (/\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$/i.test(item.fileName || '')) return true
  return false
}

export function getAttachmentUploaderId(item: TaskAttachment): Id | undefined {
  return typeof item.uploadedBy === 'object' ? item.uploadedBy?.id : item.uploadedBy
}

export function getAttachmentSize(item: TaskAttachment): number | undefined {
  return item.fileSize ?? item.size
}

export function formatAttachmentSize(size: number | null | undefined): string {
  if (size == null || !Number.isFinite(size)) return ''
  if (size < 1024) return `${size} B`
  const kb = size / 1024
  if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
}
