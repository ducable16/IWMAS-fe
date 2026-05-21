import type { Id, TaskAttachment } from '@/types'

export function isImageFile(item: TaskAttachment): boolean {
  if (item.contentType?.startsWith('image/')) return true
  if (/\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$/i.test(item.fileName || '')) return true
  return false
}

export function getAttachmentUploaderId(item: TaskAttachment): Id | undefined {
  return typeof item.uploadedBy === 'object' ? item.uploadedBy?.id : item.uploadedBy
}
