<template>
  <div
    class="tiptap-editor-view"
    :class="{ 'tiptap-editor-view--without-ref': !showReferencePanel }"
    data-testid="tiptap-editor-view"
  >
    <div class="tiptap-editor-view__main-wrap">
      <header class="editor-toolbar" v-if="showReferencePanel">
        <div class="editor-toolbar__meta">
          <span class="keyword-badge">🔑 {{ referenceSummary.length }}</span>
        </div>
      </header>

      <div v-if="isDocumentEmpty" class="editor-empty-banner">
        <div class="editor-empty-banner__copy">
          <strong>开始写作这一章</strong>
          <span>用 @角色、#地点、%物品 建立上下文</span>
        </div>
        <button type="button" class="editor-empty-banner__action" @click="focusEditor">
          开始输入
        </button>
      </div>

      <div
        class="tiptap-editor-view__main"
        :class="{ 'tiptap-editor-view__main--empty': isDocumentEmpty }"
      >
        <QyTipTapEditor
          :model-value="modelValue"
          :project-id="projectId"
          :document-id="documentId"
          :readonly="readonly"
          :placeholder="placeholder"
          @update:model-value="(val) => $emit('update:modelValue', val)"
          @save="handleSave"
          @keyword-click="(kw) => $emit('keyword-click', kw)"
          @ready="handleEditorReady"
          @selection-change="handleSelectionChange"
        />

        <div
          v-if="selectionState.visible"
          class="selection-toolbar"
          :style="{ left: `${selectionState.x}px`, top: `${selectionState.y}px` }"
        >
          <button type="button" class="selection-toolbar__action" @click="emitSelectionAction('continue')">续写</button>
          <button type="button" class="selection-toolbar__action" @click="emitSelectionAction('polish')">润色</button>
          <button type="button" class="selection-toolbar__action" @click="emitSelectionAction('rewrite')">改写</button>
          <button type="button" class="selection-toolbar__action" @click="emitSelectionAction('add_to_chat')">加入对话</button>
        </div>
      </div>
    </div>

    <aside class="tiptap-editor-view__ref" v-if="showReferencePanel">
      <div class="ref-header">
        <p class="kicker">Reference Assistant</p>
        <h4 class="title">智能引用库</h4>
        <p class="hint">本文档已识别 {{ referenceSummary.length }} 个关键词，按频次排序显示。</p>
      </div>

      <div class="ref-stats">
        <div class="stat">
          <span class="label">角色</span>
          <span class="value">{{ referenceStats.character }}</span>
        </div>
        <div class="stat stat--location">
          <span class="label">地点</span>
          <span class="value">{{ referenceStats.location }}</span>
        </div>
        <div class="stat stat--item">
          <span class="label">物品</span>
          <span class="value">{{ referenceStats.item }}</span>
        </div>
      </div>

      <ul class="ref-list" v-if="referenceSummary.length > 0">
        <li v-for="item in referenceSummary" :key="`${item.type}-${item.name}`" :class="`is-${item.type}`">
          <span class="type">{{ typeLabel(item.type) }}</span>
          <span class="name">{{ item.name }}</span>
          <span class="count">x{{ item.count }}</span>
        </li>
      </ul>
      <div v-else class="ref-empty">还没有识别到关键词，输入 <code>@角色</code>、<code>#地点</code> 或 <code>%物品</code> 试试。</div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { Editor } from '@tiptap/core'
import { QyTipTapEditor } from '@/design-system/components/editor'
import type { KeywordInfo } from '@/design-system/components/editor'
import type { ParagraphContent } from '@/modules/writer/api/wrapper'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { extractPlainTextFromEditorContent } from '@/modules/writer/utils/editorContent'

