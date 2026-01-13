<template>
  <div class="editor-view" :class="{ 'focus-mode': isFocusMode }">

    <!-- 1. 左侧：项目导航 -->
    <ProjectSidebar v-show="!isFocusMode" v-model:projectId="currentProjectId" v-model:chapterId="currentChapterId"
      :projects="projects" :chapters="chapters" @add-chapter="showNewChapterDialog = true"
      @edit-chapter="handleEditChapter" @delete-chapter="handleDeleteChapter" class="editor-sidebar" />

    <!-- 2. 中间：主编辑区域 -->
    <div class="editor-main">

      <!-- 2.1 顶部导航栏 -->
      <div class="editor-header" v-show="!isFocusMode">
        <div class="header-left">
          <!-- 面包屑/标题编辑 -->
          <div class="title-editor">
            <el-input v-model="documentTitle" placeholder="无标题章节" class="title-input" @change="handleTitleChange" />
          </div>
        </div>

        <div class="header-center">
          <!-- 功能 Tab 切换 -->
          <el-radio-group v-model="activeTab" size="small">
            <el-radio-button label="editor">
              <el-icon>
                <Edit />
              </el-icon> 写作
            </el-radio-button>
            <el-radio-button label="outline">
              <el-icon>
                <List />
              </el-icon> 大纲
            </el-radio-button>
            <el-radio-button label="characters">
              <el-icon>
                <User />
              </el-icon> 角色
            </el-radio-button>
            <el-radio-button label="world">
              <el-icon>
                <LocationInformation />
              </el-icon> 设定
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="header-right">
          <!-- AI 入口 -->
          <el-tooltip content="AI 助手 (Ctrl+Shift+A)">
            <el-button text class="ai-trigger-btn" @click="toggleAISidebar">
              <el-icon>
                <MagicStick />
              </el-icon> AI 助手
            </el-button>
          </el-tooltip>

          <el-divider direction="vertical" />

          <!-- 工具按钮 -->
          <el-tooltip content="导出">
            <el-button text @click="showExportDialog = true">
              <el-icon>
                <Download />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip :content="isFocusMode ? '退出专注' : '专注模式'">
            <el-button text @click="toggleFocusMode" :type="isFocusMode ? 'primary' : ''">
              <el-icon>
                <FullScreen />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 2.2 工具栏 (仅编辑器模式) -->
      <EditorToolbar v-show="!isFocusMode && activeTab === 'editor'" :show-preview="showPreview"
        @command="handleToolbarCommand" @togglePreview="showPreview = !showPreview" />

      <!-- 2.3 内容区域 -->
      <div class="content-wrapper">

        <!-- Tab: 写作编辑器 -->
        <div v-show="activeTab === 'editor'" class="editor-workspace" :class="{ 'dual-view': showPreview }">

          <!-- 编辑框 -->
          <div class="editor-pane">
            <textarea ref="editorTextarea" v-model="fileContent" class="native-textarea" placeholder="开始你的创作..."
              @input="handleInput" @keydown="handleKeydown" @contextmenu="handleContextMenu"
              @scroll="handleScrollSync"></textarea>
          </div>

          <!-- 预览框 -->
          <div v-if="showPreview" class="preview-pane markdown-body" ref="previewRef">
            <div v-html="renderedContent"></div>
          </div>
        </div>

        <!-- Tab: 其他视图 -->
        <div v-if="activeTab !== 'editor'" class="auxiliary-view">
          <component :is="currentAuxiliaryComponent" />
        </div>

        <!-- 底部浮动：时间线 -->
        <div class="timeline-wrapper" v-show="activeTab === 'editor' && !isFocusMode">
          <TimelineBar :timeline-id="currentTimelineId" @eventClick="handleTimelineEventClick" />
        </div>
      </div>

      <!-- 2.4 底部状态栏 -->
      <div class="editor-footer" v-show="!isFocusMode">
        <div class="footer-left">
          <!-- 字数统计组件 -->
          <WordCounter :word-count="wordCountStats" :target-word-count="5000" />
        </div>

        <div class="footer-center">
          <span class="save-status" :class="saveStatusClass">
            <el-icon>
              <component :is="saveStatusIcon" />
            </el-icon>
            {{ saveStatusText }}
          </span>
        </div>

        <div class="footer-right">
          <span class="info-item">Markdown</span>
          <span class="info-item">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- 3. 右侧：AI 侧边栏 (抽屉式) -->
    <AIAssistantSidebar v-model:visible="aiSidebarVisible" :project-id="currentProjectId" :context-text="selectedText"
      @insert="handleInsertText" />

    <!-- 弹窗：新建章节 -->
    <el-dialog v-model="showNewChapterDialog" title="新建章节" width="400px">
      <el-form :model="newChapterForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newChapterForm.title" placeholder="章节名" />
        </el-form-item>
        <el-form-item label="序号">
          <el-input-number v-model="newChapterForm.chapterNum" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewChapterDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddChapter">创建</el-button>
      </template>
    </el-dialog>

    <!-- 右键菜单 -->
    <AIContextMenu v-if="contextMenu.visible" :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y"
      :selectedText="selectedText" @update:visible="contextMenu.visible = $event" @action="handleAICommand" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Edit, List, User, LocationInformation, MagicStick,
  Download, FullScreen, Loading, CircleCheck, Warning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Stores
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore' // 旧的，建议迁移

