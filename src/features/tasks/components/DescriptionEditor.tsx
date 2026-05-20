import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Check, Loader2, FileText,
  Bold, Italic, Underline, Strikethrough, Code,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'
import clsx from 'clsx'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/ariakit'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/ariakit/style.css'
import '@/styles/blocknote-overrides.css'
import { taskService } from '@/features/tasks/services/taskService'
import { parseContent } from './editor/editorUtils'
import type { MouseEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Id } from '@/types'
import type { LegacyEditorBlock } from './editor/editorUtils'

interface DescriptionEditorProps {
  taskId: Id
  initialContent?: string | null | undefined
  onSave: (html: string | null) => void
  readOnly?: boolean
  isSaving?: boolean
}

interface DescriptionEditModeProps extends DescriptionEditorProps {
  initialContent?: string | null | undefined
  onCancel: () => void
  isSaving: boolean
}

interface DescriptionReadOnlyProps {
  initialContent?: string | null | undefined
  onClick: () => void
  canEdit: boolean
}

interface ToolbarBtnProps {
  icon: LucideIcon
  active?: boolean
  title: string
  onPress: () => void
}

interface BlockTypeOption {
  value: string
  label: string
  icon: string
  type: string
  props: Record<string, unknown>
}

type ActiveStyles = Record<string, boolean | undefined>
type TextAlignment = 'left' | 'center' | 'right'

type BlockNoteEditorInstance = ReturnType<typeof useCreateBlockNote>

/* ─── Legacy content → HTML ────────────────────────────────────────────────── */
function blocksToHtml(blocks: LegacyEditorBlock[]) {
  return blocks.map(b => {
    const content = b.html || ''
    switch (b.type) {
      case 'heading': return `<h${b.level || 1}>${content || '&nbsp;'}</h${b.level || 1}>`
      case 'bullet':  return `<ul>${content.includes('<li') ? content : `<li>${content || '&nbsp;'}</li>`}</ul>`
      case 'numbered':return `<ol>${content.includes('<li') ? content : `<li>${content || '&nbsp;'}</li>`}</ol>`
      case 'code':    return `<pre><code>${content || '&nbsp;'}</code></pre>`
      case 'image':   return b.url ? `<img src="${b.url}" alt="${b.caption || ''}" />` : '<p>&nbsp;</p>'
      default:        return `<p>${content || '&nbsp;'}</p>`
    }
  }).join('')
}

async function contentToHtml(raw: string | null | undefined) {
  if (!raw?.trim()) return null
  if (raw.trim().startsWith('<')) return raw
  try {
    const p = JSON.parse(raw)
    if ((p?._v === 3 || p?._v === 2) && Array.isArray(p.blocks)) {
      const blocks = parseContent(raw)
      return blocks?.length ? blocksToHtml(blocks) : null
    }
    if (Array.isArray(p) && p[0]?.type) {
      const blocks = parseContent(raw)
      return blocks?.length ? blocksToHtml(blocks) : null
    }
  } catch { /* not JSON */ }
  return raw.split('\n').map(l => `<p>${l}</p>`).join('')
}

/* ─── Shared hook ───────────────────────────────────────────────────────────── */
function useEditorWithContent(initialContent: string | null | undefined, extraOptions = {}) {
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
    return () => { cancelled = true }
  }, [editor, initialContent])

  return { editor, ready }
}

/* ─── Block type definitions ────────────────────────────────────────────────── */
const BLOCK_TYPES: BlockTypeOption[] = [
  { value: 'paragraph',        label: 'Text',      icon: '¶',  type: 'paragraph',        props: {} },
  { value: 'heading1',         label: 'Heading 1', icon: 'H1', type: 'heading',          props: { level: 1 } },
  { value: 'heading2',         label: 'Heading 2', icon: 'H2', type: 'heading',          props: { level: 2 } },
  { value: 'heading3',         label: 'Heading 3', icon: 'H3', type: 'heading',          props: { level: 3 } },
  { value: 'bulletListItem',   label: 'Bullet',    icon: '•',  type: 'bulletListItem',   props: {} },
  { value: 'numberedListItem', label: 'Numbered',  icon: '1.', type: 'numberedListItem', props: {} },
  { value: 'checkListItem',    label: 'To-do',     icon: '☐',  type: 'checkListItem',    props: {} },
  { value: 'codeBlock',        label: 'Code',      icon: '<>', type: 'codeBlock',        props: {} },
]

/* ─── Toolbar atom: icon button ─────────────────────────────────────────────── */
function ToolbarBtn({ icon: Icon, active, title, onPress }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e: MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onPress() }}
      className={clsx(
        'w-6 h-6 flex items-center justify-center rounded transition-colors shrink-0',
        active
          ? 'bg-accent/10 text-accent'
          : 'text-text-secondary hover:bg-[rgba(0,0,0,0.06)] hover:text-text-primary',
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2.5 : 2} />
    </button>
  )
}

/* ─── Toolbar separator ─────────────────────────────────────────────────────── */
function ToolbarSep() {
  return <div className="w-px h-3.5 bg-[rgba(0,0,0,0.12)] mx-0.5 shrink-0" />
}

/* ─── Static formatting toolbar ─────────────────────────────────────────────── */
const CHEVRON_SVG = "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A39E98' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")"

