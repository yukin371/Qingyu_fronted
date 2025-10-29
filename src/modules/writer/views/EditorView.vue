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
          <el-button @click="toggleAISidebar" link class="ai-button" title="AI写作助手 (Ctrl+Shift+A)">
            <el-icon><MagicStick /></el-icon>
            AI助手
          </el-button>
          <el-switch
            v-model="isSimpleMode"
            inactive-text="Markdown"
            active-text="简洁模式"
            @change="handleModeChange"
            style="margin-right: 12px;"
          />
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

      <!-- 标签页导航 -->
      <el-tabs v-show="!isFocusMode" v-model="activeTab" class="editor-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="编辑器" name="editor">
          <template #label>
            <span class="tab-label">
              <el-icon><Edit /></el-icon>
              编辑器
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="大纲" name="outline">
          <template #label>
            <span class="tab-label">
              <el-icon><List /></el-icon>
              大纲
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="角色图谱" name="characters">
          <template #label>
            <span class="tab-label">
              <el-icon><User /></el-icon>
              角色图谱
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="设定百科" name="encyclopedia">
          <template #label>
            <span class="tab-label">
              <el-icon><Collection /></el-icon>
              设定百科
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- Markdown工具栏（仅编辑器模式显示） -->
      <EditorToolbar
        v-show="!isFocusMode && activeTab === 'editor'"
        :is-simple-mode="isSimpleMode"
        :show-preview="showPreview"
        @insert="insertText"
        @toggle-preview="togglePreview"
      />

      <!-- 编辑器主体 - 双栏布局 -->
      <div v-show="activeTab === 'editor'" class="main-content" :class="{ 'dual-pane': showPreview && !isSimpleMode && isLargeScreen }">
        <div class="editor-pane" ref="editorPane">
          <textarea
            ref="editorTextarea"
            v-model="fileContent"
            class="editor-textarea"
            placeholder="开始写作..."
            @keydown.tab.prevent="handleTab"
            @keydown="handleKeydown"
            @input="handleContentChange"
            @scroll="handleEditorScroll"
            @contextmenu="handleContextMenu"
          ></textarea>
        </div>

        <!-- Markdown预览区 -->
        <div
          v-if="showPreview && !isSimpleMode && isLargeScreen"
          class="preview-pane"
          ref="previewPane"
          @scroll="handlePreviewScroll"
        >
          <div class="preview-content markdown-body" v-html="renderedContent"></div>
        </div>
      </div>

      <!-- 大纲视图 -->
      <OutlineView v-show="activeTab === 'outline'" />

      <!-- 角色图谱视图 -->
      <CharacterGraphView v-show="activeTab === 'characters'" />

      <!-- 设定百科视图 -->
      <EncyclopediaView v-show="activeTab === 'encyclopedia'" />

      <!-- 时间线工具栏（仅编辑器模式显示） -->
      <TimelineBar v-show="activeTab === 'editor' && !isFocusMode && writerStore.timeline.showBar" />

      <!-- 底部状态栏 -->
      <div class="editor-footer" v-show="!isFocusMode && activeTab === 'editor'">
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
          <span v-if="!isSimpleMode" class="status-item">
            模式: Markdown
          </span>
          <span v-else class="status-item">
            模式: 简洁
          </span>
          <el-button
            text
            size="small"
            @click="writerStore.toggleTimelineBar()"
            style="margin-left: 12px;"
          >
            <el-icon><Clock /></el-icon>
            {{ writerStore.timeline.showBar ? '隐藏时间线' : '显示时间线' }}
          </el-button>
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

      <!-- AI助手侧边栏 -->
      <AIAssistantSidebar
        v-if="showAISidebar"
        :project-id="currentProjectId"
        :editor="editorTextarea"
        @close="writerStore.toggleAISidebar(false)"
        @insert="handleInsertAIText"
      />
    </div>

    <!-- AI右键菜单 -->
    <AIContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :selected-text="contextMenu.selectedText"
      @action="handleContextMenuAction"
      @update:visible="contextMenu.visible = $event"
    />

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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, reactive } from 'vue'
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
  Warning,
  MagicStick,
  Edit,
  List,
  User,
  Collection,
  Clock
} from '@element-plus/icons-vue'
import * as ProjectSidebar from '../components/ProjectSidebar.vue'
import * as EditorToolbar from '../components/EditorToolbar.vue'
import { AutoSaveManager } from '../utils/autosave'
import { renderMarkdown } from '../utils/markdown'
import { useWriterStore } from '@/stores/writer'
import { useProjectStore } from '@/stores/project'
import * as AIAssistantSidebar from '../components/ai/AIAssistantSidebar.vue'
import * as AIContextMenu from '../components/ai/AIContextMenu.vue'
import * as TimelineBar from '../components/TimelineBar.vue'
import * as OutlineView from './OutlineView.vue'
import * as CharacterGraphView from './CharacterGraphView.vue'
import * as EncyclopediaView from './EncyclopediaView.vue'

