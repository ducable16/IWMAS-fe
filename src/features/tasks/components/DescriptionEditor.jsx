import { useState, useRef, useCallback, useEffect } from 'react'
import { Check, Loader2, FileText, GripVertical, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'
import { taskService } from '@/features/tasks/services/taskService'
import { useQueryClient } from '@tanstack/react-query'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { uid, makeBlock, parseContent, serializeBlocks, sanitizeHtml } from './editor/editorUtils'
import { EditorToolbar } from './editor/EditorToolbar'

/* ─── Read-only block renderer ────────────────────────────────────────────── */
function BlockView({ block, idx, onImageClick }) {
  const html = { __html: sanitizeHtml(block.html) || '&nbsp;' }
  switch (block.type) {
    case 'heading': {
      const cls = [
        'text-[18px] font-bold text-text-primary mt-2 mb-1',
        'text-[15px] font-semibold text-text-primary mt-1',
        'text-[13px] font-semibold text-text-secondary',
      ][(block.level ?? 1) - 1]
      return <div className={clsx(cls, 'leading-snug')} dangerouslySetInnerHTML={html} />
    }
    case 'bullet':
      return (
        <div className="flex items-start gap-2">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
          <div className="text-[13px] text-text-secondary leading-relaxed" dangerouslySetInnerHTML={html} />
        </div>
      )
    case 'numbered':
      return (
        <div className="flex items-start gap-2">
          <span className="text-[13px] text-text-muted shrink-0 mt-0.5">{idx + 1}.</span>
          <div className="text-[13px] text-text-secondary leading-relaxed" dangerouslySetInnerHTML={html} />
        </div>
      )
    case 'code':
      return (
        <pre className="bg-bg-subtle rounded-lg px-3 py-2.5 my-1 overflow-x-auto">
          <code className="text-[12px] font-mono text-text-primary" dangerouslySetInnerHTML={html} />
        </pre>
      )
    case 'image':
      if (!block.url) return null
      return (
        <div className="my-2">
          <img src={block.url} alt={block.caption || ''} onClick={() => onImageClick?.(block.url, block.caption)}
            className="max-w-full rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
            style={{ maxHeight: 360, objectFit: 'contain' }} />
          {block.caption && <p className="text-[11px] text-text-muted mt-1">{block.caption}</p>}
        </div>
      )
    default:
      return <div className="text-[13px] text-text-secondary leading-relaxed min-h-[1.3em]" dangerouslySetInnerHTML={html} />
  }
}

/* ─── Read-only mode ──────────────────────────────────────────────────────── */
function DescriptionReadOnly({ initialContent, onClick, canEdit }) {
  const [lightbox, setLightbox] = useState(null)
  const isEmpty = !initialContent?.trim()
  const blocks = isEmpty ? null : parseContent(initialContent)
  return (
    <>
      <div onClick={canEdit ? onClick : undefined}
        className={clsx('rounded-lg px-2 py-1.5 -mx-2 transition-colors min-h-[36px]', canEdit && 'cursor-text hover:bg-bg-hover/40')}>
        {!blocks ? (
          <p className="text-[13px] text-text-muted italic flex items-center gap-2 py-1">
            <FileText className="w-4 h-4" strokeWidth={1.75} /> Add a description…
          </p>
        ) : (
          <div className="space-y-1.5">
            {blocks.map((b, i) => (
              <BlockView key={b.id ?? i} block={b} idx={i}
                onImageClick={(src, alt) => setLightbox({ src, alt: alt || '' })} />
            ))}
          </div>
        )}
      </div>
      {lightbox && <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </>
  )
}

/* ─── Contenteditable block ───────────────────────────────────────────────── */
function EditableBlock({ block, onFocus, onKeyDown, domRef, taskId, onImageUrlChange }) {
  const qc = useQueryClient()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const res = await taskService.uploadAttachment(taskId, file)
      const url = res.data?.url || res.data
      onImageUrlChange(url, file.name)
      qc.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] })
    } finally { setUploading(false) }
  }

  if (block.type === 'image') {
    return (
      <div className="my-1 space-y-1.5">
        {block.url ? (
          <div className="relative group/img">
            <img src={block.url} alt={block.caption || ''} className="max-w-full rounded-lg" style={{ maxHeight: 320, objectFit: 'contain' }} />
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 text-[13px] text-text-muted border border-dashed border-border rounded-lg px-4 py-3 w-full hover:border-accent hover:text-accent transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {uploading ? 'Uploading…' : 'Click to upload image'}
          </button>
        )}
        <input
          value={block.caption || ''}
          onChange={e => onImageUrlChange(block.url, e.target.value)}
          placeholder="Add caption…"
          className="w-full text-[11px] text-text-muted bg-transparent focus:outline-none border-none"
        />
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleUpload(e.target.files?.[0])} />
      </div>
    )
  }

  if (block.type === 'code') {
    return (
      <pre className="bg-bg-subtle rounded-lg px-3 py-2 my-1">
        <code
          ref={domRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className="text-[12px] font-mono text-text-primary focus:outline-none block whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: block.html || '' }}
        />
      </pre>
    )
  }

  const cls = clsx(
    'w-full focus:outline-none leading-relaxed break-words',
    block.type === 'heading' && block.level === 1 && 'text-[20px] font-bold text-text-primary',
    block.type === 'heading' && block.level === 2 && 'text-[16px] font-semibold text-text-primary',
    block.type === 'heading' && block.level === 3 && 'text-[14px] font-semibold text-text-secondary',
    block.type === 'bullet'   && 'text-[13px] text-text-secondary',
    block.type === 'numbered' && 'text-[13px] text-text-secondary',
    block.type === 'paragraph' && 'text-[13px] text-text-secondary',
    !block.html && 'empty:before:content-[attr(data-placeholder)] empty:before:text-text-muted/60 empty:before:pointer-events-none',
  )

  return (
    <div className="flex items-start gap-1.5">
      {(block.type === 'bullet' || block.type === 'numbered') && (
        <span className="mt-[5px] shrink-0 text-text-muted text-[13px] leading-none select-none">
          {block.type === 'bullet' ? '•' : '1.'}
        </span>
      )}
      <div
        ref={domRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onPaste={e => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          document.execCommand('insertText', false, text)
        }}
        data-placeholder={block.html ? '' : 'Type something…'}
        className={cls}
        dangerouslySetInnerHTML={{ __html: block.html || '' }}
      />
    </div>
  )
}

