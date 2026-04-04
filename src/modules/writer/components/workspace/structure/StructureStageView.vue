<template>
  <section class="structure-stage-view">
    <!-- 顶部快速切换标签栏 - 现代化分段控制 -->
    <nav class="structure-stage-view__tabs" aria-label="结构舞台视图切换">
      <div class="tabs-group">
        <button
          v-for="option in viewModeOptions"
          :key="option.value"
          type="button"
          class="stage-tab"
          :class="{ 'is-active': stageViewMode === option.value }"
          @click="stageViewMode = option.value"
        >
          <QyIcon :name="option.icon" :size="14" class="stage-tab__icon" />
          <span class="stage-tab__label">{{ option.label }}</span>
        </button>
      </div>

      <div class="tabs-actions">
        <div
          class="structure-stage-view__status"
          :class="{ 'is-loading': isOutlineLoading, 'is-error': !!structureRefreshError }"
        >
          {{
            isOutlineLoading ? '正在同步结构...' : structureRefreshError ? '同步失败' : '结构已就绪'
          }}
        </div>
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

    <!-- 紧凑工具栏：搜索与筛选 -->
    <header class="structure-stage-view__toolbar">
      <div class="toolbar-left">
        <div class="structure-search">
          <QyIcon name="Search" :size="14" class="search-icon" />
          <input
            v-model.trim="filterText"
            type="text"
            class="structure-search__input"
            placeholder="搜索节点标题或描述"
          />
        </div>
        <div class="structure-filter-chips">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            class="structure-filter-chip"
            :class="{ 'is-active': activeFilter === option.value }"
            @click="activeFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <div class="mini-metrics">
          <div class="mini-metric" title="主干节点数">
            <span>主干</span><strong>{{ rootNodes.length }}</strong>
          </div>
          <div class="mini-metric" title="结构总数">
            <span>总计</span><strong>{{ flattenedNodes.length }}</strong>
          </div>
          <div class="mini-metric" title="当前筛选数">
            <span>命中</span><strong>{{ filteredFlattenedNodes.length }}</strong>
          </div>
          <div class="mini-metric highlight" title="当前章节">
            <span>当前</span><strong>{{ currentChapterTitle || '未选择' }}</strong>
          </div>
        </div>
      </div>
    </header>

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
      <div class="structure-stage-view__stage-column">
        <!-- 模式 1: 分叉总览 -->
        <section v-if="stageViewMode === 'overview'" class="structure-stage-view__branch-ribbon">
          <div class="structure-stage-view__branch-ribbon-header">
            <div>
              <p class="structure-stage-view__branch-eyebrow">Branch Ribbon</p>
              <h3>主线与分叉一眼对齐</h3>
            </div>
            <div class="structure-stage-view__branch-hint">
              先看每条主干的上下分支密度，再进入鱼骨图与节拍板细化。
            </div>
          </div>

          <div v-if="branchSpotlights.length" class="structure-stage-view__branch-cards">
            <button
              v-for="branch in branchSpotlights"
              :key="branch.id"
              type="button"
              class="structure-branch-card"
              :class="{ 'is-selected': selectedNodeId === branch.id }"
              @click="selectNode(branch.node)"
            >
              <span class="structure-branch-card__level">L{{ branch.level }}</span>
              <strong class="structure-branch-card__title">{{ branch.title }}</strong>
              <span class="structure-branch-card__meta">
                <span>{{ branch.branchCount }} 条分叉</span>
                <span>上支 {{ branch.topCount }}</span>
                <span>下支 {{ branch.bottomCount }}</span>
              </span>
              <span class="structure-branch-card__chips">
                <span class="structure-branch-card__chip">{{ branch.bindingLabel }}</span>
                <span class="structure-branch-card__chip" :class="`is-${branch.graphTone}`">{{
                  branch.graphLabel
                }}</span>
                <span v-if="branch.assetLabel" class="structure-branch-card__chip">{{
                  branch.assetLabel
                }}</span>
              </span>
            </button>
          </div>
          <div v-else class="structure-stage-view__branch-empty">
            {{
              isOutlineLoading
                ? '正在编排主干与分叉摘要…'
                : '还没有主干节点，先创建主线后再展开分叉。'
            }}
          </div>
        </section>

        <!-- 模式 2: 鱼骨聚焦 -->
        <FishboneOutlineBoard
          v-if="stageViewMode === 'fishbone'"
          :nodes="filteredRootNodes"
          :selected-node-id="selectedNodeId"
          :chapters="chapterOptions"
          :chapter-graphs="chapterGraphs"
          :asset-summary-by-chapter-id="assetSummaryByChapterId"
          :current-chapter-id="currentChapterId"
          :loading="isOutlineLoading"
          :can-move-up="canMoveNodeUp"
          :can-move-down="canMoveNodeDown"
          @select="selectNode"
          @edit-node="openEditNode"
          @move-up="moveNodeUp"
          @move-down="moveNodeDown"
          @create-child-node="openCreateChildForNode"
          @bind-current-chapter="bindCurrentChapterForNode"
          @unbind-chapter="unbindChapterForNode"
          @update-status="updateNodeStatus"
          @open-graph="emit('openGraph', $event)"
          @jump-to-chapter="emit('jumpToChapter', $event)"
        />

        <!-- 模式 3: 自由画布 -->
        <CanvasOutlineBoard
          v-if="stageViewMode === 'canvas'"
          :nodes="filteredRootNodes"
          :selected-node-id="selectedNodeId"
          :chapters="chapterOptions"
          :chapter-graphs="chapterGraphs"
          :asset-summary-by-chapter-id="assetSummaryByChapterId"
          :current-chapter-id="currentChapterId"
          :loading="isOutlineLoading"
          :can-move-up="canMoveNodeUp"
          :can-move-down="canMoveNodeDown"
          @select="selectNode"
          @edit-node="handleCanvasEditNode"
          @move-up="moveNodeUp"
          @move-down="moveNodeDown"
          @create-child-node="openCreateChildForNode"
          @delete-node="handleCanvasDeleteNode"
          @update-status="updateNodeStatus"
          @open-graph="emit('openGraph', $event)"
          @jump-to-chapter="emit('jumpToChapter', $event)"
        />

        <!-- 模式 4: 节拍卡片 -->
        <BeatBoardPanel
          v-if="stageViewMode === 'beats'"
          :beats="filteredFlattenedNodes"
          :selected-node-id="selectedNodeId"
          :chapters="chapterOptions"
          :chapter-graphs="chapterGraphs"
          :asset-summary-by-chapter-id="assetSummaryByChapterId"
          :current-chapter-id="currentChapterId"
          :loading="isOutlineLoading"
          :can-move-up="canMoveNodeUp"
          :can-move-down="canMoveNodeDown"
          @select="selectNode"
          @edit-node="openEditNode"
          @move-up="moveNodeUp"
          @move-down="moveNodeDown"
          @create-child-node="openCreateChildForNode"
          @bind-current-chapter="bindCurrentChapterForNode"
          @unbind-chapter="unbindChapterForNode"
          @update-status="updateNodeStatus"
          @open-graph="emit('openGraph', $event)"
          @jump-to-chapter="emit('jumpToChapter', $event)"
          @reorder="handleTreeReorder"
        />
      </div>

      <StructureInspectorPanel
        :selected-node="selectedNode"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :current-chapter-id="currentChapterId"
        :current-chapter-title="currentChapterTitle"
        :draft-binding-chapter-id="draftBindingChapterId"
        :bound-chapter="boundChapter"
        :loading="isOutlineLoading"
        @update:draft-binding-chapter-id="draftBindingChapterId = $event"
        @bind-current-chapter="bindNodeToChapter"
        @bind-chapter="bindNodeToChapter"
        @unbind-chapter="unbindNodeFromChapter"
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
import FishboneOutlineBoard from './FishboneOutlineBoard.vue'
import CanvasOutlineBoard from './CanvasOutlineBoard.vue'
import BeatBoardPanel from './BeatBoardPanel.vue'
import StructureInspectorPanel from './StructureInspectorPanel.vue'
import StructureNodeEditorDialog, {
  type StructureNodeFormValue,
} from './StructureNodeEditorDialog.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import {
  type StructureStatusValue,
  buildStructureNodeTags,
  findBoundChapter,
  getBoundChapterId,
  getStructureNodeGraphState,
  getStructureNodeLane,
  matchesStructureNodeGraphFilter,
  mapLevelToDocumentType,
} from './structureNodeTypes'

