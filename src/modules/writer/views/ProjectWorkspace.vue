<template>
  <div class="workspace-studio">
    <header class="workspace-topbar">
      <div class="workspace-topbar__title-group">
        <div class="workspace-topbar__logo">QY</div>
        <div class="workspace-topbar__title-block">
          <h1 class="workspace-topbar__title">{{ projectDisplayName }}</h1>
          <div class="workspace-topbar__meta">
            <span class="workspace-pill">{{ activeToolLabel }}</span>
            <span class="workspace-meta-text">当前章节：{{ currentChapterTitle }}</span>
            <span class="workspace-meta-text">{{ saveStatusLabel }}</span>
          </div>
        </div>
      </div>
      <div class="workspace-topbar__actions">
        <button
          type="button"
          class="workspace-action-btn workspace-action-btn--icon"
          :class="{ active: !panelStore.leftCollapsed }"
          title="切换左侧边栏"
          @click="toggleLeftPanel"
        >
          <QyIcon name="List" :size="14" />
        </button>
        <button
          type="button"
          class="workspace-action-btn workspace-action-btn--icon"
          :class="{ active: !panelStore.rightCollapsed }"
          title="切换右侧边栏"
          @click="toggleRightPanel"
        >
          <QyIcon name="MagicStick" :size="14" />
        </button>
        <button type="button" class="workspace-action-btn" @click="handleTipTapSave">保存</button>
        <button type="button" class="workspace-action-btn" @click="handleExportDraft">导出</button>
        <button
          type="button"
          class="workspace-action-btn workspace-action-btn--primary"
          @click="handleShareDraft"
        >
          分享
        </button>
      </div>
    </header>

    <EditorLayout class="workspace-editor-layout">
      <!-- 左侧面板插槽 -->
      <template #left-panel>
        <div class="workspace-left-panel-shell" :class="{ 'is-collapsed': panelStore.leftCollapsed }">
          <aside class="workspace-left-dock" aria-label="左侧工具栏">
            <button
              v-for="item in leftDockItems"
              :key="item.tool"
              type="button"
              class="workspace-left-dock__item"
              :class="{ active: activeToolForDock === item.tool }"
              :title="item.label"
              @click="handleDockSelect(item.tool)"
            >
              <QyIcon :name="item.icon" :size="16" />
              <span class="workspace-left-dock__label">{{ item.label }}</span>
            </button>
          </aside>

          <div class="workspace-left-panel-body">
            <div v-if="isEncyclopediaTool" class="world-sidebar">
              <div class="world-sidebar__header">设定工具</div>
              <button
                type="button"
                class="world-sidebar__item"
                :class="{ active: encyclopediaSubView === 'relations' }"
                @click="setEncyclopediaSubView('relations')"
              >
                人物关系图
              </button>
              <button
                type="button"
                class="world-sidebar__item"
                :class="{ active: encyclopediaSubView === 'encyclopedia' }"
                @click="setEncyclopediaSubView('encyclopedia')"
              >
                设定百科卡片
              </button>
            </div>
            <ProjectSidebar
              v-else
              v-model:projectId="currentProjectId"
              v-model:chapterId="currentChapterId"
              :projects="projects"
              :chapters="flatChapters"
              @add-chapter="handleAddChapterQuick"
              @add-volume="handleAddVolumeQuick"
              @open-directory-outline="handleOpenDirectoryOutline"
              @delete-chapter="handleDeleteChapter"
            />
          </div>
        </div>
      </template>

      <!-- 主编辑器插槽 -->
      <template #editor="{ activeTool }">
        <CharacterGraphView
          v-if="activeTool === 'encyclopedia' && encyclopediaSubView === 'relations'"
        />
        <EncyclopediaView
          v-else-if="activeTool === 'encyclopedia'"
          :project-id="currentProjectId"
          :embedded="true"
        />
        <TipTapEditorView
          v-else
          v-model="tipTapContent"
          :project-id="currentProjectId"
          :document-id="currentChapterId"
          :readonly="false"
          :show-reference-panel="false"
          @save="handleTipTapSave"
        />
      </template>

      <!-- 右侧AI面板插槽 -->
      <template #right-panel>
        <AIPanel
          :session-id="currentProjectId"
          :action-trigger="aiActionTrigger"
          @send="handleAISend"
          @apply-generated-text="handleAIApplyGeneratedText"
        />
      </template>
    </EditorLayout>

    <footer class="workspace-statusbar">
      <div class="workspace-statusbar__stats">
        <span>章节数：{{ chapterCount }}</span>
        <span>目录节点：{{ directoryCount }}</span>
        <span>当前工具：{{ activeToolLabel }}</span>
      </div>
      <div class="workspace-statusbar__state">
        <span class="workspace-statusbar__dot" />
        <span>{{ saveStatusLabel }}</span>
      </div>
    </footer>
  </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