const props = withDefaults(
  defineProps<{
    modelValue: string
    projectId: string
    documentId?: string
    readonly?: boolean
    placeholder?: string
    showReferencePanel?: boolean
  }>(),
  {
    documentId: '',
    readonly: false,
    placeholder: '输入 @角色 / #地点 / %物品 触发智能关键词',
    showReferencePanel: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save', contents: ParagraphContent[]): void
  (e: 'keyword-click', keyword: KeywordInfo): void
  (
    e: 'selection-action',
    payload: {
      action: string
      text: string
      from: number
      to: number
      applyMode?: 'replace_selection' | 'insert_after_selection'
    },
  ): void
}>()

const editorStore = useEditorStore()
const plainTextContent = computed(() => extractPlainTextFromEditorContent(props.modelValue || ''))
const isDocumentEmpty = computed(() => plainTextContent.value.trim().length === 0)
const selectionState = reactive({
  text: '',
  from: 0,
  to: 0,
  x: 0,
  y: 0,
  visible: false,
})

function handleEditorReady(editor: Editor) {
  editorStore.setTipTapEditor(editor)
}

function focusEditor() {
  editorStore.tipTapEditor?.chain().focus().run()
}

async function handleSave(contents: ParagraphContent[]) {
  await editorStore.saveParagraphs(contents)
  emit('save', contents)
}

const referenceSummary = computed(() => {
  try {
    const json = props.modelValue ? JSON.parse(props.modelValue) : null
    const text = JSON.stringify(json || '')
    return collectKeywordSummary(text)
  } catch {
    return collectKeywordSummary(props.modelValue || '')
  }
})

const referenceStats = computed(() => ({
  character: referenceSummary.value.filter(item => item.type === 'character').length,
  location: referenceSummary.value.filter(item => item.type === 'location').length,
  item: referenceSummary.value.filter(item => item.type === 'item').length,
}))

function collectKeywordSummary(text: string) {
  const patterns: Array<{ type: KeywordInfo['type']; regex: RegExp }> = [
    { type: 'character', regex: /@([\u4e00-\u9fa5\w-]{1,30})/g },
    { type: 'location', regex: /#([\u4e00-\u9fa5\w-]{1,30})/g },
    { type: 'item', regex: /%([\u4e00-\u9fa5\w-]{1,30})/g },
  ]
  const summary = new Map<string, { type: KeywordInfo['type']; name: string; count: number }>()
  for (const p of patterns) {
    for (const match of text.matchAll(p.regex)) {
      const name = match[1]
      const key = `${p.type}:${name}`
      const prev = summary.get(key)
      if (prev) prev.count += 1
      else summary.set(key, { type: p.type, name, count: 1 })
    }
  }
  return Array.from(summary.values()).sort((a, b) => b.count - a.count).slice(0, 30)
}

function typeLabel(type: KeywordInfo['type']) {
  if (type === 'character') return '角色'
  if (type === 'location') return '地点'
  return '物品'
}

function handleSelectionChange(payload: { text: string; from: number; to: number; x: number; y: number; visible: boolean }) {
  selectionState.text = payload.text
  selectionState.from = payload.from
  selectionState.to = payload.to
  selectionState.x = payload.x
  selectionState.y = payload.y
  selectionState.visible = payload.visible
}

function emitSelectionAction(action: string) {
  if (!selectionState.text.trim()) return
  emit('selection-action', {
    action,
    text: selectionState.text,
    from: selectionState.from,
    to: selectionState.to,
    applyMode: action === 'continue' ? 'insert_after_selection' : 'replace_selection',
  })
  selectionState.visible = false
}
</script>

<style scoped>
.tiptap-editor-view {
  --line: #d7deeb;
  --text-main: #1a2340;
  --text-secondary: #5d6782;
  --brand: #2f6fff;
  --mint: #02b48b;
  --warm: #e48c2d;

  height: 100%;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 14px;
  padding: 12px;
  background:
    radial-gradient(circle at 8% 8%, rgba(47, 111, 255, 0.11) 0%, transparent 26%),
    radial-gradient(circle at 92% 26%, rgba(2, 180, 139, 0.09) 0%, transparent 28%),
    #f5f7fb;
}

.tiptap-editor-view--without-ref {
  grid-template-columns: 1fr;
}

.tiptap-editor-view__main-wrap {
  min-width: 0;
  border-radius: 16px;
  border: 1px solid var(--line);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 30px rgba(19, 35, 74, 0.08);
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  border-bottom: 1px solid var(--line);
  background: linear-gradient(102deg, rgba(255, 255, 255, 0.95), rgba(244, 248, 255, 0.92));
  padding: 8px 14px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  min-height: 36px;
}

.editor-toolbar__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-empty-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(214, 202, 183, 0.7);
  background: linear-gradient(145deg, rgba(255, 249, 241, 0.98), rgba(247, 238, 227, 0.94));
}

.editor-empty-banner__copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.editor-empty-banner__copy strong {
  color: #2a2f3a;
  font-size: 15px;
}

.editor-empty-banner__copy span {
  color: #655b51;
  font-size: 13px;
  line-height: 1.6;
}

.editor-empty-banner__copy code {
  border-radius: 6px;
  background: rgba(229, 239, 248, 0.8);
  color: #24425c;
  padding: 1px 5px;
}

.editor-empty-banner__action {
  flex: 0 0 auto;
  border: 1px solid rgba(143, 63, 47, 0.2);
  border-radius: 999px;
  background: linear-gradient(180deg, #8f3f2f 0%, #7a3122 100%);
  color: #fff9f3;
  font-size: 12px;
  font-weight: 800;
  padding: 9px 14px;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(87, 48, 23, 0.12);
}

.meta-chip {
  font-size: 12px;
  font-weight: 700;
  color: #204ebf;
  border-radius: 999px;
  padding: 4px 10px;
  background: #e8efff;
}

.meta-chip--soft {
  color: #087f61;
  background: #e7fbf5;
}

.keyword-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand, #2f6fff);
  border-radius: var(--editor-radius-sm, 4px);
  padding: 3px 8px;
  background: #e8efff;
  white-space: nowrap;
}

.tiptap-editor-view__main {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 0%, rgba(47, 111, 255, 0.08) 0%, transparent 24%),
    linear-gradient(180deg, #fefcf8 0%, #f9f5ef 100%);
  position: relative;
  padding: 12px;
}

.tiptap-editor-view__main::before {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 20px;
  border: 1px solid rgba(215, 222, 235, 0.9);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(252, 248, 242, 0.92)),
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 33px,
      rgba(108, 126, 168, 0.05) 34px
    );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 20px 40px rgba(34, 39, 54, 0.08);
  pointer-events: none;
}