// Components
import ProjectSidebar from '../components/ProjectSidebar.vue'
import EditorToolbar from '../components/EditorToolbar.vue'
import TimelineBar from '../components/TimelineBar.vue'
import WordCounter from '../components/WordCounter.vue'
import AIAssistantSidebar from '../components/ai/AIAssistantSidebar.vue'
import AIContextMenu from '../components/ai/AIContextMenu.vue'
import OutlineView from './OutlineView.vue'
import CharacterGraphView from './CharacterGraphView.vue'
import EncyclopediaView from './EncyclopediaView.vue'

// Utils
import { renderMarkdown } from '../utils/markdown'
import { calculateWordCount, formatMarkdown } from '../utils/editor'

// =======================
// State
// =======================

const router = useRouter()
const route = useRoute()

// Store Instances
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const writerStore = useWriterStore()

// UI Flags
const activeTab = ref('editor')
const isFocusMode = ref(false)
const showPreview = ref(false)
const aiSidebarVisible = ref(false)
const showNewChapterDialog = ref(false)
const showExportDialog = ref(false)

// DOM Refs
const editorTextarea = ref<HTMLTextAreaElement>()
const previewRef = ref<HTMLDivElement>()

// Data
const currentTime = ref(new Date().toLocaleTimeString())
const selectedText = ref('')
const newChapterForm = ref({ title: '', chapterNum: 1 })

// Context Menu
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0
})

// =======================
// Computed
// =======================

const currentProjectId = computed({
  get: () => projectStore.currentProjectId || '',
  set: (val) => {
    projectStore.loadDetail(val)
    documentStore.loadTree(val)
  }
})

const currentChapterId = computed({
  get: () => documentStore.currentDocMeta?.id || '',
  set: (val) => {
    if (val) loadChapter(val)
  }
})

const projects = computed(() => projectStore.projects)
const chapters = computed(() => documentStore.flatDocs) // 假设 documentStore 有 flatDocs 用于列表展示
const fileContent = computed({
  get: () => editorStore.content,
  set: (val) => editorStore.setContent(val) // Store 内部处理防抖保存
})

const documentTitle = computed({
  get: () => documentStore.currentDocMeta?.title || '',
  set: (val) => {
    // 实时更新 Store 中的 title，防抖提交 API
    if (documentStore.currentDocMeta) {
      documentStore.currentDocMeta.title = val
      // TODO: debounced update title API
    }
  }
})

// Markdown Render
const renderedContent = computed(() => renderMarkdown(fileContent.value))

// Status
const saveStatusText = computed(() => {
  if (editorStore.isSaving) return '保存中...'
  if (editorStore.isDirty) return '未保存'
  return '已同步'
})

const saveStatusClass = computed(() => ({
  'saving': editorStore.isSaving,
  'dirty': editorStore.isDirty,
  'saved': !editorStore.isDirty && !editorStore.isSaving
}))

const saveStatusIcon = computed(() => {
  if (editorStore.isSaving) return Loading
  if (editorStore.isDirty) return Warning
  return CircleCheck
})

