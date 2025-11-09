import type { Plugin, Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import type { Root, Paragraph, Text, Parent, RootContent } from 'mdast'
import type { MDXJsxFlowElement, MDXJsxAttribute } from 'mdast-util-mdx'

// Transforms lines like:
// [ANIM:start parallax+fade-in hero]
// [FX: glitch effect on scroll]
// [GRAPH: timeline ...]
// [MEDIA: photo "Shrimp Jesus" - ...]
// into MDX JSX elements: <Anim value="start parallax+fade-in hero" /> etc.

const createAttribute = (name: string, value: string): MDXJsxAttribute => ({
  type: 'mdxJsxAttribute',
  name,
  value,
})

const toElement = (name: string, value: string): MDXJsxFlowElement => ({
  type: 'mdxJsxFlowElement',
  name,
  attributes: [createAttribute('value', value)],
  children: [],
})

export const remarkDirectives: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree) => {
    // Simple inline single-line directives (FX/GRAPH/MEDIA and ANIM single)
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || index == null) return
      if (!node.children || node.children.length !== 1) return
      const child = node.children[0] as Text | undefined
      if (!child || child.type !== 'text') return
      const text = child.value.trim()
      // ANIM/FX/GRAPH/MEDIA
      const match = text.match(/\[(ANIM|FX|GRAPH|MEDIA):\s*(.+)]$/i)
      if (!match) return
      const kind = match[1].toUpperCase()
      const value = match[2].trim()
      const name = kind === 'ANIM' ? 'Anim' : kind === 'FX' ? 'Fx' : kind === 'GRAPH' ? 'Graph' : 'Media'

      const replacement = toElement(name, value)
      ;(parent as Parent).children?.splice(index, 1, replacement as unknown as RootContent)
    })

    // ELIAS cues, as block paragraphs
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || index == null) return
      if (!node.children || node.children.length !== 1) return
      const child = node.children[0] as Text | undefined
      if (!child || child.type !== 'text') return
      const textValue = child.value.trim()
      const match = textValue.match(/\[ELIAS:\s*(appear|whisper|hide|takeover)\s+at=([0-9]+(?:\.[0-9]+)?)\s*(?:text="([^"]*)")?]$/i)
      if (!match) return
      const mode = match[1].toLowerCase()
      const at = match[2]
      const text = match[3] ?? ''

      const replacement: MDXJsxFlowElement = {
        type: 'mdxJsxFlowElement',
        name: 'EliasCue',
        attributes: [
          createAttribute('mode', mode),
          createAttribute('at', at),
          createAttribute('text', text),
        ],
        children: [],
      }
      ;(parent as Parent).children?.splice(index, 1, replacement as unknown as RootContent)
    })

    // Range wrapping for ANIM:start ... ANIM:end
    const children = [...(tree.children ?? [])] as RootContent[]
    let i = 0
    while (i < children.length) {
      const current = children[i]
      if (current?.type === 'paragraph') {
        const paragraph = current as Paragraph
        const firstChild = paragraph.children?.[0] as Text | undefined
        const txt = firstChild?.value?.trim()
        if (txt) {
          const start = txt.match(/\[ANIM:start\s+(.+)]$/i)
          if (start) {
            const value = start[1]
            let j = i + 1
            let endIndex = -1
            while (j < children.length) {
              const candidate = children[j]
              if (candidate?.type === 'paragraph') {
                const candidateParagraph = candidate as Paragraph
                const candidateText = candidateParagraph.children?.[0] as Text | undefined
                const t2 = candidateText?.value?.trim()
                if (t2 && /\[ANIM:end]/i.test(t2)) {
                  endIndex = j
                  break
                }
              }
              j++
            }

            if (endIndex !== -1) {
              const between = children.slice(i + 1, endIndex)
              const wrapped: MDXJsxFlowElement = {
                type: 'mdxJsxFlowElement',
                name: 'Anim',
                attributes: [createAttribute('value', value)],
                children: between,
              }
              children.splice(i, endIndex - i + 1, wrapped as unknown as RootContent)
              continue
            } else {
              console.warn('[remark-directives] Unbalanced ANIM:start without end for value:', value)
            }
          }
        }
      }
      i++
    }
    tree.children = children
  }

  return transformer
}

export default remarkDirectives


