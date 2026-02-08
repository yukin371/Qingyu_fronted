<template>
  <div
    class="editor-panel vscode-theme"
    :class="{
      'editor-panel--center': true,
      'full-width': !leftPanelWidth && !rightPanelWidth,
      'is-mobile': isMobile.value,
      'is-tablet': isTablet.value,
      'is-desktop': isDesktop.value,
      'focus-mode': isFocusMode
    }"
    :style="panelStyle"
  >
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <span class="breadcrumb-item">{{ projectName || '未命名项目' }}</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">{{ chapterTitle || '新章节' }}</span>
        </div>
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
          :aria-label="t('editor.undo', '撤销 (Ctrl+Z)')"
          :title="t('editor.undo', '撤销 (Ctrl+Z)')"
          @click="handleUndo"
        >
          <QyIcon name="Refresh" />
        </button>

        <button
          class="toolbar-button"
          :aria-label="t('editor.redo', '重做 (Ctrl+Y)')"
          :title="t('editor.redo', '重做 (Ctrl+Y)')"
          @click="handleRedo"
        >
          <QyIcon name="Refresh" />
        </button>

        <div class="toolbar-divider"></div>

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
        class="editor-content"
        role="textbox"
        :aria-label="t('editor.contentArea', '编辑器内容区域')"
        tabindex="0"
        :contenteditable="!readonly"
        @input="handleContentChange"
        @keydown="handleKeyDown"
      >
        {{ content || '' }}
      </div>

      <!-- 空状态提示 -->
      <div v-if="!content" class="editor-placeholder">
        <QyIcon name="Edit" />
        <p>{{ t('editor.placeholder', '开始写作...') }}</p>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="editor-statusbar">
      <div class="statusbar-left">
        <!-- 字数统计 -->
        <span class="word-count">
          {{ t('editor.wordCount', '字数') }}: {{ wordCount }}
        </span>

        <!-- 阅读时间 -->
        <span class="read-time">
          {{ t('editor.readTime', '阅读时间') }}: {{ readTime }}
        </span>
      </div>

      <div class="statusbar-right">
        <!-- 保存状态 -->
        <span class="save-status" :class="saveStatusClass">
          {{ saveStatusText }}
        </span>

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

// ==================== 类型定义 ====================
interface Props {
  content?: string
  projectName?: string
  chapterTitle?: string
  readonly?: boolean
  leftPanelWidth?: number
  rightPanelWidth?: number
}

interface Emits {
  (e: 'update:content', value: string): void
  (e: 'save'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'aiAssistant'): void
  (e: 'focusMode', value: boolean): void
}

// ==================== Props & Emits ====================
const props = withDefaults(defineProps<Props>(), {
  content: '',
  projectName: '',
  chapterTitle: '',
  readonly: false,
  leftPanelWidth: 280,
  rightPanelWidth: 320
})

const emit = defineEmits<Emits>()

// ==================== 国际化 ====================
const { t } = useI18n()

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

// 响应式断点状态（用于模板）
const { isMobile: mobile, isTablet: tablet, isDesktop: desktop } = breakpoints

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
  if (!props.content) return 0
  // 移除空白字符后计算
  return props.content.replace(/\s/g, '').length
})

// 阅读时间（分钟）
const readTime = computed(() => {
  const wordsPerMinute = 500 // 中文阅读速度
  const minutes = Math.ceil(wordCount.value / wordsPerMinute)
  return minutes > 0 ? `${minutes} ${t('editor.minutes', '分钟')}` : `0 ${t('editor.minutes', '分钟')}`
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
    minHeight: 'calc(100vh - 80px - 22px)' // 总高度 - 工具栏 - 状态栏
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
  const target = event.target as HTMLElement
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
        handleUndo()
        break
      case 'y':
        event.preventDefault()
        handleRedo()
        break
    }
  }

  // F11 进入专注模式
  if (event.key === 'F11') {
    event.preventDefault()
    toggleFocusMode()
  }
}

// 更新光标位置
const updateCursorPosition = () => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    // 简化的光标位置计算
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(document.querySelector('.editor-content') as HTMLElement)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    const text = preCaretRange.toString()
    const lines = text.split('\n')

    cursorPosition.value = {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    }
  }
}

// 保存
const handleSave = () => {
  saveStatus.value = 'saving'
  emit('save')

  // 模拟保存完成
  setTimeout(() => {
    saveStatus.value = 'saved'
  }, 500)
}

// 撤销
const handleUndo = () => {
  emit('undo')
}

// 重做
const handleRedo = () => {
  emit('redo')
}

// AI助手
const handleAIAssistant = () => {
  emit('aiAssistant')
}

// 切换专注模式
const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
  emit('focusMode', isFocusMode.value)
}

// ==================== 生命周期 ====================
onMounted(() => {
  console.log('[EditorPanel] Mounted')
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
  background: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
  overflow: hidden;
  transition: all 0.3s ease;

  // 专注模式
  &.focus-mode {
    .editor-toolbar,
    .editor-statusbar {
      opacity: 0;
      pointer-events: none;
    }

    &:hover {
      .editor-toolbar,
      .editor-statusbar {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  // 全宽模式（无左右面板）
  &.full-width {
    max-width: 100%;
  }

  // 响应式布局
  &.is-mobile {
    .editor-toolbar {
      padding: 0 8px;

      .breadcrumb {
        display: none;
      }
    }

    .editor-statusbar {
      .statusbar-left {
        .read-time {
          display: none;
        }
      }

      .statusbar-right {
        .cursor-position,
        .encoding {
          display: none;
        }
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
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--vscode-toolbar-background);
  border-bottom: 1px solid var(--vscode-border);

  .toolbar-left {
    flex: 1;
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
          color: var(--vscode-active-line-number);
          font-weight: 500;
        }
      }

      .breadcrumb-separator {
        color: var(--vscode-line-number);
      }
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 4px;

    .toolbar-button {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--vscode-editor-foreground);
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

    .toolbar-divider {
      width: 1px;
      height: 20px;
      background: var(--vscode-border);
      margin: 0 4px;
    }
  }
}

// ==================== 主编辑器区域 ====================
.editor-main {
  flex: 1;
  position: relative;
  overflow: auto;
  background: var(--vscode-editor-background);
  padding: 20px 40px;

  // 编辑器内容
  .editor-content {
    min-height: 100%;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', monospace;
    font-size: 14px;
    line-height: 1.8;
    color: var(--vscode-editor-foreground);
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    caret-color: var(--vscode-cursor-color);

    &::selection {
      background: var(--vscode-selection-background);
    }

    &:empty::before {
      content: '';
    }
  }

  // 空状态提示
  .editor-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: var(--vscode-line-number);
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

// ==================== 底部状态栏 ====================
.editor-statusbar {
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--vscode-statusbar-background);
  color: var(--vscode-statusbar-foreground);
  font-size: 12px;
  border-top: 1px solid var(--vscode-statusbar-border);

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
.editor-main::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}

.editor-main::-webkit-scrollbar-track {
  background: var(--vscode-editor-background);
}

.editor-main::-webkit-scrollbar-thumb {
  background: var(--vscode-whitespace);
  border: 3px solid var(--vscode-editor-background);
  border-radius: 7px;

  &:hover {
    background: var(--vscode-line-number);
  }
}
</style>
