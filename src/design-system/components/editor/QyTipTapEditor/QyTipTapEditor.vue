<template>
  <div class="qy-tiptap-editor" @click="handleEditorClick">
    <div class="qy-tiptap-toolbar">
      <button type="button" :class="{ active: isActive('bold') }" @click="run('toggleBold')"><strong>B</strong></button>
      <button type="button" :class="{ active: isActive('italic') }" @click="run('toggleItalic')"><em>I</em></button>
      <button type="button" :class="{ active: isActive('underline') }" @click="run('toggleUnderline')"><u>U</u></button>
      <span class="sep" />
      <button type="button" :class="{ active: isActive('heading', { level: 1 }) }" @click="run('toggleHeading1')">H1</button>
      <button type="button" :class="{ active: isActive('heading', { level: 2 }) }" @click="run('toggleHeading2')">H2</button>
      <button type="button" :class="{ active: isActive('heading', { level: 3 }) }" @click="run('toggleHeading3')">H3</button>
      <button type="button" :class="{ active: isActive('blockquote') }" @click="run('toggleBlockquote')">引用</button>
      <button type="button" :class="{ active: isActive('codeBlock') }" @click="run('toggleCodeBlock')">代码</button>
      <span class="sep" />
      <button type="button" :class="{ active: isActive('bulletList') }" @click="run('toggleBulletList')">无序</button>
      <button type="button" :class="{ active: isActive('orderedList') }" @click="run('toggleOrderedList')">有序</button>
      <span class="sep" />
      <button type="button" @click="run('undo')">撤销</button>
      <button type="button" @click="run('redo')">重做</button>
    </div>

    <EditorContent v-if="editor" class="qy-tiptap-editor__content" :editor="editor" />

    <QyCompletionPopover
      :visible="completion.visible"
      :x="completion.x"
      :y="completion.y"
      :items="completion.items"
      :active-index="completion.activeIndex"
      @select="insertCompletion"
    />

    <QyKeywordPopover
      :visible="keywordCard.visible"
      :x="keywordCard.x"
      :y="keywordCard.y"
      :keyword="keywordCard.keyword"
      @jump="(kw) => $emit('keyword-click', kw)"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onBeforeUnmount } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import type { Editor as CoreEditor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import QyKeywordPopover from '../QySmartKeyword/QyKeywordPopover.vue'
import QyCompletionPopover from '../QySmartKeyword/QyCompletionPopover.vue'
import { SmartKeyword, type KeywordInfo } from '../QySmartKeyword/extensions/SmartKeyword'
import { ParagraphWithId } from '../QySmartKeyword/extensions/ParagraphWithId'
import { searchProjectKeywords, type ParagraphContent } from '@/modules/writer/api/wrapper'

const props = withDefaults(
  defineProps<{
    modelValue: string
    projectId: string
    readonly?: boolean
    documentId?: string
    placeholder?: string
  }>(),
  {
    readonly: false,
    documentId: '',
    placeholder: '开始写作，输入 @角色 / #地点 / %物品 触发关键词…',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save', contents: ParagraphContent[]): void
  (e: 'keyword-click', keyword: KeywordInfo): void
  (e: 'ready', editor: CoreEditor): void
}>()

type ToolbarCommand =
  | 'toggleBold'
  | 'toggleItalic'
  | 'toggleUnderline'
  | 'toggleHeading1'
  | 'toggleHeading2'
  | 'toggleHeading3'
  | 'toggleBlockquote'
  | 'toggleCodeBlock'
  | 'toggleBulletList'
  | 'toggleOrderedList'
  | 'undo'
  | 'redo'

function parseInitialContent() {
  if (!props.modelValue) return '<p></p>'
  try {
    return JSON.parse(props.modelValue)
  } catch {
    return props.modelValue
  }
}

function run(command: ToolbarCommand) {
  if (!editor.value) return
  const chain = editor.value.chain().focus()

  switch (command) {
    case 'toggleBold':
      chain.toggleBold().run()
      break
    case 'toggleItalic':
      chain.toggleItalic().run()
      break
    case 'toggleUnderline':
      chain.toggleUnderline().run()
      break
    case 'toggleHeading1':
      chain.toggleHeading({ level: 1 }).run()
      break
    case 'toggleHeading2':
      chain.toggleHeading({ level: 2 }).run()
      break
    case 'toggleHeading3':
      chain.toggleHeading({ level: 3 }).run()
      break
    case 'toggleBlockquote':
      chain.toggleBlockquote().run()
      break
    case 'toggleCodeBlock':
      chain.toggleCodeBlock().run()
      break
    case 'toggleBulletList':
      chain.toggleBulletList().run()
      break
    case 'toggleOrderedList':
      chain.toggleOrderedList().run()
      break
    case 'undo':
      chain.undo().run()
      break
    case 'redo':
      chain.redo().run()
      break
  }
}

function isActive(name: string, attrs?: Record<string, unknown>) {
  if (!editor.value) return false
  return attrs ? editor.value.isActive(name, attrs) : editor.value.isActive(name)
}

const completion = reactive<{
  visible: boolean
  x: number
  y: number
  items: KeywordInfo[]
  activeIndex: number
  prefix: '@' | '#' | '%'
  query: string
  from: number
  to: number
}>({
  visible: false,
  x: 0,
  y: 0,
  items: [],
  activeIndex: 0,
  prefix: '@',
  query: '',
  from: 0,
  to: 0,
})

const keywordCard = reactive<{ visible: boolean; x: number; y: number; keyword: KeywordInfo | null }>({
  visible: false,
  x: 0,
  y: 0,
  keyword: null,
})

let completionTimer: ReturnType<typeof setTimeout> | undefined

const editor = useEditor({
  editable: !props.readonly,
  content: parseInitialContent(),
  extensions: [
    StarterKit,
    Underline,
    Link,
    Image,
    CharacterCount,
    Placeholder.configure({ placeholder: props.placeholder }),
    ParagraphWithId,
    SmartKeyword.configure({ projectId: props.projectId }),
  ],
  editorProps: {
    attributes: {
      class: 'qy-editor-content',
      'data-document-id': props.documentId || '',
    },
    handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
      if (handleCompletionKeydown(event)) {
        return true
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (editor.value) {
          emit('save', extractParagraphs(editor.value.getJSON()))
        }
        return true
      }
      return false
    },
  },
  onCreate({ editor: currentEditor }: { editor: CoreEditor }) {
    emit('ready', currentEditor)
  },
  onUpdate({ editor: currentEditor }: { editor: CoreEditor }) {
    const json = currentEditor.getJSON()
    emit('update:modelValue', JSON.stringify(json))
    scheduleCompletionUpdate(currentEditor)
  },
  onBlur({ editor: currentEditor }: { editor: CoreEditor }) {
    emit('save', extractParagraphs(currentEditor.getJSON()))
  },
  onSelectionUpdate({ editor: currentEditor }: { editor: CoreEditor }) {
    scheduleCompletionUpdate(currentEditor)
  },
})

function handleCompletionKeydown(event: KeyboardEvent): boolean {
  if (!completion.visible || completion.items.length === 0) return false

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    completion.activeIndex = (completion.activeIndex + 1) % completion.items.length
    return true
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    completion.activeIndex = (completion.activeIndex - 1 + completion.items.length) % completion.items.length
    return true
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    insertCompletion(completion.items[completion.activeIndex])
    return true
  }

  if (event.key === 'Escape') {
    completion.visible = false
    return true
  }

  return false
}

