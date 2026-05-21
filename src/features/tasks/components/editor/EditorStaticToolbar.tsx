import { useEffect, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Italic,
  Strikethrough,
  Underline,
} from 'lucide-react'
import clsx from 'clsx'
import type { MouseEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { BlockNoteEditorInstance } from './descriptionEditorTypes'

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

const BLOCK_TYPES: BlockTypeOption[] = [
  { value: 'paragraph', label: 'Text', icon: 'P', type: 'paragraph', props: {} },
  { value: 'heading1', label: 'Heading 1', icon: 'H1', type: 'heading', props: { level: 1 } },
  { value: 'heading2', label: 'Heading 2', icon: 'H2', type: 'heading', props: { level: 2 } },
  { value: 'heading3', label: 'Heading 3', icon: 'H3', type: 'heading', props: { level: 3 } },
  { value: 'bulletListItem', label: 'Bullet', icon: '-', type: 'bulletListItem', props: {} },
  { value: 'numberedListItem', label: 'Numbered', icon: '1.', type: 'numberedListItem', props: {} },
  { value: 'checkListItem', label: 'To-do', icon: '[ ]', type: 'checkListItem', props: {} },
  { value: 'codeBlock', label: 'Code', icon: '<>', type: 'codeBlock', props: {} },
]

const CHEVRON_SVG = "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A39E98' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")"

function ToolbarBtn({ icon: Icon, active, title, onPress }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        onPress()
      }}
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

function ToolbarSep() {
  return <div className="w-px h-3.5 bg-[rgba(0,0,0,0.12)] mx-0.5 shrink-0" />
}

export default function EditorStaticToolbar({ editor }: { editor: BlockNoteEditorInstance }) {
  const [styles, setStyles] = useState<ActiveStyles>({})
  const [curType, setCurType] = useState('paragraph')
  const [curAlign, setCurAlign] = useState<TextAlignment>('left')

  useEffect(() => {
    const unsub = editor.onSelectionChange((ed: BlockNoteEditorInstance) => {
      try {
        setStyles(ed.getActiveStyles())
        const pos = ed.getTextCursorPosition()
        if (pos?.block) {
          const { type, props } = pos.block
          setCurType(type === 'heading' ? `heading${props?.level ?? 1}` : type)
          setCurAlign((props?.textAlignment || 'left') as TextAlignment)
        }
      } catch {
        // editor may not be focused yet
      }
    })
    return () => unsub()
  }, [editor])

  function changeBlockType(type: string, props: Record<string, unknown> = {}) {
    try {
      const pos = editor.getTextCursorPosition()
      if (pos?.block) editor.updateBlock(pos.block, { type, props })
    } catch {
      // ignore transient editor selection state
    }
  }

  function toggleStyle(style: string) {
    try {
      editor.toggleStyles({ [style]: true })
    } catch {
      // ignore transient editor selection state
    }
  }

  function setAlignment(alignment: TextAlignment) {
    try {
      const pos = editor.getTextCursorPosition()
      if (pos?.block) editor.updateBlock(pos.block, { props: { textAlignment: alignment } })
    } catch {
      // ignore transient editor selection state
    }
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[rgba(0,0,0,0.07)] bg-[#F9F9F8] flex-wrap min-h-[34px]">
      <select
        value={curType}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const found = BLOCK_TYPES.find((block) => block.value === e.target.value)
          if (found) changeBlockType(found.type, found.props)
        }}
        className="h-6 pl-1.5 pr-5 text-[11px] font-medium text-text-primary rounded bg-transparent hover:bg-[rgba(0,0,0,0.05)] border-none outline-none cursor-pointer appearance-none min-w-[80px] shrink-0"
        style={{
          backgroundImage: CHEVRON_SVG,
          backgroundPosition: 'right 2px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '14px 14px',
        }}
      >
        {BLOCK_TYPES.map((block) => (
          <option key={block.value} value={block.value}>
            {block.icon} {block.label}
          </option>
        ))}
      </select>

      <ToolbarSep />

      <ToolbarBtn icon={Bold} active={!!styles.bold} title="Bold (Ctrl+B)" onPress={() => toggleStyle('bold')} />
      <ToolbarBtn icon={Italic} active={!!styles.italic} title="Italic (Ctrl+I)" onPress={() => toggleStyle('italic')} />
      <ToolbarBtn icon={Underline} active={!!styles.underline} title="Underline (Ctrl+U)" onPress={() => toggleStyle('underline')} />
      <ToolbarBtn icon={Strikethrough} active={!!styles.strike} title="Strikethrough" onPress={() => toggleStyle('strike')} />
      <ToolbarBtn icon={Code} active={!!styles.code} title="Inline Code" onPress={() => toggleStyle('code')} />

      <ToolbarSep />

      <ToolbarBtn icon={AlignLeft} active={curAlign === 'left'} title="Align Left" onPress={() => setAlignment('left')} />
      <ToolbarBtn icon={AlignCenter} active={curAlign === 'center'} title="Align Center" onPress={() => setAlignment('center')} />
      <ToolbarBtn icon={AlignRight} active={curAlign === 'right'} title="Align Right" onPress={() => setAlignment('right')} />
    </div>
  )
}
