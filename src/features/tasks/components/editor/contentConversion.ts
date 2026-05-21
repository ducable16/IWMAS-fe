import { parseContent } from './editorUtils'
import type { LegacyEditorBlock } from './editorUtils'

function blocksToHtml(blocks: LegacyEditorBlock[]) {
  return blocks.map((block) => {
    const content = block.html || ''
    switch (block.type) {
      case 'heading':
        return `<h${block.level || 1}>${content || '&nbsp;'}</h${block.level || 1}>`
      case 'bullet':
        return `<ul>${content.includes('<li') ? content : `<li>${content || '&nbsp;'}</li>`}</ul>`
      case 'numbered':
        return `<ol>${content.includes('<li') ? content : `<li>${content || '&nbsp;'}</li>`}</ol>`
      case 'code':
        return `<pre><code>${content || '&nbsp;'}</code></pre>`
      case 'image':
        return block.url ? `<img src="${block.url}" alt="${block.caption || ''}" />` : '<p>&nbsp;</p>'
      default:
        return `<p>${content || '&nbsp;'}</p>`
    }
  }).join('')
}

export async function contentToHtml(raw: string | null | undefined) {
  if (!raw?.trim()) return null
  if (raw.trim().startsWith('<')) return raw
  try {
    const parsed = JSON.parse(raw)
    if ((parsed?._v === 3 || parsed?._v === 2) && Array.isArray(parsed.blocks)) {
      const blocks = parseContent(raw)
      return blocks?.length ? blocksToHtml(blocks) : null
    }
    if (Array.isArray(parsed) && parsed[0]?.type) {
      const blocks = parseContent(raw)
      return blocks?.length ? blocksToHtml(blocks) : null
    }
  } catch {
    // not JSON
  }
  return raw.split('\n').map((line) => `<p>${line}</p>`).join('')
}
