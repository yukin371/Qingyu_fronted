<template>
  <div
    class="ai-panel"
    :class="{
      'ai-panel--collapsed': collapsed,
      'is-mobile': isMobile,
      'is-tablet': isTablet,
      'is-desktop': isDesktop
    }"
    :style="panelStyle"
  >
    <!-- 面板头部 -->
    <div v-if="!collapsed" class="ai-header">
      <div class="header-left">
        <QyIcon name="MagicStick" class="ai-icon" />
        <h3 class="header-title">AI写作助手</h3>
      </div>
      <div class="header-right">
        <button
          class="icon-button"
          data-action="clear"
          :aria-label="t('ai.clear', '清空对话')"
          :title="t('ai.clear', '清空对话')"
          @click="handleClear"
        >
          <QyIcon name="Delete" />
        </button>
        <button
          class="icon-button"
          data-action="toggle"
          :aria-label="t('ai.collapse', '折叠面板')"
          :title="t('ai.collapse', '折叠面板')"
          @click="handleToggle"
        >
          <QyIcon :name="collapsed ? 'ArrowRight' : 'ArrowLeft'" />
        </button>
      </div>
    </div>

    <!-- 折叠状态的展开按钮 -->
    <button v-else class="ai-expand-button" @click="handleToggle" :aria-label="t('ai.expand', '展开面板')">
      <QyIcon name="MagicStick" />
    </button>

    <!-- 面板内容 -->
    <div v-if="!collapsed" class="ai-content">
      <!-- 消息列表区域 -->
      <div class="ai-messages" ref="messagesContainer">
        <!-- 空状态提示 -->
        <div v-if="messages.length === 0" class="empty-state">
          <QyIcon name="ChatBubbleLeftRight" class="empty-icon" />
          <p class="empty-text">{{ t('ai.emptyHint', '开始与AI助手对话...') }}</p>
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
              <div class="message-content">
                {{ message.typing ? typingText : message.content }}
              </div>
              <div v-if="message.typing" class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷操作卡片 -->
      <div v-if="messages.length === 0" class="ai-quick-actions">
        <div
          v-for="(action, index) in quickActions"
          :key="index"
          class="quick-action-card"
          @click="handleQuickAction(action)"
        >
          <QyIcon :name="action.icon" class="quick-action-icon" />
          <span class="quick-action-label">{{ action.label }}</span>
        </div>
      </div>

      <!-- 输入框区域 -->
      <div class="ai-input-area">
        <div class="input-wrapper">
          <textarea
            ref="inputRef"
            v-model="inputText"
            class="message-input"
            :placeholder="t('ai.inputPlaceholder', '输入消息...')"
            rows="1"
            :disabled="isTyping"
            @keydown="handleKeyDown"
            @input="handleInput"
          ></textarea>
          <button
            class="send-button"
            :disabled="!inputText.trim() || isTyping"
            :aria-label="t('ai.send', '发送')"
            @click="handleSend"
          >
            <QyIcon :name="isTyping ? 'Loading' : 'Promotion'" />
          </button>
        </div>
        <div class="input-hint">
          <span>{{ t('ai.hint', '按 Enter 发送，Shift + Enter 换行') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useChatHistory, type ChatMessage } from '@/composables/useChatHistory'
import { useTypewriter } from '@/composables/useTypewriter'
import { mockAIResponse, QUICK_ACTION_PROMPTS, getQuickActionPrompt } from '@/utils/mockAIResponse'

// ==================== 类型定义 ====================
interface Props {
  collapsed?: boolean
  sessionId?: string
  width?: number
}

interface Emits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'send', message: string): void
}

// ==================== Props & Emits ====================
const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  sessionId: 'default',
  width: 320
})

const emit = defineEmits<Emits>()

// ==================== 国际化 ====================
const { t } = useI18n()

// ==================== 响应式断点 ====================
const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200
})

const isMobile = breakpoints.smaller('mobile')
const isTablet = breakpoints.between('mobile', 'desktop')
const isDesktop = breakpoints.greaterOrEqual('desktop')

