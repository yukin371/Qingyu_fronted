<template>
  <div class="workspace-studio" :class="{ 'workspace-studio--immersive': isImmersiveMode }">
    <!-- 顶部工具栏 -->
    <WorkspaceTopbar
      :project-display-name="projectDisplayName"
      :current-chapter-title="currentChapterTitle"
      :active-tool-label="activeToolLabel"
      :save-status-label="saveStatusLabel"
      :left-panel-collapsed="panelStore.leftCollapsed"
      :right-panel-collapsed="panelStore.rightCollapsed"
      :is-immersive-mode="isImmersiveMode"
      @toggle-left-panel="toggleLeftPanel"
      @toggle-right-panel="toggleRightPanel"
      @save="handleTipTapSave"
      @export="handleExportDraft"
      @share="handleShareDraft"
    />

    <EditorLayout class="workspace-editor-layout">
      <!-- 左侧面板插槽 -->
      <template #left-panel>
        <WorkspaceLeftPanel
          v-model:project-id="currentProjectId"
          v-model:chapter-id="currentChapterId"
          :collapsed="panelStore.leftCollapsed"
          :is-immersive-mode="isImmersiveMode"
          :active-tool-for-dock="activeToolForDock"
          :is-encyclopedia-tool="isEncyclopediaTool"
          :encyclopedia-sub-view="encyclopediaSubView"
          :encyclopedia-category="encyclopediaCategory"
          :world-sidebar-title="worldSidebarTitle"
          :world-sidebar-hint="worldSidebarHint"
          :projects="projects"
          :chapters="flatChapters"
          @dock-select="handleDockSelect"
          @set-encyclopedia-category="setEncyclopediaCategory"
          @add-chapter="handleAddChapterQuick"
          @add-volume="handleAddVolumeQuick"
          @open-directory-outline="handleOpenDirectoryOutline"
          @delete-chapter="handleDeleteChapter"
        />
      </template>

      <!-- 主编辑器插槽 -->
      <template #editor="{ activeTool }">
        <WorkspaceEditorContent
          :active-tool="activeTool"
          :is-encyclopedia="isEncyclopediaTool"
          :sub-view="encyclopediaSubView"
          :category="encyclopediaCategory"
          :project-id="currentProjectId"
          :chapter-id="currentChapterId"
          v-model:content="tipTapContent"
          @update:category="setEncyclopediaCategory"
          @save="handleTipTapSave"
        />
      </template>

      <!-- 右侧AI面板插槽 -->
      <template #right-panel>
        <WorkspaceRightPanel
          :collapsed="panelStore.rightCollapsed"
          :is-immersive-mode="isImmersiveMode"
          :active-right-dock-tool="activeRightDockTool"
          :project-id="currentProjectId"
          :ai-action-trigger="aiActionTrigger"
          @dock-select="handleRightDockSelect"
          @ai-send="handleAISend"
          @ai-apply="handleAIApplyGeneratedText"
        />
      </template>
    </EditorLayout>

    <!-- 底部状态栏 -->
    <WorkspaceStatusbar
      :chapter-count="chapterCount"
      :directory-count="directoryCount"
      :active-tool-label="activeToolLabel"
      :save-status-label="saveStatusLabel"
      :is-immersive-mode="isImmersiveMode"
      :immersive-timer-text="immersiveTimerText"
    />
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
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
// 引入 Store 体系
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore, type ActiveTool } from '@/modules/writer/stores/editorStore'
import { usePanelStore } from '@/modules/writer/stores/panelStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { getWorkspaceMockProject } from '@/modules/writer/mock/workspaceMock'
import { DocumentType } from '@/modules/writer/types/document'

// 引入 Composables
import { useWorkspaceState } from '@/modules/writer/composables/useWorkspaceState'
import { useImmersiveTimer } from '@/modules/writer/composables/useImmersiveTimer'
import { useEncyclopediaView } from '@/modules/writer/composables/useEncyclopediaView'
import { useDirectoryOutline } from '@/modules/writer/composables/useDirectoryOutline'

// 引入子组件
import WorkspaceTopbar from '@/modules/writer/components/workspace/WorkspaceTopbar.vue'
import WorkspaceLeftPanel from '@/modules/writer/components/workspace/WorkspaceLeftPanel.vue'
import WorkspaceRightPanel, { type AIApplyPayload } from '@/modules/writer/components/workspace/WorkspaceRightPanel.vue'
import WorkspaceStatusbar from '@/modules/writer/components/workspace/WorkspaceStatusbar.vue'
import WorkspaceEditorContent from '@/modules/writer/components/workspace/WorkspaceEditorContent.vue'
import EditorLayout from '@/modules/writer/components/editor/EditorLayout.vue'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  projectId?: string
}>()

// =======================
// Store 初始化
// =======================
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const panelStore = usePanelStore()
const writerStore = useWriterStore()

