<template>
  <div
    class="editor-panel vscode-theme"
    :class="{
      'editor-panel--center': true,
      'full-width': !leftPanelWidth && !rightPanelWidth,
      'is-mobile': isMobile.value,
      'is-tablet': isTablet.value,
      'is-desktop': isDesktop.value,
      'focus-mode': isFocusMode,
      'preview-mode': showPreview
    }"
    :style="panelStyle"
  >
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar" v-if="!isFocusMode">
      <!-- 面包屑导航 -->
      <div class="toolbar-left">
        <div class="breadcrumb">
          <span class="breadcrumb-item">{{ projectName || '未命名项目' }}</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">{{ chapterTitle || '新章节' }}</span>
        </div>
      </div>

      <!-- EditorToolbar 集成 -->
      <div class="toolbar-center">
        <EditorToolbar
          :show-preview="showPreview"
          @command="handleToolbarCommand"
          @togglePreview="emit('togglePreview')"
        />
      </div>

      <div class="toolbar-right">
        <!-- 工具按钮组 -->
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

    <!-- 主编辑器区域 -->
    <div
      class="editor-main"
      :style="editorStyle"
    >
      <!-- 编辑器内容区域 -->
      <div
        class="editor-container"
        :class="{ 'dual-view': showPreview }"
      >
        <!-- 输入区域 -->
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

        <!-- Markdown 预览 -->
        <div v-if="showPreview" class="preview-pane markdown-body">
          <div v-html="renderedContent"></div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="!content" class="editor-placeholder">
        <QyIcon name="Edit" />
        <p>{{ t('editor.placeholder', '开始写作...') }}</p>
      </div>
    </div>

    <!-- 时间线面板 -->
    <div class="timeline-panel" v-if="showTimeline && !isFocusMode">
      <TimelineBar v-if="timelineId" :timeline-id="timelineId" />
    </div>

    <!-- 底部状态栏 -->
    <div class="editor-statusbar" v-if="!isFocusMode">
      <div class="statusbar-left">
        <!-- 字数统计 -->
        <span class="word-count">
          {{ t('editor.wordCount', '字数') }}: {{ wordCount }}
        </span>

        <!-- 阅读时间 -->
        <span class="read-time">
          {{ t('editor.readTime', '阅读时间') }}: {{ readTime }}
        </span>

        <!-- 保存状态 -->
        <span class="save-status" :class="saveStatusClass">
          {{ saveStatusText }}
        </span>
      </div>

      <div class="statusbar-right">
        <!-- 光标位置 -->
        <span class="cursor-position">
          {{ t('editor.line', '行') }} {{ cursorPosition.line }} : {{ cursorPosition.column }}
        </span>

        <!-- 编码 -->
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

// ==================== 类型定义 ====================
interface Props {
  content?: string
  projectName?: string
  chapterTitle?: string
  readonly?: boolean
  leftPanelWidth?: number
  rightPanelWidth?: number
  showPreview?: boolean
  showTimeline?: boolean
  timelineId?: string
}

interface Emits {
  (e: 'update:content', value: string): void
  (e: 'save'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'aiAssistant'): void
  (e: 'togglePreview'): void
  (e: 'formatCommand', command: string): void
  (e: 'contextmenu', event: MouseEvent, selectedText: string): void
}

// ==================== Props & Emits ====================
const props = withDefaults(defineProps<Props>(), {
  content: '',
  projectName: '',
  chapterTitle: '',
  readonly: false,
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  showPreview: false,
  showTimeline: false,
  timelineId: ''
})

const emit = defineEmits<Emits>()

// ==================== 国际化 ====================
const { t } = useI18n()

// ==================== DOM Refs ====================
const editorContentRef = ref<HTMLDivElement>()

// ==================== 响应式状态 ====================
const isFocusMode = ref(false)
const saveStatus = ref<'saved' | 'saving' | 'unsaved'>('saved')
const cursorPosition = ref({ line: 1, column: 1 })