// ==================== 对话历史管理 ====================
const { messages, addMessage, clearHistory, save, load } = useChatHistory(props.sessionId)

// ==================== 打字机效果 ====================
const typingText = ref('')
const typewriter = useTypewriter('', 30)

// ==================== UI状态 ====================
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()

// ==================== 快捷操作 ====================
const quickActions = computed(() => [
  { id: 'continue', ...QUICK_ACTION_PROMPTS.continue },
  { id: 'polish', ...QUICK_ACTION_PROMPTS.polish },
  { id: 'summary', ...QUICK_ACTION_PROMPTS.summary },
  { id: 'suggestion', ...QUICK_ACTION_PROMPTS.suggestion }
])

// ==================== VSCode主题颜色 ====================
const vscodeColors = {
  editorBackground: '#1e1e1e',
  editorForeground: '#d4d4d4',
  toolbarBackground: '#252526',
  statusBarBackground: '#007acc',
  statusBarForeground: '#ffffff',
  selectionBackground: '#264f78',
  cursorColor: '#aeafad'
}

// ==================== 计算属性 ====================
const panelStyle = computed(() => {
  return {
    '--ai-panel-width': `${props.width}px`,
    '--vscode-editor-background': vscodeColors.editorBackground,
    '--vscode-editor-foreground': vscodeColors.editorForeground,
    '--vscode-toolbar-background': vscodeColors.toolbarBackground,
    '--vscode-statusbar-background': vscodeColors.statusBarBackground,
    '--vscode-statusbar-foreground': vscodeColors.statusBarForeground
  }
})

// ==================== 方法 ====================
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
 * 发送消息
 */
async function sendMessage(content: string) {
  if (!content.trim() || isTyping.value) return

  // 添加用户消息
  addMessage('user', content)

  // 清空输入框
  inputText.value = ''

  // 滚动到底部
  await scrollToBottom()

  // 模拟AI响应
  isTyping.value = true
  try {
    const response = await mockAIResponse(content)

    // 添加AI消息（打字状态）
    const aiMessage = addMessage('assistant', response)

    // 启动打字机效果
    typewriter.displayText.value = ''
    typewriter.start()

    // 监听打字进度
    const stopTyping = watch(typewriter.displayText, (newText) => {
      aiMessage.content = newText
      if (typewriter.progress.value >= 1) {
        isTyping.value = false
        stopTyping()
      }
    })

    // 滚动到底部
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to get AI response:', error)
    addMessage('assistant', '抱歉，我遇到了一些问题。请稍后再试。')
    isTyping.value = false
  }
}

/**
 * 处理发送按钮点击
 */
function handleSend() {
  sendMessage(inputText.value)
}

/**
 * 处理快捷操作
 */
function handleQuickAction(action: { id: string; prompt: string }) {
  const prompt = getQuickActionPrompt(action.id)
  sendMessage(prompt)
}

/**
 * 处理键盘事件
 */
function handleKeyDown(event: KeyboardEvent) {
  // Enter 发送，Shift + Enter 换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

/**
 * 处理输入事件
 */
function handleInput() {
  // 自动调整文本框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 120)}px`
  }
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

/**
 * 切换折叠状态
 */
function handleToggle() {
  emit('update:collapsed', !props.collapsed)
}

/**
 * 清空对话历史
 */
function handleClear() {
  if (confirm(t('ai.clearConfirm', '确定要清空对话历史吗？'))) {
    clearHistory()
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  // 加载历史对话
  load()

  // 滚动到底部
  if (messages.value.length > 0) {
    scrollToBottom()
  }

  console.log('[AIPanel] Mounted')
})

onBeforeUnmount(() => {
  // 保存对话历史
  save()

  // 停止打字机效果
  typewriter.stop()
})

// ==================== 监听 ====================
// 监听消息变化，自动保存
watch(() => messages.value, () => {
  save()
}, { deep: true })
</script>

<style scoped lang="scss">
// ==================== AI面板容器 ====================
.ai-panel {
  --ai-panel-width: 320px;
  --vscode-editor-background: #1e1e1e;
  --vscode-editor-foreground: #d4d4d4;
  --vscode-toolbar-background: #252526;
  --vscode-statusbar-background: #007acc;
  --vscode-statusbar-foreground: #ffffff;
  --ai-message-user-bg: #007acc;
  --ai-message-ai-bg: rgba(255, 255, 255, 0.1);

  width: var(--ai-panel-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground);
  border-left: 1px solid #3c3c3c;
  transition: all 0.3s ease;
  overflow: hidden;

  // 折叠状态
  &.ai-panel--collapsed {
    width: 48px;

    .ai-expand-button {
      display: flex;
    }
  }

  &.ai-panel--collapsed .ai-header,
  &.ai-panel--collapsed .ai-content {
    display: none;
  }

  // 响应式布局
  &.is-mobile {
    width: 100%;
    border-left: none;
    border-top: 1px solid #3c3c3c;
  }

  &.is-tablet {
    --ai-panel-width: 280px;
  }
}

// ==================== 面板头部 ====================
.ai-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--vscode-toolbar-background);
  border-bottom: 1px solid #3c3c3c;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .ai-icon {
      font-size: 18px;
      color: #409eff;
    }

    .header-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .header-right {
    display: flex;
    gap: 4px;

    .icon-button {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--vscode-editor-foreground);
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &:active {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }
}

