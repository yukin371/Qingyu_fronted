<template>
  <div v-if="visible" class="qy-completion-popover" :style="popoverStyle">
    <button
      v-for="(item, idx) in items"
      :key="`${item.type}-${item.name}-${idx}`"
      type="button"
      class="qy-completion-popover__item"
      :class="{ active: idx === activeIndex }"
      @click="$emit('select', item)"
    >
      <span class="type">{{ typeLabel(item.type) }}</span>
      <span class="name">{{ item.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KeywordInfo } from './extensions/SmartKeyword'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  items: KeywordInfo[]
  activeIndex: number
}>()

defineEmits<{
  (e: 'select', item: KeywordInfo): void
}>()

const popoverStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}))

function typeLabel(type: KeywordInfo['type']) {
  if (type === 'character') return '角色'
  if (type === 'location') return '地点'
  return '物品'
}
</script>

<style scoped>
.qy-completion-popover {
  position: fixed;
  z-index: 3900;
  width: 260px;
  max-height: 220px;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
.qy-completion-popover__item {
  width: 100%;
  border: 0;
  background: #fff;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
}
.qy-completion-popover__item.active,
.qy-completion-popover__item:hover { background: #f5f7fa; }
.type { color: #909399; font-size: 12px; min-width: 28px; }
.name { color: #303133; }
</style>
