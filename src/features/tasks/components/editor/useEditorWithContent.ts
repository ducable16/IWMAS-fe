import { useEffect, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { contentToHtml } from './contentConversion'

export function useEditorWithContent(
  initialContent: string | null | undefined,
  extraOptions = {},
) {
  const [ready, setReady] = useState(false)
  const editor = useCreateBlockNote(extraOptions)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const html = await contentToHtml(initialContent)
      if (cancelled) return
      if (html) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(html)
          if (!cancelled) editor.replaceBlocks(editor.document, blocks)
        } catch (err) {
          console.warn('[DescriptionEditor] Failed to parse HTML:', err)
        }
      }
      if (!cancelled) setReady(true)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [editor, initialContent])

  return { editor, ready }
}