// ==================== 折叠状态的展开按钮 ====================
.ai-expand-button {
  display: none;
  width: 100%;
  height: 48px;
  padding: 0;
  border: none;
  background: var(--vscode-toolbar-background);
  color: #409eff;
  cursor: pointer;
  border-bottom: 1px solid #3c3c3c;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(64, 158, 255, 0.1);
  }
}

// ==================== 面板内容 ====================
.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ==================== 消息列表区域 ====================
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
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

// 空状态
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-text {
    margin: 0;
    font-size: 14px;
  }
}

// 消息项
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

// 消息气泡
.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  word-wrap: break-word;

  &.message-user {
    background: var(--ai-message-user-bg);
    color: white;
    border-bottom-right-radius: 4px;
  }

  &.message-ai {
    background: var(--ai-message-ai-bg);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom-left-radius: 4px;
    display: flex;
    gap: 8px;

    .message-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #409eff;
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
  }

  .message-time {
    margin-top: 4px;
    font-size: 11px;
    opacity: 0.6;
  }
}

// 打字指示器
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
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
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// ==================== 快捷操作卡片 ====================
.ai-quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 16px 16px;

  .quick-action-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;

    &:hover {
      background: rgba(64, 158, 255, 0.1);
      border-color: #409eff;
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }

    .quick-action-icon {
      font-size: 20px;
      color: #409eff;
    }

    .quick-action-label {
      font-size: 12px;
      color: var(--vscode-editor-foreground);
    }
  }
}

// ==================== 输入框区域 ====================
.ai-input-area {
  padding: 12px 16px;
  background: var(--vscode-toolbar-background);
  border-top: 1px solid #3c3c3c;

  .input-wrapper {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px;
    transition: border-color 0.2s ease;

    &:focus-within {
      border-color: #409eff;
    }

    .message-input {
      flex: 1;
      min-height: 32px;
      max-height: 120px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--vscode-editor-foreground);
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      outline: none;

      &::placeholder {
        color: rgba(255, 255, 255, 0.3);
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
      background: #409eff;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background: #66b1ff;
      }

      &:active:not(:disabled) {
        background: #3a8ee6;
      }

      &:disabled {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.3);
        cursor: not-allowed;
      }
    }
  }

  .input-hint {
    margin-top: 8px;
    text-align: center;

    span {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

// ==================== 响应式布局 ====================
@media (max-width: 768px) {
  .ai-panel {
    .ai-quick-actions {
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;

      .quick-action-card {
        padding: 8px;

        .quick-action-icon {
          font-size: 16px;
        }

        .quick-action-label {
          font-size: 11px;
        }
      }
    }
  }
}

// ==================== 无障碍支持 ====================
@media (prefers-reduced-motion: reduce) {
  .ai-panel,
  .quick-action-card,
  .send-button {
    transition: none;
  }

  .typing-indicator span {
    animation: none;
  }
}
</style>