watch(
  () => props.readonly,
  (val) => {
    editor.value?.setEditable(!val)
  },
)

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    const next = value || ''
    const current = JSON.stringify(editor.value.getJSON())
    if (next && next !== current) {
      try {
        editor.value.commands.setContent(JSON.parse(next), { emitUpdate: false })
      } catch {
        editor.value.commands.setContent(next, { emitUpdate: false })
      }
    }
  },
)

function scheduleCompletionUpdate(currentEditor: CoreEditor) {
  if (completionTimer) clearTimeout(completionTimer)
  completionTimer = setTimeout(() => {
    void updateCompletionFromSelection(currentEditor)
  }, 200)
}

async function updateCompletionFromSelection(currentEditor: CoreEditor) {
  const { from } = currentEditor.state.selection
  const textBefore = currentEditor.state.doc.textBetween(Math.max(0, from - 64), from, ' ')
  const match = textBefore.match(/([@#%])([\u4e00-\u9fa5\w-]{0,30})%?$/)
  if (!match) {
    completion.visible = false
    return
  }

  completion.prefix = match[1] as '@' | '#' | '%'
  completion.query = match[2] || ''
  completion.from = Math.max(0, from - (completion.query.length + 1))
  completion.to = from

  const coords = currentEditor.view.coordsAtPos(from)
  completion.x = coords.left
  completion.y = coords.bottom + 6

  const type = completion.prefix === '@' ? 'character' : completion.prefix === '#' ? 'location' : 'item'
  const items = await searchCompletion(type, completion.query)
  completion.items = items
  completion.activeIndex = 0
  completion.visible = items.length > 0
}

async function searchCompletion(type: KeywordInfo['type'], query: string): Promise<KeywordInfo[]> {
  if (!props.projectId) {
    return buildMockCompletion(type, query)
  }

  try {
    const keyword = `${prefixByType(type)}${query}`
    const resp = await searchProjectKeywords(props.projectId, keyword, 5)
    const payload = (resp as unknown as { data?: { suggestions?: Array<{ type?: string; id?: string; name?: string }> }; suggestions?: Array<{ type?: string; id?: string; name?: string }> })
    const suggestions = payload.data?.suggestions || payload.suggestions || []

    const mapped = suggestions
      .map((item) => ({
        id: item.id,
        type: normalizeKeywordType(item.type, type),
        name: item.name || '',
      }))
      .filter((item) => item.type === type && item.name)
      .slice(0, 5)

    return mapped.length > 0 ? mapped : buildMockCompletion(type, query)
  } catch {
    return buildMockCompletion(type, query)
  }
}

function normalizeKeywordType(rawType: string | undefined, fallback: KeywordInfo['type']): KeywordInfo['type'] {
  if (rawType === 'character' || rawType === 'location' || rawType === 'item') {
    return rawType
  }
  return fallback
}

function prefixByType(type: KeywordInfo['type']): '@' | '#' | '%' {
  if (type === 'character') return '@'
  if (type === 'location') return '#'
  return '%'
}

function buildMockCompletion(type: KeywordInfo['type'], query: string): KeywordInfo[] {
  const seed: Record<KeywordInfo['type'], string[]> = {
    character: ['主角', '导师', '反派', '守夜人', '医师'],
    location: ['青石镇', '北境雪原', '断崖城', '迷雾森林', '临港码头'],
    item: ['古卷', '青铜钥匙', '誓约之剑', '刻印石', '航海图'],
  }
  return seed[type]
    .filter((name) => !query || name.includes(query))
    .slice(0, 5)
    .map((name, idx) => ({ id: `${type}-${idx}`, type, name }))
}

function insertCompletion(item: KeywordInfo) {
  if (!editor.value) return

  const prefix = prefixByType(item.type)
  const insertText = prefix === '%' ? `%${item.name}% ` : `${prefix}${item.name} `
  const from = completion.from || editor.value.state.selection.from
  const to = completion.to || editor.value.state.selection.from

  editor.value.chain().focus().insertContentAt({ from, to }, insertText).run()
  completion.visible = false
}

function handleEditorClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return
  const keywordEl = target.closest('[data-smart-keyword]') as HTMLElement | null
  if (!keywordEl) {
    keywordCard.visible = false
    return
  }

  if (!(event.ctrlKey || event.metaKey)) {
    keywordCard.visible = false
    return
  }

  const type = (keywordEl.getAttribute('data-keyword-type') || 'character') as KeywordInfo['type']
  const name = keywordEl.getAttribute('data-keyword-name') || keywordEl.textContent || ''
  const id = keywordEl.getAttribute('data-keyword-id') || undefined
  keywordCard.keyword = { id, type, name }
  keywordCard.visible = true
  keywordCard.x = event.clientX + 12
  keywordCard.y = event.clientY + 12
}

function extractParagraphs(doc: unknown): ParagraphContent[] {
  const nodes = Array.isArray((doc as { content?: unknown[] })?.content)
    ? ((doc as { content: unknown[] }).content as Array<Record<string, unknown>>)
    : []
  const paragraphs: ParagraphContent[] = []
  let order = 0

  for (const node of nodes) {
    if (node?.type !== 'paragraph') continue
    const attrs = (node.attrs || {}) as { paragraphId?: string }
    const paragraphId = attrs.paragraphId || `p-${order + 1}`
    const text = flattenText(node)
    paragraphs.push({
      paragraphId,
      order,
      content: text,
      contentType: 'text',
    })
    order += 1
  }
  return paragraphs
}

function flattenText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const typed = node as { type?: string; text?: string; content?: unknown[] }
  if (typed.type === 'text') return typed.text || ''
  if (!Array.isArray(typed.content)) return ''
  return typed.content.map(flattenText).join('')
}

onBeforeUnmount(() => {
  if (completionTimer) clearTimeout(completionTimer)
  editor.value?.destroy()
})
</script>

<style scoped>
.qy-tiptap-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.qy-tiptap-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}
.qy-tiptap-toolbar button {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}
.qy-tiptap-toolbar button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}
.sep {
  width: 1px;
  height: 20px;
  background: #e4e7ed;
}
.qy-tiptap-editor__content {
  flex: 1;
  overflow: auto;
  padding: 14px;
}
:deep(.ProseMirror) {
  min-height: 380px;
  outline: none;
  line-height: 1.75;
  color: #303133;
}
:deep(.qy-smart-keyword) {
  border-bottom: 1px dashed #409eff;
  color: #1d4ed8;
  cursor: pointer;
}
:deep(.qy-smart-keyword--character) {
  border-bottom-color: #3b82f6;
  color: #1d4ed8;
}
:deep(.qy-smart-keyword--location) {
  border-bottom-color: #10b981;
  color: #047857;
}
:deep(.qy-smart-keyword--item) {
  border-bottom-color: #f59e0b;
  color: #b45309;
}
</style>
