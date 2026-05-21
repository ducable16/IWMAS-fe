import { useCreateBlockNote } from '@blocknote/react'
import type { Id } from '@/types'

export interface DescriptionEditorProps {
  taskId: Id
  initialContent?: string | null | undefined
  onSave: (html: string | null) => void
  readOnly?: boolean
  isSaving?: boolean
}

export interface DescriptionEditModeProps extends DescriptionEditorProps {
  initialContent?: string | null | undefined
  onCancel: () => void
  isSaving: boolean
}

export interface DescriptionReadOnlyProps {
  initialContent?: string | null | undefined
  onClick: () => void
  canEdit: boolean
}

export type BlockNoteEditorInstance = ReturnType<typeof useCreateBlockNote>