// 引入新的 Store 体系
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { usePanelStore } from '@/modules/writer/stores/panelStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { getWorkspaceMockProject } from '@/modules/writer/mock/workspaceMock'
import { DocumentType, type Document } from '@/modules/writer/types/document'
import type { ActiveTool } from '@/modules/writer/stores/editorStore'

// 引入组件
import EditorLayout from '@/modules/writer/components/editor/EditorLayout.vue'
import TipTapEditorView from '@/modules/writer/components/editor-new/TipTapEditorView.vue'
import ProjectSidebar from '@/modules/writer/components/ProjectSidebar.vue'
import AIPanel from '@/modules/writer/components/editor/AIPanel.vue'
import EncyclopediaView from '@/modules/writer/views/EncyclopediaView.vue'
import CharacterGraphView from '@/modules/writer/views/CharacterGraphView.vue'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  projectId?: string
}>()

// =======================
// 状态初始化
// =======================
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const panelStore = usePanelStore()
const writerStore = useWriterStore()

// UI Flags
const showCreateDocDialog = ref(false)

// Forms
const newDocForm = ref({ title: '', type: 'chapter' })
const aiActionTrigger = ref<{
  id: number
  action: string
  text: string
  instructions?: string
} | null>(null)

// =======================
// 数据绑定 (核心)
// =======================

// 1. 项目 ID - 优先使用 props，然后是 route.params
const currentProjectId = computed({
  get: () => props.projectId || projectStore.currentProjectId || (route.params.projectId as string),
  set: (id) => {
    if (id) {
      projectStore.loadDetail(id)
      documentStore.loadTree(id)
    }
  },
})

const isTestMode = computed(() => route.query.test === 'true')
const mockProject = computed(() =>
  isTestMode.value ? getWorkspaceMockProject(currentProjectId.value) : null,
)
const queryChapterId = computed(() => String(route.query.chapterId || ''))
const queryTool = computed(() => String(route.query.tool || ''))
const isEncyclopediaTool = computed(() => editorStore.activeTool === 'encyclopedia')
const encyclopediaSubView = computed<'relations' | 'encyclopedia'>(() => {
  const raw = String(route.query.encyclopediaView || route.query.worldView || '').toLowerCase()
  if (['encyclopedia', 'cards', 'list'].includes(raw)) return 'encyclopedia'
  if (['relations', 'relation', 'graph', 'relationship'].includes(raw)) return 'relations'
  return 'relations'
})

const setEncyclopediaSubView = async (view: 'relations' | 'encyclopedia') => {
  await router.replace({
    query: {
      ...route.query,
      tool: 'encyclopedia',
      encyclopediaView: view,
    },
  })
}

const leftDockItems: Array<{ tool: ActiveTool; label: string; icon: string }> = [
  { tool: 'writing', label: '写作', icon: 'Edit' },
  { tool: 'immersive', label: '沉浸', icon: 'FullScreen' },
  { tool: 'encyclopedia', label: '设定', icon: 'Location' },
]

const activeToolForDock = computed<ActiveTool>(() => {
  const tool = editorStore.activeTool
  return tool === 'ai' || tool === 'chapters' ? 'writing' : tool
})

const handleDockSelect = async (tool: ActiveTool) => {
  const normalizedTool: ActiveTool =
    tool === 'chapters' || tool === 'ai' ? 'writing' : tool

  editorStore.setActiveTool(normalizedTool)
  const nextQuery = { ...route.query, tool: normalizedTool } as Record<string, unknown>

  if (normalizedTool === 'encyclopedia') {
    if (!nextQuery.encyclopediaView) {
      nextQuery.encyclopediaView = 'relations'
    }
  } else {
    delete nextQuery.encyclopediaView
    delete nextQuery.worldView
  }

  await router.replace({ query: nextQuery as any })
}

