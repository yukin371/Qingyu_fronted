<template>
  <div class="workspace-studio" :class="{ 'workspace-studio--immersive': isImmersiveMode }" data-editor-theme="light">
    <!-- 顶部工具栏 -->
    <WorkspaceTopbar
      :project-display-name="projectDisplayName"
      :current-chapter-title="currentChapterTitle"
      :active-tool-label="activeToolLabel"
      :save-status-label="saveStatusLabel"
      :is-immersive-mode="isImmersiveMode"
      @save="handleTipTapSave"
      @export="handleExportDraft"
      @share="handleShareDraft"
      @back="handleBackToDashboard"
    />

    <EditorLayout class="workspace-editor-layout">
      <!-- 左侧面板插槽 -->
      <template #left-panel>
        <WorkspaceLeftPanel
          v-model:project-id="currentProjectId"
          v-model:chapter-id="displayChapterId"
          :collapsed="panelStore.leftCollapsed"
          :is-immersive-mode="isImmersiveMode"
          :projects="projects"
          :chapters="flatChapters"
          @add-doc="handleAddDoc"
          @open-directory-outline="handleOpenDirectoryOutline"
          @delete-chapter="handleDeleteChapter"
          @create-outline-root="handleCreateOutlineRoot"
          @create-outline-child="handleCreateOutlineChild"
          @open-graph="handleOpenGraph"
          @open-fullscreen-tool="handleOpenFullscreenTool"
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
          :chapter-id="displayChapterId"
          :chapter-title="displayChapterTitle"
          :chapters="flatChapters"
          v-model:content="tipTapContent"
          @update:category="setEncyclopediaCategory"
          @trigger-ai-action="handleAIStageAction"
          @open-graph="handleOpenGraph"
          @jump-to-chapter="handleChapterIdUpdate"
          @save="handleTipTapSave"
          @add-doc="handleAddDoc"
          @status-change="handleWorkspaceStatusChange"
        />
      </template>

      <!-- 右侧AI面板插槽 -->
      <template #right-panel>
        <WorkspaceRightPanel
          :collapsed="panelStore.rightCollapsed"
          :is-immersive-mode="isImmersiveMode"
          :active-right-dock-tool="activeRightDockTool"
          :project-id="currentProjectId"
          :chapter-id="displayChapterId"
          :chapter-title="displayChapterTitle"
          :source-text="currentChapterPlainText"
          :ai-action-trigger="aiActionTrigger"
          :ai-apply-feedback="aiApplyFeedback"
          @toggle="toggleRightPanel"
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
      :extra-status-chips="workspaceExtraStatusChips"
      :is-immersive-mode="isImmersiveMode"
      :immersive-timer-text="immersiveTimerText"
    />
  </div>

  <!-- 新建文档对话框 -->
  <QyFormModal
    v-model:visible="showCreateDocDialog"
    title="新建文档"
    :fields="createDocFields"
    :loading="createDocLoading"
    @submit="handleCreateDocSubmit"
    @cancel="showCreateDocDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, unref } from 'vue'
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
import WorkspaceRightPanel, {
  type AIApplyPayload,
} from '@/modules/writer/components/workspace/WorkspaceRightPanel.vue'
import WorkspaceStatusbar from '@/modules/writer/components/workspace/WorkspaceStatusbar.vue'
import WorkspaceEditorContent from '@/modules/writer/components/workspace/WorkspaceEditorContent.vue'
import EditorLayout from '@/modules/writer/components/editor/EditorLayout.vue'
import QyFormModal from '@/design-system/components/advanced/QyFormModal/QyFormModal.vue'
import type { FormField } from '@/design-system/components/advanced/QyFormModal/QyFormModal.vue'
import {
  appendPlainTextToEditorContent,
  buildEditorContentFromPlainText,
  extractPlainTextFromEditorContent,
} from '@/modules/writer/utils/editorContent'

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
const resolvedActiveTool = computed<ActiveTool>(() => unref(editorStore.activeTool) as ActiveTool)
const activeTool = computed(() => resolvedActiveTool.value)
const workspaceExtraStatusChips = ref<string[]>([])

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

const isImmersiveMode = computed(() => resolvedActiveTool.value === 'immersive')

