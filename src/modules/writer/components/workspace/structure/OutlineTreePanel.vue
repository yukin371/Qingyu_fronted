<template>
  <section class="outline-tree-panel">
    <div class="outline-tree-panel__header">
      <div>
        <p class="outline-tree-panel__eyebrow">Outline Tree</p>
        <h3 class="outline-tree-panel__title">结构树</h3>
      </div>
      <div class="outline-tree-panel__header-side">
        <div class="outline-tree-panel__count">{{ flattenedCount }} 节点</div>
        <div class="outline-tree-panel__hint">支持同级拖拽排序</div>
        <div class="outline-tree-panel__actions">
          <button type="button" class="outline-action outline-action--primary" @click="emit('createRoot')">新增主干</button>
          <button type="button" class="outline-action" :disabled="!selectedNodeId" @click="emit('createChild')">新增子节点</button>
          <button type="button" class="outline-action" :disabled="!canMoveUp" @click="emit('moveUp')">上移</button>
          <button type="button" class="outline-action" :disabled="!canMoveDown" @click="emit('moveDown')">下移</button>
          <button type="button" class="outline-action" :disabled="!selectedNodeId" @click="handleEdit">编辑</button>
          <button type="button" class="outline-action outline-action--danger" :disabled="!selectedNodeId" @click="handleDelete">删除</button>
        </div>
      </div>
    </div>

    <div class="outline-tree-panel__body">
      <div v-if="nodes.length" class="outline-tree-panel__tree">
        <OutlineTreeRow
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :selected-node-id="selectedNodeId"
          :expanded-node-ids="expandedNodeIds"
          :chapters="chapters"
          :current-chapter-id="currentChapterId"
          :dragging-node-id="dragState.draggingNodeId"
          :drop-target-node-id="dragState.targetNodeId"
          :drop-position="dragState.position"
          @toggle="emit('toggle', $event)"
          @select="handleSelect"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drag-end="handleDragEnd"
          @drop-node="handleDrop"
          @contextmenu="handleContextMenu"
        />
      </div>
      <div v-else-if="loading" class="outline-tree-panel__empty outline-tree-panel__empty--loading">
        正在加载结构树，请稍候。
      </div>
      <div v-else class="outline-tree-panel__empty">还没有结构节点，先从章节目录或 AI 生成大纲进入。</div>
    </div>

    <!-- 右键菜单 -->
    <OutlineContextMenu
      ref="contextMenuRef"
      :visible="contextMenuVisible"
      :can-create-child="!!selectedNodeId"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @create-child="handleCreateChild"
      @move-up="emit('moveUp')"
      @move-down="emit('moveDown')"
      @edit="handleEdit"
      @delete="handleDelete"
      @close="contextMenuVisible = false"
    />

    <!-- 编辑对话框 -->
    <OutlineNodeDialog
      v-model:visible="dialogVisible"
      :is-edit="isEditDialog"
      :node="selectedNodeData"
      :chapters="chapters"
      @confirm="handleDialogConfirm"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { OutlineNode } from '@/types/writer'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import OutlineTreeRow from './OutlineTreeRow.vue'
import OutlineContextMenu from './OutlineContextMenu.vue'
import OutlineNodeDialog from './OutlineNodeDialog.vue'
import type { CreateOutlineRequest, UpdateOutlineRequest } from '@/modules/writer/api/outline'

type TreeDropPosition = 'before' | 'after'

const props = defineProps<{
  nodes: OutlineNode[]
  selectedNodeId: string
  expandedNodeIds: string[]
  chapters: SidebarChapterSummary[]
  chapterGraphs?: ChapterGraph[]
  assetSummaryByChapterId?: Record<string, WriterAssetSummary>
  currentChapterId?: string
  loading?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', nodeId: string): void
  (e: 'select', node: OutlineNode): void
  (e: 'openGraph', chapterId: string): void
  (e: 'createRoot'): void
  (e: 'createChild', data: CreateOutlineRequest): void
  (e: 'moveUp'): void
  (e: 'moveDown'): void
  (e: 'editSelected', data: UpdateOutlineRequest): void
  (e: 'deleteSelected'): void
  (e: 'reorder', payload: { draggedNodeId: string; targetNodeId: string; position: TreeDropPosition }): void
}>()

const dragState = reactive<{
  draggingNodeId: string
  draggingParentId: string
  targetNodeId: string
  position: TreeDropPosition | null
}>({
  draggingNodeId: '',
  draggingParentId: '',
  targetNodeId: '',
  position: null,
})

const flattenedCount = computed(() => {
  const walk = (items: OutlineNode[]): number =>
    items.reduce((total, item) => total + 1 + walk(item.children || []), 0)
  return walk(props.nodes)
})

function normalizeParentId(parentId: string | undefined): string {
  return parentId || ''
}

function resetDragState() {
  dragState.draggingNodeId = ''
  dragState.draggingParentId = ''
  dragState.targetNodeId = ''
  dragState.position = null
}

function handleDragStart(node: OutlineNode) {
  dragState.draggingNodeId = node.id
  dragState.draggingParentId = normalizeParentId(node.parentId)
  dragState.targetNodeId = ''
  dragState.position = null
  emit('select', node)
}