const router = useRouter()
const route = useRoute()

// Stores
const writerStore = useWriterStore() // 作者相关（AI功能等）
const projectStore = useProjectStore() // 项目和文档管理

// AI相关状态
const showAISidebar = computed(() => writerStore.ai.sidebarVisible)
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  selectedText: ''
})

// 编辑器模式和显示状态
const activeTab = ref('editor')
const isSimpleMode = ref(false)
const showPreview = ref(true)
const isLargeScreen = ref(window.innerWidth >= 1200)
const editorPane = ref<HTMLDivElement | null>(null)
const previewPane = ref<HTMLDivElement | null>(null)
const isScrollingSyncEnabled = ref(true)

// --- 从路由获取参数 ---
const documentId = computed(() => route.params.documentId as string)
const projectId = computed(() => route.params.projectId as string || route.query.projectId as string)

// --- 从 stores 获取数据 ---
const currentProject = computed(() => writerStore.currentProject)
const currentDocument = computed(() => projectStore.currentDocument)
const chapters = computed(() => projectStore.documentList)

// --- 文档内容（双向绑定到 store） ---
const fileContent = computed({
  get: () => projectStore.editorContent,
  set: (value: string) => {
    projectStore.updateEditorContent(value)
    // 触发内容变更（用于自动保存）
    handleContentInput()
  }
})

const documentTitle = computed({
  get: () => currentDocument.value?.title || '未命名文档',
  set: (value: string) => {
    if (currentDocument.value) {
      currentDocument.value.title = value
    }
  }
})

// --- 状态 ---
const currentChapterId = computed(() => projectStore.currentDocumentId)
const isFocusMode = ref(false)
const isSaving = computed(() => projectStore.isSaving)
const saveStatus = computed(() => {
  if (projectStore.isSaving) return '保存中...'
  if (projectStore.hasUnsavedChanges) return '未保存'
  return '已保存'
})
const showExportDialog = ref(false)
const showNewChapterDialog = ref(false)
const editorTextarea = ref<HTMLTextAreaElement | null>(null)
const lastSavedTime = computed(() => {
  if (!projectStore.lastSaved) return '从未保存'
  return new Date(projectStore.lastSaved).toLocaleTimeString('zh-CN')
})
const currentTime = ref(new Date().toLocaleTimeString())

// 新建章节表单
const newChapterForm = ref({
  chapterNum: 1,
  title: ''
})

// 自动保存定时器
let autoSaveTimer: NodeJS.Timeout | null = null

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

// Markdown渲染预览
const renderedContent = computed(() => {
  if (isSimpleMode.value || !fileContent.value) return ''
  return renderMarkdown(fileContent.value)
})

// --- 方法 ---

// 插入文本
const insertText = (text: string) => {
  const textarea = editorTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = fileContent.value.substring(0, start)
  const after = fileContent.value.substring(end)

  fileContent.value = before + text + after

  nextTick(() => {
    textarea.focus()
    const newPosition = start + text.length
    textarea.setSelectionRange(newPosition, newPosition)
  })
}

// 切换预览
const togglePreview = () => {
  showPreview.value = !showPreview.value
  localStorage.setItem('editor-show-preview', String(showPreview.value))
}

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  // 标签页切换时的逻辑
  if (tabName === 'editor') {
    // 切换到编辑器时，刷新编辑器内容
  } else if (tabName === 'outline') {
    // 切换到大纲时，加载大纲数据
    writerStore.loadOutlineTree()
  } else if (tabName === 'characters') {
    // 切换到角色图谱时，加载角色数据
    writerStore.loadCharacters()
    writerStore.loadCharacterRelations()
  } else if (tabName === 'encyclopedia') {
    // 切换到设定百科时，加载设定数据
    writerStore.loadCharacters()
    writerStore.loadLocations()
  }
}

