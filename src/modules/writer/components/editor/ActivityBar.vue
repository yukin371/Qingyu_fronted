<template>
  <aside class="activity-bar" aria-label="页面切换栏">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="activity-btn"
      :class="{ 'is-active': modelValue === item.id }"
      :title="item.label"
      :aria-label="item.label"
      @click="handleSwitch(item.id)"
    >
      <QyIcon :name="item.icon" :size="18" />
    </button>
  </aside>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { ActiveTool } from '../../stores/editorStore'

interface Props {
  modelValue: ActiveTool
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: ActiveTool]
  'tool-change': [value: ActiveTool]
}>()

const items: Array<{ id: ActiveTool; label: string; icon: string }> = [
  { id: 'writing', label: '编辑器', icon: 'Edit' },
  { id: 'relations', label: '关系图谱', icon: 'Share' },
  { id: 'timeline', label: '时间线', icon: 'Timer' },
  { id: 'encyclopedia', label: '设定百科', icon: 'Collection' },
  { id: 'ai', label: 'AI 助手', icon: 'MagicStick' }
]

const handleSwitch = (next: ActiveTool) => {
  if (next === props.modelValue) return
  emit('update:modelValue', next)
  emit('tool-change', next)
}
</script>

<style scoped lang="scss">
.activity-bar {
  width: 56px;
  min-width: 56px;
  max-width: 56px;
  flex: 0 0 56px;
  height: 100%;
  border-right: 1px solid #dbe3ef;
  background: linear-gradient(180deg, #0f2742 0%, #15355b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 6px;
}

.activity-btn {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #dbeafe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
}

.activity-btn:hover {
  border-color: rgba(125, 211, 252, 0.7);
  background: rgba(59, 130, 246, 0.25);
}

.activity-btn.is-active {
  color: #0f172a;
  background: #e0ecff;
  border-color: #93c5fd;
  box-shadow: inset 0 0 0 1px rgba(191, 219, 254, 0.8);
}

</style>