// Word Count (使用优化后的 WordCounter 组件接口)
const wordCountStats = computed(() => {
  // 这里做一个简单的统计，真实逻辑在 utils/editor.ts 中
  const total = calculateWordCount(fileContent.value)
  return {
    total,
    chinese: 0, // 简略
    english: 0,
    numbers: 0,
    punctuation: 0,
    whitespace: 0
  }
})

// Auxiliary Views
const currentAuxiliaryComponent = computed(() => {
  switch (activeTab.value) {
    case 'outline': return OutlineView
    case 'characters': return CharacterGraphView
    case 'world': return EncyclopediaView
    default: return null
  }
})

// Timeline (假设 store 有)
const currentTimelineId = computed(() => writerStore.timeline.currentTimeline?.id)

// =======================
// Methods
// =======================

// 处理标题变更
const handleTitleChange = async (val: string) => {
  if (!documentStore.currentDocMeta) return
  try {
    // 调用 store 的 update 方法更新元数据
    // 注意：documentTitle 的 setter 已经处理了本地状态，这里主要用于触发保存/API
    await documentStore.update(documentStore.currentDocMeta.id, { title: val })
    // 更新左侧树
    await documentStore.loadTree(currentProjectId.value)
  } catch (error) {
    ElMessage.error('标题更新失败')
  }
}

// 处理时间线事件点击
const handleTimelineEventClick = (event: any) => {
  // 这里可以处理点击事件，例如跳转到对应文本位置，或弹出编辑框
  ElMessage.info(`选中事件：${event.title}`)
  // 如果需要编辑，可以复用 TimelineBar 内部的逻辑，或者在这里弹窗
}

// 1. 加载逻辑
onMounted(async () => {
  const pId = route.params.projectId as string || route.query.projectId as string
  if (pId) {
    await projectStore.loadDetail(pId)
    await documentStore.loadTree(pId)
    // 默认选中第一章
    if (chapters.value.length > 0) {
      loadChapter(chapters.value[0].id)
    }
  }

  // Timer
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, 1000)
})

async function loadChapter(docId: string) {
  // 如果有未保存，先强制保存
  if (editorStore.isDirty) await editorStore.save()

  await documentStore.selectDocument(docId) // 设置 currentMeta
  await editorStore.loadContent(docId) // 加载 content
}

// 2. 编辑器交互
function handleInput() {
  // Store 内部会自动防抖保存，这里只需要触发 v-model 更新
}

function handleKeydown(e: KeyboardEvent) {
  // Tab 键处理
  if (e.key === 'Tab') {
    e.preventDefault()
    handleInsertText('  ') // 2空格缩进
  }

  // 快捷键: AI
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault()
    toggleAISidebar()
  }

  // 快捷键: 保存
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    editorStore.save()
  }
}

function handleToolbarCommand(cmd: string) {
  if (!editorTextarea.value) return
  formatMarkdown(cmd, editorTextarea.value)
  // 手动触发 update，因为 formatMarkdown 修改的是 dom.value
  editorStore.setContent(editorTextarea.value.value)
}

function handleScrollSync(e: Event) {
  if (!showPreview.value || !previewRef.value) return
  const target = e.target as HTMLTextAreaElement
  const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight)
  const preview = previewRef.value
  preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight)
}

// 3. AI 交互
function toggleAISidebar() {
  aiSidebarVisible.value = !aiSidebarVisible.value
}

function handleContextMenu(e: MouseEvent) {
  // 获取选中文本
  const ta = editorTextarea.value
  if (!ta) return

  const text = ta.value.substring(ta.selectionStart, ta.selectionEnd)
  if (text) {
    e.preventDefault()
    selectedText.value = text
    contextMenu.x = e.clientX
    contextMenu.y = e.clientY
    contextMenu.visible = true
  }
}

// AI 命令处理函数
// TODO 原有的 handleAICommand 可能没有正确定义，确保它存在
const handleAICommand = (action: string) => {
  contextMenu.visible = false // 点击后关闭菜单
  toggleAISidebar() // 打开侧边栏

  // 映射 action 到工具类型
  const toolMap: Record<string, string> = {
    'chat': 'chat',
    'polish': 'polish',
    'continue': 'continue',
    'expand': 'expand',
    'rewrite': 'rewrite'
  }

  // 设置 AI Store 状态
  if (toolMap[action]) {
    writerStore.setAITool(toolMap[action] as any)
  }

  // 如果有选中文本，设置进去
  if (selectedText.value) {
    writerStore.setSelectedText(selectedText.value)
  }
}