// 切换模式
const handleModeChange = () => {
  localStorage.setItem('editor-simple-mode', String(isSimpleMode.value))
  if (isSimpleMode.value) {
    showPreview.value = false
  } else {
    showPreview.value = true
  }
}

// 处理快捷键
const handleKeydown = (event: KeyboardEvent) => {
  // === AI快捷键（优先处理） ===

  // Ctrl/Cmd + Shift + A: 打开AI对话
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
    event.preventDefault()
    writerStore.toggleAISidebar(true)
    writerStore.setAITool('chat')
    return
  }

  // Ctrl/Cmd + Shift + K: 快速续写
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'K') {
    event.preventDefault()
    const textarea = editorTextarea.value
    if (textarea) {
      const cursor = textarea.selectionStart || 0
      // 获取光标前500字作为上下文
      const text = fileContent.value.substring(Math.max(0, cursor - 500), cursor)
      writerStore.setSelectedText(text)
      writerStore.toggleAISidebar(true)
      writerStore.setAITool('continue')
    }
    return
  }

  // Ctrl/Cmd + Shift + P: 润色选中文本
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
    event.preventDefault()
    const textarea = editorTextarea.value
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      if (start !== end) {
        const selected = fileContent.value.substring(start, end)
        writerStore.setSelectedText(selected)
        writerStore.toggleAISidebar(true)
        writerStore.setAITool('polish')
      } else {
        ElMessage.warning('请先选中要润色的文本')
      }
    }
    return
  }

  // === 原有快捷键 ===

  // Ctrl/Cmd + S: 保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    handleSaveManually()
    return
  }

  // Ctrl/Cmd + B: 粗体
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    insertText('**粗体文本**')
    return
  }

  // Ctrl/Cmd + I: 斜体
  if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault()
    insertText('*斜体文本*')
    return
  }

  // Ctrl/Cmd + K: 链接
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    insertText('[链接文本](https://example.com)')
    return
  }

  // Ctrl/Cmd + H: 标题
  if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
    event.preventDefault()
    insertText('## ')
    return
  }
}

// 编辑区滚动同步
const handleEditorScroll = () => {
  if (!isScrollingSyncEnabled.value || !editorPane.value || !previewPane.value) return

  const editor = editorTextarea.value
  const preview = previewPane.value
  if (!editor) return

  const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
  preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
}

// 预览区滚动同步
const handlePreviewScroll = () => {
  if (!isScrollingSyncEnabled.value || !editorPane.value || !previewPane.value) return

  const editor = editorTextarea.value
  const preview = previewPane.value
  if (!editor) return

  const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
  editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight)
}

// 监听窗口大小变化
const handleResize = () => {
  isLargeScreen.value = window.innerWidth >= 1200
}

// 加载用户偏好设置
const loadPreferences = () => {
  const savedMode = localStorage.getItem('editor-simple-mode')
  const savedPreview = localStorage.getItem('editor-show-preview')

  if (savedMode !== null) {
    isSimpleMode.value = savedMode === 'true'
  }

  if (savedPreview !== null) {
    showPreview.value = savedPreview === 'true'
  }
}

// 章节切换
const handleChapterChange = async (chapter: any) => {
  const docId = chapter.documentId || chapter.id

  // 如果有未保存的内容，先保存
  if (projectStore.hasUnsavedChanges && currentDocument.value) {
    try {
      await projectStore.saveDocumentContent(
        currentDocument.value.documentId,
        fileContent.value
      )
    } catch (error: any) {
      ElMessage.error('保存当前文档失败：' + (error.message || '未知错误'))
      return
    }
  }

  // 加载新文档
  try {
    await projectStore.loadDocument(docId)
  } catch (error: any) {
    ElMessage.error('加载文档失败：' + (error.message || '未知错误'))
  }
}

// 项目切换
const handleProjectChange = async (projectId: string) => {
  try {
    // 设置当前项目
    projectStore.setCurrentProject(projectId)
    await writerStore.fetchProjectById(projectId)

    // 加载项目的文档列表
    await projectStore.fetchDocuments(projectId)
    await projectStore.fetchDocumentTree(projectId)

    // 切换到第一个文档
    if (chapters.value.length > 0) {
      await handleChapterChange(chapters.value[0])
    }
  } catch (error: any) {
    ElMessage.error('切换项目失败：' + (error.message || '未知错误'))
  }
}