// ==================== 响应式断点 ====================
const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200
})

const isMobile = breakpoints.smaller('mobile')
const isTablet = breakpoints.between('mobile', 'desktop')
const isDesktop = breakpoints.greaterOrEqual('desktop')

// ==================== 编辑器内容处理 ====================
// 处理contenteditable的换行和空格显示
const editorText = computed(() => {
  if (!props.content) return ''
  // 将换行符转换为<br>以保持格式
  return props.content
})

// ==================== VSCode主题颜色 ====================
const vscodeColors = {
  editorBackground: '#1e1e1e',
  editorForeground: '#d4d4d4',
  editorGroupHeaderTabsBackground: '#252526',
  statusBarBackground: '#007acc',
  statusBarForeground: '#ffffff',
  statusBarBorder: '#007acc',
  editorSelectionBackground: '#264f78',
  editorCursorColor: '#aeafad',
  editorWhitespaceForeground: '#404040',
  editorLineNumberForeground: '#858585',
  editorActiveLineNumberForeground: '#c6c6c6'
}

// ==================== 计算属性 ====================
// 字数统计
const wordCount = computed(() => {
  return calculateWordCount(props.content)
})

// 阅读时间（分钟）
const readTime = computed(() => {
  const wordsPerMinute = 500 // 中文阅读速度
  const minutes = Math.ceil(wordCount.value / wordsPerMinute)
  return minutes > 0 ? `${minutes} ${t('editor.minutes', '分钟')}` : `0 ${t('editor.minutes', '分钟')}`
})

// Markdown渲染结果
const renderedContent = computed(() => {
  return renderMarkdown(props.content)
})

// 保存状态文本
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

// 保存状态样式
const saveStatusClass = computed(() => {
  return `save-status--${saveStatus.value}`
})

// 编辑器面板样式
const panelStyle = computed(() => {
  return {
    '--vscode-editor-background': vscodeColors.editorBackground,
    '--vscode-editor-foreground': vscodeColors.editorForeground,
    '--vscode-toolbar-background': vscodeColors.editorGroupHeaderTabsBackground,
    '--vscode-statusbar-background': vscodeColors.statusBarBackground,
    '--vscode-statusbar-foreground': vscodeColors.statusBarForeground,
    '--vscode-selection-background': vscodeColors.editorSelectionBackground,
    '--vscode-cursor-color': vscodeColors.editorCursorColor
  }
})

// 编辑器区域样式
const editorStyle = computed(() => {
  return {
    minWidth: '400px',
    minHeight: props.showTimeline ? 'calc(100vh - 80px - 22px - 180px)' : 'calc(100vh - 80px - 22px)' // 减去时间线高度
  }
})

// ==================== 方法 ====================
// 防抖处理内容变化
const debouncedUpdate = debounce((newContent: string) => {
  emit('update:content', newContent)
  saveStatus.value = 'unsaved'
}, 300)

// 处理内容变化
const handleContentChange = (event: Event) => {
  const target = event.target as HTMLDivElement
  // 获取纯文本内容，保留换行
  const newContent = target.textContent || ''
  debouncedUpdate(newContent)
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 更新光标位置
  updateCursorPosition()

  // 快捷键处理
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

  // Tab键处理
  if (event.key === 'Tab') {
    event.preventDefault()
    insertText('  ')
  }

  // F11 进入专注模式
  if (event.key === 'F11') {
    event.preventDefault()
    toggleFocusMode()
  }
}

