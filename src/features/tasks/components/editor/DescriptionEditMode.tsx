import { useCallback, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { BlockNoteView } from '@blocknote/ariakit'
import { taskService } from '@/features/tasks/services/taskService'
import EditorStaticToolbar from './EditorStaticToolbar'
import { useEditorWithContent } from './useEditorWithContent'
import type { DescriptionEditModeProps } from './descriptionEditorTypes'

export default function DescriptionEditMode({
  taskId,
  initialContent,
  onSave,
  onCancel,
  isSaving,
}: DescriptionEditModeProps) {
  const { editor, ready } = useEditorWithContent(initialContent, {
    uploadFile: async (file: File) => {
      const res = await taskService.uploadAttachment(taskId, file)
      return res.data?.url || res.data
    },
  })

  const handleSave = useCallback(async () => {
    try {
      const html = await editor.blocksToHTMLLossy(editor.document)
      onSave(html)
    } catch (err) {
      console.error('[DescriptionEditor] Save failed:', err)
    }
  }, [editor, onSave])

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleSave, onCancel])

  return (
    <div className="space-y-2.5">
      <div
        className={clsx(
          'border rounded-lg bg-white transition-all',
          'border-[#DDDDDD]',
          'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
        )}
      >
        {ready && (
          <div className="rounded-tl-lg rounded-tr-lg overflow-hidden">
            <EditorStaticToolbar editor={editor} />
          </div>
        )}

        {!ready && (
          <div className="flex items-center justify-center p-8 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
          </div>
        )}

        <div className={ready ? 'block' : 'invisible h-0 overflow-hidden'}>
          <BlockNoteView editor={editor as never} theme="light" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary text-[12px] px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSaving
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Check className="w-3 h-3" strokeWidth={2.5} />}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="btn-ghost text-[12px] px-3 py-1.5 disabled:opacity-50"
        >
          Cancel
        </button>
        <span className="text-[11px] text-text-muted ml-auto hidden sm:block">
          Ctrl+Enter to save - Esc to cancel
        </span>
      </div>
    </div>
  )
}
