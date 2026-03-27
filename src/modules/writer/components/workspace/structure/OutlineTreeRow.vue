<template>
  <article class="outline-tree-row">
    <div
      class="outline-tree-row__main"
      :class="{
        'is-selected': selectedNodeId === node.id,
        'is-dragging': draggingNodeId === node.id,
        'is-drop-before': dropTargetNodeId === node.id && dropPosition === 'before',
        'is-drop-after': dropTargetNodeId === node.id && dropPosition === 'after',
      }"
      :style="{ '--outline-level': `${depth}` }"
      draggable="true"
      @dragstart="handleDragStart"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @dragend="emit('dragEnd')"
      @contextmenu.prevent="handleContextMenu"
    >
      <span class="outline-tree-row__depth" />
      <button
        type="button"
        class="outline-tree-row__toggle"
        :class="{ 'is-hidden': !hasChildren }"
        @click.stop="hasChildren && emit('toggle', node.id)"
      >
        {{ hasChildren ? (isExpanded ? '−' : '+') : '·' }}
      </button>
      <button type="button" class="outline-tree-row__select" @click="emit('select', node)">
        <span class="outline-tree-row__level">L{{ node.level || depth + 1 }}</span>
        <span class="outline-tree-row__type-icon" :style="{ color: nodeTypeInfo.color }">{{ nodeTypeInfo.icon }}</span>
        <span class="outline-tree-row__title">{{ node.title }}</span>
        <span class="outline-tree-row__meta">
          <span class="outline-tree-row__binding" :class="bindingClass">{{ bindingText }}</span>
          <span v-if="boundChapterLabel" class="outline-tree-row__chapter">{{ boundChapterLabel }}</span>
          <span v-if="assetSummary.total > 0" class="outline-tree-row__assets">
            资产 {{ assetSummary.characters }}角 {{ assetSummary.locations }}地<span v-if="assetSummary.items > 0"> {{ assetSummary.items }}物</span>
          </span>
          <span
            v-if="showGraphChip"
            class="outline-tree-row__graph"
            :class="graphClass"
          >{{ graphText }}</span>
          <span v-if="isCurrentChapter" class="outline-tree-row__chapter outline-tree-row__chapter--current">当前章节</span>
        </span>
      </button>
      <button
        v-if="showGraphAction"
        type="button"
        class="outline-tree-row__graph-action"
        :class="graphClass"
        @click.stop="emit('openGraph', boundChapterId)"
      >
        {{ graphActionText }}
      </button>
      <span class="outline-tree-row__status" :class="`is-${node.status || 'draft'}`">{{ statusText }}</span>
    </div>

    <div v-if="hasChildren && isExpanded" class="outline-tree-row__children">
      <OutlineTreeRow
        v-for="child in node.children || []"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :selected-node-id="selectedNodeId"
        :expanded-node-ids="expandedNodeIds"
        :chapters="chapters"
        :chapter-graphs="chapterGraphs"
        :asset-summary-by-chapter-id="assetSummaryByChapterId"
        :current-chapter-id="currentChapterId"
        :dragging-node-id="draggingNodeId"
        :drop-target-node-id="dropTargetNodeId"
        :drop-position="dropPosition"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
        @open-graph="emit('openGraph', $event)"
        @drag-start="emit('dragStart', $event)"
        @drag-over="emit('dragOver', $event)"
        @drag-end="emit('dragEnd')"
        @drop-node="emit('dropNode', $event)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { ChapterGraph } from '@/modules/writer/types/character'
import type { OutlineNode } from '@/types/writer'
import type { WriterAssetSummary } from '@/modules/writer/utils/writerAssetRefs'
import { getOutlineNodeTypeInfo } from '@/modules/writer/api/outline'
import {
  getBoundChapterId,
  getBoundChapterLabel,
  getStructureNodeBindingState,
  getStructureNodeGraphState,
} from './structureNodeTypes'

const props = withDefaults(
  defineProps<{
    node: OutlineNode
    depth?: number
    selectedNodeId: string
    expandedNodeIds: string[]
    chapters: SidebarChapterSummary[]
    chapterGraphs?: ChapterGraph[]
    assetSummaryByChapterId?: Record<string, WriterAssetSummary>
    currentChapterId?: string
    draggingNodeId?: string
    dropTargetNodeId?: string
    dropPosition?: 'before' | 'after' | null
  }>(),
  {
    depth: 0,
    chapters: () => [],
    currentChapterId: '',
    draggingNodeId: '',
    dropTargetNodeId: '',
    dropPosition: null,
  },
)

