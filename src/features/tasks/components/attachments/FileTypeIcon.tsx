import { File, FileImage, FileSpreadsheet, FileText } from 'lucide-react'
import type { TaskAttachment } from '@/types'

type FileTypeIconProps = {
  item: TaskAttachment
}

export default function FileTypeIcon({ item }: FileTypeIconProps) {
  const contentType = item.contentType || ''
  const name = item.fileName || ''

  if (contentType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(name)) {
    return <FileImage className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
  }
  if (contentType === 'application/pdf' || /\.pdf$/i.test(name)) {
    return <FileText className="w-8 h-8 text-red-400" strokeWidth={1.5} />
  }
  if (/spreadsheet|excel|\.xls/i.test(contentType + name)) {
    return <FileSpreadsheet className="w-8 h-8 text-green-500" strokeWidth={1.5} />
  }
  return <File className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
}
