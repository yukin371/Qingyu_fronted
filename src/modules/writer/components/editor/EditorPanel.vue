<template>
  <div
    class="editor-panel"
    :class="{
      'editor-panel--center': true,
      'full-width': !leftPanelWidth && !rightPanelWidth,
      'is-mobile': isMobile,
      'is-tablet': isTablet,
      'is-desktop': isDesktop,
      'focus-mode': isFocusMode,
      'preview-mode': showPreview
    }"
    :style="panelStyle"
  >
    <div class="editor-toolbar" v-if="!isFocusMode">
      <div class="toolbar-left">
        <div class="breadcrumb">
          <span class="breadcrumb-item">{{ projectName || '未命名项目' }}</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">{{ chapterTitle || '新章节' }}</span>
        </div>
      </div>

      <div class="toolbar-center">
        <EditorToolbar
          :show-preview="showPreview"
          @command="handleToolbarCommand"
          @togglePreview="emit('togglePreview')"
        />
      </div>

      <div class="toolbar-right">
        <button
          class="toolbar-button"
          data-action="save"
          :aria-label="t('editor.save', '保存 (Ctrl+S)')"
          :title="t('editor.save', '保存 (Ctrl+S)')"
          @click="handleSave"
        >
          <QyIcon name="Check" />
        </button>

        <button
          class="toolbar-button"
          :aria-label="t('editor.aiAssistant', 'AI助手 (Ctrl+Shift+A)')"
          :title="t('editor.aiAssistant', 'AI助手 (Ctrl+Shift+A)')"
          @click="handleAIAssistant"
        >
          <QyIcon name="MagicStick" />
        </button>

        <button
          class="toolbar-button"
          :aria-label="t('editor.focusMode', '专注模式 (F11)')"
          :title="t('editor.focusMode', '专注模式 (F11)')"
          @click="toggleFocusMode"
        >
          <QyIcon :name="isFocusMode ? 'FullScreen' : 'View'" />
        </button>
      </div>
    </div>

    <div class="editor-main" :style="editorStyle">
      <section class="chapter-header-card" v-if="!isFocusMode">
        <div class="chapter-title-row">
          <QyIcon name="Document" class="chapter-icon" />
          <h2 class="chapter-title">{{ chapterTitle || '新章节' }}</h2>
        </div>
        <div class="chapter-meta-row">
          <span class="meta-chip">{{ t('editor.wordCount', '字数') }} {{ wordCount }}</span>
          <span class="meta-chip">{{ t('editor.readTime', '阅读时间') }} {{ readTime }}</span>
          <span class="meta-chip" :class="saveStatusClass">{{ saveStatusText }}</span>
        </div>
      </section>

      <section v-if="isBoardMode && !isFocusMode" class="story-board">
        <div class="story-board__grid">
          <article
            v-for="item in boardItems"
            :key="item.id"
            class="board-card"
            :class="{ 'board-card--active': item.isActive }"
          >
            <header class="board-card__header">
              <h3>{{ item.title }}</h3>
              <span>{{ item.words }} words</span>
            </header>
            <div class="board-card__body">
              <p>{{ item.summary }}</p>
            </div>
            <footer class="board-card__footer">+ New Scene</footer>
          </article>
        </div>
        <div class="story-board__add">+ 新章节</div>
      </section>

      <div v-else class="editor-workspace" :class="{ 'editor-workspace--focus': isFocusMode }">
        <section class="editor-writing-card" :class="{ 'dual-view': showPreview }">
          <header class="section-title">场景正文</header>

          <div
            class="editor-content"
            role="textbox"
            :aria-label="t('editor.contentArea', '编辑器内容区域')"
            tabindex="0"
            :contenteditable="!readonly"
            @input="handleContentChange"
            @keydown="handleKeyDown"
            @contextmenu="handleContextMenu"
            ref="editorContentRef"
          >{{ editorText }}</div>

          <div v-if="showPreview" class="preview-pane markdown-body">
            <header class="section-title">预览</header>
            <div v-html="renderedContent"></div>
          </div>
        </section>

        <aside v-if="!isFocusMode" class="editor-inspector">
          <article class="inspector-card">
            <h3>写作概览</h3>
            <div class="stat-grid">
              <div class="stat-item">
                <span class="label">总字数</span>
                <span class="value">{{ wordCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">阅读时间</span>
                <span class="value">{{ readTime }}</span>
              </div>
              <div class="stat-item">
                <span class="label">光标</span>
                <span class="value">{{ cursorPosition.line }}:{{ cursorPosition.column }}</span>
              </div>
            </div>
          </article>

          <article class="inspector-card">
            <h3>快捷操作</h3>
            <div class="action-list">
              <button class="inspector-action" @click="handleSave">立即保存</button>
              <button class="inspector-action" @click="emit('togglePreview')">切换预览</button>
              <button class="inspector-action" @click="handleAIAssistant">呼出 AI 助手</button>
            </div>
          </article>
        </aside>
      </div>
    </div>

    <div class="timeline-panel" v-if="showTimeline && !isFocusMode">
      <TimelineBar v-if="timelineId" :timeline-id="timelineId" />
    </div>

    <div class="editor-statusbar" v-if="!isFocusMode">
      <div class="statusbar-left">
        <span class="word-count">
          {{ t('editor.wordCount', '字数') }}: {{ wordCount }}
        </span>

        <span class="read-time">
          {{ t('editor.readTime', '阅读时间') }}: {{ readTime }}
        </span>

        <span class="save-status" :class="saveStatusClass">
          {{ saveStatusText }}
        </span>
      </div>

      <div class="statusbar-right">
        <span class="cursor-position">
          {{ t('editor.line', '行') }} {{ cursorPosition.line }} : {{ cursorPosition.column }}
        </span>

        <span class="encoding">UTF-8</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { debounce } from '@/utils/performance'
import { useI18n } from '@/composables/useI18n'
import { useBreakpoints } from '@/composables/useBreakpoints'
import EditorToolbar from '@/modules/writer/components/EditorToolbar.vue'
import TimelineBar from '@/modules/writer/components/TimelineBar.vue'
import { renderMarkdown } from '@/modules/writer/utils/markdown'
import { calculateWordCount } from '@/modules/writer/utils/editor'

interface Props {
  content?: string
  projectName?: string
  chapterTitle?: string
  activeTool?: string
  readonly?: boolean
  leftPanelWidth?: number
  rightPanelWidth?: number
  showPreview?: boolean
  showTimeline?: boolean
  timelineId?: string
}

interface Emits {
  (e: 'update:content', _value: string): void
  (e: 'save'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'aiAssistant'): void
  (e: 'togglePreview'): void
  (e: 'formatCommand', _command: string): void
  (e: 'contextmenu', _event: MouseEvent, _selectedText: string): void
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  projectName: '',
  chapterTitle: '',
  activeTool: 'writing',
  readonly: false,
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  showPreview: false,
  showTimeline: false,
  timelineId: ''
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const editorContentRef = ref<HTMLDivElement>()
const isFocusMode = ref(false)
const saveStatus = ref<'saved' | 'saving' | 'unsaved'>('saved')
const cursorPosition = ref({ line: 1, column: 1 })

const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200
})

const isMobile = breakpoints.smaller('mobile')
const isTablet = breakpoints.between('mobile', 'desktop')
const isDesktop = breakpoints.greaterOrEqual('desktop')

const editorText = computed(() => {
  if (!props.content) return ''
  return props.content
})

const panelStyle = computed(() => ({}))

const wordCount = computed(() => {
  return calculateWordCount(props.content)
})

const readTime = computed(() => {
  const wordsPerMinute = 500
  const minutes = Math.ceil(wordCount.value / wordsPerMinute)
  return minutes > 0 ? `${minutes} ${t('editor.minutes', '分钟')}` : `0 ${t('editor.minutes', '分钟')}`
})

const renderedContent = computed(() => {
  return renderMarkdown(props.content)
})

const isBoardMode = computed(() => props.activeTool === 'outline')

const boardItems = computed(() => {
  const summary = (props.content || '').trim().replace(/\s+/g, ' ')
  const shortSummary = summary.length > 120 ? `${summary.slice(0, 120)}...` : summary
  const chapterName = props.chapterTitle || '第1章'

  return [
    {
      id: 'current',
      title: chapterName,
      words: wordCount.value,
      summary: shortSummary || '输入场景摘要...',
      isActive: true
    },
    {
      id: 'next',
      title: '第2章',
      words: 0,
      summary: '输入场景摘要...',
      isActive: false
    },
    {
      id: 'new',
      title: '新章节',
      words: 0,
      summary: '输入场景摘要...',
      isActive: false
    }
  ]
})

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saved':
      return t('editor.saved', '已保存')
    case 'saving':
      return t('editor.saving', '保存中...')
    case 'unsaved':
      return t('editor.unsaved', '未保存')
    default:
      return ''
  }
})

