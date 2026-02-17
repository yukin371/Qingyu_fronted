<template>
  <EditorLayout>
    <!-- 左侧面板插槽 -->
    <template #left-panel>
      <ProjectSidebar
        v-model:projectId="currentProjectId"
        v-model:chapterId="currentChapterId"
        :projects="projects"
        :chapters="flatChapters"
        @add-chapter="handleAddChapterQuick"
        @add-volume="handleAddVolumeQuick"
        @delete-chapter="handleDeleteChapter"
      />
    </template>

    <!-- 主编辑器插槽 -->
    <template #editor="{ activeTool }">
      <EncyclopediaView
        v-if="activeTool === 'encyclopedia'"
        :project-id="currentProjectId"
        :embedded="true"
      />
      <EditorPanel
        v-else
        :content="fileContent"
        :project-name="editorBreadcrumbTitle"
        :chapter-title="documentTitle"
        :active-tool="activeTool"
        :show-preview="showPreview"
        :show-timeline="showTimeline"
        :timeline-id="currentTimelineId"
        @update:content="handleContentUpdate"
        @save="handleManualSave"
        @togglePreview="showPreview = !showPreview"
        @formatCommand="handleToolbarCommand"
        @aiAssistant="toggleAISidebar"
        @contextmenu="handleContextMenu"
      />
    </template>

    <!-- 右侧AI面板插槽 -->
    <template #right-panel>
      <AIPanel
        :session-id="currentProjectId"
        @send="handleAISend"
      />
    </template>
  </EditorLayout>

  <!-- 辅助组件 -->

  <!-- AI 右键菜单 -->
  <AIContextMenu
    v-if="contextMenu.visible"
    :visible="contextMenu.visible"
    :x="contextMenu.x"
    :y="contextMenu.y"
    :selected-text="contextMenu.selectedText"
    @action="handleAIAction"
    @update:visible="val => contextMenu.visible = val"
  />

  <!-- 新建文档对话框 -->
  <el-dialog v-model="showCreateDocDialog" title="新建文档" width="400px">
    <el-form :model="newDocForm">
      <el-form-item label="标题">
        <el-input v-model="newDocForm.title" placeholder="请输入文档标题" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="newDocForm.type">
          <el-option label="章节" value="chapter" />
          <el-option label="卷/分卷" value="volume" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showCreateDocDialog = false">取消</el-button>
      <el-button type="primary" @click="handleCreateDoc">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
// 引入新的 Store 体系
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore' // 假如还需要读取 timeline 等
import { getWorkspaceMockProject } from '@/modules/writer/mock/workspaceMock'
import { DocumentType, type Document } from '@/modules/writer/types/document'
import type { ActiveTool } from '@/modules/writer/stores/editorStore'

// 引入组件
import EditorLayout from '@/modules/writer/components/editor/EditorLayout.vue'
import EditorPanel from '@/modules/writer/components/editor/EditorPanel.vue'
import ProjectSidebar from '@/modules/writer/components/ProjectSidebar.vue'
import AIPanel from '@/modules/writer/components/editor/AIPanel.vue'
import AIContextMenu from '@/modules/writer/components/ai/AIContextMenu.vue'
import EncyclopediaView from '@/modules/writer/views/EncyclopediaView.vue'

// 工具
import { formatMarkdown } from '@/modules/writer/utils/editor'

// =======================
// 状态初始化
// =======================
const route = useRoute()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const writerStore = useWriterStore() // 用于 Timeline 数据

// UI Flags
const showPreview = ref(false)
const showTimeline = ref(false)
const showCreateDocDialog = ref(false)

// Forms
const newDocForm = ref({ title: '', type: 'chapter' })
const contextMenu = reactive({ visible: false, x: 0, y: 0, selectedText: '' })

// =======================
// 数据绑定 (核心)
// =======================

// 1. 项目 ID
const currentProjectId = computed({
  get: () => projectStore.currentProjectId || (route.params.projectId as string),
  set: (id) => {
    if (id) {
      projectStore.loadDetail(id)
      documentStore.loadTree(id)
    }
  }
})

const isTestMode = computed(() => route.query.test === 'true')
const mockProject = computed(() => isTestMode.value ? getWorkspaceMockProject(currentProjectId.value) : null)
const queryChapterId = computed(() => String(route.query.chapterId || ''))
const queryTool = computed(() => String(route.query.tool || ''))

// 2. 文档 ID (切换文档的核心逻辑)
const currentChapterId = computed({
  get: () => (route.query.chapterId as string) || documentStore.currentDocMeta?.id || '',
  set: async (id) => {
    if (!id) return
    const selectedDoc = availableDocMap.value.get(id)
    if (selectedDoc) {
      await documentStore.selectDocument(selectedDoc)
    }
    editorStore.setCurrentChapter(id)

    // 真实内容 API 未就绪时，测试模式优先用统一 mock 文本填充
    if (mockProject.value?.contentByDocId[id]) {
      editorStore.setContent(mockProject.value.contentByDocId[id], false)
      editorStore.markSaved()
      return
    }

    // 非 mock 文档默认不覆盖已有内容，仅在首次无内容时清空
    if (!editorStore.content) {
      editorStore.setContent('', false)
      editorStore.markSaved()
    }
  }
})

