<template>
  <section class="structure-stage-view">
    <!-- 顶部状态栏 -->
    <nav class="structure-stage-view__header" aria-label="结构舞台">
      <div class="header-left">
        <div>
          <p class="structure-stage-view__eyebrow">Structure Tree</p>
          <h3 class="structure-stage-view__title">结构树</h3>
        </div>
        <div
          class="structure-stage-view__status"
          :class="{ 'is-loading': isOutlineLoading, 'is-error': !!structureRefreshError }"
        >
          {{
            isOutlineLoading ? '正在同步结构...' : structureRefreshError ? '同步失败' : '结构已就绪'
          }}
        </div>
      </div>
      <div class="header-actions">
        <button
          type="button"
          class="refresh-action"
          :disabled="isOutlineLoading"
          @click="handleRefresh"
        >
          <QyIcon :name="isOutlineLoading ? 'Loading' : 'Refresh'" :size="14" />
          <span>{{ isOutlineLoading ? '加载中' : '刷新' }}</span>
        </button>
      </div>
    </nav>

    <section v-if="structureRefreshError" class="structure-stage-view__error-card">
      <div>
        <p class="structure-stage-view__error-eyebrow">Structure Sync</p>
        <h3>结构数据暂时未同步成功</h3>
        <p>{{ structureRefreshError }}</p>
      </div>
      <button
        type="button"
        class="refresh-action"
        :disabled="isOutlineLoading"
        @click="handleRefresh"
      >
        重新加载
      </button>
    </section>

    <div class="structure-stage-view__grid">
      <div class="structure-stage-view__tree-column">
        <!-- 大纲树面板 -->
        <OutlineTreePanel
          :nodes="rootNodes"
          :selected-node-id="selectedNodeId"
          :expanded-node-ids="expandedNodeIds"
          :chapters="chapterOptions"
          :chapter-graphs="chapterGraphs"
          :asset-summary-by-chapter-id="assetSummaryByChapterId"
          :current-chapter-id="currentChapterId"
          :loading="isOutlineLoading"
          :can-move-up="selectedNode ? canMoveNodeUp(selectedNode) : false"
          :can-move-down="selectedNode ? canMoveNodeDown(selectedNode) : false"
          @toggle="handleToggleNode"
          @select="selectNode"
          @open-graph="emit('openGraph', $event)"
          @create-root="openCreateRoot"
          @create-child="openCreateChild"
          @move-up="(node: OutlineNode) => moveNodeUp(node)"
          @move-down="(node: OutlineNode) => moveNodeDown(node)"
          @edit-selected="handleEditSelected"
          @delete-selected="handleDeleteSelected"
          @reorder="handleTreeReorder"
          @bind-chapter="(chapterId: string) => handleBindChapterFromMenu(chapterId)"
          @unbind-chapter="() => handleUnbindChapterFromMenu()"
        />
      </div>

      <StructureInspectorPanel
        :selected-node="selectedNode"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :workflow-context="workflowContext"
        :active-entities="activeEntities"
        :current-chapter-id="currentChapterId"
        :current-chapter-title="currentChapterTitle"
        :draft-binding-chapter-id="draftBindingChapterId"
        :bound-chapter="boundChapter"
        :loading="isOutlineLoading"
        @update:draft-binding-chapter-id="draftBindingChapterId = $event"
        @bind-current-chapter="bindNodeToChapter"
        @bind-chapter="bindNodeToChapter"
        @unbind-chapter="unbindNodeFromChapter"
        @trigger-ai-action="emit('trigger-ai-action', $event)"
        @open-graph="emit('openGraph', $event)"
        @jump-to-chapter="emit('jumpToChapter', $event)"
      />
    </div>

    <StructureNodeEditorDialog
      v-model:visible="editorVisible"
      :mode="editorMode"
      :initial-value="editorForm"
      :submitting="editorSubmitting"
      @submit="submitNodeEditor"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { loadCharacterGraphDraftState } from '@/modules/writer/utils/characterGraphDrafts'