const { immersiveTimerText, startImmersiveTimer, stopImmersiveTimer } = useImmersiveTimer({
  isImmersiveMode,
})

const {
  isEncyclopediaTool,
  encyclopediaSubView,
  encyclopediaCategory,
  setEncyclopediaCategory,
} = useEncyclopediaView({ activeTool })

const { buildDirectoryOutline } = useDirectoryOutline({ availableDocMap, mockProject })

const handleWorkspaceStatusChange = (chips: string[]) => {
  workspaceExtraStatusChips.value = chips
}

watch(
  [isEncyclopediaTool, encyclopediaSubView],
  ([isEncyclopedia, subView]) => {
    if (!isEncyclopedia || subView !== 'relations') {
      workspaceExtraStatusChips.value = []
    }
  },
  { immediate: true },
)

const activeRightDockTool = computed<'ai'>(() => 'ai')
const currentChapterPlainText = computed(() =>
  extractPlainTextFromEditorContent(tipTapContent.value),
)
const isGlobalRelationsView = computed(
  () =>
    isEncyclopediaTool.value && encyclopediaSubView.value === 'relations' && !queryChapterId.value,
)
const displayChapterId = computed({
  get: () => (isGlobalRelationsView.value ? '' : currentChapterId.value),
  set: (value: string) => {
    currentChapterId.value = value
  },
})
const displayChapterTitle = computed(() =>
  isGlobalRelationsView.value ? '' : currentChapterTitle.value,
)

// =======================
// UI 状态
// =======================
const showCreateDocDialog = ref(false)
const createDocLoading = ref(false)
const aiActionTrigger = ref<{
  id: number
  action: string
  text: string
  instructions?: string
  applyMode?:
    | 'replace_selection'
    | 'insert_after_selection'
    | 'append_paragraph'
    | 'replace_document'
} | null>(null)
const aiApplyFeedback = ref<{
  status: 'idle' | 'success' | 'fallback'
  title: string
  detail: string
  mode?: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document'
  updatedAt: number
} | null>(null)
const latestSelectionContext = ref<{ text: string; from: number; to: number } | null>(null)

// 新建文档表单字段配置
const createDocFields: FormField[] = [
  {
    key: 'title',
    label: '文档标题',
    type: 'text',
    placeholder: '请输入文档标题',
    required: true,
  },
  {
    key: 'type',
    label: '文档类型',
    type: 'select',
    defaultValue: 'chapter',
    options: [
      { label: '章节', value: 'chapter' },
      { label: '卷', value: 'volume' },
    ],
  },
]

// =======================
// 事件处理
// =======================
const toggleLeftPanel = () => {
  if (isImmersiveMode.value) return
  panelStore.setLeftCollapsed(!panelStore.leftCollapsed)
}

const toggleRightPanel = () => {
  if (isImmersiveMode.value) return
  panelStore.setRightCollapsed(!panelStore.rightCollapsed)
}
void toggleLeftPanel
void toggleRightPanel

const handleAddDoc = () => {
  showCreateDocDialog.value = true
}

