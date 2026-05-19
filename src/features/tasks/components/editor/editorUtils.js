/* ─── Unique IDs ──────────────────────────────────────────────────────────── */
let _seq = 0
export const uid = () => `blk-${Date.now()}-${++_seq}`

/* ─── HTML helpers ────────────────────────────────────────────────────────── */
// ul, ol, li needed for list blocks
const ALLOW = new Set(['strong','b','em','i','u','s','del','strike','code','br','a','span','ul','ol','li'])

export function sanitizeHtml(html) {
  if (!html) return ''
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (m, tag) =>
    ALLOW.has(tag.toLowerCase()) ? m : ''
  )
}

export function escapeHtml(t = '') {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

/* ─── Block factory ───────────────────────────────────────────────────────── */
export const makeBlock = (type = 'paragraph', extra = {}) => {
  // List blocks start with an empty <li> so contenteditable has something to edit
  const defaultHtml = (type === 'bullet' || type === 'numbered') ? '<li><br></li>' : ''
  return { id: uid(), type, html: defaultHtml, ...extra }
}

/* ─── Merge consecutive list blocks of the same type into one ─────────────── */
function mergeListBlocks(blocks) {
  if (!blocks?.length) return blocks
  const result = []
  for (const b of blocks) {
    const isList = b.type === 'bullet' || b.type === 'numbered'
    if (!isList) { result.push(b); continue }

    // Ensure html is <li>-wrapped (migration from old flat html)
    const liHtml = b.html?.trim().startsWith('<li') ? b.html : `<li>${b.html || ''}</li>`

    const prev = result[result.length - 1]
    if (prev?.type === b.type) {
      // Merge into previous block
      prev.html += liHtml
    } else {
      result.push({ ...b, html: liHtml })
    }
  }
  return result
}

/* ─── Parse raw description → Block[] ────────────────────────────────────── */
export function parseContent(raw) {
  if (!raw?.trim()) return null
  try {
    const p = JSON.parse(raw)
    // v3 — our current format
    if (p?._v === 3 && Array.isArray(p.blocks))
      return mergeListBlocks(p.blocks.map(b => ({ ...b, id: b.id ?? uid() })))
    // v2 — previous format with `text` field
    if (p?._v === 2 && Array.isArray(p.blocks))
      return mergeListBlocks(p.blocks.map(b => ({ ...b, id: b.id ?? uid(), html: b.html ?? escapeHtml(b.text ?? '') })))
    // BlockNote v1 — array with ProseMirror content nodes
    if (Array.isArray(p) && p[0]?.type) {
      const converted = p.map(b => {
        if (b.type === 'image')
          return { id: uid(), type: 'image', url: b.props?.url || '', caption: b.props?.caption || '', html: '' }
        const html = Array.isArray(b.content)
          ? b.content.map(c => {
              if (c.type !== 'text') return ''
              let t = escapeHtml(c.text || '')
              if (c.styles?.bold)      t = `<strong>${t}</strong>`
              if (c.styles?.italic)    t = `<em>${t}</em>`
              if (c.styles?.underline) t = `<u>${t}</u>`
              if (c.styles?.strike)    t = `<s>${t}</s>`
              if (c.styles?.code)      t = `<code>${t}</code>`
              return t
            }).join('')
          : escapeHtml(typeof b.content === 'string' ? b.content : '')
        const type = b.type === 'bulletListItem' ? 'bullet'
          : b.type === 'numberedListItem' ? 'numbered'
          : b.type === 'heading' ? 'heading'
          : 'paragraph'
        return { id: uid(), type, level: b.props?.level, html }
      })
      return mergeListBlocks(converted)
    }
  } catch { /* not JSON */ }
  // Legacy plain text
  return raw.split('\n').map(line => ({ id: uid(), type: 'paragraph', html: escapeHtml(line) }))
}

export const serializeBlocks = (blocks) => JSON.stringify({ _v: 3, blocks })