const emit = defineEmits<{
  (e: 'toggle', nodeId: string): void
  (e: 'select', node: OutlineNode): void
  (e: 'openGraph', chapterId: string): void
  (e: 'dragStart', node: OutlineNode): void
  (e: 'dragOver', payload: { node: OutlineNode; event: DragEvent }): void
  (e: 'dragEnd'): void
  (e: 'dropNode', payload: { node: OutlineNode; event: DragEvent }): void
  (e: 'contextmenu', payload: { node: OutlineNode; event: MouseEvent }): void
}>()

const hasChildren = computed(() => Array.isArray(props.node.children) && props.node.children.length > 0)
const nodeTypeInfo = computed(() => getOutlineNodeTypeInfo((props.node as any)?.type))
const isExpanded = computed(() => props.expandedNodeIds.includes(props.node.id))
const bindingState = computed(() => getStructureNodeBindingState(props.node))
const bindingText = computed(() => bindingState.value.label)
const bindingClass = computed(() =>
  bindingState.value.tone === 'linked'
    ? 'outline-tree-row__binding--linked'
    : 'outline-tree-row__binding--unlinked',
)
const boundChapterLabel = computed(() => getBoundChapterLabel(props.node, props.chapters))
const boundChapterId = computed(() => getBoundChapterId(props.node))
const assetSummary = computed<WriterAssetSummary>(() =>
  (boundChapterId.value && props.assetSummaryByChapterId?.[boundChapterId.value]) || {
    total: 0,
    characters: 0,
    locations: 0,
    items: 0,
  },
)
const isCurrentChapter = computed(() => !!props.currentChapterId && boundChapterId.value === props.currentChapterId)
const graphState = computed(() => getStructureNodeGraphState(props.node, props.chapterGraphs || []))
const showGraphChip = computed(() => !!boundChapterLabel.value)
const graphText = computed(() => graphState.value.label)
const graphClass = computed(() => `outline-tree-row__graph--${graphState.value.tone}`)
const showGraphAction = computed(() => !!boundChapterId.value)
const graphActionText = computed(() => (graphState.value.tone === 'missing' ? '建图' : '看图'))
const statusText = computed(() => {
  if (props.node.status === 'completed') return '已完成'
  if (props.node.status === 'writing') return '写作中'
  if (props.node.status === 'reviewing') return '审核中'
  return '草稿'
})

function handleDragStart(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.node.id)
  }
  emit('dragStart', props.node)
}

function handleDragOver(event: DragEvent) {
  emit('dragOver', {
    node: props.node,
    event,
  })
}

function handleDrop(event: DragEvent) {
  emit('dropNode', {
    node: props.node,
    event,
  })
}

function handleContextMenu(event: MouseEvent) {
  emit('contextmenu', {
    node: props.node,
    event,
  })
}
</script>

<style scoped lang="scss">
.outline-tree-row {
  display: grid;
  gap: 8px;
}

.outline-tree-row__main {
  width: 100%;
  position: relative;
  border: 1px solid rgba(117, 93, 67, 0.14);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 252, 248, 0.95), rgba(251, 245, 236, 0.9));
  min-height: 52px;
  padding: 10px 12px 10px calc(12px + var(--outline-level, 0) * 18px);
  display: grid;
  grid-template-columns: 10px 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  transition: all 0.18s ease;
}

.outline-tree-row__main:hover {
  border-color: rgba(143, 63, 47, 0.22);
  background: linear-gradient(135deg, rgba(255, 248, 240, 0.98), rgba(250, 238, 224, 0.98));
  box-shadow: 0 12px 20px rgba(99, 60, 30, 0.06);
}

.outline-tree-row__main.is-selected {
  border-color: rgba(143, 63, 47, 0.36);
  background: linear-gradient(135deg, rgba(255, 248, 240, 1), rgba(245, 225, 205, 0.98));
  box-shadow: 0 14px 24px rgba(98, 57, 29, 0.1);
}

.outline-tree-row__main.is-dragging {
  opacity: 0.56;
}

.outline-tree-row__main.is-drop-before::before,
.outline-tree-row__main.is-drop-after::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #8f3f2f, #b76d38);
  box-shadow: 0 0 0 3px rgba(143, 63, 47, 0.1);
}

.outline-tree-row__main.is-drop-before::before {
  top: -3px;
}

.outline-tree-row__main.is-drop-after::after {
  bottom: -3px;
}

.outline-tree-row__depth {
  width: 2px;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(183, 109, 56, 0.1), rgba(143, 63, 47, 0.34));
  box-shadow: 0 0 0 4px rgba(183, 109, 56, 0.04);
}