function handleDragOver(payload: { node: OutlineNode; event: DragEvent }) {
  if (!dragState.draggingNodeId || dragState.draggingNodeId === payload.node.id) return

  if (normalizeParentId(payload.node.parentId) !== dragState.draggingParentId) {
    dragState.targetNodeId = ''
    dragState.position = null
    return
  }

  const targetElement = payload.event.currentTarget as HTMLElement | null
  if (!targetElement) return

  payload.event.preventDefault()
  if (payload.event.dataTransfer) payload.event.dataTransfer.dropEffect = 'move'

  const rect = targetElement.getBoundingClientRect()
  dragState.targetNodeId = payload.node.id
  dragState.position = payload.event.clientY <= rect.top + rect.height / 2 ? 'before' : 'after'
}

function handleDragEnd() {
  resetDragState()
}

function handleDrop(payload: { node: OutlineNode; event: DragEvent }) {
  if (
    !dragState.draggingNodeId ||
    !dragState.position ||
    dragState.draggingNodeId === payload.node.id ||
    normalizeParentId(payload.node.parentId) !== dragState.draggingParentId
  ) {
    resetDragState()
    return
  }

  payload.event.preventDefault()

  emit('reorder', {
    draggedNodeId: dragState.draggingNodeId,
    targetNodeId: payload.node.id,
    position: dragState.position,
  })

  resetDragState()
}

// =======================
// 右键菜单和编辑对话框
// =======================
const contextMenuRef = ref<InstanceType<typeof OutlineContextMenu> | null>(null)
const contextMenuVisible = ref(false)
const dialogVisible = ref(false)
const isEditDialog = ref(false)

const selectedNodeData = computed(() => {
  const findNode = (nodes: OutlineNode[], id: string): OutlineNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return undefined
  }
  return findNode(props.nodes, props.selectedNodeId)
})

function handleSelect(node: OutlineNode) {
  emit('select', node)
}

function handleContextMenu(payload: { node: OutlineNode; event: MouseEvent }) {
  emit('select', payload.node)
  contextMenuVisible.value = true

  // 延迟显示菜单以确保状态已更新
  setTimeout(() => {
    contextMenuRef.value?.show(payload.event.clientX, payload.event.clientY)
  }, 0)
}

function handleCreateChild() {
  contextMenuVisible.value = false
  emit('createChild')
}

function handleEdit() {
  contextMenuVisible.value = false
  isEditDialog.value = true
  dialogVisible.value = true
}

function handleDelete() {
  contextMenuVisible.value = false
  emit('deleteSelected')
}

function handleDialogConfirm(data: CreateOutlineRequest | UpdateOutlineRequest) {
  if (isEditDialog.value) {
    // 编辑模式：将数据传递给父组件进行API调用
    emit('editSelected', data as UpdateOutlineRequest)
  } else {
    // 新增模式：将数据传递给父组件进行API调用
    emit('createChild', data as CreateOutlineRequest)
  }
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.outline-tree-panel {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  border: 1px solid rgba(91, 72, 50, 0.14);
  background:
    radial-gradient(circle at 0% 0%, rgba(143, 63, 47, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(255, 251, 246, 0.98), rgba(245, 235, 222, 0.96));
  box-shadow: 0 16px 32px rgba(80, 49, 26, 0.08);
  overflow: hidden;
}

.outline-tree-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.14), transparent 30%),
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 22px,
      rgba(145, 117, 86, 0.03) 23px
    );
  pointer-events: none;
}

.outline-tree-panel__header {
  position: relative;
  z-index: 1;
  padding: 18px 18px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(91, 72, 50, 0.1);
}

.outline-tree-panel__eyebrow {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8f3f2f;
  font-weight: 800;
}

.outline-tree-panel__title {
  margin: 6px 0 0;
  font-size: 22px;
  color: #2e2b27;
}

.outline-tree-panel__count {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(143, 63, 47, 0.1);
  border: 1px solid rgba(143, 63, 47, 0.14);
  color: #7b3123;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.outline-tree-panel__header-side {
  display: grid;
  gap: 8px;
  justify-items: end;
}

.outline-tree-panel__hint {
  color: #8b7a6c;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.outline-tree-panel__actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.outline-action {
  border: 1px solid rgba(117, 93, 67, 0.18);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.94);
  color: #5b4f43;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 10px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.outline-action--primary {
  border-color: transparent;
  background: linear-gradient(135deg, #8f3f2f, #b76d38);
  color: #fff9f3;
  box-shadow: 0 10px 18px rgba(99, 60, 30, 0.12);
}

.outline-action--danger {
  color: #8f3f2f;
}

.outline-action:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(99, 60, 30, 0.08);
}

.outline-action:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.outline-tree-panel__body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px;
}

.outline-tree-panel__tree {
  display: grid;
  gap: 8px;
  align-content: start;
}

.outline-tree-panel__empty {
  border-radius: 16px;
  border: 1px dashed rgba(117, 93, 67, 0.2);
  background: rgba(255, 252, 247, 0.9);
  padding: 18px;
  color: #74675d;
  font-size: 13px;
  line-height: 1.6;
}

.outline-tree-panel__empty--loading {
  border-style: solid;
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(235, 244, 249, 0.92);
  color: #32536a;
}

@media (max-width: 960px) {
  .outline-tree-panel__header {
    flex-direction: column;
  }

  .outline-tree-panel__header-side {
    justify-items: start;
  }

  .outline-tree-panel__actions {
    justify-content: flex-start;
  }
}
</style>