interface SidebarProjectSummary {
  id: string
  title: string
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
}

interface SidebarChapterSummary {
  id: string
  projectId: string
  chapterNum: number
  title: string
  wordCount: number
  updatedAt: string
  status: 'draft' | 'published'
  nodeType?: 'directory' | 'chapter'
  sortOrder?: number
}

const docsFromStore = computed(() => (documentStore.flatDocs || []) as Document[])

const availableDocMap = computed(() => {
  const map = new Map<string, Document>()
  for (const doc of docsFromStore.value) {
    map.set(doc.id, doc)
  }
  for (const doc of (mockProject.value?.docs || [])) {
    if (!map.has(doc.id)) {
      map.set(doc.id, doc)
    }
  }
  return map
})

// 3. 供 Sidebar 使用的数据源
const projects = computed<SidebarProjectSummary[]>(() => {
  const normalized = (projectStore.projects || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    status: p.status || 'writing',
    wordCount: Number(p.wordCount ?? p.totalWords ?? 0),
    chapterCount: Number(p.chapterCount ?? 0),
    updatedAt: p.updatedAt || p.lastUpdateTime || new Date().toISOString(),
  }))

  const mock = mockProject.value?.project
  if (mock && !normalized.some((p) => p.id === mock.id)) {
    normalized.unshift(mock)
  }

  return normalized
})

const docsForTree = computed<Document[]>(() => {
  const docs = [...docsFromStore.value]
  if (!isTestMode.value || !mockProject.value?.docs?.length) return docs
  const seen = new Set(docs.map((doc) => doc.id))
  for (const doc of mockProject.value.docs) {
    if (!seen.has(doc.id)) {
      docs.push(doc)
    }
  }
  return docs
})

