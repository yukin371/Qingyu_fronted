import { Mark, mergeAttributes, markInputRule, markPasteRule } from '@tiptap/core'

export type KeywordType = 'character' | 'location' | 'item'

export interface KeywordInfo {
  id?: string
  type: KeywordType
  name: string
  summary?: string
}

export interface SmartKeywordOptions {
  projectId?: string
}

const keywordPattern = /(?:^|\s)([@#%])([\u4e00-\u9fa5\w-]{1,30})%?$/
const pasteKeywordPattern = /([@#%])([\u4e00-\u9fa5\w-]{1,30})%?/g

function toKeywordType(prefix: string): KeywordType {
  if (prefix === '@') return 'character'
  if (prefix === '#') return 'location'
  return 'item'
}

export const SmartKeyword = Mark.create<SmartKeywordOptions>({
  name: 'smartKeyword',

  addAttributes() {
    return {
      keywordId: { default: null },
      keywordType: { default: null },
      keywordName: { default: null },
      projectId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-smart-keyword]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const keywordType = String(HTMLAttributes.keywordType || '')
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-smart-keyword': 'true',
        'data-keyword-id': HTMLAttributes.keywordId,
        'data-keyword-type': keywordType,
        'data-keyword-name': HTMLAttributes.keywordName,
        class: `qy-smart-keyword ${keywordType ? `qy-smart-keyword--${keywordType}` : ''}`.trim(),
      }),
      0,
    ]
  },

  addInputRules() {
    return [
      markInputRule({
        find: keywordPattern,
        type: this.type,
        getAttributes: (match: string[]) => {
          const prefix = match[1]
          const name = match[2]
          return {
            keywordType: toKeywordType(prefix),
            keywordName: name,
            projectId: this.options.projectId || null,
          }
        },
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteKeywordPattern,
        type: this.type,
        getAttributes: (match: string[]) => {
          const prefix = match[1]
          const name = match[2]
          return {
            keywordType: toKeywordType(prefix),
            keywordName: name,
            projectId: this.options.projectId || null,
          }
        },
      }),
    ]
  },
})
