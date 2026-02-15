<template>
  <div class="markdown-editor" :class="{ 'is-readonly': readonly }">
    <!-- 编辑器头部 -->
    <header class="editor-header">
      <div class="header-left">
        <QyIcon name="Document" class="chapter-icon" />
        <h2 class="chapter-title">{{ displayTitle }}</h2>
      </div>
      <div class="header-right">
        <!-- 保存状态 -->
        <div class="save-status" :class="saveStatusClass">
          <QyIcon v-if="saveStatus === 'saving'" name="Loading" class="is-loading" />
          <QyIcon v-else-if="saveStatus === 'saved'" name="Check" />
          <QyIcon v-else-if="saveStatus === 'error'" name="Close" />
          <QyIcon v-else-if="saveStatus === 'unsaved'" name="Warning" />
          <span class="status-text">{{ saveStatusText }}</span>
        </div>
        <!-- 字数统计 -->
        <div class="word-count">
          <span class="count-value">{{ formattedWordCount }}</span>
          <span class="count-unit">万字</span>
        </div>
      </div>
    </header>

    <!-- 编辑器主体 -->
    <div class="editor-body">
      <!-- vditor 未安装提示 -->
      <div v-if="!vditorAvailable" class="vditor-missing">
        <QyIcon name="Warning" class="warning-icon" />
        <p class="missing-title">vditor 编辑器未安装</p>
        <p class="missing-desc">请运行以下命令安装：</p>
        <code class="install-cmd">npm install vditor</code>
        <p class="missing-hint">或使用 yarn：</p>
        <code class="install-cmd">yarn add vditor</code>
      </div>

      <!-- vditor 编辑器容器 -->
      <div
        v-else
        ref="editorRef"
        class="vditor-container"
        :class="{ 'is-readonly': readonly }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { QyIcon } from '@/design-system/components'
import { useEditorStore } from '@/modules/writer/stores/editorStore'

// 防抖函数
function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }) as T
}

// 保存状态类型
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unsaved'

// Props 定义
interface Props {
  modelValue?: string
  title?: string
  placeholder?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  title: '',
  placeholder: '开始创作...',
  readonly: false
})

// Emits 定义
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'save', value: string): void
  (e: 'wordCountChange', count: number): void
}

const emit = defineEmits<Emits>()

// Store
const editorStore = useEditorStore()

// Refs
const editorRef = ref<HTMLDivElement>()
const vditorAvailable = ref(false)
const wordCount = ref(0)
const saveStatus = ref<SaveStatus>('saved')

// Vditor 实例
let vditorInstance: any = null
let saveTimeout: ReturnType<typeof setTimeout> | null = null

// 计算属性
const displayTitle = computed(() => props.title || '未命名章节')

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saved':
      return '已保存'
    case 'saving':
      return '保存中...'
    case 'unsaved':
      return '未保存'
    case 'error':
      return '保存失败'
    case 'idle':
    default:
      return ''
  }
})

const saveStatusClass = computed(() => `status-${saveStatus.value}`)

const formattedWordCount = computed(() => {
  const wan = wordCount.value / 10000
  return wan.toFixed(2)
})

// 计算字数（中文按字计算，英文按词计算）
function calculateWordCount(text: string): number {
  if (!text) return 0

  // 移除 Markdown 语法标记
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/`[^`]+`/g, '') // 行内代码
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1') // 链接
    .replace(/[#*_~>`|-]/g, '') // 标记符号
    .replace(/\s+/g, ' ') // 空白字符
    .trim()

  // 中文字符数
  const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length

  // 英文单词数
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length

  return chineseChars + englishWords
}

// 防抖字数统计（500ms 防抖）
const debouncedUpdateWordCount = useDebounceFn((value: string) => {
  const count = calculateWordCount(value)
  wordCount.value = count
  emit('wordCountChange', count)
}, 500)

// 防抖保存
function debouncedSave(content: string) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  saveStatus.value = 'unsaved'
  editorStore.markDirty()

  saveTimeout = setTimeout(() => {
    performSave(content)
  }, 3000)
}