function EditorStaticToolbar({ editor }: { editor: BlockNoteEditorInstance }) {
  const [styles, setStyles]     = useState<ActiveStyles>({})
  const [curType, setCurType]   = useState('paragraph')
  const [curAlign, setCurAlign] = useState<TextAlignment>('left')

  // Single subscription — tracks both inline styles and block type
  useEffect(() => {
    const unsub = editor.onSelectionChange((ed: BlockNoteEditorInstance) => {
      try {
        setStyles(ed.getActiveStyles())
        const pos = ed.getTextCursorPosition()
        if (pos?.block) {
          const { type, props: bProps } = pos.block
          setCurType(type === 'heading' ? `heading${bProps?.level ?? 1}` : type)
          setCurAlign((bProps?.textAlignment || 'left') as TextAlignment)
        }
      } catch { /* editor might not be focused yet */ }
    })
    return () => unsub()
  }, [editor])

  function changeBlockType(type: string, props: Record<string, unknown> = {}) {
    try {
      const pos = editor.getTextCursorPosition()
      if (pos?.block) editor.updateBlock(pos.block, { type, props })
    } catch {}
  }

  function toggleStyle(style: string) {
    try { editor.toggleStyles({ [style]: true }) } catch {}
  }

  function setAlignment(alignment: TextAlignment) {
    try {
      const pos = editor.getTextCursorPosition()
      if (pos?.block) editor.updateBlock(pos.block, { props: { textAlignment: alignment } })
    } catch {}
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[rgba(0,0,0,0.07)] bg-[#F9F9F8] flex-wrap min-h-[34px]">

      {/* Block type <select> */}
      <select
        value={curType}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const found = BLOCK_TYPES.find(b => b.value === e.target.value)
          if (found) changeBlockType(found.type, found.props)
        }}
        className="h-6 pl-1.5 pr-5 text-[11px] font-medium text-text-primary rounded
                   bg-transparent hover:bg-[rgba(0,0,0,0.05)] border-none outline-none
                   cursor-pointer appearance-none min-w-[80px] shrink-0"
        style={{
          backgroundImage: CHEVRON_SVG,
          backgroundPosition: 'right 2px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '14px 14px',
        }}
      >
        {BLOCK_TYPES.map(b => (
          <option key={b.value} value={b.value}>{b.icon}  {b.label}</option>
        ))}
      </select>

      <ToolbarSep />

      {/* Inline styles */}
      <ToolbarBtn icon={Bold}          active={!!styles.bold}      title="Bold (Ctrl+B)"      onPress={() => toggleStyle('bold')} />
      <ToolbarBtn icon={Italic}        active={!!styles.italic}    title="Italic (Ctrl+I)"    onPress={() => toggleStyle('italic')} />
      <ToolbarBtn icon={Underline}     active={!!styles.underline} title="Underline (Ctrl+U)" onPress={() => toggleStyle('underline')} />
      <ToolbarBtn icon={Strikethrough} active={!!styles.strike}    title="Strikethrough"      onPress={() => toggleStyle('strike')} />
      <ToolbarBtn icon={Code}          active={!!styles.code}      title="Inline Code"        onPress={() => toggleStyle('code')} />

      <ToolbarSep />

      {/* Text alignment */}
      <ToolbarBtn icon={AlignLeft}   active={curAlign === 'left'}   title="Align Left"   onPress={() => setAlignment('left')} />
      <ToolbarBtn icon={AlignCenter} active={curAlign === 'center'} title="Align Center" onPress={() => setAlignment('center')} />
      <ToolbarBtn icon={AlignRight}  active={curAlign === 'right'}  title="Align Right"  onPress={() => setAlignment('right')} />
    </div>
  )
}

/* ─── Edit mode ─────────────────────────────────────────────────────────────── */
function DescriptionEditMode({ taskId, initialContent, onSave, onCancel, isSaving }: DescriptionEditModeProps) {
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

  // Ctrl+Enter → save  |  Escape → cancel
  useEffect(() => {
    const h = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSave() }
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [handleSave, onCancel])

  return (
    <div className="space-y-2.5">
      {/* Editor container — NO overflow-hidden so side menu isn't clipped */}
      <div
        className={clsx(
          'border rounded-lg bg-white transition-all',
          'border-[#DDDDDD]',
          'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
        )}
      >
        {/* Static toolbar — rounded top corners */}
        {ready && (
          <div className="rounded-tl-lg rounded-tr-lg overflow-hidden">
            <EditorStaticToolbar editor={editor} />
          </div>
        )}

        {/* Loading skeleton */}
        {!ready && (
          <div className="flex items-center justify-center p-8 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
          </div>
        )}

        {/* BlockNote view */}
        <div className={ready ? 'block' : 'invisible h-0 overflow-hidden'}>
          <BlockNoteView editor={editor as never} theme="light" />
        </div>
      </div>

      {/* Actions */}
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
          {isSaving ? 'Saving…' : 'Save'}
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
          Ctrl+Enter to save · Esc to cancel
        </span>
      </div>
    </div>
  )
}

/* ─── Read-only mode ─────────────────────────────────────────────────────────── */
function DescriptionReadOnly({ initialContent, onClick, canEdit }: DescriptionReadOnlyProps) {
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
          <FileText className="w-4 h-4" strokeWidth={1.75} /> Add a description…
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

/* ─── Public export ──────────────────────────────────────────────────────────── */
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
    setEditKey(k => k + 1)
    setEditing(true)
  }, [readOnly, initialContent])

  if (editing) {
    return (
      <DescriptionEditMode
        key={editKey}
        taskId={taskId}
        initialContent={savedRef.current}
        onSave={(html) => { onSave(html); setEditing(false) }}
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