type StructureFilterMode =
  | 'all'
  | 'linked'
  | 'unlinked'
  | 'current-chapter'
  | 'asset-ready'
  | 'asset-missing'
  | 'draft'
  | 'writing'
  | 'completed'
  | 'graph-missing'
  | 'graph-ready'
  | 'graph-inherit'
type StageViewMode = 'overview' | 'fishbone' | 'canvas' | 'beats'

type TreeDropPosition = 'before' | 'after'

const props = withDefaults(
  defineProps<{
    projectId?: string
    chapters?: SidebarChapterSummary[]
    currentChapterId?: string
    currentChapterTitle?: string
  }>(),
  {
    projectId: '',
    chapters: () => [],
    currentChapterId: '',
    currentChapterTitle: '',
  },
)

// 本地状态管理
const writerStore = useWriterStore()
const expandedNodeIds = ref<string[]>([])
const selectedNodeId = ref('')

// 本地计算属性
const rootNodes = computed<OutlineNode[]>(() => writerStore.outline.tree || [])

// 本地计算属性（基于过滤后的树，用于舞台视图）
const filteredRootNodes = computed<OutlineNode[]>(() => filterOutlineTree(rootNodes.value))
const filteredFlattenedNodes = computed<OutlineNode[]>(() => {
  const list: OutlineNode[] = []
  const walk = (nodes: OutlineNode[]) => {
    for (const node of nodes) {
      list.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(filteredRootNodes.value)
  return list
})

// 未过滤的扁平化节点（用于节点排序等操作）
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
const filterText = ref('')
const activeFilter = ref<StructureFilterMode>('all')
const stageViewMode = ref<StageViewMode>('overview')
const viewModeOptions: Array<{ value: StageViewMode; label: string; icon: string }> = [
  { value: 'overview', label: '分叉总览', icon: 'Connection' },
  { value: 'fishbone', label: '鱼骨聚焦', icon: 'Workflow' },
  { value: 'canvas', label: '自由画布', icon: 'Grid' },
  { value: 'beats', label: '节拍卡片', icon: 'Card' },
]
const draftBindingChapterId = ref('')
const structureRefreshError = ref('')
const assetRefState = ref<WriterAssetRefState>({
  chapterRefs: {},
  volumeRefs: {},
})
const emit = defineEmits<{
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
const filterOptions: Array<{ value: StructureFilterMode; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'linked', label: '已绑定' },
  { value: 'unlinked', label: '待绑定' },
  { value: 'current-chapter', label: '当前章节' },
  { value: 'asset-ready', label: '资产已就绪' },
  { value: 'asset-missing', label: '资产待补' },
  { value: 'graph-missing', label: '待建图谱' },
  { value: 'graph-ready', label: '已建图谱' },
  { value: 'graph-inherit', label: '继承图谱' },
  { value: 'draft', label: '草稿' },
  { value: 'writing', label: '推进中' },
  { value: 'completed', label: '已完成' },
]

const branchSpotlights = computed(() =>
  filteredRootNodes.value.map((node) => {
    const children = node.children || []
    const topCount = children.filter((_, index) => index % 2 === 0).length
    const bottomCount = children.length - topCount
    const branchCount = children.length
    const chapterId = getBoundChapterId(node)
    const assetSummary = chapterId ? assetSummaryByChapterId.value[chapterId] : undefined
    const graphState = getStructureNodeGraphState(node, chapterGraphs.value)
    return {
      id: node.id,
      node,
      title: node.title || '未命名节点',
      level: node.level || 1,
      topCount,
      bottomCount,
      branchCount,
      bindingLabel: findBoundChapter(node, chapterOptions.value)?.title || '未绑定章节',
      graphLabel: graphState.label,
      graphTone: graphState.tone,
      assetLabel: assetSummary?.total ? `资产 ${assetSummary.total}` : '',
    }
  }),
)
const selectedNode = computed(
  () => filteredFlattenedNodes.value.find((node) => node.id === selectedNodeId.value) || null,
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

function matchesNodeFilter(node: OutlineNode): boolean {
  const normalizedQuery = filterText.value.trim().toLowerCase()
  const matchesQuery =
    !normalizedQuery ||
    node.title?.toLowerCase().includes(normalizedQuery) ||
    node.description?.toLowerCase().includes(normalizedQuery)

  if (!matchesQuery) return false

  if (activeFilter.value === 'linked') return !!getBoundChapterId(node)
  if (activeFilter.value === 'unlinked') return !getBoundChapterId(node)
  if (activeFilter.value === 'current-chapter') {
    return !!props.currentChapterId && getBoundChapterId(node) === props.currentChapterId
  }
  if (activeFilter.value === 'asset-ready') {
    const chapterId = getBoundChapterId(node)
    return !!chapterId && (assetSummaryByChapterId.value[chapterId]?.total || 0) > 0
  }
  if (activeFilter.value === 'asset-missing') {
    const chapterId = getBoundChapterId(node)
    return !chapterId || (assetSummaryByChapterId.value[chapterId]?.total || 0) === 0
  }
  if (activeFilter.value === 'graph-missing') {
    return matchesStructureNodeGraphFilter(node, chapterGraphs.value, 'missing')
  }
  if (activeFilter.value === 'graph-ready') {
    return matchesStructureNodeGraphFilter(node, chapterGraphs.value, 'graphed')
  }
  if (activeFilter.value === 'graph-inherit') {
    return matchesStructureNodeGraphFilter(node, chapterGraphs.value, 'inherit')
  }
  if (activeFilter.value === 'draft') return getStructureNodeLane(node) === 'draft'
  if (activeFilter.value === 'writing') return getStructureNodeLane(node) === 'writing'
  if (activeFilter.value === 'completed') return getStructureNodeLane(node) === 'completed'
  return true
}

function filterOutlineTree(nodes: OutlineNode[]): OutlineNode[] {
  return nodes.reduce<OutlineNode[]>((result, node) => {
    const filteredChildren = filterOutlineTree(node.children || [])
    if (matchesNodeFilter(node) || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
      })
    }
    return result
  }, [])
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

function openEditNode(node: OutlineNode) {
  selectNode(node)
  editorMode.value = 'edit'
  editorForm.value = {
    title: node.title || '',
    level: node.level || 1,
    status: node.status === 'completed' || node.status === 'writing' ? node.status : 'planned',
    description: node.description || '',
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
    tags: buildStructureNodeTags(node, ''),
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
    tags: buildStructureNodeTags(node, chapterId),
  })

  selectNode(node)
  draftBindingChapterId.value = chapterId
  await handleRefresh()
  const chapter = chapterOptions.value.find((item) => item.id === chapterId)
  message.success(chapter ? `已绑定到章节「${chapter.title}」` : '章节绑定已更新')
}

async function bindCurrentChapterForNode(node: OutlineNode) {
  if (!props.currentChapterId) return

  // 只有 volume 类型的大纲节点才能自动映射到章节
  const nodeWithType = node as OutlineNode & { type?: string }
  if (nodeWithType.type && nodeWithType.type !== 'volume') {
    message.warning('只有卷级别的大纲节点才能绑定章节')
    return
  }

  await bindChapterForNode(node, props.currentChapterId)
}

async function updateNodeStatus(node: OutlineNode, status: StructureStatusValue) {
  if (!effectiveProjectId.value) return
  if ((node.status || 'planned') === status) return

  await writerStore.updateOutlineNode(node.id, effectiveProjectId.value, {
    title: node.title,
    status: status === 'planned' ? DocumentStatus.PLANNED : status,
    notes: (node as OutlineNode & { notes?: string }).notes,
    tags: (node as OutlineNode & { tags?: string[] }).tags,
  })

  selectNode(node)
  await handleRefresh()
  message.success(
    `结构节点已切换为「${status === 'planned' ? '草稿' : status === 'writing' ? '写作中' : '已完成'}」`,
  )
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

/**
 * 画布编辑节点：双击改名时，直接更新标题（不走编辑弹窗）
 */
async function handleCanvasEditNode(node: OutlineNode) {
  if (!effectiveProjectId.value) return
  // 画布双击编辑时，打开编辑弹窗以保留完整表单能力
  openEditNode(node)
}

/**
 * 画布删除节点
 */
async function handleCanvasDeleteNode(node: OutlineNode) {
  if (!effectiveProjectId.value) return
  await messageBox.confirm(`确定删除结构节点"${node.title}"吗？`, '删除节点', {
    type: 'warning',
  })
  await writerStore.deleteOutlineNode(node.id, effectiveProjectId.value)
  if (selectedNodeId.value === node.id) {
    selectedNodeId.value = ''
    draftBindingChapterId.value = ''
  }
  message.success('结构节点已删除')
}

async function handleRefresh() {
  if (!effectiveProjectId.value) return
  structureRefreshError.value = ''
  try {
    await writerStore.loadOutlineTree(effectiveProjectId.value)
    assetRefState.value = loadWriterAssetRefState(effectiveProjectId.value)
    expandRootNodes()
    if (!selectedNodeId.value && filteredRootNodes.value.length > 0) {
      selectNode(filteredRootNodes.value[0])
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

watch(
  () => [
    filterText.value,
    activeFilter.value,
    filteredFlattenedNodes.value.map((node) => node.id).join('|'),
  ],
  () => {
    if (
      selectedNodeId.value &&
      filteredFlattenedNodes.value.some((node) => node.id === selectedNodeId.value)
    ) {
      return
    }

    const firstNode = filteredFlattenedNodes.value[0]
    if (firstNode) {
      selectNode(firstNode)
      return
    }

    selectedNodeId.value = ''
    draftBindingChapterId.value = ''
    writerStore.setCurrentOutlineNode(null)
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
/* ==========================================================================
   结构舞台主容器 - 采用现代毛玻璃设计与分层 Flex 布局
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

/* 1. 顶部现代化分段导航栏 (Segmented Control) */
.structure-stage-view__tabs {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--editor-bg-surface, #f8fafc);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  margin: 0 4px;
}

.tabs-group {
  display: flex;
  gap: 2px;
  background: var(--editor-bg-elevated, #f1f5f9);
  padding: 4px;
  border-radius: var(--editor-radius-md, 6px);
  border: 1px solid var(--editor-border, #e2e8f0);
}

.stage-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  border-radius: var(--editor-radius-md, 6px);
  border: 1px solid transparent;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  .stage-tab__icon {
    opacity: 0.5;
    transition: all 0.25s;
    filter: grayscale(1);
    color: currentColor;
  }

  &:hover {
    color: var(--editor-text-secondary, #334155);
    background: var(--editor-bg-elevated, #f1f5f9);

    .stage-tab__icon {
      opacity: 0.8;
      filter: grayscale(0);
      transform: scale(1.1);
    }
  }

  &.is-active {
    background: var(--editor-bg-base, #ffffff);
    color: var(--editor-accent, #06b6d4);
    border-color: var(--editor-accent-soft-border, #a5f3fc);
    box-shadow: none;

    .stage-tab__icon {
      opacity: 1;
      filter: grayscale(0);
    }

    .stage-tab__label {
      font-weight: 700;
    }
  }
}

.tabs-actions {
  display: flex;
  align-items: center;
  gap: 16px;
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

/* 2. 紧凑工具栏 (搜索 & 指标) */
.structure-stage-view__toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.structure-search {
  position: relative;
  width: 260px;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #a39589;
  }

  .structure-search__input {
    width: 100%;
    height: 36px;
    padding: 0 12px 0 38px;
    border-radius: 12px;
    border: 1px solid rgba(143, 63, 47, 0.1);
    background: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      background: white;
      border-color: var(--structure-warm);
      box-shadow: 0 0 0 3px rgba(143, 63, 47, 0.08);
    }
  }
}

.structure-filter-chips {
  display: flex;
  gap: 8px;
}

.structure-filter-chip {
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(143, 63, 47, 0.04);
  color: #746b64;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(143, 63, 47, 0.08);
  }

  &.is-active {
    background: rgba(143, 63, 47, 0.1);
    color: var(--structure-warm);
    border-color: rgba(143, 63, 47, 0.2);
  }
}

.mini-metrics {
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.5);
  padding: 6px 16px;
  border-radius: 12px;
  border: 1px solid rgba(143, 63, 47, 0.08);
}

.mini-metric {
  display: flex;
  flex-direction: column;
  line-height: 1.3;

  span {
    font-size: 10px;
    color: #a39589;
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    font-size: 14px;
    color: #4e443c;
    font-weight: 700;
  }

  &.highlight strong {
    color: var(--structure-warm);
  }
}

/* 3. 双栏网格布局容器（树已移至侧边栏） */
.structure-stage-view__grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-areas: 'stage inspector';
  gap: 16px;
  padding: 0 4px 4px;
}

.structure-stage-view__grid > * {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-surface, #f8fafc);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  overflow: hidden;
}

.structure-stage-view__stage-column {
  grid-area: stage;
  background: transparent;
  border: none;
  gap: 16px;
}

/* 4. 具体视图样式 (分叉总览/鱼骨/节拍) */
.structure-stage-view__branch-ribbon,
:deep(.fishbone-outline-board),
:deep(.beat-board-panel) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-base, #ffffff);
  border-radius: var(--editor-radius-lg, 8px);
  border: 1px solid var(--editor-border, #e2e8f0);
  overflow: hidden;
}

/* 5. 分叉总览 (Branch Ribbon) 卡片流样式 */
.structure-stage-view__branch-ribbon {
  padding: 24px;
}

.structure-stage-view__branch-ribbon-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.structure-stage-view__branch-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: var(--structure-warm);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.structure-stage-view__branch-ribbon-header h3 {
  margin: 6px 0;
  font-size: 24px;
  font-weight: 800;
  color: #2e2b27;
}

.structure-stage-view__branch-hint {
  font-size: 14px;
  color: #8a7e74;
  line-height: 1.6;
}

.structure-stage-view__branch-cards {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(143, 63, 47, 0.1);
    border-radius: 4px;
  }
}

.structure-branch-card {
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(143, 63, 47, 0.1);
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(143, 63, 47, 0.1);
    border-color: rgba(143, 63, 47, 0.2);
  }

  &.is-selected {
    background: rgba(143, 63, 47, 0.03);
    border-color: var(--structure-warm);
    box-shadow: 0 8px 24px rgba(143, 63, 47, 0.12);
  }
}

.structure-branch-card__level {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(50, 83, 106, 0.08);
  color: #32536a;
  font-size: 11px;
  font-weight: 800;
}

.structure-branch-card__title {
  color: #2b2926;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
}

.structure-branch-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    font-size: 12px;
    color: #6f6257;
    background: #f5efe7;
    border-radius: 999px;
    padding: 4px 10px;
  }
}

.structure-branch-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.structure-branch-card__chip {
  font-size: 11px;
  color: #65574d;
  border-radius: 999px;
  border: 1px solid rgba(117, 93, 67, 0.12);
  background: rgba(255, 251, 247, 0.88);
  padding: 4px 10px;
}

.structure-branch-card__chip.is-ready {
  color: #1f6a43;
  background: #eaf7ef;
  border-color: rgba(31, 106, 67, 0.16);
}

.structure-branch-card__chip.is-inherit {
  color: #32536a;
  background: #eaf1f6;
  border-color: rgba(50, 83, 106, 0.16);
}

.structure-branch-card__chip.is-missing {
  color: #8f3f2f;
  background: #fff2e7;
  border-color: rgba(143, 63, 47, 0.16);
}

.structure-stage-view__branch-empty {
  border-radius: 18px;
  border: 2px dashed rgba(143, 63, 47, 0.15);
  background: rgba(255, 251, 247, 0.6);
  padding: 32px;
  color: #8a7e74;
  font-size: 15px;
  text-align: center;
}

/* 子组件特殊覆盖 */
:deep(.structure-inspector-panel) {
  grid-area: inspector;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

@media (max-width: 1380px) {
  .structure-stage-view__grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'stage'
      'inspector';
  }
}

@media (max-width: 1024px) {
  .structure-stage-view__grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'stage'
      'inspector';
  }

  .structure-stage-view__tabs {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .tabs-group {
    justify-content: center;
  }

  .tabs-actions {
    justify-content: space-between;
  }
}
</style>
