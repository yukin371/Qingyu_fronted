<template>
  <div class="editor-view" :class="{ 'focus-mode': isFocusMode }">
    <!-- 项目侧边栏 -->
    <ProjectSidebar v-show="!isFocusMode" :current-chapter-id="currentChapterId" :projects="projects"
      :chapters="chapters" @chapter-change="handleChapterChange" @project-change="handleProjectChange"
      @add-chapter="handleAddChapter" @edit-chapter="handleEditChapter" @delete-chapter="handleDeleteChapter" />

    <!-- 主编辑区域 -->
    <div class="editor-container">
      <!-- 顶部工具栏 -->
      <div class="editor-header" v-show="!isFocusMode">
        <div class="header-left">
          <el-button @click="goBack" link class="back-btn">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            返回
          </el-button>
          <div class="document-title-container">
            <el-input v-model="documentTitle" class="document-title-input" placeholder="章节标题"
              @change="handleTitleChange" />
          </div>
        </div>
        <div class="header-right">
          <el-button @click="toggleFocusMode" link>
            {{ isFocusMode ? '退出专注' : '专注模式' }}
          </el-button>
          <el-button @click="handleSaveManually" :loading="isSaving" type="primary" link>
            <el-icon><Select /></el-icon>
            保存
          </el-button>
          <el-button @click="exportDocument" link>
            <el-icon>
              <Download />
            </el-icon>
            导出
          </el-button>
        </div>
      </div>

      <!-- 编辑器主体 -->
      <div class="main-content">
        <textarea ref="editorTextarea" v-model="fileContent" class="editor-textarea" placeholder="开始写作..."
          @keydown.tab.prevent="handleTab" @input="handleContentChange"></textarea>
      </div>

      <!-- 底部状态栏 -->
      <div class="editor-footer" v-show="!isFocusMode">
        <div class="status-left">
          <span class="status-item">
            字数: <strong>{{ wordCount }}</strong>
          </span>
          <span class="status-item save-status" :class="saveStatusClass">
            <el-icon>
              <component :is="saveStatusIcon" />
            </el-icon>
            {{ saveStatus }}
          </span>
        </div>
        <div class="status-right">
          <span v-if="lastSavedTime" class="status-item">
            最后保存: {{ lastSavedTime }}
          </span>
          <span class="status-item">
            {{ currentTime }}
          </span>
        </div>
      </div>
    </div>

    <!-- 导出对话框 -->
    <el-dialog v-model="showExportDialog" title="导出文档" width="400px">
      <div class="export-options">
        <el-button @click="exportAsText" class="export-option">
          <el-icon>
            <Document />
          </el-icon>
          纯文本 (.txt)
        </el-button>
        <el-button @click="exportAsMarkdown" class="export-option">
          <el-icon>
            <EditPen />
          </el-icon>
          Markdown (.md)
        </el-button>
        <el-button @click="exportAsHTML" class="export-option">
          <el-icon>
            <View />
          </el-icon>
          HTML (.html)
        </el-button>
      </div>
    </el-dialog>

    <!-- 新建章节对话框 -->
    <el-dialog v-model="showNewChapterDialog" title="新建章节" width="500px">
      <el-form :model="newChapterForm" label-width="80px">
        <el-form-item label="章节序号">
          <el-input-number v-model="newChapterForm.chapterNum" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="章节标题">
          <el-input v-model="newChapterForm.title" placeholder="请输入章节标题" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewChapterDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddChapter">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Download,
  Document,
  EditPen,
  View,
  Select,
  Loading,
  CircleCheck,
  Warning
} from '@element-plus/icons-vue'
import ProjectSidebar from '../components/ProjectSidebar.vue'
import { AutoSaveManager } from '../utils/autosave'
import { renderMarkdown } from '../utils/markdown'

const router = useRouter()
const route = useRoute()

// --- 项目和章节数据 (模拟数据，实际应从API获取) ---
const projects = ref([
  {
    id: '1',
    title: '我的第一本小说',
    status: 'published' as const,
    wordCount: 125000,
    chapterCount: 15
  },
  {
    id: '2',
    title: '科幻短篇集',
    status: 'draft' as const,
    wordCount: 35000,
    chapterCount: 5
  }
])