function handleInsertText(text: string) {
  if (!editorTextarea.value) return
  const ta = editorTextarea.value
  const start = ta.selectionStart
  const end = ta.selectionEnd

  const newVal = ta.value.substring(0, start) + text + ta.value.substring(end)
  editorStore.setContent(newVal)

  nextTick(() => {
    ta.focus()
    ta.selectionStart = ta.selectionEnd = start + text.length
  })
}

// 4. 章节管理
async function confirmAddChapter() {
  if (!currentProjectId.value) return
  await documentStore.create(currentProjectId.value, {
    title: newChapterForm.value.title,
    // order: newChapterForm.value.chapterNum // 这里的 order 逻辑需要根据后端实现
    type: 'chapter',
    projectId: currentProjectId.value
  })
  showNewChapterDialog.value = false
}

function handleEditChapter(chapter: any) {
  // 打开重命名弹窗等
}

function handleDeleteChapter(id: string) {
  // 调用 store 删除
}

// 5. 其他
function toggleFocusMode() {
  isFocusMode.value = !isFocusMode.value
}
</script>

<style scoped lang="scss">
.editor-view {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--el-bg-color);
  overflow: hidden;

  // 专注模式样式覆盖
  &.focus-mode {
    .editor-main {
      // 移除侧边栏空间
      width: 100%;
    }

    .editor-workspace {
      // 增加阅读边距，更像纸张
      padding: 0 20%;

      .native-textarea {
        padding-top: 4rem;
        font-size: 18px;
        line-height: 2;
      }
    }
  }
}

// 2. 主区域
.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // 防止 flex 子项溢出
  position: relative;
}

// 2.1 头部
.editor-header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-overlay);

  .header-left {
    flex: 1;

    .title-input {
      width: 200px;

      :deep(.el-input__wrapper) {
        box-shadow: none; // 无边框风格
        padding-left: 0;
        font-size: 16px;
        font-weight: 600;

        &:hover {
          box-shadow: none; // TODO: hover 显示编辑图标？
        }
      }
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .header-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;

    .ai-trigger-btn {
      color: #8e44ad;

      &:hover {
        background-color: #f3e5f5;
      }
    }
  }
}

// 2.3 内容包裹
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

// 编辑器工作区
.editor-workspace {
  flex: 1;
  display: flex;
  height: 100%;

  &.dual-view {
    .editor-pane {
      width: 50%;
      border-right: 1px solid var(--el-border-color-light);
    }

    .preview-pane {
      width: 50%;
      display: block;
    }
  }

  .editor-pane {
    flex: 1;
    height: 100%;
    background-color: var(--el-bg-color);
  }

  .native-textarea {
    width: 100%;
    height: 100%;
    border: none;
    resize: none;
    outline: none;
    padding: 2rem 3rem;
    font-size: 16px;
    line-height: 1.8;
    color: var(--el-text-color-primary);
    background-color: transparent;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-lighter);
      border-radius: 3px;
    }
  }

  .preview-pane {
    display: none; // 默认隐藏
    overflow-y: auto;
    padding: 2rem;
    background-color: var(--el-fill-color-light);
  }
}

// 辅助视图容器
.auxiliary-view {
  flex: 1;
  overflow: hidden;
}

// 2.4 底部状态栏
.editor-footer {
  height: 32px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-bg-color);

  .footer-center {
    .save-status {
      display: flex;
      align-items: center;
      gap: 4px;

      &.saving {
        color: var(--el-color-warning);
      }

      &.dirty {
        color: var(--el-color-info);
      }

      &.saved {
        color: var(--el-color-success);
      }
    }
  }

  .footer-right {
    display: flex;
    gap: 16px;
  }
}

// AI 侧边栏过渡
.ai-sidebar-enter-active,
.ai-sidebar-leave-active {
  transition: transform 0.3s ease;
}
</style>