// 插入文本到光标位置
const insertText = (text: string) => {
  if (!editorContentRef.value) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  const textNode = document.createTextNode(text)
  range.insertNode(textNode)

  // 移动光标到插入文本之后
  range.setStartAfter(textNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  // 触发内容更新
  handleContentChange({ target: editorContentRef.value } as unknown as Event)
}

// 更新光标位置
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

// 处理右键菜单
const handleContextMenu = (event: MouseEvent) => {
  const selection = window.getSelection()
  const selectedText = selection?.toString() || ''
  if (selectedText) {
    emit('contextmenu', event, selectedText)
  }
}

// 处理工具栏命令
const handleToolbarCommand = (cmd: string) => {
  emit('formatCommand', cmd)
}

// 保存
const handleSave = () => {
  saveStatus.value = 'saving'
  emit('save')

  // 模拟保存完成（实际由父组件处理）
  setTimeout(() => {
    saveStatus.value = 'saved'
  }, 500)
}

// AI助手
const handleAIAssistant = () => {
  emit('aiAssistant')
}

// 切换专注模式
const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
}

// ==================== 生命周期 ====================
onMounted(() => {
  console.log('[EditorPanel] Mounted', {
    showPreview: props.showPreview,
    showTimeline: props.showTimeline,
    timelineId: props.timelineId
  })
})

onBeforeUnmount(() => {
  // 页面关闭前保存
  if (saveStatus.value === 'unsaved') {
    handleSave()
  }
})

// ==================== 监听 ====================
// 监听内容变化，更新保存状态
watch(() => props.content, () => {
  if (props.content) {
    saveStatus.value = 'unsaved'
  }
})

// 监听外部content变化，同步到编辑器
watch(() => props.content, (newContent) => {
  if (editorContentRef.value && editorContentRef.value.textContent !== newContent) {
    // 保存当前光标位置
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)
    const offset = range ? startOffsetInNode(editorContentRef.value, range.startContainer, range.startOffset) : 0

    // 更新内容
    editorContentRef.value.textContent = newContent || ''

    // 恢复光标位置
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

// 监听showPreview变化
watch(() => props.showPreview, () => {
  // 预览模式由props控制，这里可以做额外的处理
})

// 监听showTimeline变化
watch(() => props.showTimeline, () => {
  // 时间线显示由props控制
})

// 监听timelineId变化
watch(() => props.timelineId, () => {
  // timelineId变化时可以刷新数据
})

// 辅助函数：计算偏移量
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

// 辅助函数：恢复偏移量
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
// ==================== VSCode深色主题变量 ====================
.editor-panel {
  --vscode-editor-background: #1e1e1e;
  --vscode-editor-foreground: #d4d4d4;
  --vscode-toolbar-background: #252526;
  --vscode-statusbar-background: #007acc;
  --vscode-statusbar-foreground: #ffffff;
  --vscode-selection-background: #264f78;
  --vscode-cursor-color: #aeafad;
  --vscode-line-number: #858585;
  --vscode-active-line-number: #c6c6c6;
  --vscode-whitespace: #404040;
  --vscode-border: #3c3c3c;
}

// ==================== 编辑器面板容器 ====================
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--qy-editor-bg);
  color: var(--qy-editor-fg);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100vh;

  // 专注模式
  &.focus-mode {
    .editor-toolbar,
    .editor-statusbar,
    .timeline-panel {
      opacity: 0;
      pointer-events: none;
    }

    &:hover {
      .editor-toolbar,
      .editor-statusbar,
      .timeline-panel {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  // 全宽模式（无左右面板）
  &.full-width {
    max-width: 100%;
  }

  // 预览模式
  &.preview-mode {
    .editor-main {
      .editor-container {
        display: flex;
      }
    }
  }

  // 响应式布局
  &.is-mobile {
    .editor-toolbar {
      padding: 0 8px;
      flex-wrap: wrap;

      .toolbar-left {
        display: none;
      }

      .toolbar-center {
        order: 1;
        flex: 1;
      }

      .toolbar-right {
        order: 2;
      }
    }

    .editor-statusbar {
      .read-time,
      .cursor-position,
      .encoding {
        display: none;
      }
    }
  }

  &.is-tablet {
    .editor-toolbar {
      .breadcrumb-separator {
        display: none;
      }
    }

    .editor-statusbar {
      .encoding {
        display: none;
      }
    }
  }
}

// ==================== 顶部工具栏 ====================
.editor-toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: var(--qy-editor-toolbar-bg);
  border-bottom: 1px solid var(--qy-editor-border);
  gap: 12px;

  .toolbar-left {
    flex: 0 0 auto;
    min-width: 0;

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--vscode-editor-foreground);

      .breadcrumb-item {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &.current {
          color: var(--qy-editor-active-line-number);
          font-weight: 500;
        }
      }

      .breadcrumb-separator {
        color: var(--qy-editor-line-number);
      }
    }
  }

  .toolbar-center {
    flex: 1;
    display: flex;
    justify-content: center;
    min-width: 0;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 0 0 auto;

    .toolbar-button {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--qy-editor-fg);
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &:active {
        background: rgba(255, 255, 255, 0.15);
      }

      &:focus-visible {
        outline: 2px solid var(--vscode-statusbar-background);
        outline-offset: 2px;
      }
    }
  }
}