const handleOpenDirectoryOutline = async (directoryId: string) => {
  if (!directoryId) return

  // 如果在百科/关系图谱视图，点击卷不切换到编辑器，只更新选中
  if (isEncyclopediaTool.value && encyclopediaSubView.value === 'relations') {
    currentChapterId.value = directoryId
    return
  }

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

const handleTipTapSave = async (contents?: unknown[]) => {
  if (!currentChapterId.value) {
    message.warning('请先选择要保存的章节')
    return
  }
  try {
    if (contents && Array.isArray(contents)) {
      // 调用 editorStore.saveParagraphs 保存到后端
      await editorStore.saveParagraphs(
        contents as Array<{
          paragraphId?: string
          order: number
          content: string
          contentType?: string
        }>,
      )
    }
    message.success('保存成功')
  } catch (error) {
    console.error('[ProjectWorkspace] 保存失败:', error)
    message.error('保存失败，请重试')
  }
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

const handleBackToDashboard = () => {
  router.push('/writer/dashboard')
}

const handleCreateDocSubmit = async (formData: Record<string, unknown>) => {
  const title = formData.title as string
  if (!title) return

  createDocLoading.value = true
  try {
    // 确定父节点：如果当前选中的是目录类型，则作为父节点
    const currentDoc = availableDocMap.value.get(currentChapterId.value)
    const parentId = currentDoc?.type === DocumentType.VOLUME ? currentChapterId.value : undefined

    await documentStore.create(currentProjectId.value, {
      title,
      type: formData.type as DocumentType,
      projectId: currentProjectId.value,
      parentId, // 传递父节点ID
    })
    showCreateDocDialog.value = false
    message.success('创建成功')
  } catch (error) {
    console.error('[ProjectWorkspace] Create failed:', error)
    message.error('创建失败')
  } finally {
    createDocLoading.value = false
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

// 处理章节 ID 更新（从侧边栏选择章节）
const handleChapterIdUpdate = async (chapterId: string) => {
  if (!chapterId) return

  // 如果在百科/关系图谱视图，保持在该视图
  if (isEncyclopediaTool.value && encyclopediaSubView.value === 'relations') {
    // 更新路由 query 中的 chapterId，但不切换工具
    const nextQuery = { ...route.query } as LocationQueryRaw
    nextQuery.chapterId = chapterId
    await router.replace({ query: nextQuery })
    return
  }

  // 其他视图切换到写作模式
  const nextQuery = { ...route.query } as LocationQueryRaw
  nextQuery.chapterId = chapterId
  nextQuery.tool = 'writing'
  delete nextQuery.encyclopediaView
  await router.replace({ query: nextQuery })
}

const handleOpenGraph = async (chapterId: string) => {
  const nextQuery = { ...route.query } as LocationQueryRaw
  nextQuery.tool = 'encyclopedia'
  nextQuery.encyclopediaView = 'relations'

  if (chapterId) {
    nextQuery.chapterId = chapterId
  } else {
    delete nextQuery.chapterId
  }

  await router.replace({ query: nextQuery })
}

// 处理创建大纲根节点
const handleCreateOutlineRoot = () => {
  // TODO: 实现创建大纲根节点的逻辑
  console.log('创建大纲根节点')
  message.info('创建大纲根节点功能开发中')
}

// 处理创建大纲子节点
const handleCreateOutlineChild = () => {
  // TODO: 实现创建大纲子节点的逻辑
  console.log('创建大纲子节点')
  message.info('创建大纲子节点功能开发中')
}

// 处理打开全屏工具
const handleOpenFullscreenTool = async (tool: string) => {
  // TODO: 后续 P2 阶段实现全屏覆盖层系统
  console.log('打开全屏工具:', tool)
  message.info(`${tool} 全屏视图功能开发中`)
}

const handleAISend = (msg: string) => {
  void msg
}

const handleAIStageAction = (payload: {
  action: string
  text: string
  instructions?: string
  from?: number
  to?: number
  applyMode?:
    | 'replace_selection'
    | 'insert_after_selection'
    | 'append_paragraph'
    | 'replace_document'
}) => {
  panelStore.setRightCollapsed(false)
  latestSelectionContext.value =
    typeof payload.from === 'number' && typeof payload.to === 'number'
      ? {
          text: payload.text,
          from: payload.from,
          to: payload.to,
        }
      : null
  aiActionTrigger.value = {
    id: Date.now(),
    action: payload.action,
    text: payload.text || currentChapterPlainText.value,
    instructions: payload.instructions,
    applyMode: payload.applyMode,
  }
}

const setAIApplyFeedback = (
  status: 'idle' | 'success' | 'fallback',
  title: string,
  detail: string,
  mode?: 'replace_selection' | 'insert_after_selection' | 'append_paragraph' | 'replace_document',
) => {
  aiApplyFeedback.value = {
    status,
    title,
    detail,
    mode,
    updatedAt: Date.now(),
  }
}

const handleAIApplyGeneratedText = (payload: AIApplyPayload) => {
  const generatedText = (payload.generatedText || '').trim()
  if (!generatedText) return

  const tiptapEditor = editorStore.tipTapEditor
  const selectionContext = latestSelectionContext.value
  const requestedApplyMode = payload.applyMode || aiActionTrigger.value?.applyMode

  if (
    tiptapEditor &&
    selectionContext &&
    (requestedApplyMode === 'replace_selection' || requestedApplyMode === 'insert_after_selection')
  ) {
    try {
      const docSize = tiptapEditor.state.doc.content.size
      const from = Math.min(selectionContext.from, selectionContext.to)
      const to = Math.max(selectionContext.from, selectionContext.to)
      const latestSelectedText = tiptapEditor.state.doc.textBetween(from, to, '\n').trim()
      const selectionStillMatches =
        !selectionContext.text.trim() || latestSelectedText === selectionContext.text.trim()

      if (from >= 0 && to <= docSize && from <= to && selectionStillMatches) {
        const insertionDoc = JSON.parse(buildEditorContentFromPlainText(generatedText)) as {
          content?: unknown[]
        }
        const insertionContent =
          insertionDoc.content && insertionDoc.content.length > 0
            ? insertionDoc.content
            : [{ type: 'paragraph' }]

        if (requestedApplyMode === 'replace_selection') {
          tiptapEditor.chain().focus().insertContentAt({ from, to }, insertionContent).run()
        } else {
          tiptapEditor.chain().focus().insertContentAt(to, insertionContent).run()
        }

        const nextJson = JSON.stringify(tiptapEditor.getJSON())
        tipTapContent.value = nextJson
        editorStore.editorContent = nextJson
        latestSelectionContext.value = null
        writerStore.setSelectedText('')
        setAIApplyFeedback(
          'success',
          '已按选区回填',
          requestedApplyMode === 'insert_after_selection'
            ? 'AI 结果已插入到原选区后方。'
            : 'AI 结果已替换当前选区。',
          requestedApplyMode,
        )
        message.success('AI 结果已应用到当前选区')
        return
      }

      if (!selectionStillMatches) {
        setAIApplyFeedback(
          'fallback',
          '选区已失效，改为安全回填',
          '原选区内容已变化，系统改为按段落/全文模式写回，避免覆盖错误位置。',
          requestedApplyMode,
        )
        message.info('原选区内容已发生变化，已改为按整段结果安全回填。')
      }
    } catch (error) {
      console.warn(
        '[ProjectWorkspace] failed to apply AI result to selection, fallback to document mode:',
        error,
      )
      setAIApplyFeedback(
        'fallback',
        '定位选区失败，改为安全回填',
        '系统未能稳定定位原选区，已切换为文档级写回以避免内容损坏。',
        requestedApplyMode,
      )
    }
  }

  const sourceText = payload.sourceText || ''
  const currentEditorContent =
    tipTapContent.value || editorStore.editorContent || editorStore.content || ''
  const shouldReplaceWholeChapter =
    requestedApplyMode === 'replace_document' ||
    (!!sourceText.trim() && sourceText.trim() === currentChapterPlainText.value.trim())

  const nextEditorContent =
    requestedApplyMode === 'append_paragraph' ||
    payload.action === 'continue' ||
    payload.action === 'expand'
      ? appendPlainTextToEditorContent(currentEditorContent, generatedText)
      : shouldReplaceWholeChapter
        ? buildEditorContentFromPlainText(generatedText)
        : appendPlainTextToEditorContent(currentEditorContent, generatedText)

  tipTapContent.value = nextEditorContent
  editorStore.editorContent = nextEditorContent
  latestSelectionContext.value = null
  writerStore.setSelectedText('')
  setAIApplyFeedback(
    requestedApplyMode === 'replace_document' ? 'success' : 'fallback',
    requestedApplyMode === 'replace_document' ? '已整章替换' : '已按安全模式写回',
    requestedApplyMode === 'append_paragraph' ||
      payload.action === 'continue' ||
      payload.action === 'expand'
      ? 'AI 结果已追加为新的正文段落。'
      : requestedApplyMode === 'replace_document'
        ? 'AI 结果已完整替换当前章节正文。'
        : 'AI 结果已写回编辑器，但未直接覆盖原选区。',
    requestedApplyMode,
  )
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
    const shouldStayOnGlobalRelations =
      isEncyclopediaTool.value && encyclopediaSubView.value === 'relations' && !queryChapterId.value

    if (shouldStayOnGlobalRelations) {
      currentChapterId.value = ''
      return
    }

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
  background: #f8f9fa;
}

.workspace-editor-layout {
  flex: 1;
  min-height: 0;
}
</style>
