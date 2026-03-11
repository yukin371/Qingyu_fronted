<template>
  <div
    class="tiptap-editor-view"
    :class="{ 'tiptap-editor-view--without-ref': !showReferencePanel }"
    data-testid="tiptap-editor-view"
  >
    <div class="tiptap-editor-view__main-wrap">
      <header class="editor-toolbar">
        <div class="editor-toolbar__title">
          <p class="kicker">Writing Studio</p>
          <h3>正文编辑区</h3>
        </div>
        <div v-if="showReferencePanel" class="editor-toolbar__meta">
          <span class="meta-chip">关键词 {{ referenceSummary.length }}</span>
          <span class="meta-chip meta-chip--soft">智能引用已启用</span>
        </div>
      </header>

      <div class="tiptap-editor-view__main">
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
        />
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
import { computed } from 'vue'
import type { Editor } from '@tiptap/core'
import { QyTipTapEditor } from '@/design-system/components/editor'
import type { KeywordInfo } from '@/design-system/components/editor'
import type { ParagraphContent } from '@/modules/writer/api/wrapper'
import { useEditorStore } from '@/modules/writer/stores/editorStore'

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
}>()

const editorStore = useEditorStore()

function handleEditorReady(editor: Editor) {
  editorStore.setTipTapEditor(editor)
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
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.editor-toolbar__title h3 {
  margin: 2px 0 0;
  font-size: 18px;
  line-height: 1.2;
  color: var(--text-main);
}

.kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #7280a0;
  text-transform: uppercase;
  font-weight: 700;
}

.editor-toolbar__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.tiptap-editor-view__main {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background: #fff;
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
}
</style>