// 标题变化
const handleTitleChange = async () => {
  if (!currentDocument.value) return

  try {
    await projectStore.updateDocumentData(
      currentDocument.value.documentId,
      { title: documentTitle.value }
    )
  } catch (error: any) {
    ElMessage.error('保存标题失败：' + (error.message || '未知错误'))
  }
}

// 内容输入处理（用于自动保存）
const handleContentInput = () => {
  // 清除旧的自动保存定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }

  // 30秒后自动保存
  autoSaveTimer = setTimeout(async () => {
    if (currentDocument.value && projectStore.hasUnsavedChanges) {
      try {
        await projectStore.autoSave(
          currentDocument.value.documentId,
          fileContent.value,
          currentDocument.value.version || 0
        )
      } catch (error: any) {
        console.error('自动保存失败:', error)
      }
    }
  }, 30000) // 30秒
}

// 内容变化处理（兼容性）
const handleContentChange = () => {
  handleContentInput()
}

// === AI功能相关 ===

// 显示右键菜单
const handleContextMenu = (e: MouseEvent) => {
  const textarea = editorTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  if (start !== end) {
    e.preventDefault()
    const selected = fileContent.value.substring(start, end)

    contextMenu.visible = true
    contextMenu.x = e.clientX
    contextMenu.y = e.clientY
    contextMenu.selectedText = selected

    writerStore.setSelectedText(selected)
  }
}

// 处理右键菜单操作
const handleContextMenuAction = (action: string, text?: string) => {
  writerStore.toggleAISidebar(true)

  // 转换action为AIToolType
  const toolType = action === 'chat' ? 'chat' :
                   action === 'continue' ? 'continue' :
                   action === 'polish' ? 'polish' :
                   action === 'expand' ? 'expand' :
                   action === 'rewrite' ? 'rewrite' : 'chat'
  writerStore.setAITool(toolType as any)

  if (text) {
    writerStore.setSelectedText(text)
  }
}

// 切换AI侧边栏
const toggleAISidebar = () => {
  writerStore.toggleAISidebar()
}

// 插入AI生成的文本
const handleInsertAIText = (text: string) => {
  const textarea = editorTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  // 如果有选中文本，替换它；否则插入到光标位置
  const before = fileContent.value.substring(0, start)
  const after = fileContent.value.substring(end)

  fileContent.value = before + text + after

  // 移动光标到插入文本的末尾
  nextTick(() => {
    const newPos = start + text.length
    textarea.selectionStart = newPos
    textarea.selectionEnd = newPos
    textarea.focus()
  })

  handleContentChange()
}

// 手动保存
const handleSaveManually = async () => {
  if (!currentDocument.value) {
    ElMessage.warning('请先打开文档')
    return
  }

  try {
    await projectStore.saveDocumentContent(
      currentDocument.value.documentId,
      fileContent.value
    )
    // 成功提示已在 store 中处理
  } catch (error: any) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
  }
}

// 新建章节
const handleAddChapter = () => {
  // 找到当前项目的最大章节号
  const maxChapterNum = Math.max(...chapters.value.map(c => c.chapterNum || 0), 0)

  newChapterForm.value = {
    chapterNum: maxChapterNum + 1,
    title: ''
  }

  showNewChapterDialog.value = true
}

// 确认添加章节
const confirmAddChapter = async () => {
  if (!newChapterForm.value.title) {
    ElMessage.warning('请输入章节标题')
    return
  }

  if (!projectId.value) {
    ElMessage.error('请先选择项目')
    return
  }

  try {
    const newDoc = await projectStore.createNewDocument(projectId.value, {
      title: newChapterForm.value.title,
      chapterNum: newChapterForm.value.chapterNum
    })

    if (newDoc) {
      showNewChapterDialog.value = false
      // 切换到新章节
      await handleChapterChange(newDoc)
    }
  } catch (error: any) {
    ElMessage.error('创建章节失败：' + (error.message || '未知错误'))
  }
}

// 编辑章节
const handleEditChapter = () => {
  // TODO: 实现章节编辑功能
  ElMessage.info('章节编辑功能开发中')
}