// 执行保存
function performSave(content: string) {
  saveStatus.value = 'saving'
  editorStore.setSaving(true)

  emit('save', content)

  // 注意：实际保存成功/失败状态需要父组件通过回调设置
  // 这里默认设置为已保存，父组件可以调用 setSaveStatus 来更新
  setTimeout(() => {
    saveStatus.value = 'saved'
    editorStore.markSaved()
    editorStore.setSaving(false)
  }, 500)
}

// 手动设置保存状态（供父组件调用）
function setSaveStatus(status: SaveStatus) {
  saveStatus.value = status
  if (status === 'saved') {
    editorStore.markSaved()
    editorStore.setSaving(false)
  } else if (status === 'saving') {
    editorStore.setSaving(true)
  }
}

// 初始化 vditor
async function initVditor() {
  try {
    // 动态导入 vditor
    const Vditor = (await import('vditor')).default
    await import('vditor/dist/index.css')

    vditorAvailable.value = true

    await nextTick()

    if (!editorRef.value) return

    // 工具栏配置（精简版）
    const toolbar = [
      {
        name: 'headings',
        tip: '标题',
        tipPosition: 'n'
      },
      {
        name: 'bold',
        tip: '粗体',
        tipPosition: 'n'
      },
      {
        name: 'italic',
        tip: '斜体',
        tipPosition: 'n'
      },
      {
        name: 'quote',
        tip: '引用',
        tipPosition: 'n'
      },
      {
        name: 'list',
        tip: '无序列表',
        tipPosition: 'n'
      },
      {
        name: 'ordered-list',
        tip: '有序列表',
        tipPosition: 'n'
      },
      '|',
      {
        name: 'undo',
        tip: '撤销',
        tipPosition: 'n'
      },
      {
        name: 'redo',
        tip: '重做',
        tipPosition: 'n'
      }
    ]

    vditorInstance = new Vditor(editorRef.value, {
      height: '100%',
      mode: 'wysiwyg', // 所见即所得模式
      placeholder: props.placeholder,
      value: props.modelValue,
      readonly: props.readonly,
      toolbar,
      theme: 'classic',
      icon: 'material',

      // 输入回调
      input: (value: string) => {
        emit('update:modelValue', value)

        // 更新字数统计（使用防抖版本）
        debouncedUpdateWordCount(value)

        // 触发自动保存
        if (!props.readonly) {
          debouncedSave(value)
        }
      },

      // 聚焦回调
      focus: () => {
        editorRef.value?.classList.add('is-focused')
      },

      // 失焦回调
      blur: () => {
        editorRef.value?.classList.remove('is-focused')
      },

      // 计数器配置
      counter: {
        enable: false // 我们使用自己的字数统计
      },

      // 缓存配置
      cache: {
        enable: false // 使用 store 管理
      }
    })
  } catch (error) {
    console.warn('[MarkdownEditor] vditor 加载失败，请确保已安装:', error)
    vditorAvailable.value = false
  }
}

// 销毁编辑器
function destroyVditor() {
  if (vditorInstance) {
    try {
      vditorInstance.destroy()
    } catch (error) {
      console.warn('[MarkdownEditor] 销毁编辑器时出错:', error)
    }
    vditorInstance = null
  }

  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
}

// 获取编辑器内容
function getContent(): string {
  if (vditorInstance) {
    return vditorInstance.getValue()
  }
  return props.modelValue
}

// 设置编辑器内容
function setContent(content: string) {
  if (vditorInstance) {
    vditorInstance.setValue(content)
  }
}

// 聚焦编辑器
function focus() {
  if (vditorInstance) {
    vditorInstance.focus()
  }
}

// 监听 modelValue 变化（外部更新）
watch(
  () => props.modelValue,
  (newValue) => {
    if (vditorInstance && newValue !== vditorInstance.getValue()) {
      vditorInstance.setValue(newValue)

      // 更新字数
      const count = calculateWordCount(newValue)
      wordCount.value = count
      emit('wordCountChange', count)
    }
  }
)

