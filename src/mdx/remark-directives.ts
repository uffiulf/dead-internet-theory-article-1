import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

// Transforms lines like:
// [ANIM:start parallax+fade-in hero]
// [FX: glitch effect on scroll]
// [GRAPH: timeline ...]
// [MEDIA: photo "Shrimp Jesus" - ...]
// into MDX JSX elements: <Anim value="start parallax+fade-in hero" /> etc.

export const remarkDirectives: Plugin = () => {
  return (tree: any) => {
    // Simple inline single-line directives (FX/GRAPH/MEDIA and ANIM single)
    (visit as any)(tree, 'paragraph', (node: any, index: any, parent: any) => {
      if (!parent || index == null) return
      if (!node.children || node.children.length !== 1) return
      const child = node.children[0]
      if (child.type !== 'text') return
      const text: string = child.value.trim()
      // ANIM/FX/GRAPH/MEDIA
      const match = text.match(/^\[(ANIM|FX|GRAPH|MEDIA):\s*(.+)\]$/i)
      if (!match) return
      const kind = match[1].toUpperCase()
      const value = match[2].trim()
      const name = kind === 'ANIM' ? 'Anim' : kind === 'FX' ? 'Fx' : kind === 'GRAPH' ? 'Graph' : 'Media'

      parent.children.splice(index, 1, {
        type: 'mdxJsxFlowElement',
        name,
        attributes: [
          { type: 'mdxJsxAttribute', name: 'value', value },
        ],
        children: [],
      })
    })

    // ELIAS cues, as block paragraphs
    ;(visit as any)(tree, 'paragraph', (node: any, index: any, parent: any) => {
      if (!parent || index == null) return
      if (!node.children || node.children.length !== 1) return
      const child = node.children[0]
      if (child.type !== 'text') return
      const t: string = child.value.trim()
      const m = t.match(/^\[ELIAS:\s*(appear|whisper|hide|takeover)\s+at=([0-9]+(?:\.[0-9]+)?)\s*(?:text=\"([^\"]*)\")?\]$/i)
      if (!m) return
      const mode = m[1].toLowerCase()
      const at = m[2]
      const text = m[3] ?? ''
      parent.children.splice(index, 1, {
        type: 'mdxJsxFlowElement',
        name: 'EliasCue',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'mode', value: mode },
          { type: 'mdxJsxAttribute', name: 'at', value: at },
          { type: 'mdxJsxAttribute', name: 'text', value: text },
        ],
        children: [],
      })
    })

    // Range wrapping for ANIM:start ... ANIM:end
    const children = (tree.children ?? []) as any[]
    let i = 0
    while (i < children.length) {
      const node = children[i]
      if (node.type === 'paragraph' && node.children && node.children[0] && node.children[0].type === 'text') {
        const txt = String(node.children[0].value).trim()
        const start = txt.match(/^\[ANIM:start\s+(.+)]$/i)
        if (start) {
          const value = start[1]
          // find end
          let j = i + 1
          let endIndex = -1
          while (j < children.length) {
            const n = children[j]
            if (n.type === 'paragraph' && n.children && n.children[0] && n.children[0].type === 'text') {
              const t2 = String(n.children[0].value).trim()
              if (/^\[ANIM:end\]$/i.test(t2)) { endIndex = j; break }
            }
            j++
          }
          if (endIndex !== -1) {
            const between = children.slice(i + 1, endIndex)
            const wrapped = {
              type: 'mdxJsxFlowElement',
              name: 'Anim',
              attributes: [{ type: 'mdxJsxAttribute', name: 'value', value }],
              children: between,
            }
            // replace [start, ..., end] with wrapped
            children.splice(i, endIndex - i + 1, wrapped)
            continue // process next
          } else {
            console.warn('[remark-directives] Unbalanced ANIM:start without end for value:', value)
          }
        }
      }
      i++
    }
    tree.children = children
  }
}

export default remarkDirectives