import {
  loadWriterAssetRefState,
  summarizeWriterAssetRefs,
  type WriterAssetRefState,
  type WriterAssetSummary,
} from '@/modules/writer/utils/writerAssetRefs'
import { DocumentStatus } from '@/modules/writer/types/document'
import type { OutlineNode } from '@/types/writer'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ActiveEntitySummary } from '@/modules/writer/composables/useWorkflowContext'
import type {
  WriterWorkflowActionRequest,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import OutlineTreePanel from './OutlineTreePanel.vue'
import StructureInspectorPanel from './StructureInspectorPanel.vue'
import StructureNodeEditorDialog, {
  type StructureNodeFormValue,
} from './StructureNodeEditorDialog.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import {
  findBoundChapter,
  getBoundChapterId,
  mapLevelToDocumentType,
} from './structureNodeTypes'

type TreeDropPosition = 'before' | 'after'

const props = withDefaults(
  defineProps<{
    projectId?: string
    chapters?: SidebarChapterSummary[]
    currentChapterId?: string
    currentChapterTitle?: string
    workflowContext?: WriterWorkflowContext
    activeEntities?: ActiveEntitySummary[]
  }>(),
  {
    projectId: '',
    chapters: () => [],
    currentChapterId: '',
    currentChapterTitle: '',
    workflowContext: undefined,
    activeEntities: () => [],
  },
)

// 本地状态管理
const writerStore = useWriterStore()
const expandedNodeIds = ref<string[]>([])
const selectedNodeId = ref('')

// 本地计算属性
const rootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])

// 扁平化节点（用于节点排序等操作）
const flattenedNodes = computed<OutlineNode[]>(() => {
  const list: OutlineNode[] = []
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      list.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(rootNodes.value)
  return list
})

