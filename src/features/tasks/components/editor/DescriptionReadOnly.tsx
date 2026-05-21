import { FileText, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { BlockNoteView } from '@blocknote/ariakit'
import { useEditorWithContent } from './useEditorWithContent'
import type { DescriptionReadOnlyProps } from './descriptionEditorTypes'

export default function DescriptionReadOnly({
  initialContent,
  onClick,
  canEdit,
}: DescriptionReadOnlyProps) {
  const isEmpty = !initialContent?.trim()
  const { editor, ready } = useEditorWithContent(isEmpty ? null : initialContent)

  if (isEmpty) {
    return canEdit ? (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left rounded-lg px-2 py-1.5 -mx-2 hover:bg-[rgba(0,0,0,0.03)] transition-colors min-h-[36px]"
      >
        <p className="text-[13px] text-text-muted italic flex items-center gap-2 py-1">
          <FileText className="w-4 h-4" strokeWidth={1.75} /> Add a description...
        </p>
      </button>
    ) : null
  }

  return (
    <div
      onClick={canEdit ? onClick : undefined}
      className={clsx(
        'rounded-lg -mx-3 transition-colors min-h-[36px]',
        canEdit && 'cursor-text hover:bg-[rgba(0,0,0,0.03)]',
      )}
    >
      {!ready && (
        <div className="flex items-center gap-2 p-3 text-[13px] text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      <div className={ready ? 'block' : 'invisible h-0 overflow-hidden'}>
        <BlockNoteView editor={editor as never} editable={false} theme="light" />
      </div>
    </div>
  )
}