// ==================== 主编辑器区域 ====================
.editor-main {
  flex: 1;
  position: relative;
  overflow: auto;
  background: var(--qy-editor-bg);
  padding: 0;

  .editor-container {
    display: block;
    height: 100%;

    &.dual-view {
      display: flex;
    }
  }

  // 编辑器内容
  .editor-content {
    flex: 1;
    min-height: 100%;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', monospace;
    font-size: 15px;
    line-height: 1.8;
    color: var(--qy-editor-fg);
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    caret-color: var(--qy-editor-cursor);
    padding: 20px 30px;

    &::selection {
      background: var(--qy-editor-selection-bg);
    }

    &:empty::before {
      content: '';
    }

    // 处理contenteditable的换行显示
    white-space: pre-wrap;
  }

  // Markdown 预览
  .preview-pane {
    flex: 1;
    overflow-y: auto;
    padding: 20px 30px;
    background-color: var(--el-fill-color-light);
    border-left: 1px solid var(--el-border-color-light);

    :deep(.markdown-body) {
      font-size: 15px;
      line-height: 1.8;
    }
  }

  // 空状态提示
  .editor-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: var(--qy-editor-line-number);
    pointer-events: none;

    .qy-icon {
      font-size: 48px;
      opacity: 0.3;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.6;
    }
  }
}

// ==================== 时间线面板 ====================
.timeline-panel {
  border-top: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

// ==================== 底部状态栏 ====================
.editor-statusbar {
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--qy-editor-statusbar-bg);
  color: var(--qy-editor-statusbar-fg);
  font-size: 12px;
  border-top: 1px solid var(--qy-editor-statusbar-border);
  flex-shrink: 0;

  .statusbar-left,
  .statusbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .word-count,
  .read-time,
  .cursor-position,
  .encoding {
    white-space: nowrap;
  }

  .save-status {
    &--saved {
      color: var(--vscode-statusbar-foreground);
    }

    &--saving {
      color: #ffd700;
    }

    &--unsaved {
      color: #ff6b6b;
    }
  }
}

// ==================== 无障碍支持 ====================
@media (prefers-reduced-motion: reduce) {
  .editor-panel,
  .toolbar-button,
  .editor-content {
    transition: none;
  }
}

// ==================== 滚动条样式 ====================
.editor-main::-webkit-scrollbar,
.preview-pane::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

.editor-main::-webkit-scrollbar-track,
.preview-pane::-webkit-scrollbar-track {
  background: var(--qy-editor-bg);
}

.editor-main::-webkit-scrollbar-thumb,
.preview-pane::-webkit-scrollbar-thumb {
  background: var(--qy-editor-whitespace);
  border: 3px solid var(--qy-editor-bg);
  border-radius: 7px;

  &:hover {
    background: var(--qy-editor-line-number);
  }
}
</style>
