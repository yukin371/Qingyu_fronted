<template>
  <div class="ai-messages" ref="messagesContainer">
    <!-- 空状态提示 -->
    <div v-if="messages.length === 0" class="empty-state">
      <QyIcon name="ChatBubbleLeftRight" class="empty-icon" />
      <p class="empty-text">{{ emptyHint }}</p>
    </div>

    <!-- 消息列表 -->
    <div
      v-for="message in messages"
      :key="message.id"
      :class="['message-item', `message-${message.role}`]"
    >
      <!-- 用户消息 -->
      <div v-if="message.role === 'user'" class="message-bubble message-user">
        <div class="message-content">{{ message.content }}</div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>

      <!-- AI消息 -->
      <div v-else class="message-bubble message-ai">
        <div class="message-avatar">
          <QyIcon name="MagicStick" />
        </div>
        <div class="message-content-wrapper">
          <div
            class="message-content"
            :class="{ 'message-content--pending': message.typing }"
            v-safe-html="renderAssistantMessage(message)"
          ></div>
          <div v-if="message.typing" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>

    <div v-if="showPendingAssistant" class="message-item message-ai message-ai-pending">
      <div class="message-bubble message-ai">
        <div class="message-avatar">
          <QyIcon name="MagicStick" />
        </div>
        <div class="message-content-wrapper">
          <div
            class="message-content message-content--pending"
            v-safe-html="renderPendingMarkdown()"
          ></div>
          <div class="typing-indicator"><span></span><span></span><span></span></div>
          <div class="message-time">思考中</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { marked } from 'marked'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { sanitizeMarkdownHtml } from '@/utils/sanitize'
import type { ChatMessage } from './types'

// ==================== Props ====================
const props = withDefaults(
  defineProps<{
    messages: ChatMessage[]
    typingText?: string
    isTyping?: boolean
  }>(),
  {
    messages: () => [],
    typingText: '',
    isTyping: false,
  },
)

// ==================== Emits ====================
defineEmits<{
  (e: 'scrollToBottom'): void
}>()

// ==================== 国际化 ====================
const { t } = useI18n()
const emptyHint = t('ai.emptyHint', '开始与AI助手对话...')

// ==================== Refs ====================
const messagesContainer = ref<HTMLElement>()
const showPendingAssistant = computed(
  () =>
    props.isTyping &&
    !props.messages.some((message) => message.role === 'assistant' && message.typing),
)

// ==================== 方法 ====================
function renderMarkdown(content: string): string {
  if (!content) return ''
  try {
    const html = marked(content, { breaks: true, gfm: true }) as string
    return sanitizeMarkdownHtml(html)
  } catch {
    return content
  }
}

function renderAssistantMessage(message: ChatMessage): string {
  const content = message.typing ? props.typingText || '正在整理回复…' : message.content
  return renderMarkdown(content)
}

function renderPendingMarkdown(): string {
  return renderMarkdown(props.typingText || '正在思考，请稍候…')
}

/**
 * 格式化时间戳
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 其他
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

/**
 * 滚动到底部
 */
async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// ==================== 暴露方法 ====================
defineExpose({
  scrollToBottom,
})

// ==================== 生命周期 ====================
onMounted(() => {
  if (props.messages.length > 0) {
    scrollToBottom()
  }
})

// ==================== 监听 ====================
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

watch(
  () => props.isTyping,
  (newVal) => {
    if (newVal) {
      scrollToBottom()
    }
  },
)
</script>

<style scoped lang="scss">
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;

    &:hover {
      background: #94a3b8;
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--editor-text-muted);

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--editor-text-ghost);
  }

  .empty-text {
    margin: 0;
    font-size: 14px;
  }
}

.message-item {
  display: flex;
  flex-direction: column;

  &.message-user {
    align-items: flex-end;
  }

  &.message-ai {
    align-items: flex-start;
  }
}

.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  word-wrap: break-word;

  &.message-user {
    background: var(--ai-user-bg, #2563eb);
    color: white;
    border-bottom-right-radius: 4px;
  }

  &.message-ai {
    background: var(--ai-assistant-bg, #f1f5f9);
    border: 1px solid var(--ai-border, #e2e8f0);
    border-bottom-left-radius: 4px;
    display: flex;
    gap: 8px;

    .message-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 12px;
    }

    .message-content-wrapper {
      flex: 1;
    }
  }

  .message-content {
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;

    &--pending {
      color: var(--ai-text-muted, #64748b);
    }
  }

  .message-content :deep(p) {
    margin: 0 0 8px;
  }

  .message-content :deep(p:last-child) {
    margin-bottom: 0;
  }

  .message-content :deep(ul),
  .message-content :deep(ol) {
    margin: 0;
    padding-left: 20px;
  }

  .message-content :deep(blockquote) {
    margin: 8px 0;
    padding-left: 12px;
    border-left: 3px solid var(--ai-border-strong, #cbd5e1);
    color: var(--ai-text-muted, #64748b);
  }

  .message-content :deep(code) {
    padding: 2px 6px;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.08);
    font-size: 13px;
  }

  .message-content :deep(pre) {
    margin: 8px 0 0;
    padding: 10px 12px;
    border-radius: 10px;
    overflow-x: auto;
    background: #0f172a;
    color: #e2e8f0;
    white-space: pre-wrap;
  }

  .message-content :deep(pre code) {
    padding: 0;
    background: transparent;
    color: inherit;
  }

  .message-time {
    margin-top: 4px;
    font-size: 11px;
    color: var(--ai-text-muted, #64748b);
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #94a3b8;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .typing-indicator span {
    animation: none;
  }
}
</style>