// 删除章节
const handleDeleteChapter = async (chapterId: string) => {
  try {
    await projectStore.deleteDocumentById(chapterId)

    // 如果删除的是当前章节，切换到第一个章节
    if (chapterId === currentChapterId.value) {
      if (chapters.value.length > 0) {
        await handleChapterChange(chapters.value[0])
      } else {
        projectStore.clearEditor()
      }
    }
  } catch (error: any) {
    ElMessage.error('删除章节失败：' + (error.message || '未知错误'))
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
onMounted(async () => {
  // 加载用户偏好
  loadPreferences()

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)

  // 启动时间更新定时器
  const timeInterval = setInterval(updateCurrentTime, 1000)

  // 从路由参数加载项目和文档
  const docId = documentId.value
  const projId = projectId.value

  try {
    if (projId) {
      // 设置当前项目
      projectStore.setCurrentProject(projId)

      // 加载项目详情和文档列表
      await Promise.all([
        writerStore.fetchProjectById(projId),
        projectStore.fetchDocuments(projId),
        projectStore.fetchDocumentTree(projId)
      ])
    }

    // 如果有文档ID，加载该文档
    if (docId) {
      await projectStore.loadDocument(docId)
    } else if (chapters.value.length > 0) {
      // 否则加载第一个文档
      await projectStore.loadDocument(chapters.value[0].documentId)
    }
  } catch (error: any) {
    ElMessage.error('加载失败：' + (error.message || '未知错误'))
  }

  // 清理函数
  onBeforeUnmount(() => {
    clearInterval(timeInterval)
    window.removeEventListener('resize', handleResize)
  })
})

onBeforeUnmount(() => {
  // 清除自动保存定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }

  // 保存当前文档
  if (projectStore.hasUnsavedChanges && currentDocument.value) {
    projectStore.saveDocumentContent(
      currentDocument.value.documentId,
      fileContent.value
    )
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
  position: relative;
  overflow: hidden;

  &.dual-pane {
    .editor-pane {
      width: 50%;
      border-right: 1px solid #e5e7eb;
    }

    .preview-pane {
      width: 50%;
    }
  }
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 2rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', monospace;
  font-size: 16px;
  line-height: 1.8;
  border: none;
  background-color: #ffffff;
  color: #1f2937;
  resize: none;
  outline: none;
  overflow-y: auto;

  &::placeholder {
    color: #9ca3af;
  }
}

// 预览区
.preview-pane {
  flex: 1;
  background-color: #f9fafb;
  overflow-y: auto;
  padding: 2rem;
}

.preview-content {
  max-width: 800px;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

// Markdown样式
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #24292e;
  word-wrap: break-word;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 2em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }

  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }

  h3 {
    font-size: 1.25em;
  }

  h4 {
    font-size: 1em;
  }

  h5 {
    font-size: 0.875em;
  }

  h6 {
    font-size: 0.85em;
    color: #6a737d;
  }

  p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  blockquote {
    margin: 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }

  ul, ol {
    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 16px;
  }

  li + li {
    margin-top: 0.25em;
  }

  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', monospace;
  }

  pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
    margin-bottom: 16px;

    code {
      display: inline;
      padding: 0;
      margin: 0;
      overflow: visible;
      line-height: inherit;
      background-color: transparent;
      border: 0;
    }
  }

  a {
    color: #0366d6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    display: block;
    width: 100%;
    overflow: auto;
    margin-bottom: 16px;

    th, td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }

    th {
      font-weight: 600;
      background-color: #f6f8fa;
    }

    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;

      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }

  hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }
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

// === AI功能样式 ===

// AI按钮
.ai-button {
  color: #667eea;
  margin-right: 8px;

  &:hover {
    color: #764ba2;
    background: rgba(102, 126, 234, 0.1);
  }

  .el-icon {
    font-size: 18px;
  }
}

// 编辑器容器调整（为AI侧边栏留出空间）
.editor-container {
  position: relative;
  transition: margin-right 0.3s ease;
}

// 当AI侧边栏显示时调整布局
.editor-view:has(.ai-assistant-sidebar) .editor-container {
  margin-right: 400px;

  @media (max-width: 1200px) {
    margin-right: 350px;
  }

  @media (max-width: 768px) {
    margin-right: 0;
  }
}

// 响应式优化
@media (max-width: 768px) {
  .ai-button span {
    display: none;
  }
}
</style>
