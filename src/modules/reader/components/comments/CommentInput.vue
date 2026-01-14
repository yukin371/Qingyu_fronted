<template>
  <div class="comment-input">
    <!-- 表情选择器 -->
    <EmojiPicker
      v-if="showEmojiPicker"
      @select="handleSelectEmoji"
      @close="showEmojiPicker = false"
    />

    <div class="input-wrapper">
      <el-input
        v-model="content"
        type="textarea"
        :rows="2"
        placeholder="写下你的想法..."
        :maxlength="500"
        show-word-limit
        @keydown="handleKeydown"
      />

      <div class="input-actions">
        <el-button
          text
          :icon="ChatDotRound"
          @click="showEmojiPicker = true"
        >
          表情
        </el-button>

        <el-button
          type="primary"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import EmojiPicker from './EmojiPicker.vue'

const content = ref('')
const showEmojiPicker = ref(false)

const canSubmit = computed(() => {
  return content.value.trim().length > 0
})

const emit = defineEmits<{
  submit: [data: { content: string; emoji?: string }]
}>()

const handleSelectEmoji = (emoji: string) => {
  content.value = emoji
  showEmojiPicker.value = false
  emit('submit', { emoji })
  content.value = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleSubmit()
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', { content: content.value })
  content.value = ''
}
</script>

<style scoped lang="scss">
.comment-input {
  position: relative;
  padding: 16px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