const chapters = ref([
  { id: '1-1', projectId: '1', chapterNum: 1, title: '第一章：开始', wordCount: 3500, updateTime: new Date().toISOString(), isDraft: false },
  { id: '1-2', projectId: '1', chapterNum: 2, title: '第二章：冒险', wordCount: 4200, updateTime: new Date(Date.now() - 86400000).toISOString(), isDraft: false },
  { id: '1-3', projectId: '1', chapterNum: 3, title: '第三章：挑战', wordCount: 0, updateTime: new Date().toISOString(), isDraft: true },
  { id: '2-1', projectId: '2', chapterNum: 1, title: '流浪地球', wordCount: 8000, updateTime: new Date().toISOString(), isDraft: false },
  { id: '2-2', projectId: '2', chapterNum: 2, title: '三体', wordCount: 12000, updateTime: new Date(Date.now() - 172800000).toISOString(), isDraft: false }
])

// --- 状态 ---
const fileContent = ref('')
const documentTitle = ref('未命名章节')
const currentChapterId = ref('')
const isFocusMode = ref(false)
const saveStatus = ref('未保存')
const isSaving = ref(false)
const showExportDialog = ref(false)
const showNewChapterDialog = ref(false)
const editorTextarea = ref<HTMLTextAreaElement | null>(null)
const lastSavedTime = ref('')
const currentTime = ref(new Date().toLocaleTimeString())

// 新建章节表单
const newChapterForm = ref({
  chapterNum: 1,
  title: ''
})

// 自动保存管理器
let autoSaveManager: AutoSaveManager | null = null

// --- 计算属性 ---
const wordCount = computed(() => {
  if (!fileContent.value) return 0
  const text = fileContent.value.replace(/[\s\n\r]/g, '')
  return text.length
})

const saveStatusClass = computed(() => {
  return {
    'status-saving': saveStatus.value === '保存中...',
    'status-saved': saveStatus.value === '已保存',
    'status-error': saveStatus.value === '保存失败'
  }
})

const saveStatusIcon = computed(() => {
  switch (saveStatus.value) {
    case '保存中...':
      return Loading
    case '已保存':
      return CircleCheck
    case '保存失败':
      return Warning
    default:
      return Document
  }
})

// --- 方法 ---

// 章节切换
const handleChapterChange = (chapter: any) => {
  // 如果有未保存的内容，提示用户
  if (saveStatus.value === '未保存' && fileContent.value) {
    ElMessage.warning('当前章节有未保存的内容')
    return
  }

  currentChapterId.value = chapter.id
  documentTitle.value = chapter.title

  // 加载章节内容 (模拟)
  loadChapterContent(chapter.id)
}

// 项目切换
const handleProjectChange = (projectId: string) => {
  // 切换到该项目的第一个章节
  const firstChapter = chapters.value.find(c => c.projectId === projectId)
  if (firstChapter) {
    currentChapterId.value = firstChapter.id
    documentTitle.value = firstChapter.title
    loadChapterContent(firstChapter.id)
  }
}

// 加载章节内容
const loadChapterContent = (chapterId: string) => {
  // TODO: 从API加载实际内容
  // 模拟加载
  const mockContent = `# ${documentTitle.value}

这是章节内容的占位符。在实际应用中，这里会从服务器加载真实的章节内容。

## 示例内容

你可以在这里开始创作你的故事...
`
  fileContent.value = mockContent
  saveStatus.value = '已加载'

  // 启动自动保存
  if (autoSaveManager) {
    autoSaveManager.start(chapterId, fileContent.value, 0)
  }
}

// 标题变化
const handleTitleChange = () => {
  saveStatus.value = '未保存'
}

// 内容变化
const handleContentChange = () => {
  saveStatus.value = '未保存'

  if (autoSaveManager && currentChapterId.value) {
    autoSaveManager.onContentChange(
      currentChapterId.value,
      fileContent.value,
      documentTitle.value
    )
  }
}

// 手动保存
const handleSaveManually = async () => {
  if (!currentChapterId.value) {
    ElMessage.warning('请先选择章节')
    return
  }

  if (autoSaveManager) {
    isSaving.value = true
    const success = await autoSaveManager.saveNow(
      currentChapterId.value,
      fileContent.value,
      documentTitle.value
    )
    isSaving.value = false

    if (success) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error('保存失败')
    }
  }
}

// 新建章节
const handleAddChapter = () => {
  // 找到当前项目的最大章节号
  const currentProjectChapters = chapters.value.filter(
    c => c.projectId === projects.value[0].id
  )
  const maxChapterNum = Math.max(...currentProjectChapters.map(c => c.chapterNum), 0)

  newChapterForm.value = {
    chapterNum: maxChapterNum + 1,
    title: ''
  }

  showNewChapterDialog.value = true
}