.tiptap-editor-view__main--empty::before {
  border-style: dashed;
  border-color: rgba(194, 171, 140, 0.65);
}

.selection-toolbar {
  position: absolute;
  z-index: 12;
  transform: translate(-50%, -100%);
  display: inline-flex;
  gap: 8px;
  padding: 8px;
  border-radius: 999px;
  background: rgba(41, 32, 24, 0.94);
  box-shadow: 0 18px 32px rgba(36, 25, 16, 0.18);
}

.selection-toolbar__action {
  border: 1px solid rgba(255, 246, 235, 0.16);
  border-radius: 999px;
  background: rgba(255, 250, 243, 0.1);
  color: #fff9f1;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  cursor: pointer;
}

.selection-toolbar__action:hover {
  background: rgba(255, 250, 243, 0.18);
}

.tiptap-editor-view__ref {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 14px;
  overflow: auto;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 30px rgba(19, 35, 74, 0.08);
}

.ref-header {
  padding-bottom: 10px;
  border-bottom: 1px dashed #d3ddf0;
}

.title {
  margin: 2px 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.ref-stats {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat {
  border-radius: 12px;
  padding: 8px;
  border: 1px solid rgba(47, 111, 255, 0.22);
  background: #edf2ff;
  text-align: center;
}

.stat .label {
  display: block;
  font-size: 11px;
  color: #2f57c9;
  font-weight: 700;
}

.stat .value {
  display: block;
  margin-top: 2px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2e57;
}

.stat--location {
  border-color: rgba(2, 180, 139, 0.3);
  background: #e8fbf5;
}

.stat--location .label {
  color: #078366;
}

.stat--item {
  border-color: rgba(228, 140, 45, 0.32);
  background: #fff4e9;
}

.stat--item .label {
  color: #ab6212;
}

.ref-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.ref-list li {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #dde4f1;
  border-radius: 10px;
  background: #ffffff;
}

.ref-list li.is-character {
  border-left: 3px solid var(--brand);
}

.ref-list li.is-location {
  border-left: 3px solid var(--mint);
}

.ref-list li.is-item {
  border-left: 3px solid var(--warm);
}

.type {
  font-size: 11px;
  width: 30px;
  color: #5d6d90;
  font-weight: 700;
}

.name {
  flex: 1;
  min-width: 0;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.count {
  font-size: 11px;
  color: #7280a0;
}

.ref-empty {
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f9fe;
  border: 1px dashed #d2dcef;
  color: #64718f;
  font-size: 12px;
  line-height: 1.5;
}

.ref-empty code {
  color: #2d57c6;
  background: #edf2ff;
  border-radius: 4px;
  padding: 1px 4px;
}

:deep(.qy-tiptap-editor) {
  position: relative;
  z-index: 1;
  height: 100%;
  background: transparent;
}

:deep(.qy-tiptap-toolbar) {
  margin: 14px 14px 0;
  border: 1px solid rgba(214, 221, 235, 0.92);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 246, 251, 0.94));
  padding: 7px 8px;
  gap: 4px;
  box-shadow: 0 10px 22px rgba(29, 43, 78, 0.06);
}

:deep(.qy-tiptap-toolbar button) {
  min-width: 32px;
  height: 32px;
  border-radius: 10px;
  border-color: rgba(198, 205, 220, 0.94);
  background: rgba(255, 255, 255, 0.88);
  color: #42506f;
  font-weight: 700;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

:deep(.qy-tiptap-toolbar button:hover) {
  transform: translateY(-1px);
  border-color: rgba(47, 111, 255, 0.24);
  color: #2449ac;
  box-shadow: 0 8px 14px rgba(39, 70, 135, 0.08);
}

:deep(.qy-tiptap-toolbar button.active) {
  background: linear-gradient(180deg, #2f6fff 0%, #1f5ad5 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 10px 20px rgba(42, 79, 163, 0.18);
}

:deep(.qy-tiptap-toolbar .sep) {
  height: 18px;
  background: rgba(199, 208, 227, 0.9);
}

:deep(.qy-tiptap-editor__content) {
  padding: 18px 22px 22px;
}

:deep(.ProseMirror) {
  min-height: calc(100% - 4px);
  padding: 6px 0 80px;
  color: #27324a;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #96a0b6;
  font-style: normal;
}

@media (max-width: 1200px) {
  .tiptap-editor-view {
    grid-template-columns: 1fr;
  }

  .tiptap-editor-view__ref {
    max-height: 280px;
  }
}

@media (max-width: 768px) {
  .tiptap-editor-view {
    padding: 8px;
  }

  .editor-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .ref-stats {
    grid-template-columns: 1fr;
  }

  .tiptap-editor-view__main {
    padding: 8px;
  }

  .tiptap-editor-view__main::before {
    inset: 8px;
    border-radius: 16px;
  }

  .editor-empty-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .editor-empty-banner__action {
    width: 100%;
  }

  :deep(.qy-tiptap-toolbar) {
    margin: 10px 10px 0;
    overflow-x: auto;
  }

  :deep(.qy-tiptap-editor__content) {
    padding: 16px 16px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.qy-tiptap-toolbar button) {
    transition: none;
  }

  :deep(.qy-tiptap-toolbar button:hover) {
    transform: none;
  }
}
</style>
