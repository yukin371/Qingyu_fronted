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
        <span class="outline-tree-row__title">{{ node.title }}</span>
        <span v-if="boundChapterLabel" class="outline-tree-row__chapter">{{
          boundChapterLabel
        }}</span>
      </button>
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
        :current-chapter-id="currentChapterId"
        :dragging-node-id="draggingNodeId"
        :drop-target-node-id="dropTargetNodeId"
        :drop-position="dropPosition"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
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
import type { OutlineNode } from '@/types/writer'
import { getBoundChapterLabel } from './structureNodeTypes'

const props = withDefaults(
  defineProps<{
    node: OutlineNode
    depth?: number
    selectedNodeId: string
    expandedNodeIds: string[]
    chapters: SidebarChapterSummary[]
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
  (e: 'dragStart', node: OutlineNode): void
  (e: 'dragOver', payload: { node: OutlineNode; event: DragEvent }): void
  (e: 'dragEnd'): void
  (e: 'dropNode', payload: { node: OutlineNode; event: DragEvent }): void
  (e: 'contextmenu', payload: { node: OutlineNode; event: MouseEvent }): void
}>()

const hasChildren = computed(
  () => Array.isArray(props.node.children) && props.node.children.length > 0,
)
const isExpanded = computed(() => props.expandedNodeIds.includes(props.node.id))
const boundChapterLabel = computed(() => getBoundChapterLabel(props.node, props.chapters))

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
  background: linear-gradient(135deg, rgba(255, 252, 248, 0.95), rgba(251, 245, 236, 0.9));
  min-height: 44px;
  padding: 10px 12px 10px calc(12px + var(--outline-level, 0) * 18px);
  display: grid;
  grid-template-columns: 10px 24px minmax(0, 1fr);
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
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  cursor: pointer;
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

.outline-tree-row__chapter {
  border: 1px solid rgba(117, 93, 67, 0.12);
  background: rgba(255, 251, 246, 0.94);
  color: #6d5f52;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.outline-tree-row__children {
  display: grid;
  gap: 8px;
}
</style>
