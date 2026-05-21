import { useCallback, useRef, useState } from 'react'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/ariakit/style.css'
import '@/styles/blocknote-overrides.css'
import DescriptionEditMode from './editor/DescriptionEditMode'
import DescriptionReadOnly from './editor/DescriptionReadOnly'
import type { DescriptionEditorProps } from './editor/descriptionEditorTypes'

export default function DescriptionEditor({
  taskId,
  initialContent,
  onSave,
  readOnly = false,
  isSaving = false,
}: DescriptionEditorProps) {
  const [editing, setEditing] = useState(false)
  const [editKey, setEditKey] = useState(0)
  const savedRef = useRef(initialContent)

  const startEdit = useCallback(() => {
    if (readOnly) return
    savedRef.current = initialContent
    setEditKey((key) => key + 1)
    setEditing(true)
  }, [readOnly, initialContent])

  if (editing) {
    return (
      <DescriptionEditMode
        key={editKey}
        taskId={taskId}
        initialContent={savedRef.current}
        onSave={(html) => {
          onSave(html)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
        isSaving={isSaving}
      />
    )
  }

  return (
    <DescriptionReadOnly
      initialContent={initialContent}
      onClick={startEdit}
      canEdit={!readOnly}
    />
  )
}
