<template>
  <div class="ai-input-area">
    <div v-if="context" class="chat-context-chip">
      <span class="context-label">即将发送片段</span>
      <span class="context-text">{{ context.text }}</span>
      <button class="context-clear" @click="$emit('clearContext')">移除</button>
    </div>
    <div class="input-wrapper">
      <textarea
        ref="inputRef"
        :value="modelValue"
        class="message-input"
        :placeholder="placeholder"
        rows="1"
        :disabled="disabled"
        @keydown="handleKeyDown"
        @input="handleInput"
      ></textarea>
      <button
        class="send-button"
        :disabled="!modelValue.trim() || disabled"
        :aria-label="sendLabel"
        @click="handleSend"
      >
        <QyIcon :name="disabled ? 'Loading' : 'Promotion'" />
      </button>
    </div>
    <div class="input-hint">
      <span>{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useI18n } from '@/composables/useI18n'
import type { ChatContextSnippet } from './types'

// ==================== Props ====================
const props = withDefaults(
  defineProps<{
    modelValue: string
    context?: ChatContextSnippet | null
    disabled?: boolean
    placeholder?: string
    hint?: string
  }>(),
  {
    modelValue: '',
    context: null,
    disabled: false,
    placeholder: '输入消息...',
    hint: '按 Enter 发送，Shift + Enter 换行',
  },
)

// ==================== Emits ====================
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'clearContext'): void
}>()

// ==================== 国际化 ====================
const { t } = useI18n()
const sendLabel = t('ai.send', '发送')

// ==================== Refs ====================
const inputRef = ref<HTMLTextAreaElement>()

// ==================== 方法 ====================
function handleKeyDown(event: KeyboardEvent) {
  // Enter 发送，Shift + Enter 换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)

  // 自动调整文本框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 120)}px`
  }
}

function handleSend() {
  if (props.modelValue.trim() && !props.disabled) {
    emit('send')
  }
}

// ==================== 暴露方法 ====================
defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>

<style scoped lang="scss">
.ai-input-area {
  padding: 12px 16px;
  background: var(--ai-bg-soft, #f8fafc);
  border-top: 1px solid var(--ai-border, #e2e8f0);

  .chat-context-chip {
    margin-bottom: 8px;
    border: 1px solid #bfdbfe;
    background: #eff6ff;
    color: #1e3a8a;
    border-radius: 10px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;

    .context-label {
      flex-shrink: 0;
      font-weight: 600;
    }

    .context-text {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .context-clear {
      flex-shrink: 0;
      border: none;
      background: transparent;
      color: #1d4ed8;
      cursor: pointer;
      font-size: 12px;
      padding: 0;
    }
  }

  .input-wrapper {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: #ffffff;
    border: 1px solid var(--ai-border-strong, #cbd5e1);
    border-radius: 12px;
    padding: 8px;
    transition: border-color 0.2s ease;

    &:focus-within {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.16);
    }

    .message-input {
      flex: 1;
      min-height: 32px;
      max-height: 120px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--ai-text, #0f172a);
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      outline: none;

      &::placeholder {
        color: #94a3b8;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .send-button {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: var(--ai-user-bg, #2563eb);
      color: white;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background: var(--ai-user-bg-hover, #1d4ed8);
      }

      &:active:not(:disabled) {
        background: #1e40af;
      }

      &:disabled {
        background: #cbd5e1;
        color: #94a3b8;
        cursor: not-allowed;
      }
    }
  }

  .input-hint {
    margin-top: 8px;
    text-align: center;

    span {
      font-size: 11px;
      color: #94a3b8;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .send-button {
    transition: none;
  }
}
</style>