const buildDirectoryOutline = (directoryId: string): string => {
  const directory = availableDocMap.value.get(directoryId)
  if (!directory) return ''

  if (mockProject.value?.contentByDocId?.[directoryId]) {
    return mockProject.value.contentByDocId[directoryId]
  }

  const children = Array.from(availableDocMap.value.values())
    .filter((doc) => doc.parentId === directoryId && doc.type === DocumentType.CHAPTER)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const chapterLines = children.length > 0
    ? children.map((chapter, index) => `${index + 1}. ${chapter.title}`).join('\n')
    : '- 暂无章节，请在右上角新增章节。'

  return `# ${directory.title} 细纲\n\n## 目录目标\n- 待补充此目录核心冲突与推进目标。\n\n## 章节推进\n${chapterLines}\n`
}

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

    // 目录节点展示细纲
    if (
      selectedDoc &&
      (selectedDoc.type === DocumentType.SCENE || selectedDoc.type === DocumentType.VOLUME)
    ) {
      const outlineContent = buildDirectoryOutline(id)
      editorStore.setContent(outlineContent, false)
      editorStore.editorContent = outlineContent
      editorStore.markSaved()
      return
    }

    // 真实内容 API 未就绪时，测试模式优先用统一 mock 文本填充
    if (mockProject.value?.contentByDocId[id]) {
      editorStore.setContent(mockProject.value.contentByDocId[id], false)
      editorStore.editorContent = mockProject.value.contentByDocId[id]
      editorStore.markSaved()
      return
    }

    // 真实文档走段落内容加载链路
    try {
      await editorStore.loadDocument(id)
      return
    } catch {
      // 非 mock 文档默认不覆盖已有内容，仅在首次无内容时清空
    }

    if (!editorStore.content) {
      editorStore.setContent('', false)
      editorStore.editorContent = ''
      editorStore.markSaved()
    }
  },
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
  for (const doc of mockProject.value?.docs || []) {
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

const projectDisplayName = computed(() => {
  return (
    mockProject.value?.project?.title ||
    (projectStore.currentProject as { title?: string } | null)?.title ||
    projects.value.find((item) => item.id === currentProjectId.value)?.title ||
    '未命名项目'
  )
})

const currentChapterTitle = computed(() => {
  const target = flatChapters.value.find((item) => item.id === currentChapterId.value)
  return target?.title || '未选择章节'
})

const chapterCount = computed(() => {
  return flatChapters.value.filter((item) => item.nodeType !== 'directory').length
})

const directoryCount = computed(() => {
  return flatChapters.value.filter((item) => item.nodeType === 'directory').length
})

const activeToolLabel = computed(() => {
  const labels: Record<ActiveTool, string> = {
    chapters: '章节模式',
    writing: '写作模式',
    immersive: '沉浸模式',
    ai: 'AI助手',
    encyclopedia: '设定百科',
  }
  return labels[editorStore.activeTool]
})

const saveStatusLabel = computed(() => editorStore.saveStatusText || '系统就绪')

// 4. 编辑器内容绑定 (双向绑定到 Store，Store 内处理自动保存)
const tipTapContent = computed({
  get: () => editorStore.editorContent || editorStore.content,
  set: (val: string) => {
    editorStore.editorContent = val
    // 保持旧内容链路兼容：写作统计/AI 上下文仍可读取 content
    editorStore.setContent(val)
  },
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
      documentStore.loadTree(pId),
    ])
  }
})

watch(
  () => flatChapters.value,
  (chapters) => {
    if (!currentChapterId.value && chapters.length > 0) {
      const firstChapter = chapters.find((chapter) => chapter.nodeType !== 'directory')
      // 添加数组长度检查，解决 TS2493 错误
      const targetChapter = firstChapter || chapters[0]
      if (targetChapter) {
        currentChapterId.value = targetChapter.id
      }
    }
  },
  { immediate: true },
)

watch(
  [queryChapterId, availableDocMap],
  ([chapterId, docMap]) => {
    if (!chapterId) return
    if (!docMap.has(chapterId)) return
    currentChapterId.value = chapterId
  },
  { immediate: true },
)

watch(
  () => queryTool.value,
  (tool) => {
    const normalizedTool = tool === 'chapters' || tool === 'ai' ? 'writing' : tool
    const allowedTools: ActiveTool[] = ['writing', 'immersive', 'encyclopedia']
    if (allowedTools.includes(normalizedTool as ActiveTool)) {
      editorStore.setActiveTool(normalizedTool as ActiveTool)
    }
  },
  { immediate: true },
)