const editorVisible = ref(false)
const editorSubmitting = ref(false)
const editorMode = ref<'create-root' | 'create-child' | 'edit'>('create-root')
const editorForm = ref<StructureNodeFormValue>({
  title: '',
  level: 1,
  status: 'planned',
  description: '',
})
const draftBindingChapterId = ref('')
const structureRefreshError = ref('')
const assetRefState = ref<WriterAssetRefState>({
  chapterRefs: {},
  volumeRefs: {},
})
const emit = defineEmits<{
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'jumpToChapter', chapterId: string): void
  (e: 'openGraph', chapterId: string): void
}>()

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const isOutlineLoading = computed(() => writerStore.outline.loading)
const chapterOptions = computed(() =>
  props.chapters.filter((chapter) => chapter.nodeType !== 'directory'),
)
const graphDraftState = computed(() => loadCharacterGraphDraftState(effectiveProjectId.value))
const chapterGraphs = computed(() => graphDraftState.value.chapterGraphs)
const assetSummaryByChapterId = computed<Record<string, WriterAssetSummary>>(() => {
  const summaries: Record<string, WriterAssetSummary> = {}

  for (const chapter of chapterOptions.value) {
    const chapterRefs = assetRefState.value.chapterRefs[chapter.id] || []
    const volumeRefs = chapter.parentId
      ? assetRefState.value.volumeRefs[chapter.parentId] || []
      : []
    const merged = [...chapterRefs]
    const seen = new Set(
      chapterRefs.map((ref) => `${ref.assetType}:${ref.assetId || ref.assetName}`),
    )

    for (const ref of volumeRefs) {
      const key = `${ref.assetType}:${ref.assetId || ref.assetName}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(ref)
    }

    summaries[chapter.id] = summarizeWriterAssetRefs(merged)
  }

  return summaries
})

const selectedNode = computed(
  () => flattenedNodes.value.find((node) => node.id === selectedNodeId.value) || null,
)
const boundChapter = computed(() => findBoundChapter(selectedNode.value, chapterOptions.value))

function getNodeSiblingContext(node: OutlineNode | null | undefined) {
  if (!node) {
    return { siblings: [] as OutlineNode[], index: -1 }
  }

  const siblings = node.parentId
    ? flattenedNodes.value.find((item) => item.id === node.parentId)?.children || []
    : rootNodes.value
  const orderedSiblings = [...siblings].sort(
    (left, right) => (left.order ?? 0) - (right.order ?? 0),
  )

  return {
    siblings: orderedSiblings,
    index: orderedSiblings.findIndex((item) => item.id === node.id),
  }
}

function expandRootNodes() {
  expandedNodeIds.value = rootNodes.value.map((node) => node.id)
}

function handleToggleNode(nodeId: string) {
  const index = expandedNodeIds.value.indexOf(nodeId)
  if (index >= 0) {
    expandedNodeIds.value.splice(index, 1)
  } else {
    expandedNodeIds.value.push(nodeId)
  }
}

function openCreateRoot() {
  editorMode.value = 'create-root'
  editorForm.value = {
    title: '',
    level: 1,
    status: 'planned',
    description: '',
  }
  editorVisible.value = true
}

function openCreateChild() {
  if (!selectedNode.value) return
  openCreateChildForNode(selectedNode.value)
}

function handleEditSelected(_data: any) {
  if (!selectedNode.value) return
  // 编辑模式：更新节点
  editorVisible.value = false
  // 编辑逻辑已在 submitNodeEditor 中处理
}

function handleDeleteSelected() {
  if (!selectedNode.value) return
  messageBox.confirm(`确定删除结构节点"${selectedNode.value.title}"吗？`, '删除节点', {
    type: 'warning',
  }).then(() => {
    if (!effectiveProjectId.value || !selectedNode.value) return
    writerStore.deleteOutlineNode(selectedNode.value.id, effectiveProjectId.value)
    if (selectedNodeId.value === selectedNode.value.id) {
      selectedNodeId.value = ''
      draftBindingChapterId.value = ''
    }
    message.success('结构节点已删除')
    handleRefresh()
  })
}

async function handleBindChapterFromMenu(chapterId: string) {
  if (!selectedNode.value) return
  await bindChapterForNode(selectedNode.value, chapterId)
}

async function handleUnbindChapterFromMenu() {
  if (!selectedNode.value) return
  await unbindChapterForNode(selectedNode.value)
}

function selectNode(node: OutlineNode) {
  selectedNodeId.value = node.id
  draftBindingChapterId.value = getBoundChapterId(node)
  writerStore.setCurrentOutlineNode(node)
}

function openCreateChildForNode(node: OutlineNode) {
  selectNode(node)
  editorMode.value = 'create-child'
  editorForm.value = {
    title: '',
    level: Math.min((node.level || 1) + 1, 3),
    status: 'planned',
    description: '',
  }
  editorVisible.value = true
}

function canMoveNodeUp(node: OutlineNode): boolean {
  return getNodeSiblingContext(node).index > 0
}

function canMoveNodeDown(node: OutlineNode): boolean {
  const { siblings, index } = getNodeSiblingContext(node)
  return index >= 0 && index < siblings.length - 1
}

async function moveNode(node: OutlineNode, direction: 'up' | 'down') {
  if (!effectiveProjectId.value) return

  const { siblings, index } = getNodeSiblingContext(node)
  if (index < 0) return

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= siblings.length) return

  const targetNode = siblings[targetIndex]
  if (!targetNode) return

  await writerStore.moveOutlineNode(node.id, effectiveProjectId.value, {
    parentId: node.parentId,
    order: targetNode.order,
  })

  selectNode(node)
  await handleRefresh()
  message.success(direction === 'up' ? '结构节点已上移' : '结构节点已下移')
}

async function reorderNodeToSiblingPosition(
  node: OutlineNode,
  targetNode: OutlineNode,
  position: TreeDropPosition,
) {
  if (!effectiveProjectId.value || node.id === targetNode.id) return
  if ((node.parentId || '') !== (targetNode.parentId || '')) return

  const siblingContext = getNodeSiblingContext(targetNode)
  const remainingSiblings = siblingContext.siblings.filter((item) => item.id !== node.id)
  const targetIndex = remainingSiblings.findIndex((item) => item.id === targetNode.id)
  if (targetIndex < 0) return

  const destinationIndex = position === 'before' ? targetIndex : targetIndex + 1

  await writerStore.moveOutlineNode(node.id, effectiveProjectId.value, {
    parentId: node.parentId,
    order: destinationIndex,
  })

  await handleRefresh()
  const refreshedNode = flattenedNodes.value.find((item) => item.id === node.id)
  if (refreshedNode) {
    selectNode(refreshedNode)
  }
  message.success(position === 'before' ? '结构节点已拖拽到目标前' : '结构节点已拖拽到目标后')
}

async function moveNodeUp(node: OutlineNode) {
  await moveNode(node, 'up')
}

async function moveNodeDown(node: OutlineNode) {
  await moveNode(node, 'down')
}

async function handleTreeReorder(payload: {
  draggedNodeId: string
  targetNodeId: string
  position: TreeDropPosition
}) {
  const draggedNode = flattenedNodes.value.find((node) => node.id === payload.draggedNodeId)
  const targetNode = flattenedNodes.value.find((node) => node.id === payload.targetNodeId)
  if (!draggedNode || !targetNode) return

  await reorderNodeToSiblingPosition(draggedNode, targetNode, payload.position)
}

async function bindNodeToChapter(chapterId: string) {
  if (!selectedNode.value) return
  await bindChapterForNode(selectedNode.value, chapterId)
}

async function unbindNodeFromChapter() {
  if (!selectedNode.value || !effectiveProjectId.value) return
  await unbindChapterForNode(selectedNode.value)
}

async function unbindChapterForNode(node: OutlineNode) {
  if (!effectiveProjectId.value) return

  await writerStore.updateOutlineNode(node.id, effectiveProjectId.value, {
    title: node.title,
    status:
      node.status === 'completed' || node.status === 'writing'
        ? node.status
        : DocumentStatus.PLANNED,
    notes: (node as OutlineNode & { notes?: string }).notes,
    tags: [],
    documentId: '',
  })

  selectNode(node)
  draftBindingChapterId.value = ''
  await handleRefresh()
  message.success('章节绑定已解除')
}

async function bindChapterForNode(node: OutlineNode, chapterId: string) {
  if (!effectiveProjectId.value) return

  // 只有 volume 类型的大纲节点才能自动映射到章节
  const nodeWithType = node as OutlineNode & { type?: string }
  if (nodeWithType.type && nodeWithType.type !== 'volume') {
    message.warning('只有卷级别的大纲节点才能绑定章节')
    return
  }

  await writerStore.updateOutlineNode(node.id, effectiveProjectId.value, {
    title: node.title,
    status:
      node.status === 'completed' || node.status === 'writing'
        ? node.status
        : DocumentStatus.PLANNED,
    notes: (node as OutlineNode & { notes?: string }).notes,
    tags: [],
    documentId: chapterId,
  })

  selectNode(node)
  draftBindingChapterId.value = chapterId
  await handleRefresh()
  const chapter = chapterOptions.value.find((item) => item.id === chapterId)
  message.success(chapter ? `已绑定到章节「${chapter.title}」` : '章节绑定已更新')
}

async function submitNodeEditor(value: StructureNodeFormValue) {
  if (!effectiveProjectId.value) {
    message.warning('当前没有可用项目')
    return
  }
  if (!value.title) {
    message.warning('请输入节点标题')
    return
  }

  editorSubmitting.value = true
  try {
    if (editorMode.value === 'edit' && selectedNode.value) {
      await writerStore.updateOutlineNode(selectedNode.value.id, effectiveProjectId.value, {
        title: value.title,
        status: value.status === 'planned' ? DocumentStatus.PLANNED : value.status,
        notes: value.description,
      })
      message.success('结构节点已更新')
    } else {
      await writerStore.createOutlineNode(effectiveProjectId.value, {
        parentId: editorMode.value === 'create-child' ? selectedNode.value?.id : undefined,
        title: value.title,
        type: mapLevelToDocumentType(value.level),
        order: flattenedNodes.value.length,
      })
      message.success(editorMode.value === 'create-child' ? '子节点已创建' : '主干节点已创建')
    }

    editorVisible.value = false
    await handleRefresh()
  } finally {
    editorSubmitting.value = false
  }
}

async function handleRefresh() {
  if (!effectiveProjectId.value) return
  structureRefreshError.value = ''
  try {
    await writerStore.loadOutlineTree(effectiveProjectId.value)
    assetRefState.value = loadWriterAssetRefState(effectiveProjectId.value)
    expandRootNodes()
    if (!selectedNodeId.value && rootNodes.value.length > 0) {
      selectNode(rootNodes.value[0])
    }
  } catch (error) {
    const fallbackMessage =
      error instanceof Error ? error.message : writerStore.error || '结构数据加载失败，请稍后重试'
    structureRefreshError.value = fallbackMessage
    message.error(fallbackMessage)
  }
}

watch(
  () => effectiveProjectId.value,
  async (projectId) => {
    if (!projectId) return
    await handleRefresh()
  },
  { immediate: true },
)

watch(
  () => selectedNode.value?.id,
  () => {
    draftBindingChapterId.value = getBoundChapterId(selectedNode.value)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
/* ==========================================================================
   结构舞台主容器 - 极简设计
   ========================================================================== */
.structure-stage-view {
  --structure-warm: #8f3f2f;
  --structure-accent: #32536a;

  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  position: relative;
  background: transparent;
}

/* 1. 顶部简化导航栏 */
.structure-stage-view__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--editor-bg-surface, #f8fafc);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  margin: 0 4px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.structure-stage-view__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--editor-accent);
  font-weight: 800;
}

.structure-stage-view__title {
  margin: 4px 0 0;
  font-size: 18px;
  color: var(--editor-text-primary);
  font-weight: 700;
}

.structure-stage-view__status {
  font-size: 12px;
  color: #8a7e74;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #52c41a;
    box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
  }

  &.is-loading {
    color: var(--structure-accent);

    &::before {
      background: #1890ff;
      animation: pulse 1.5s infinite;
      box-shadow: 0 0 8px rgba(24, 144, 255, 0.4);
    }
  }

  &.is-error {
    color: var(--structure-warm);

    &::before {
      background: #ff4d4f;
      box-shadow: 0 0 8px rgba(255, 77, 79, 0.4);
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid rgba(143, 63, 47, 0.1);
  background: white;
  color: #5f4e40;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #fffcf9;
    border-color: var(--structure-warm);
    color: var(--structure-warm);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(143, 63, 47, 0.06);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 2. 错误卡片 */
.structure-stage-view__error-card {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff2e7;
  border: 1px solid rgba(143, 63, 47, 0.2);
  border-radius: var(--editor-radius-lg, 8px);
  margin: 0 4px;
  gap: 16px;
}

.structure-stage-view__error-eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  color: var(--structure-warm);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.structure-stage-view__error-card h3 {
  margin: 6px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--structure-warm);
}

.structure-stage-view__error-card p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8a7e74;
}

/* 3. 双栏网格布局容器 */
.structure-stage-view__grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-areas: 'tree inspector';
  gap: 16px;
  padding: 0 4px 4px;
}

.structure-stage-view__grid > * {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.structure-stage-view__tree-column {
  grid-area: tree;
  background: transparent;
  border: none;
  overflow: hidden;
}

/* 子组件特殊覆盖 */
:deep(.structure-inspector-panel) {
  grid-area: inspector;
  background: var(--editor-bg-surface, #f8fafc) !important;
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0) !important;
}

@media (max-width: 1380px) {
  .structure-stage-view__grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'tree'
      'inspector';
  }
}

@media (max-width: 1024px) {
  .structure-stage-view__header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-left {
    justify-content: space-between;
  }

  .header-actions {
    justify-content: flex-end;
  }
}
</style>