.outline-tree-row__toggle {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(117, 93, 67, 0.18);
  border-radius: 999px;
  background: #fffaf4;
  color: #6d5a47;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.outline-tree-row__toggle:hover:not(.is-hidden) {
  transform: translateY(-1px);
  border-color: rgba(143, 63, 47, 0.22);
  box-shadow: 0 8px 14px rgba(99, 60, 30, 0.08);
}

.outline-tree-row__toggle.is-hidden {
  opacity: 0.45;
  cursor: default;
}

.outline-tree-row__select {
  border: 0;
  background: transparent;
  min-width: 0;
  display: grid;
  gap: 4px;
  text-align: left;
  cursor: pointer;
}

.outline-tree-row__level {
  font-size: 11px;
  font-weight: 800;
  color: #8f3f2f;
  letter-spacing: 0.08em;
}

.outline-tree-row__title {
  min-width: 0;
  color: #2f2b26;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.outline-tree-row__type-icon {
  font-size: 13px;
  flex-shrink: 0;
  margin-right: 4px;
}

.outline-tree-row__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.outline-tree-row__binding,
.outline-tree-row__chapter,
.outline-tree-row__assets,
.outline-tree-row__graph {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 7px;
}

.outline-tree-row__binding {
  border: 1px solid rgba(117, 93, 67, 0.16);
  background: rgba(246, 239, 230, 0.92);
  color: #7a6250;
}

.outline-tree-row__binding--linked {
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(232, 241, 248, 0.92);
  color: #27425c;
}

.outline-tree-row__binding--unlinked {
  border-color: rgba(117, 93, 67, 0.14);
  background: rgba(248, 241, 233, 0.92);
  color: #7b6a5b;
}

.outline-tree-row__chapter {
  border: 1px solid rgba(117, 93, 67, 0.12);
  background: rgba(255, 251, 246, 0.94);
  color: #6d5f52;
  max-width: 164px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.outline-tree-row__assets {
  border: 1px solid rgba(84, 116, 79, 0.16);
  background: rgba(239, 247, 236, 0.94);
  color: #41613a;
}

.outline-tree-row__graph {
  border: 1px solid rgba(117, 93, 67, 0.14);
  background: rgba(255, 251, 246, 0.9);
  color: #6e6155;
}

.outline-tree-row__graph--ready {
  border-color: rgba(74, 127, 88, 0.18);
  background: rgba(232, 245, 236, 0.94);
  color: #2e6a3d;
}

.outline-tree-row__graph--inherit {
  border-color: rgba(54, 80, 107, 0.18);
  background: rgba(235, 244, 249, 0.94);
  color: #2c4d66;
}

.outline-tree-row__graph--missing {
  border-color: rgba(183, 109, 56, 0.18);
  background: rgba(255, 243, 230, 0.94);
  color: #9a551f;
}

.outline-tree-row__graph--unbound {
  border-color: rgba(117, 93, 67, 0.14);
  background: rgba(248, 241, 233, 0.92);
  color: #7b6a5b;
}

.outline-tree-row__chapter--current {
  border-color: rgba(143, 63, 47, 0.18);
  background: rgba(255, 242, 227, 0.94);
  color: #8f3f2f;
}

.outline-tree-row__status {
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.outline-tree-row__graph-action {
  border: 1px solid rgba(117, 93, 67, 0.14);
  border-radius: 999px;
  background: rgba(255, 251, 246, 0.94);
  color: #6e6155;
  font-size: 10px;
  font-weight: 800;
  padding: 5px 8px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.outline-tree-row__graph-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 14px rgba(99, 60, 30, 0.08);
}

.outline-tree-row__status.is-draft {
  background: rgba(72, 87, 108, 0.1);
  color: #45566c;
}

.outline-tree-row__status.is-writing {
  background: rgba(183, 109, 56, 0.12);
  color: #9a551f;
}

.outline-tree-row__status.is-reviewing {
  background: rgba(54, 80, 107, 0.12);
  color: #27425c;
}

.outline-tree-row__status.is-completed {
  background: rgba(74, 127, 88, 0.14);
  color: #2e6a3d;
}

.outline-tree-row__children {
  display: grid;
  gap: 8px;
}

@media (max-width: 960px) {
  .outline-tree-row__main {
    grid-template-columns: 10px 24px minmax(0, 1fr);
  }

  .outline-tree-row__graph-action,
  .outline-tree-row__status {
    grid-column: 3;
    justify-self: start;
  }
}
</style>
