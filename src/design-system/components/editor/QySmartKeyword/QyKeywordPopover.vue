<template>
  <div v-if="visible && keyword" class="qy-keyword-popover" :style="popoverStyle">
    <div class="qy-keyword-popover__title">{{ keyword.name }}</div>
    <div class="qy-keyword-popover__meta">{{ keywordTypeLabel }}</div>
    <div class="qy-keyword-popover__summary">{{ keyword.summary || '暂无简介' }}</div>
    <button class="qy-keyword-popover__btn" type="button" @click="$emit('jump', keyword)">
      跳转设定
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
  keyword: KeywordInfo | null
}>()

defineEmits<{
  (e: 'jump', keyword: KeywordInfo): void
}>()

const popoverStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}))

const keywordTypeLabel = computed(() => {
  const type = props.keyword?.type
  if (type === 'character') return '角色'
  if (type === 'location') return '地点'
  if (type === 'item') return '物品'
  return '未知类型'
})
</script>

<style scoped>
.qy-keyword-popover {
  position: fixed;
  z-index: 4000;
  width: 240px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}
.qy-keyword-popover__title { font-weight: 700; }
.qy-keyword-popover__meta { color: #409eff; font-size: 12px; margin-top: 4px; }
.qy-keyword-popover__summary { margin-top: 8px; font-size: 13px; color: #606266; }
.qy-keyword-popover__btn {
  margin-top: 10px;
  border: 0;
  border-radius: 6px;
  padding: 6px 10px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}
</style>