const handleAddChapterQuick = () => {
  newDocForm.value.type = 'chapter'
  showCreateDocDialog.value = true
}

const handleAddVolumeQuick = () => {
  newDocForm.value.type = 'volume'
  showCreateDocDialog.value = true
}

const handleOpenDirectoryOutline = async (directoryId: string) => {
  if (!directoryId) return
  editorStore.setActiveTool('writing')
  if (currentChapterId.value !== directoryId) {
    currentChapterId.value = directoryId
    return
  }
  const outlineContent = buildDirectoryOutline(directoryId)
  editorStore.setContent(outlineContent, false)
  editorStore.editorContent = outlineContent
  editorStore.markSaved()
  if (route.query.tool !== 'writing') {
    await router.replace({ query: { ...route.query, tool: 'writing' } as any })
  }
}

const handleTipTapSave = async () => {
  editorStore.markSaved()
  message.success('已保存（TipTap）')
}

const handleExportDraft = () => {
  message.info('导出功能已接入入口，后续可绑定实际导出流程')
}

const handleShareDraft = async () => {
  const shareUrl = window.location.href
  if (!navigator?.clipboard?.writeText) {
    message.info('当前环境不支持自动复制，请手动复制地址栏链接')
    return
  }
  try {
    await navigator.clipboard.writeText(shareUrl)
    message.success('分享链接已复制到剪贴板')
  } catch {
    message.error('复制失败，请手动复制地址栏链接')
  }
}

const toggleLeftPanel = () => {
  panelStore.setLeftCollapsed(!panelStore.leftCollapsed)
}

const toggleRightPanel = () => {
  panelStore.setRightCollapsed(!panelStore.rightCollapsed)
}