// 确认添加章节
const confirmAddChapter = () => {
  if (!newChapterForm.value.title) {
    ElMessage.warning('请输入章节标题')
    return
  }

  // TODO: 调用API创建章节
  const newChapter = {
    id: `${projects.value[0].id}-${Date.now()}`,
    projectId: projects.value[0].id,
    chapterNum: newChapterForm.value.chapterNum,
    title: newChapterForm.value.title,
    wordCount: 0,
    updateTime: new Date().toISOString(),
    isDraft: true
  }

  chapters.value.push(newChapter)
  showNewChapterDialog.value = false

  ElMessage.success('章节创建成功')

  // 切换到新章节
  handleChapterChange(newChapter)
}

// 编辑章节
const handleEditChapter = () => {
  // TODO: 实现章节编辑功能
  ElMessage.info('章节编辑功能开发中')
}

// 删除章节
const handleDeleteChapter = async (chapterId: string) => {
  // TODO: 调用API删除章节
  const index = chapters.value.findIndex(c => c.id === chapterId)
  if (index > -1) {
    chapters.value.splice(index, 1)
    ElMessage.success('删除成功')

    // 如果删除的是当前章节，切换到第一个章节
    if (chapterId === currentChapterId.value) {
      if (chapters.value.length > 0) {
        handleChapterChange(chapters.value[0])
      } else {
        currentChapterId.value = ''
        fileContent.value = ''
        documentTitle.value = '未命名章节'
      }
    }
  }
}

// 切换专注模式
const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
}

// Tab键处理
const handleTab = (event: KeyboardEvent) => {
  event.preventDefault()
  const textarea = event.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const tabCharacter = '  ' // 两个空格

  textarea.value =
    textarea.value.substring(0, start) + tabCharacter + textarea.value.substring(end)

  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + tabCharacter.length
  })
}

// 导出文档
const exportDocument = () => {
  showExportDialog.value = true
}

const downloadFile = (filename: string, content: string, mimeType: string) => {
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

// 返回
const goBack = () => {
  router.push({ name: 'writer-projects' })
}

// 更新当前时间
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN')
}

// --- 生命周期 ---
onMounted(() => {
  // 初始化自动保存管理器
  autoSaveManager = new AutoSaveManager({
    interval: 30000, // 30秒自动保存
    debounceDelay: 1500, // 1.5秒防抖
    onSave: async () => {
      saveStatus.value = '保存中...'
      // TODO: 调用API保存到服务器
      await new Promise(resolve => setTimeout(resolve, 500))
      saveStatus.value = '已保存'
      lastSavedTime.value = new Date().toLocaleTimeString('zh-CN')
      return Promise.resolve()
    },
    onConflict: () => {
      ElMessage.warning('检测到版本冲突，请刷新页面')
    }
  })

  // 如果有路由参数中的章节ID，加载对应章节
  const chapterId = route.query.chapterId as string
  if (chapterId) {
    const chapter = chapters.value.find(c => c.id === chapterId)
    if (chapter) {
      handleChapterChange(chapter)
    }
  } else if (chapters.value.length > 0) {
    // 默认加载第一个章节
    handleChapterChange(chapters.value[0])
  }

  // 启动时间更新定时器
  const timeInterval = setInterval(updateCurrentTime, 1000)

  onBeforeUnmount(() => {
    clearInterval(timeInterval)
  })
})

onBeforeUnmount(() => {
  if (autoSaveManager) {
    autoSaveManager.stop()
  }
})
</script>

<style scoped lang="scss">
.editor-view {
  display: flex;
  height: 100vh;
  background-color: #fff;

  &.focus-mode {
    .editor-container {
      padding: 5% 15%;
    }
  }
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 头部
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;

  .header-left,
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-left {
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

    :deep(.el-input__wrapper) {
      background-color: transparent;
    }
  }
}

// 主内容区
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
  line-height: 1.8;
  border: none;
  background-color: transparent;
  color: #1f2937;
  resize: none;
  outline: none;
}

// 底部状态栏
.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  font-size: 13px;
  color: #6b7280;

  .status-left,
  .status-right {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 4px;

    strong {
      color: #409eff;
      font-weight: 600;
    }
  }

  .save-status {
    transition: color 0.2s;

    &.status-saving {
      color: #e6a23c;
    }

    &.status-saved {
      color: #67c23a;
    }

    &.status-error {
      color: #f56c6c;
    }
  }
}

// 导出选项
.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .export-option {
    width: 100%;
    justify-content: flex-start;
    padding: 16px;
    height: auto;
  }
}
</style>