/* ─── Edit mode ───────────────────────────────────────────────────────────── */
function DescriptionEditMode({ taskId, initialContent, onSave, onCancel, isSaving }) {
  const initBlocks = () => {
    const parsed = parseContent(initialContent)
    return parsed?.length ? parsed.map(b => ({ ...b, id: b.id ?? uid() })) : [makeBlock()]
  }

  const [blocks, setBlocks] = useState(initBlocks)
  const [focusedIdx, setFocusedIdx] = useState(null)
  const [dragIdx, setDragIdx] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const dragOkRef = useRef(false)

  // DOM refs for each block (keyed by block.id)
  const domRefs = useRef({})

  // Collect current HTML from DOM before any state operation
  const syncHtml = useCallback(() => {
    setBlocks(prev => prev.map(b => {
      const el = domRefs.current[b.id]
      if (!el || b.type === 'image') return b
      return { ...b, html: el.innerHTML }
    }))
  }, [])

  // Save
  const handleSave = useCallback(() => {
    const currentBlocks = blocks.map(b => {
      const el = domRefs.current[b.id]
      if (!el || b.type === 'image') return b
      return { ...b, html: el.innerHTML }
    })
    onSave(serializeBlocks(currentBlocks))
  }, [blocks, onSave])

  // Keyboard shortcuts
  useEffect(() => {
    const h = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave()
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [handleSave, onCancel])

  // Insert new block after index
  const insertAfter = useCallback((idx) => {
    syncHtml()
    const nb = makeBlock()
    setBlocks(prev => { const n = [...prev]; n.splice(idx + 1, 0, nb); return n })
    setTimeout(() => domRefs.current[nb.id]?.focus(), 30)
  }, [syncHtml])

  // Delete block at index
  const deleteBlock = useCallback((idx) => {
    setBlocks(prev => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== idx)
    })
    setTimeout(() => {
      const prev = blocks[Math.max(0, idx - 1)]
      if (prev) domRefs.current[prev.id]?.focus()
    }, 30)
  }, [blocks])

  // Change block type (syncs HTML first)
  const changeType = useCallback((idx, type, level) => {
    if (idx === null || idx === undefined) return
    const el = domRefs.current[blocks[idx]?.id]
    const html = el?.innerHTML ?? blocks[idx]?.html ?? ''
    setBlocks(prev => prev.map((b, i) =>
      i === idx ? { ...b, type, level: level ?? undefined, html } : b
    ))
    setTimeout(() => domRefs.current[blocks[idx]?.id]?.focus(), 30)
  }, [blocks])

  // Toolbar handlers
  const handleInsertImage = useCallback(() => {
    syncHtml()
    const nb = makeBlock('image', { url: '', caption: '' })
    const after = focusedIdx ?? blocks.length - 1
    setBlocks(prev => { const n = [...prev]; n.splice(after + 1, 0, nb); return n })
  }, [focusedIdx, blocks.length, syncHtml])

  const handleInsertCode = useCallback(() => {
    syncHtml()
    const nb = makeBlock('code')
    const after = focusedIdx ?? blocks.length - 1
    setBlocks(prev => { const n = [...prev]; n.splice(after + 1, 0, nb); return n })
    setTimeout(() => domRefs.current[nb.id]?.focus(), 30)
  }, [focusedIdx, blocks.length, syncHtml])

  const handleInsertLink = useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (url) document.execCommand('createLink', false, url)
  }, [])

  // Per-block keydown
  const makeKeyHandler = (idx) => (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      insertAfter(idx)
    }
    if (e.key === 'Backspace') {
      const el = domRefs.current[blocks[idx].id]
      if (!el?.textContent?.trim() && el?.innerHTML === '') {
        e.preventDefault()
        deleteBlock(idx)
      }
    }
  }

  // Drag handlers
  const onDragStart = (e, i) => {
    if (!dragOkRef.current) { e.preventDefault(); return }
    setDragIdx(i); e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (e, i) => { e.preventDefault(); setDragOver(i) }
  const onDrop = (e, i) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== i) {
      setBlocks(prev => {
        const n = [...prev]; const [r] = n.splice(dragIdx, 1); n.splice(i, 0, r); return n
      })
    }
    setDragIdx(null); setDragOver(null); dragOkRef.current = false
  }

  const focusedBlock = focusedIdx !== null ? blocks[focusedIdx] : null

  return (
    <div className="space-y-2.5">
      <div className="border border-border rounded-lg overflow-hidden focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/10 transition-all">
        {/* Toolbar */}
        <EditorToolbar
          focusedBlock={focusedBlock}
          onChangeType={(type, level) => changeType(focusedIdx, type, level)}
          onInsertImage={handleInsertImage}
          onInsertCode={handleInsertCode}
          onInsertBlock={() => insertAfter(focusedIdx ?? blocks.length - 1)}
          onInsertLink={handleInsertLink}
        />

        {/* Blocks */}
        <div className="p-3 space-y-1 min-h-[80px]" onDragOver={e => e.preventDefault()}>
          {blocks.map((block, i) => (
            <div
              key={`${block.id}-${block.type}-${block.level}`}
              draggable
              onDragStart={e => onDragStart(e, i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={e => onDrop(e, i)}
              onDragEnd={() => { setDragIdx(null); setDragOver(null); dragOkRef.current = false }}
              className={clsx('group flex items-start gap-1 rounded py-0.5', dragOver === i && dragIdx !== i && 'border-t-2 border-accent')}
            >
              {/* Drag grip */}
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded text-text-muted hover:bg-bg-hover"
                onMouseDown={() => { dragOkRef.current = true }}
                onMouseUp={() => { dragOkRef.current = false }}
              >
                <GripVertical className="w-4 h-4" strokeWidth={1.5} />
              </div>

              {/* Block content */}
              <div className="flex-1 min-w-0">
                <EditableBlock
                  block={block}
                  taskId={taskId}
                  domRef={el => { if (el) domRefs.current[block.id] = el }}
                  onFocus={() => setFocusedIdx(i)}
                  onKeyDown={makeKeyHandler(i)}
                  onImageUrlChange={(url, caption) =>
                    setBlocks(prev => prev.map((b, j) => j === i ? { ...b, url, caption } : b))
                  }
                />
              </div>

              {/* Delete */}
              {blocks.length > 1 && (
                <button type="button" onClick={() => deleteBlock(i)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0 p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10">
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}

          <button type="button" onMouseDown={() => insertAfter(blocks.length - 1)}
            className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-primary mt-1 pl-5 transition-colors">
            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add block
          </button>
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleSave} disabled={isSaving}
          className="btn-primary text-[12px] px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50">
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" strokeWidth={2.5} />}
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={isSaving}
          className="btn-ghost text-[12px] px-3 py-1.5 disabled:opacity-50">
          Cancel
        </button>
        <span className="text-[11px] text-text-muted ml-auto hidden sm:block">
          Ctrl+Enter to save · Esc to cancel
        </span>
      </div>
    </div>
  )
}

/* ─── Public export ───────────────────────────────────────────────────────── */
export default function DescriptionEditor({ taskId, initialContent, onSave, readOnly = false, isSaving = false }) {
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
        onSave={json => { onSave(json); setEditing(false) }}
        onCancel={() => setEditing(false)}
        isSaving={isSaving}
      />
    )
  }

  return <DescriptionReadOnly initialContent={initialContent} onClick={startEdit} canEdit={!readOnly} />
}
