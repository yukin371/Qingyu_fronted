<template>
  <div class="conversation-toolbar">
    <select
      :value="currentId"
      class="conversation-select"
      :disabled="disabled"
      @change="handleChange"
    >
      <option
        v-for="conversation in conversationList"
        :key="conversation.id"
        :value="conversation.id"
      >
        {{ conversation.title }}
      </option>
    </select>
    <button class="conversation-action-btn" :disabled="disabled" title="重命名对话" @click="$emit('rename')">
      <QyIcon name="Edit" />
    </button>
    <button class="conversation-new-btn" :disabled="disabled" title="新对话" @click="$emit('create')">
      <QyIcon name="Plus" />
    </button>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import type { ConversationMeta } from './types'

// ==================== Props ====================
defineProps<{
  conversationList: ConversationMeta[]
  currentId: string
  disabled?: boolean
}>()

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'update:currentId', id: string): void
  (e: 'create'): void
  (e: 'rename'): void
  (e: 'delete'): void
}>()

// ==================== 方法 ====================
function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:currentId', target.value)
}
</script>

<style scoped lang="scss">
.conversation-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ai-border, #e2e8f0);
  background: #ffffff;

  .conversation-select {
    flex: 1;
    min-width: 0;
    height: 32px;
    border: 1px solid var(--ai-border-strong, #cbd5e1);
    border-radius: 8px;
    padding: 0 8px;
    background: #ffffff;
    color: var(--ai-text, #0f172a);
    font-size: 12px;
  }

  .conversation-new-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #93c5fd;
    border-radius: 8px;
    background: #eff6ff;
    color: #1d4ed8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .conversation-action-btn {
    width: 32px;
    height: 32px;
    border: 1px solid var(--ai-border-strong, #cbd5e1);
    border-radius: 8px;
    background: #ffffff;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}
</style>
