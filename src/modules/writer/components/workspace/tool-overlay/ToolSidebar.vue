<template>
  <nav class="tool-sidebar">
    <div class="tool-list">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-item"
        :class="{ 'is-active': activeTool === tool.id }"
        :title="`${tool.name} (Ctrl+${tool.index})`"
        @click="handleToolClick(tool.id)"
      >
        <span class="tool-icon">
          <QyIcon :name="tool.icon" :size="22" />
        </span>
        <span class="tool-name">{{ tool.name }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'

interface Props {
  activeTool: ToolType
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toolChange', toolId: ToolType): void
}>()

const tools: Array<{
  id: ToolType
  name: string
  icon: string
  index: number
}> = [
  { id: 'relations', name: '关系图谱', icon: 'Share', index: 1 },
  { id: 'timeline', name: '时间线', icon: 'Clock', index: 2 },
  { id: 'branches', name: '故事分支', icon: 'Connection', index: 3 },
  { id: 'structure', name: '结构舞台', icon: 'Grid', index: 4 },
]

function handleToolClick(toolId: ToolType) {
  emit('toolChange', toolId)
}
</script>

<style scoped lang="scss">
.tool-sidebar {
  width: 64px;
  background: var(--editor-bg-surface);
  border-right: 1px solid var(--editor-border);
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  flex-shrink: 0;

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 8px;
  }

  .tool-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--editor-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    .tool-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .tool-name {
      font-size: 10px;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }

    &:hover {
      background: var(--editor-bg-elevated);
      color: var(--editor-text-primary);

      .tool-icon {
        background: var(--editor-bg-elevated);
      }
    }

    &.is-active {
      background: var(--editor-accent-soft);
      color: var(--editor-accent);

      .tool-icon {
        background: var(--editor-accent-soft);
      }
    }
  }
}
</style>
