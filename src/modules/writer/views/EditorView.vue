<template>
  <div class="editor-view" :class="{ 'focus-mode': isFocusMode }">
    <!-- 顶部工具栏 -->
    <div class="editor-header" v-show="!isFocusMode">
      <div class="header-left">
        <el-button @click="goBack" link class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="document-title-container">
          <el-input
            v-model="documentTitle"
            class="document-title-input"
            placeholder="文档标题"
          />
        </div>
        <el-button @click="toggleFocusMode" link>
          {{ isFocusMode ? '退出专注' : '专注模式' }}
        </el-button>
        <el-button @click="exportDocument" link>
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="main-content">
      <textarea
        ref="editorTextarea"
        v-model="fileContent"
        class="editor-textarea"
        placeholder="开始写作..."
        @keydown.tab.prevent="handleTab"
        @input="handleContentChange"
      ></textarea>
    </div>

    <!-- 底部状态栏 -->
    <div class="editor-footer" v-show="!isFocusMode">
      <div class="status-left">
        <span class="status-item">字数: {{ wordCount }}</span>
        <span class="status-item save-status">{{ saveStatus }}</span>
      </div>
      <div class="status-right">
        <span class="status-item">{{ lastSavedTime }}</span>
      </div>
    </div>

    <!-- 导出对话框 -->
    <el-dialog v-model="showExportDialog" title="导出文档" width="400px">
      <div class="export-options">
        <el-button @click="exportAsText" class="export-option">
          <el-icon><Document /></el-icon>
          纯文本 (.txt)
        </el-button>
        <el-button @click="exportAsMarkdown" class="export-option">
          <el-icon><EditPen /></el-icon>
          Markdown (.md)
        </el-button>
        <el-button @click="exportAsHTML" class="export-option">
          <el-icon><View /></el-icon>
          HTML (.html)
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Document, EditPen, View } from '@element-plus/icons-vue'
import { renderMarkdown } from '../utils/markdown'

const route = useRoute()
const router = useRouter()

// --- State ---
const fileContent = ref('')
const documentTitle = ref('未命名文档')
const isFocusMode = ref(false)
const saveStatus = ref('已保存')
const showExportDialog = ref(false)
const editorTextarea = ref(null)
let autoSaveTimer = null

// --- Computed ---
const wordCount = computed(() => {
  if (!fileContent.value) return 0
  const text = fileContent.value.replace(/[\s\n\r]/g, '')
  return text.length
})

const lastSavedTime = computed(() => {
  return `最后保存: ${new Date().toLocaleTimeString()}`
})

// --- Methods ---
const loadDocument = () => {
  // POC: 使用假数据
  const mockContent = `# 欢迎使用青羽写作编辑器

这是一个基于 Markdown 的写作编辑器，支持以下功能：

## 功能特点

- **实时字数统计**：底部状态栏显示当前字数
- **自动保存**：编辑内容会自动保存
- **专注模式**：隐藏工具栏，专注写作
- **导出功能**：支持导出为 TXT、Markdown、HTML 格式

## Markdown 语法支持

### 标题

使用 # 号可表示 1-6 级标题

### 列表

- 无序列表项 1
- 无序列表项 2
- 无序列表项 3

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

### 代码

行内代码: \`const x = 1\`

代码块:
\`\`\`javascript
function hello() {
  console.log('Hello, World!')
}
\`\`\`

### 引用

> 这是一段引用文本

### 链接和图片

[青羽平台](https://qingyu.com)

---

开始你的创作之旅吧！
`
  fileContent.value = mockContent
  documentTitle.value = '示例文档'
  saveStatus.value = '已加载'
}

const saveDocument = () => {
  saveStatus.value = '保存中...'
  // POC: 模拟保存到 localStorage
  try {
    localStorage.setItem('writer_draft', fileContent.value)
    localStorage.setItem('writer_title', documentTitle.value)
    setTimeout(() => {
      saveStatus.value = '已保存'
    }, 500)
  } catch (error) {
    saveStatus.value = '保存失败'
    console.error('Save failed:', error)
  }
}

const handleContentChange = () => {
  saveStatus.value = '未保存'
  // 防抖保存
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(saveDocument, 1500)
}

const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
}

const handleTab = (event) => {
  event.preventDefault()
  const textarea = event.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const tabCharacter = '  ' // 两个空格

  textarea.value =
    textarea.value.substring(0, start) + tabCharacter + textarea.value.substring(end)

  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + tabCharacter.length
  })
}

const exportDocument = () => {
  showExportDialog.value = true
}

const downloadFile = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showExportDialog.value = false
}

const exportAsText = () => {
  const filename = `${documentTitle.value || 'Untitled'}.txt`
  downloadFile(filename, fileContent.value, 'text/plain;charset=utf-8')
}

const exportAsMarkdown = () => {
  const filename = `${documentTitle.value || 'Untitled'}.md`
  downloadFile(filename, fileContent.value, 'text/markdown;charset=utf-8')
}

const exportAsHTML = () => {
  const title = documentTitle.value || 'Untitled'
  const content = renderMarkdown(fileContent.value)

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      font-weight: 600;
    }
    code {
      background-color: #e9ecef;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      background-color: #e9ecef;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
  `

  const filename = `${title}.html`
  downloadFile(filename, html, 'text/html;charset=utf-8')
}

const goBack = () => {
  router.push({ name: 'home' })
}

// --- Lifecycle Hooks ---
onMounted(() => {
  // 尝试从 localStorage 恢复草稿
  const savedDraft = localStorage.getItem('writer_draft')
  const savedTitle = localStorage.getItem('writer_title')

  if (savedDraft) {
    fileContent.value = savedDraft
    documentTitle.value = savedTitle || '未命名文档'
    saveStatus.value = '已恢复'
  } else {
    loadDocument()
  }
})

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style scoped>
/* 基本样式 */
.editor-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

.editor-view.focus-mode {
  padding: 5% 15%;
}

/* 头部 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.back-btn {
  margin-right: 8px;
}

.document-title-container {
  flex: 1;
  max-width: 400px;
}

.document-title-input {
  font-size: 16px;
  font-weight: 500;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 2rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.7;
  border: none;
  background-color: transparent;
  color: #1f2937;
  resize: none;
  outline: none;
}

/* 底部状态栏 */
.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  font-size: 14px;
  color: #6b7280;
}

.status-left,
.status-right {
  display: flex;
  gap: 16px;
}

.save-status {
  font-style: italic;
}

/* 导出选项 */
.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-option {
  width: 100%;
  justify-content: flex-start;
  padding: 12px;
}
</style>

