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
    (visit as any)(tree, 'paragraph', (node: any, index: any, parent: any) => {
      if (!parent || index == null) return
      if (!node.children || node.children.length !== 1) return
      const child = node.children[0]
      if (child.type !== 'text') return
      const text: string = child.value.trim()
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
  }
}

export default remarkDirectives