const chaptersFromDocs = computed<SidebarChapterSummary[]>(() => {
  const docs = docsForTree.value
  const sceneDocs = docs
    .filter((doc) => doc.type === DocumentType.SCENE || doc.type === DocumentType.VOLUME)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const chapterDocs = docs
    .filter((doc) => doc.type === DocumentType.CHAPTER)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  if (sceneDocs.length === 0) {
    return chapterDocs.map((doc, index) => ({
      id: doc.id,
      projectId: doc.projectId,
      chapterNum: index + 1,
      title: doc.title,
      wordCount: Number(doc.wordCount || 0),
      updatedAt: doc.updatedAt || new Date().toISOString(),
      status: doc.status === 'completed' ? 'published' : 'draft',
      nodeType: 'chapter',
      sortOrder: index + 1,
    }))
  }

  const list: SidebarChapterSummary[] = []
  let runningIndex = 1
  for (const scene of sceneDocs) {
    list.push({
      id: scene.id,
      projectId: scene.projectId,
      chapterNum: 0,
      title: scene.title,
      wordCount: 0,
      updatedAt: scene.updatedAt || new Date().toISOString(),
      status: scene.status === 'completed' ? 'published' : 'draft',
      nodeType: 'directory',
      sortOrder: (scene.order || 0) * 100,
    })

    const children = chapterDocs
      .filter((chapter) => chapter.parentId === scene.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    for (const chapter of children) {
      list.push({
        id: chapter.id,
        projectId: chapter.projectId,
        chapterNum: runningIndex++,
        title: chapter.title,
        wordCount: Number(chapter.wordCount || 0),
        updatedAt: chapter.updatedAt || new Date().toISOString(),
        status: chapter.status === 'completed' ? 'published' : 'draft',
        nodeType: 'chapter',
        sortOrder: (scene.order || 0) * 100 + (chapter.order || 0),
      })
    }
  }

  return list
})

const flatChapters = computed(() => {
  if (chaptersFromDocs.value.length > 0) return chaptersFromDocs.value
  return mockProject.value?.chapters || []
})

// 4. 编辑器内容绑定 (双向绑定到 Store，Store 内处理自动保存)
const fileContent = computed({
  get: () => editorStore.content,
  set: (val) => editorStore.setContent(val)
})

const stripDirectoryPrefix = (title: string) =>
  title.replace(/^目录[一二三四五六七八九十百千万0-9]+\s*/u, '').trim()

const documentTitle = computed({
  get: () => {
    const title = documentStore.currentDocMeta?.title || ''
    const type = documentStore.currentDocMeta?.type
    return type === DocumentType.SCENE || type === DocumentType.VOLUME
      ? stripDirectoryPrefix(title)
      : title
  },
  set: (val) => {
    if (documentStore.currentDocMeta) {
      documentStore.currentDocMeta.title = val
    }
  }
})

// 当前项目信息
const currentProject = computed(() => {
  if (projectStore.currentProject) return projectStore.currentProject
  const current = projects.value.find((p) => p.id === currentProjectId.value)
  return current || null
})

const currentTimelineId = computed(() => writerStore.timeline.currentTimeline?.id)

const editorBreadcrumbTitle = computed(() => {
  const currentDocId = currentChapterId.value
  if (!currentDocId) return currentProject.value?.title || ''

  const docs = docsForTree.value
  const currentDoc = docs.find((doc) => doc.id === currentDocId)
  if (!currentDoc) return currentProject.value?.title || ''

  // 目录本身被选中时，首栏显示目录名
  if (currentDoc.type === DocumentType.SCENE || currentDoc.type === DocumentType.VOLUME) {
    return stripDirectoryPrefix(currentDoc.title)
  }

  // 章节被选中时，首栏显示所属目录名
  if (currentDoc.parentId) {
    const parent = docs.find((doc) => doc.id === currentDoc.parentId)
    if (parent) return stripDirectoryPrefix(parent.title)
  }

  // 无目录时回退项目名
  return currentProject.value?.title || ''
})

// =======================
// 业务逻辑方法
// =======================

// 初始化
onMounted(async () => {
  const pId = currentProjectId.value
  if (pId) {
    // 并行加载数据
    await Promise.all([
      projectStore.loadList(),
      projectStore.loadDetail(pId),
      documentStore.loadTree(pId)
    ])
  }
})

watch(
  () => flatChapters.value,
  (chapters) => {
    if (!currentChapterId.value && chapters.length > 0) {
      const firstChapter = chapters.find((chapter) => chapter.nodeType !== 'directory')
      currentChapterId.value = (firstChapter || chapters[0]).id
    }
  },
  { immediate: true }
)

watch(
  [queryChapterId, availableDocMap],
  ([chapterId, docMap]) => {
    if (!chapterId) return
    if (!docMap.has(chapterId)) return
    currentChapterId.value = chapterId
  },
  { immediate: true }
)

watch(
  () => queryTool.value,
  (tool) => {
    const allowedTools: ActiveTool[] = ['chapters', 'writing', 'immersive', 'ai', 'encyclopedia']
    if (allowedTools.includes(tool as ActiveTool)) {
      editorStore.setActiveTool(tool as ActiveTool)
    }
  },
  { immediate: true }
)

// 内容更新处理
const handleContentUpdate = (newContent: string) => {
  editorStore.setContent(newContent)
}

const handleAddChapterQuick = () => {
  newDocForm.value.type = 'chapter'
  showCreateDocDialog.value = true
}

const handleAddVolumeQuick = () => {
  newDocForm.value.type = 'volume'
  showCreateDocDialog.value = true
}

// 手动保存内容
const handleManualSave = async () => {
  editorStore.markSaved()
  message.success('保存成功')
}

// 创建文档
const handleCreateDoc = async () => {
  if (!newDocForm.value.title) return
  try {
    await documentStore.create(currentProjectId.value, {
      title: newDocForm.value.title,
      type: newDocForm.value.type as 'chapter' | 'volume',
      projectId: currentProjectId.value
    })

    showCreateDocDialog.value = false
    newDocForm.value.title = ''
    newDocForm.value.type = 'chapter'
  } catch {
    message.error('创建失败')
  }
}

// 删除文档
const handleDeleteChapter = async (docId: string) => {
  try {
    await messageBox.confirm('确定删除该章节吗？此操作不可恢复', '警告', { type: 'warning' })
    await documentStore.remove(docId)
    // 如果删除的是当前文档，清空编辑器
    if (docId === currentChapterId.value) {
      editorStore.reset() // 需要在 store 中实现 reset
    }
  } catch {
    // cancel
  }
}

// 工具栏命令
const handleToolbarCommand = (cmd: string) => {
  // 由于EditorPanel使用contenteditable，需要特殊处理
  // 这里暂时简单处理，直接在editorStore上操作
  // 实际可能需要通过emit传递DOM引用
  const editorElement = document.querySelector('.editor-content') as HTMLDivElement
  if (editorElement) {
    formatMarkdown(cmd, editorElement)
    editorStore.setContent(editorElement.textContent || '')
  }
}

// AI 相关
const toggleAISidebar = () => {
  editorStore.setActiveTool(editorStore.activeTool === 'ai' ? 'writing' : 'ai')
}

const handleContextMenu = (event: MouseEvent, selectedText: string) => {
  if (selectedText) {
    contextMenu.x = event.clientX
    contextMenu.y = event.clientY
    contextMenu.selectedText = selectedText
    contextMenu.visible = true
  }
}

const handleAIAction = (action: string, text?: string) => {
  contextMenu.visible = false
  editorStore.setActiveTool('ai')
  // 这里可以调用 AI Store 设置当前模式和文本
  writerStore.setAITool(action as 'chat' | 'continue' | 'polish' | 'expand' | 'rewrite' | 'agent')
  if (text) writerStore.setSelectedText(text)
}

const handleAISend = (message: string) => {
  // 处理AI发送消息事件
  console.log('[ProjectWorkspace] AI send message:', message)
  // TODO: 集成到writerStore的AI功能
}
</script>

<style scoped lang="scss">
// ProjectWorkspace现在使用EditorLayout，不需要额外的样式
// 所有布局相关样式由EditorLayout及其子组件处理
</style>