const saveStatusClass = computed(() => {
  return `save-status--${saveStatus.value}`
})

const editorStyle = computed(() => ({
  minWidth: '400px',
  minHeight: 0,
  height: '100%'
}))

const debouncedUpdate = debounce((newContent: string) => {
  emit('update:content', newContent)
  saveStatus.value = 'unsaved'
}, 300)

const handleContentChange = (event: Event) => {
  const target = event.target as HTMLDivElement
  const newContent = target.textContent || ''
  debouncedUpdate(newContent)
}

const handleKeyDown = (event: KeyboardEvent) => {
  updateCursorPosition()

  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 's':
        event.preventDefault()
        handleSave()
        break
      case 'z':
        event.preventDefault()
        emit('undo')
        break
      case 'y':
        event.preventDefault()
        emit('redo')
        break
      default:
        break
    }
  }

  if (event.key === 'Tab') {
    event.preventDefault()
    insertText('  ')
  }

  if (event.key === 'F11') {
    event.preventDefault()
    toggleFocusMode()
  }
}

const insertText = (text: string) => {
  if (!editorContentRef.value) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  const textNode = document.createTextNode(text)
  range.insertNode(textNode)
  range.setStartAfter(textNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  handleContentChange({ target: editorContentRef.value } as unknown as Event)
}

const updateCursorPosition = () => {
  if (!editorContentRef.value) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(editorContentRef.value)
  preCaretRange.setEnd(range.endContainer, range.endOffset)
  const text = preCaretRange.toString()
  const lines = text.split('\n')

  cursorPosition.value = {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  }
}

const handleContextMenu = (event: MouseEvent) => {
  const selection = window.getSelection()
  const selectedText = selection?.toString() || ''
  if (selectedText) {
    emit('contextmenu', event, selectedText)
  }
}

const handleToolbarCommand = (cmd: string) => {
  emit('formatCommand', cmd)
}

const handleSave = () => {
  saveStatus.value = 'saving'
  emit('save')

  setTimeout(() => {
    saveStatus.value = 'saved'
  }, 500)
}

const handleAIAssistant = () => {
  emit('aiAssistant')
}

const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
}