// =======================
// 计算属性
// =======================
const isTestMode = computed(() => route.query.test === 'true')
const mockProject = computed(() =>
  isTestMode.value ? getWorkspaceMockProject(currentProjectId.value) : null,
)
const queryChapterId = computed(() => String(route.query.chapterId || ''))
const queryTool = computed(() => String(route.query.tool || ''))
const activeTool = computed(() => editorStore.activeTool)

// =======================
// 使用 Composables
// =======================
const {
  currentProjectId,
  currentChapterId,
  projectDisplayName,
  currentChapterTitle,
  chapterCount,
  directoryCount,
  activeToolLabel,
  saveStatusLabel,
  tipTapContent,
  projects,
  flatChapters,
  availableDocMap,
} = useWorkspaceState({
  projectIdProp: props.projectId,
  isTestMode,
  mockProject,
})

const isImmersiveMode = computed(() => editorStore.activeTool === 'immersive')

const {
  immersiveTimerText,
  startImmersiveTimer,
  stopImmersiveTimer,
} = useImmersiveTimer({ isImmersiveMode })

const {
  isEncyclopediaTool,
  encyclopediaSubView,
  encyclopediaCategory,
  worldSidebarTitle,
  worldSidebarHint,
  setEncyclopediaCategory,
} = useEncyclopediaView({ activeTool })

const { buildDirectoryOutline } = useDirectoryOutline({ availableDocMap, mockProject })

// =======================
// Dock 状态
// =======================
import type { LeftDockTool } from '@/modules/writer/composables/types'

const activeToolForDock = computed<LeftDockTool>(() => {
  const tool = editorStore.activeTool
  if (tool === 'encyclopedia') return encyclopediaSubView.value
  return tool === 'ai' || tool === 'chapters' ? 'writing' : tool
})

const activeRightDockTool = computed<'ai'>(() => 'ai')

// =======================
// UI 状态
// =======================
const showCreateDocDialog = ref(false)
const newDocForm = ref({ title: '', type: 'chapter' })
const aiActionTrigger = ref<{ id: number; action: string; text: string; instructions?: string } | null>(null)

// =======================
// 事件处理
// =======================
const handleDockSelect = async (tool: LeftDockTool) => {
  const nextQuery = { ...route.query } as LocationQueryRaw
  if (tool === 'relations' || tool === 'encyclopedia' || tool === 'timeline' || tool === 'branches') {
    editorStore.setActiveTool('encyclopedia')
    nextQuery.tool = 'encyclopedia'
    nextQuery.encyclopediaView = tool
  } else {
    const normalizedTool: ActiveTool = tool
    editorStore.setActiveTool(normalizedTool)
    nextQuery.tool = normalizedTool
    delete nextQuery.encyclopediaView
    delete nextQuery.worldView
    delete nextQuery.worldCategory
  }
  await router.replace({ query: nextQuery as LocationQueryRaw })
}

const handleRightDockSelect = (tool: string) => {
  if (isImmersiveMode.value) return
  if (tool === 'ai') {
    panelStore.setRightCollapsed(false)
  }
}

const toggleLeftPanel = () => {
  if (isImmersiveMode.value) return
  panelStore.setLeftCollapsed(!panelStore.leftCollapsed)
}

const toggleRightPanel = () => {
  if (isImmersiveMode.value) return
  panelStore.setRightCollapsed(!panelStore.rightCollapsed)
}

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
    await router.replace({ query: { ...route.query, tool: 'writing' } as LocationQueryRaw })
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

const handleCreateDoc = async () => {
  if (!newDocForm.value.title) return
  try {
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

const handleDeleteChapter = async (docId: string) => {
  try {
    await messageBox.confirm('确定删除该章节吗？此操作不可恢复', '警告', { type: 'warning' })
    await documentStore.remove(docId)
    if (docId === currentChapterId.value) {
      editorStore.reset()
    }
  } catch {
    // cancel
  }
}

const handleAISend = (msg: string) => {
  console.log('[ProjectWorkspace] AI send message:', msg)
}

const handleAIApplyGeneratedText = (payload: AIApplyPayload) => {
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

// =======================
// 生命周期
// =======================
onMounted(async () => {
  const pId = currentProjectId.value
  if (pId) {
    await Promise.all([
      projectStore.loadList(),
      projectStore.loadDetail(pId),
      documentStore.loadTree(pId),
    ])
  }
})

// =======================
// Watchers
// =======================
watch(
  () => flatChapters.value,
  (chapters) => {
    if (!currentChapterId.value && chapters.length > 0) {
      const firstChapter = chapters.find((chapter) => chapter.nodeType !== 'directory')
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

watch(
  () => isImmersiveMode.value,
  (immersive) => {
    if (immersive) {
      startImmersiveTimer()
    } else {
      stopImmersiveTimer()
    }
  },
  { immediate: true },
)
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

.workspace-editor-layout {
  flex: 1;
  min-height: 0;
}
</style>