// 监听只读状态变化
watch(
  () => props.readonly,
  (isReadonly) => {
    if (vditorInstance) {
      vditorInstance.disabled(isReadonly)
    }
  }
)

// 生命周期
onMounted(() => {
  initVditor()

  // 初始化字数统计
  if (props.modelValue) {
    const count = calculateWordCount(props.modelValue)
    wordCount.value = count
    emit('wordCountChange', count)
  }
})

onBeforeUnmount(() => {
  destroyVditor()
})

// 暴露方法给父组件
defineExpose({
  getContent,
  setContent,
  focus,
  setSaveStatus
})
</script>

<style scoped lang="scss">
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color, #ffffff);
  border-radius: 12px;
  overflow: hidden;

  &.is-readonly {
    opacity: 0.85;
  }
}

// 编辑器头部
.editor-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
  background: var(--el-bg-color, #ffffff);

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .chapter-icon {
      color: var(--el-color-primary, #409eff);
      font-size: 18px;
      flex-shrink: 0;
    }

    .chapter-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }
}

// 保存状态
.save-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  transition: all 0.3s ease;

  .status-text {
    white-space: nowrap;
  }

  &.status-saved {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.1);
  }

  &.status-saving {
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);

    .is-loading {
      animation: rotating 1.5s linear infinite;
    }
  }

  &.status-unsaved {
    color: #e6a23c;
    background: rgba(230, 162, 60, 0.1);
  }

  &.status-error {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }

  &.status-idle {
    color: #909399;
    background: transparent;
  }
}

// 字数统计
.word-count {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 4px 10px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 12px;

  .count-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    font-family: var(--el-font-family-monospace, monospace);
  }

  .count-unit {
    font-size: 11px;
    color: var(--el-text-color-secondary, #909399);
  }
}

// 编辑器主体
.editor-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

// vditor 容器
.vditor-container {
  height: 100%;

  :deep(.vditor) {
    border: none;
    height: 100%;
  }

  :deep(.vditor-toolbar) {
    border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
    padding: 8px 12px;
    background: var(--el-bg-color-page, #f5f7fa);
  }

  :deep(.vditor-content) {
    height: calc(100% - 45px);
  }

  :deep(.vditor-wysiwyg) {
    padding: 20px 24px;
    font-family: 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
    font-size: 16px;
    line-height: 1.8;
  }

  &.is-readonly {
    :deep(.vditor-toolbar) {
      display: none;
    }

    :deep(.vditor-wysiwyg) {
      background: var(--el-fill-color-lighter, #fafafa);
    }
  }
}

// vditor 未安装提示
.vditor-missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: var(--el-text-color-secondary, #909399);

  .warning-icon {
    font-size: 48px;
    color: var(--el-color-warning, #e6a23c);
    margin-bottom: 16px;
  }

  .missing-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    margin: 0 0 8px;
  }

  .missing-desc,
  .missing-hint {
    font-size: 14px;
    margin: 8px 0;
  }

  .install-cmd {
    display: block;
    padding: 8px 16px;
    background: var(--el-fill-color-dark, #e4e7ed);
    border-radius: 4px;
    font-family: var(--el-font-family-monospace, monospace);
    font-size: 13px;
    color: var(--el-color-primary, #409eff);
    margin: 8px 0;
  }
}

// 加载动画
@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .markdown-editor {
    background: var(--el-bg-color-overlay, #1d1e1f);
  }

  .editor-header {
    background: var(--el-bg-color-overlay, #1d1e1f);
    border-bottom-color: var(--el-border-color-darker, #4c4d4f);
  }

  .vditor-container {
    :deep(.vditor) {
      background: var(--el-bg-color-overlay, #1d1e1f);
    }

    :deep(.vditor-toolbar) {
      background: var(--el-fill-color-darker, #252627);
      border-bottom-color: var(--el-border-color-darker, #4c4d4f);
    }

    :deep(.vditor-wysiwyg) {
      background: var(--el-bg-color-overlay, #1d1e1f);
      color: var(--el-text-color-primary, #e5eaf3);
    }
  }
}
</style>