onMounted(() => {
  console.log('[EditorPanel] Mounted', {
    showPreview: props.showPreview,
    showTimeline: props.showTimeline,
    timelineId: props.timelineId
  })
})

onBeforeUnmount(() => {
  if (saveStatus.value === 'unsaved') {
    handleSave()
  }
})

watch(() => props.content, () => {
  if (props.content) {
    saveStatus.value = 'unsaved'
  }
})

watch(() => props.content, (newContent) => {
  if (editorContentRef.value && editorContentRef.value.textContent !== newContent) {
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)
    const offset = range ? startOffsetInNode(editorContentRef.value, range.startContainer, range.startOffset) : 0

    editorContentRef.value.textContent = newContent || ''

    if (range) {
      const newRange = document.createRange()
      const newOffset = restoreOffsetInNode(editorContentRef.value, offset)
      newRange.setStart(editorContentRef.value, newOffset)
      newRange.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(newRange)
    }
  }
})

watch(() => props.showPreview, () => {
})

watch(() => props.showTimeline, () => {
})

watch(() => props.timelineId, () => {
})

function startOffsetInNode(container: Node, node: Node, offset: number): number {
  if (node === container) return offset

  let totalOffset = 0
  let current = container.firstChild

  while (current && current !== node) {
    totalOffset += current.textContent?.length || 0
    current = current.nextSibling
  }

  return totalOffset + offset
}

function restoreOffsetInNode(container: Node, targetOffset: number): number {
  let currentOffset = 0
  let current = container.firstChild

  while (current) {
    const nodeLength = current.textContent?.length || 0
    if (currentOffset + nodeLength >= targetOffset) {
      return Math.min(targetOffset - currentOffset, nodeLength)
    }
    currentOffset += nodeLength
    current = current.nextSibling
  }

  return currentOffset
}
</script>

<style scoped lang="scss">
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: #f8fafc;
  color: #0f172a;
  overflow: hidden;
  border-radius: 12px;
}

.editor-toolbar {
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;

  .toolbar-left {
    min-width: 0;

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 12px;

      .breadcrumb-item.current {
        color: #0f172a;
        font-weight: 600;
      }
    }
  }

  .toolbar-center {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
  }

  .toolbar-right {
    display: flex;
    gap: 6px;

    .toolbar-button {
      width: 32px;
      height: 32px;
      border: 1px solid #dbe3ef;
      border-radius: 8px;
      background: #fff;
      color: #475569;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.16s ease;

      &:hover {
        border-color: #93c5fd;
        background: #eff6ff;
        color: #1d4ed8;
      }
    }
  }
}

