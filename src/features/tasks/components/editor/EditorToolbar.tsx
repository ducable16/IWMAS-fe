import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Image as ImageIcon, Plus, Undo2, Redo2 } from 'lucide-react'
import clsx from 'clsx'
import type { MouseEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface FocusedBlock {
  type?: string | undefined
  level?: number | undefined
}

interface ToolbarBtnProps {
  icon?: LucideIcon | undefined
  label: string
  onMouseDown?: (() => void) | undefined
  active?: boolean | undefined
  disabled?: boolean | undefined
  children?: ReactNode | undefined
}

interface DropdownProps {
  triggerEl: ReactNode
  children: (args: { close: () => void }) => ReactNode
}

interface TextTypeDropdownProps {
  focusedBlock?: FocusedBlock | null | undefined
  onChangeType: (type: string, level?: number) => void
}

interface ListDropdownProps {
  onChangeType: (type: string) => void
}

interface EditorToolbarProps {
  focusedBlock?: FocusedBlock | null | undefined
  onChangeType: (type: string, level?: number) => void
  onInsertImage: () => void
  onInsertBlock: () => void
}

/* ─── Primitives ──────────────────────────────────────────────────────────── */
export function ToolbarSep() {
  return <div className="w-px h-4 bg-border mx-1 shrink-0" />
}

/** onMouseDown with e.preventDefault() keeps contenteditable focused */
export function ToolbarBtn({ icon: Icon, label, onMouseDown, active, disabled, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onMouseDown={(e: MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onMouseDown?.() }}
      className={clsx(
        'flex items-center gap-1 px-1.5 py-1 rounded text-[12px] transition-colors shrink-0 select-none',
        'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
        active && 'bg-bg-subtle text-text-primary',
        disabled && 'opacity-40 pointer-events-none',
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
      {children}
    </button>
  )
}

/** Generic dropdown that stays open while interacting */
export function Dropdown({ triggerEl, children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: globalThis.MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative shrink-0" ref={ref}>
      <div onMouseDown={(e: MouseEvent<HTMLDivElement>) => { e.preventDefault(); setOpen(v => !v) }}>{triggerEl}</div>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-[200] min-w-[170px] bg-bg-surface border border-border rounded-lg shadow-card py-1 animate-fade-in"
          onMouseDown={(e: MouseEvent<HTMLDivElement>) => e.preventDefault()}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  )
}

/* ─── Text-type dropdown (Tt) ─────────────────────────────────────────────── */
const TEXT_TYPES = [
  { type: 'paragraph', label: 'Paragraph',     tag: 'T'  },
  { type: 'heading',   label: 'Heading 1',     tag: 'H1', level: 1 },
  { type: 'heading',   label: 'Heading 2',     tag: 'H2', level: 2 },
  { type: 'heading',   label: 'Heading 3',     tag: 'H3', level: 3 },
  { type: 'bullet',    label: 'Bullet list',   tag: '•'  },
  { type: 'numbered',  label: 'Numbered list', tag: '1.' },
]

export function TextTypeDropdown({ focusedBlock, onChangeType }: TextTypeDropdownProps) {
  const label = focusedBlock?.type === 'heading' ? `H${focusedBlock.level}` : 'Tt'
  return (
    <Dropdown
      triggerEl={
        <button type="button" className="flex items-center gap-0.5 px-1.5 py-1 rounded text-[12px] text-text-secondary hover:bg-bg-hover transition-colors select-none">
          <span className="font-semibold leading-none">{label}</span>
          <ChevronDown className="w-3 h-3 ml-0.5" strokeWidth={2} />
        </button>
      }
    >
      {({ close }) => TEXT_TYPES.map(tt => (
        <button
          key={`${tt.type}-${tt.level}`}
          type="button"
          onMouseDown={() => { onChangeType(tt.type, tt.level); close() }}
          className="flex items-center gap-3 w-full px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
        >
          <span className="w-5 text-[11px] text-text-muted font-mono font-bold">{tt.tag}</span>
          {tt.label}
        </button>
      ))}
    </Dropdown>
  )
}

/* ─── Format dropdown (B) ─────────────────────────────────────────────────── */
const FORMATS = [
  { cmd: 'bold',          label: 'Bold',          Icon: Bold,          kbd: 'Ctrl+B' },
  { cmd: 'italic',        label: 'Italic',        Icon: Italic,        kbd: 'Ctrl+I' },
  { cmd: 'underline',     label: 'Underline',     Icon: Underline,     kbd: 'Ctrl+U' },
  { cmd: 'strikeThrough', label: 'Strikethrough', Icon: Strikethrough, kbd: ''       },
]

export function FormatDropdown() {
  return (
    <Dropdown
      triggerEl={
        <button type="button" className="flex items-center gap-0.5 px-1.5 py-1 rounded text-[12.5px] font-bold text-text-secondary hover:bg-bg-hover transition-colors select-none">
          B <ChevronDown className="w-3 h-3" strokeWidth={2} />
        </button>
      }
    >
      {({ close }) => FORMATS.map(f => (
        <button
          key={f.cmd}
          type="button"
          onMouseDown={() => { document.execCommand(f.cmd); close() }}
          className="flex items-center justify-between w-full px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
        >
          <span className="flex items-center gap-2">
            <f.Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            {f.label}
          </span>
          {f.kbd && <span className="text-[10px] text-text-muted">{f.kbd}</span>}
        </button>
      ))}
    </Dropdown>
  )
}

/* ─── List dropdown (≡) ───────────────────────────────────────────────────── */
export function ListDropdown({ onChangeType }: ListDropdownProps) {
  return (
    <Dropdown
      triggerEl={
        <button type="button" className="flex items-center gap-0.5 px-1.5 py-1 rounded text-[12px] text-text-secondary hover:bg-bg-hover transition-colors select-none">
          <List className="w-3.5 h-3.5" strokeWidth={1.75} />
          <ChevronDown className="w-3 h-3" strokeWidth={2} />
        </button>
      }
    >
      {({ close }) => (
        <>
          <button type="button" onMouseDown={() => { onChangeType('bullet'); close() }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors">
            <List className="w-3.5 h-3.5" strokeWidth={1.75} /> Bullet list
          </button>
          <button type="button" onMouseDown={() => { onChangeType('numbered'); close() }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors">
            <ListOrdered className="w-3.5 h-3.5" strokeWidth={1.75} /> Numbered list
          </button>
        </>
      )}
    </Dropdown>
  )
}

/* ─── Main toolbar ────────────────────────────────────────────────────────── */
export function EditorToolbar({ focusedBlock, onChangeType, onInsertImage, onInsertBlock }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border-subtle flex-wrap bg-bg-subtle/50 rounded-t-lg">
      {/* Text type */}
      <TextTypeDropdown focusedBlock={focusedBlock} onChangeType={onChangeType} />
      <ToolbarSep />
      {/* Inline format */}
      <FormatDropdown />
      {/* List */}
      <ListDropdown onChangeType={t => onChangeType(t)} />
      <ToolbarSep />
      {/* Image */}
      <ToolbarBtn icon={ImageIcon} label="Insert image" onMouseDown={onInsertImage} />
      <ToolbarSep />
      {/* Add block */}
      <ToolbarBtn icon={Plus} label="Add block" onMouseDown={onInsertBlock} />
      <ToolbarSep />
      {/* Undo / Redo */}
      <ToolbarBtn icon={Undo2} label="Undo (Ctrl+Z)" onMouseDown={() => document.execCommand('undo')} />
      <ToolbarBtn icon={Redo2} label="Redo (Ctrl+Y)" onMouseDown={() => document.execCommand('redo')} />
    </div>
  )
}