// 创建文档
const handleCreateDoc = async () => {
  if (!newDocForm.value.title) return
  try {
    // 使用类型断言解决 TS2322 错误
    await documentStore.create(currentProjectId.value, {
      title: newDocForm.value.title,
      type: newDocForm.value.type as unknown as DocumentType,
      projectId: currentProjectId.value,
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

const handleAISend = (message: string) => {
  // 处理AI发送消息事件
  console.log('[ProjectWorkspace] AI send message:', message)
  // TODO: 集成到writerStore的AI功能
}

const handleAIApplyGeneratedText = (payload: {
  action: string
  sourceText: string
  generatedText: string
}) => {
  const generatedText = (payload.generatedText || '').trim()
  if (!generatedText) return

  const sourceText = payload.sourceText || ''
  const currentContent = editorStore.content || ''
  let nextContent = currentContent

  if (sourceText) {
    const sourceIndex = currentContent.indexOf(sourceText)
    if (sourceIndex >= 0) {
      if (payload.action === 'continue') {
        const insertPos = sourceIndex + sourceText.length
        nextContent = `${currentContent.slice(0, insertPos)}${generatedText}${currentContent.slice(insertPos)}`
      } else {
        nextContent = `${currentContent.slice(0, sourceIndex)}${generatedText}${currentContent.slice(sourceIndex + sourceText.length)}`
      }
    }
  }

  if (nextContent === currentContent) {
    const separator = currentContent && !currentContent.endsWith('\n') ? '\n\n' : ''
    nextContent = `${currentContent}${separator}${generatedText}`
  }

  editorStore.setContent(nextContent)
  writerStore.setSelectedText('')
  message.success('AI 结果已应用到编辑器')
}
</script>

<style scoped lang="scss">
.workspace-studio {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 12% -24%, rgba(19, 91, 236, 0.2) 0%, transparent 36%),
    radial-gradient(circle at 88% -30%, rgba(15, 23, 42, 0.24) 0%, transparent 42%), #eef3fb;
}

.workspace-topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid #d5dfef;
  background: linear-gradient(110deg, #ffffff 0%, #f6f9ff 100%);
}

.workspace-topbar__title-group {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.workspace-topbar__logo {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #fff;
  background: linear-gradient(145deg, #1f63f0, #083ca5);
  box-shadow: 0 10px 18px rgba(31, 99, 240, 0.24);
}

.workspace-topbar__title-block {
  min-width: 0;
}

.workspace-topbar__title {
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 800;
  color: #13233f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-topbar__meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.workspace-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #2053c6;
  background: #e5edff;
  border: 1px solid #c8d8ff;
}

.workspace-meta-text {
  font-size: 12px;
  color: #63708b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.workspace-action-btn {
  border: 1px solid #d4deef;
  background: #fff;
  color: #24344f;
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.workspace-action-btn:hover {
  border-color: #8cadf8;
  color: #1246b3;
  background: #f0f5ff;
}

.workspace-action-btn--primary {
  background: linear-gradient(145deg, #2f6fff, #1a4fcb);
  border-color: #2f6fff;
  color: #fff;
}

.workspace-action-btn--icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.workspace-action-btn--icon.active {
  border-color: #8cadf8;
  color: #1246b3;
  background: #f0f5ff;
}

.workspace-action-btn--primary:hover {
  filter: brightness(1.06);
  color: #fff;
}

.workspace-editor-layout {
  flex: 1;
  min-height: 0;
}

.workspace-statusbar {
  height: 30px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(90deg, #1f59d3, #1545a8);
  color: #f8fbff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.workspace-statusbar__stats {
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
  overflow: hidden;
}

.workspace-statusbar__state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.workspace-statusbar__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #48e594;
  box-shadow: 0 0 0 5px rgba(72, 229, 148, 0.15);
}

.workspace-left-panel-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  width: 100%;
  min-width: 0;
}

.workspace-left-dock {
  width: 56px;
  flex: 0 0 56px;
  border-right: 1px solid #d7deeb;
  background: linear-gradient(180deg, #ffffff, #f2f7ff);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
}

.workspace-left-dock__item {
  width: 100%;
  border: 1px solid #d8e1f2;
  border-radius: 10px;
  padding: 7px 4px;
  background: #fff;
  color: #314360;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.workspace-left-dock__item:hover {
  border-color: #95b3f8;
  background: #eff5ff;
}

.workspace-left-dock__item.active {
  border-color: #2f6fff;
  background: linear-gradient(140deg, #eaf1ff, #dce9ff);
  color: #1f4ec2;
  box-shadow: 0 8px 14px rgba(47, 111, 255, 0.14);
}

.workspace-left-dock__label {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  background: #0f1e3a;
  color: #fff;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.16s ease;
  z-index: 20;
}

.workspace-left-dock__item:hover .workspace-left-dock__label,
.workspace-left-dock__item:focus-visible .workspace-left-dock__label {
  opacity: 1;
}

.workspace-left-dock__item :deep(.qy-icon) {
  color: currentColor;
}

.workspace-left-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.workspace-left-panel-shell.is-collapsed .workspace-left-panel-body {
  width: 0;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
}

.world-sidebar {
  height: 100%;
  padding: 16px 12px;
  border-right: 1px solid #d7deeb;
  background: linear-gradient(180deg, #f8fbff, #f0f5ff);
}

.world-sidebar__header {
  font-size: 11px;
  color: #63708b;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.world-sidebar__item {
  width: 100%;
  text-align: left;
  border: 1px solid #d8e0ef;
  background: #fff;
  color: #283452;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.world-sidebar__item:hover {
  border-color: #3b82f6;
}

.world-sidebar__item.active {
  border-color: #2f6fff;
  background: linear-gradient(130deg, #edf3ff, #e4eeff);
  color: #1f4ec2;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(47, 111, 255, 0.14);
}

@media (max-width: 1024px) {
  .workspace-topbar {
    height: auto;
    padding: 10px 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .workspace-topbar__actions {
    width: 100%;
  }

  .workspace-action-btn {
    flex: 1;
  }

  .workspace-statusbar {
    height: auto;
    min-height: 30px;
    padding: 6px 10px;
    flex-direction: column;
    align-items: flex-start;
  }

  .workspace-statusbar__stats {
    width: 100%;
    gap: 10px;
    overflow-x: auto;
  }

  .workspace-left-dock {
    width: 50px;
    flex-basis: 50px;
    padding: 8px 6px;
  }

  .workspace-left-dock__label {
    display: none;
  }
}

@media (max-width: 640px) {
  .workspace-topbar__meta {
    flex-wrap: wrap;
    gap: 6px;
  }

  .workspace-meta-text {
    font-size: 11px;
  }
}
</style>