.editor-main {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 14px;
}

.chapter-header-card {
  flex-shrink: 0;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  padding: 12px 14px;
  margin-bottom: 10px;

  .chapter-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .chapter-icon {
      color: #2563eb;
      font-size: 16px;
    }

    .chapter-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .chapter-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .meta-chip {
      border: 1px solid #dbe3ef;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      color: #475569;
      background: #f8fafc;
    }
  }
}

.editor-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.editor-workspace--focus {
  grid-template-columns: minmax(0, 1fr);
}

.story-board {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  padding: 14px;
}

.story-board__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.story-board__add {
  height: 88px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 600;
}

.board-card {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #f8fafc;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 220px;
  transition: all 0.16s ease;
}

.board-card--active {
  border-color: #93c5fd;
  background: #eff6ff;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.15);
}

.board-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 12px;
}

.board-card__header h3 {
  margin: 0;
  font-size: 14px;
  color: #0f172a;
  font-weight: 700;
}

.board-card__header span {
  color: #64748b;
  font-size: 12px;
}

.board-card__body {
  padding: 12px;
}

.board-card__body p {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #334155;
}

.board-card__footer {
  border-top: 1px solid #e2e8f0;
  padding: 8px 12px;
  font-size: 12px;
  color: #64748b;
  background: #ffffff;
}

.editor-writing-card {
  min-height: 0;
  height: 100%;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;

  &.dual-view {
    grid-template-columns: 1fr 1fr;
  }

  .section-title {
    margin: 0;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }
}

.editor-content {
  min-height: 0;
  height: 100%;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
  font-size: 17px;
  line-height: 1.9;
  color: #0f172a;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 24px 32px;
  caret-color: #2563eb;
  overflow: auto;

  &:focus {
    background: #fffeff;
  }

  &[contenteditable='true']:empty::before {
    content: '输入场景正文...';
    color: #94a3b8;
    pointer-events: none;
  }
}

.preview-pane {
  min-height: 0;
  border-left: 1px solid #e2e8f0;
  overflow: auto;
  background: #fcfdff;

  > div {
    padding: 18px 22px 26px;
  }
}

.editor-inspector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 240px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.inspector-card {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
  padding: 12px;

  h3 {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
  }
}

.stat-grid {
  display: grid;
  gap: 8px;

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 10px;
    background: #f8fafc;

    .label {
      color: #64748b;
      font-size: 12px;
    }

    .value {
      color: #0f172a;
      font-size: 12px;
      font-weight: 600;
    }
  }
}

.action-list {
  display: grid;
  gap: 8px;

  .inspector-action {
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 8px 10px;
    text-align: center;
    font-size: 12px;
    color: #334155;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.16s ease;

    &:hover {
      border-color: #93c5fd;
      background: #eff6ff;
      color: #1d4ed8;
    }
  }
}

.timeline-panel {
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.editor-statusbar {
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;

  .statusbar-left,
  .statusbar-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .save-status {
    &--saved { color: #16a34a; }
    &--saving { color: #2563eb; }
    &--unsaved { color: #dc2626; }
  }
}

@media (max-width: 1280px) {
  .story-board__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .editor-workspace {
    grid-template-columns: 1fr;
  }

  .editor-inspector {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 1024px) {
  .editor-toolbar .toolbar-left {
    display: none;
  }

  .editor-main {
    padding: 10px;
  }

  .editor-writing-card.dual-view {
    grid-template-columns: 1fr;
  }

  .story-board__grid {
    grid-template-columns: 1fr;
  }

  .preview-pane {
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }

  .editor-content {
    min-height: 0;
    padding: 18px 20px;
  }

  .editor-inspector {
    grid-template-columns: 1fr;
  }

  .editor-statusbar .read-time,
  .editor-statusbar .encoding {
    display: none;
  }
}

.editor-main::-webkit-scrollbar,
.editor-content::-webkit-scrollbar,
.preview-pane::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.editor-main::-webkit-scrollbar-thumb,
.editor-content::-webkit-scrollbar-thumb,
.preview-pane::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cbd5e1;
}

.editor-main::-webkit-scrollbar-track,
.editor-content::-webkit-scrollbar-track,
.preview-pane::-webkit-scrollbar-track {
  background: #f1f5f9;
}
</style>
