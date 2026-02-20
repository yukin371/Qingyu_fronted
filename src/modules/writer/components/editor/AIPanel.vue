<template>
  <div
    class="ai-panel"
    :class="{
      'is-mobile': isMobile,
      'is-tablet': isTablet,
      'is-desktop': isDesktop
    }"
    :style="panelStyle"
  >
    <!-- 面板头部 -->
    <div class="ai-header">
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
      </div>
    </div>

    <!-- 面板内容 -->
    <div class="ai-content">
      <div class="conversation-toolbar">
        <select v-model="currentConversationId" class="conversation-select" :disabled="isTyping">
          <option v-for="conversation in conversationList" :key="conversation.id" :value="conversation.id">
            {{ conversation.title }}
          </option>
        </select>
        <button class="conversation-action-btn" :disabled="isTyping" @click="handleRenameConversation">
          <QyIcon name="Edit" />
        </button>
        <button class="conversation-action-btn" :disabled="isTyping" @click="handleDeleteConversation">
          <QyIcon name="Delete" />
        </button>
        <button class="conversation-new-btn" :disabled="isTyping" @click="handleCreateConversation">
          <QyIcon name="Plus" />
          新对话
        </button>
      </div>

      <div v-if="selectionNotice" class="selection-notice" :class="`is-${selectionNotice.status}`">
        <div class="selection-title">
          {{ selectionNotice.actionLabel }} · 已选中 {{ selectionNotice.text.length }} 字
        </div>
        <div class="selection-content">{{ selectionNotice.text }}</div>
        <div v-if="selectionNotice.instructions" class="selection-extra">
          要求：{{ selectionNotice.instructions }}
        </div>
        <div class="selection-status">{{ selectionNotice.statusText }}</div>
      </div>

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
        <div v-if="selectedChatContext" class="chat-context-chip">
          <span class="context-label">即将发送片段</span>
          <span class="context-text">{{ selectedChatContext.text }}</span>
          <button class="context-clear" @click="handleClearSelectedContext">移除</button>
        </div>
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
import { useChatHistory } from '@/composables/useChatHistory'
import { useTypewriter } from '@/composables/useTypewriter'
import { message } from '@/design-system/services'
import { QUICK_ACTION_PROMPTS, getQuickActionPrompt } from '@/utils/mockAIResponse'
import { chatWithAI, continueWriting, polishText, expandText, rewriteText } from '@/modules/ai/api'

// 防抖函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...parameters: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...parameters)
      timeoutId = null
    }, delay)
  }) as T
}

// ==================== 类型定义 ====================
interface Props {
  sessionId?: string
  width?: number
  actionTrigger?: {
    id: number
    action: string
    text: string
    instructions?: string
  } | null
}

interface Emits {
  (e: 'send', msg: string): void
  (e: 'applyGeneratedText', payload: { action: string; sourceText: string; generatedText: string }): void
}

interface ConversationMeta {
  id: string
  title: string
  updatedAt: number
}

type SelectionNoticeStatus = 'pending' | 'running' | 'done' | 'error'

interface SelectionNotice {
  action: string
  actionLabel: string
  text: string
  instructions?: string
  status: SelectionNoticeStatus
  statusText: string
}

interface ChatContextSnippet {
  text: string
  instructions?: string
  addedAt: number
}

// ==================== Props & Emits ====================
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
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
const currentConversationId = ref('default')
const conversationList = ref<ConversationMeta[]>([])
const chatSessionKey = computed(() => `${props.sessionId}:${currentConversationId.value}`)
const {
  messages,
  addMessage,
  clearHistory,
  save,
  load,
  setSessionId,
} = useChatHistory(chatSessionKey.value)

// ==================== 打字机效果 ====================
const typingText = ref('')
const typewriter = useTypewriter('', 30)

// ==================== UI状态 ====================
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()
const selectionNotice = ref<SelectionNotice | null>(null)
const selectedChatContext = ref<ChatContextSnippet | null>(null)

// ==================== 快捷操作 ====================
// 仅保留3个快捷操作：续写、润色、摘要
const quickActions = computed(() => [
  { id: 'continue', ...QUICK_ACTION_PROMPTS.continue },
  { id: 'polish', ...QUICK_ACTION_PROMPTS.polish },
  { id: 'summary', ...QUICK_ACTION_PROMPTS.summary }
])

// ==================== 计算属性 ====================
const panelStyle = computed(() => {
  return {
    '--ai-panel-width': `${props.width}px`
  }
})

const conversationStorageKey = computed(() => `ai-conversation-list-${props.sessionId}`)

function loadConversations() {
  try {
    const raw = localStorage.getItem(conversationStorageKey.value)
    const parsed = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed : []
    const deduped = list.filter((item, index, arr) => {
      if (!item?.id) return false
      return arr.findIndex((x) => x?.id === item.id) === index
    })
    conversationList.value = list.length > 0 ? list : [{
      id: 'default',
      title: '默认对话',
      updatedAt: Date.now(),
    }]
    if (deduped.length > 0) {
      conversationList.value = deduped
    }
  } catch {
    conversationList.value = [{
      id: 'default',
      title: '默认对话',
      updatedAt: Date.now(),
    }]
  }
}

function saveConversations() {
  try {
    localStorage.setItem(conversationStorageKey.value, JSON.stringify(conversationList.value))
  } catch (error) {
    console.warn('[AIPanel] Failed to save conversations:', error)
  }
}

function ensureCurrentConversation() {
  if (!conversationList.value.some((item) => item.id === currentConversationId.value)) {
    currentConversationId.value = conversationList.value[0]?.id || 'default'
  }
}

function touchConversationTitle() {
  const index = conversationList.value.findIndex((item) => item.id === currentConversationId.value)
  if (index < 0) return
  const firstUserMessage = messages.value.find((item) => item.role === 'user')?.content || ''
  const nextTitle = firstUserMessage
    ? firstUserMessage.replace(/\s+/g, ' ').slice(0, 18)
    : `对话 ${index + 1}`
  conversationList.value[index] = {
    ...conversationList.value[index],
    title: nextTitle,
    updatedAt: Date.now(),
  }
  saveConversations()
}

function handleCreateConversation() {
  const id = `chat-${Date.now()}`
  conversationList.value.unshift({
    id,
    title: `新对话 ${conversationList.value.length + 1}`,
    updatedAt: Date.now(),
  })
  saveConversations()
  currentConversationId.value = id
}

function handleRenameConversation() {
  const current = conversationList.value.find((item) => item.id === currentConversationId.value)
  if (!current) return
  const nextTitle = window.prompt('请输入新的会话名称', current.title)?.trim()
  if (!nextTitle) return
  const idx = conversationList.value.findIndex((item) => item.id === currentConversationId.value)
  if (idx < 0) return
  conversationList.value[idx] = {
    ...conversationList.value[idx],
    title: nextTitle,
    updatedAt: Date.now(),
  }
  saveConversations()
}

function handleDeleteConversation() {
  if (conversationList.value.length <= 1) {
    message.warning('至少保留一个会话')
    return
  }
  const current = conversationList.value.find((item) => item.id === currentConversationId.value)
  if (!current) return
  if (!window.confirm(`确定删除会话「${current.title}」吗？`)) return
  const remaining = conversationList.value.filter((item) => item.id !== currentConversationId.value)
  conversationList.value = remaining
  saveConversations()
  currentConversationId.value = remaining[0]?.id || 'default'
}

function updateSelectionNotice(
  action: string,
  selectedText: string,
  instructions: string | undefined,
  status: SelectionNoticeStatus,
) {
  const actionLabelMap: Record<string, string> = {
    continue: '续写',
    polish: '润色',
    expand: '扩写',
    rewrite: '改写',
  }
  const statusLabelMap: Record<SelectionNoticeStatus, string> = {
    pending: '已识别选中内容，等待执行',
    running: '正在处理选中内容...',
    done: '已完成并应用到编辑器',
    error: '处理失败，请重试',
  }
  selectionNotice.value = {
    action,
    actionLabel: actionLabelMap[action] || '处理',
    text: selectedText,
    instructions: instructions?.trim() || undefined,
    status,
    statusText: statusLabelMap[status],
  }
}

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

  const trimmedContent = content.trim()
  const requestMessage = selectedChatContext.value
    ? `参考片段：${selectedChatContext.value.text}\n\n用户需求：${trimmedContent}`
    : trimmedContent

  // 添加用户消息
  addMessage('user', trimmedContent)

  // 清空输入框
  inputText.value = ''

  // 滚动到底部
  await scrollToBottom()

  // 调用真实AI API
  isTyping.value = true
  try {
    // 构建对话历史
    const history = messages.value
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))

    const response = await chatWithAI(requestMessage, history)
    const aiResponseText = response.reply || '抱歉，我没有理解您的问题。'

    // 直接添加AI消息（简化处理，不使用打字机效果）
    addMessage('assistant', aiResponseText)
    if (selectedChatContext.value) {
      handleClearSelectedContext()
    }
    isTyping.value = false

    // 滚动到底部
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to get AI response:', error)
    addMessage('assistant', '抱歉，我遇到了一些问题。请稍后再试。')
    isTyping.value = false
  }
}

function getGeneratedTextByAction(action: string, response: Record<string, any>): string {
  if (action === 'continue') return response.generated_text || ''
  if (action === 'polish') return response.polished_text || response.rewritten_text || ''
  if (action === 'expand') return response.expanded_text || response.rewritten_text || ''
  if (action === 'rewrite') return response.rewritten_text || response.polished_text || ''
  return ''
}

async function runSelectionAction(action: string, selectedText: string, instructions?: string) {
  if (!selectedText.trim()) return
  if (isTyping.value) return

  isTyping.value = true
  updateSelectionNotice(action, selectedText, instructions, 'running')
  try {
    const actionLabelMap: Record<string, string> = {
      continue: '续写',
      polish: '润色',
      expand: '扩写',
      rewrite: '改写',
    }
    const label = actionLabelMap[action] || '处理'
    const trimmedInstructions = (instructions || '').trim()
    const userPrompt = trimmedInstructions
      ? `[${label}] ${selectedText}\n要求：${trimmedInstructions}`
      : `[${label}] ${selectedText}`
    addMessage('user', userPrompt)

    const projectId = props.sessionId || 'demo-project'
    let response: Record<string, any> = {}
    if (action === 'continue') {
      response = await continueWriting(projectId, selectedText, 200, trimmedInstructions)
    } else if (action === 'polish') {
      response = await polishText(projectId, selectedText, trimmedInstructions || undefined)
    } else if (action === 'expand') {
      response = await expandText(projectId, selectedText, trimmedInstructions || undefined)
    } else if (action === 'rewrite') {
      response = await rewriteText(projectId, selectedText, 'polish', trimmedInstructions || undefined)
    }

    const generatedText = getGeneratedTextByAction(action, response)
    if (!generatedText) {
      addMessage('assistant', '未生成有效内容，请稍后重试。')
      return
    }

    addMessage('assistant', generatedText)
    emit('applyGeneratedText', {
      action,
      sourceText: selectedText,
      generatedText,
    })
    updateSelectionNotice(action, selectedText, instructions, 'done')
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to run selection action:', error)
    addMessage('assistant', '处理失败，请稍后重试。')
    updateSelectionNotice(action, selectedText, instructions, 'error')
  } finally {
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
 * 清空对话历史
 */
function handleClear() {
  if (confirm(t('ai.clearConfirm', '确定要清空对话历史吗？'))) {
    clearHistory()
    selectionNotice.value = null
    selectedChatContext.value = null
  }
}

function handleClearSelectedContext() {
  selectedChatContext.value = null
  if (selectionNotice.value?.action === 'chat') {
    selectionNotice.value = null
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadConversations()
  ensureCurrentConversation()
  setSessionId(chatSessionKey.value)

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
  saveConversations()

  // 停止打字机效果
  typewriter.stop()
})

// ==================== 监听 ====================
// 防抖保存（1秒防抖）
const debouncedSave = useDebounceFn(() => {
  save()
}, 1000)

// 监听消息变化，自动保存（使用防抖版本）
watch(() => messages.value, () => {
  debouncedSave()
  touchConversationTitle()
}, { deep: true })

watch(
  () => currentConversationId.value,
  () => {
    setSessionId(chatSessionKey.value)
    load()
    nextTick(() => {
      scrollToBottom()
    })
  }
)

watch(
  () => props.sessionId,
  () => {
    loadConversations()
    ensureCurrentConversation()
    setSessionId(chatSessionKey.value)
    load()
  }
)

watch(
  () => props.actionTrigger?.id,
  async (newId, oldId) => {
    if (!newId || newId === oldId || !props.actionTrigger) return
    const { action, text, instructions } = props.actionTrigger
    if (!action || !text.trim()) return

    if (action === 'add_to_chat') {
      selectedChatContext.value = {
        text: text.trim(),
        instructions: instructions?.trim() || undefined,
        addedAt: Date.now(),
      }
      selectionNotice.value = {
        action: 'chat',
        actionLabel: '对话上下文',
        text: text.trim(),
        instructions: instructions?.trim() || undefined,
        status: 'done',
        statusText: '已加入即将发送内容，下一条消息会自动携带',
      }
      return
    }

    if (action === 'chat') {
      await sendMessage(text)
      return
    }

    if (['continue', 'polish', 'expand', 'rewrite'].includes(action)) {
      updateSelectionNotice(action, text, instructions, 'pending')
      await runSelectionAction(action, text, instructions)
    }
  }
)
</script>

<style scoped lang="scss">
.ai-panel {
  --ai-panel-width: 320px;
  --ai-bg: #ffffff;
  --ai-bg-soft: #f8fafc;
  --ai-border: #e2e8f0;
  --ai-border-strong: #cbd5e1;
  --ai-text: #0f172a;
  --ai-text-muted: #64748b;
  --ai-user-bg: #2563eb;
  --ai-user-bg-hover: #1d4ed8;
  --ai-assistant-bg: #f1f5f9;
  --ai-accent-soft: #dbeafe;

  width: var(--ai-panel-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--ai-bg);
  color: var(--ai-text);
  border-left: 1px solid var(--ai-border);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;

  // 响应式布局
  &.is-mobile {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--ai-border);
    border-radius: 12px 12px 0 0;
  }

  &.is-tablet {
    --ai-panel-width: 280px;
  }
}

.ai-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--ai-bg-soft);
  border-bottom: 1px solid var(--ai-border);

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .ai-icon {
      font-size: 18px;
      color: #2563eb;
    }

    .header-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--ai-text);
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
      color: var(--ai-text-muted);
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      &:hover {
        background: var(--ai-accent-soft);
        color: #1d4ed8;
      }

      &:active {
        background: #bfdbfe;
      }
    }
  }
}

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fcfdff;
}

.conversation-toolbar {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ai-border);
  background: #ffffff;

  .conversation-select {
    flex: 1;
    min-width: 0;
    height: 32px;
    border: 1px solid var(--ai-border-strong);
    border-radius: 8px;
    padding: 0 8px;
    background: #ffffff;
    color: var(--ai-text);
    font-size: 12px;
  }

  .conversation-new-btn {
    height: 32px;
    padding: 0 10px;
    border: 1px solid #93c5fd;
    border-radius: 8px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  .conversation-action-btn {
    width: 32px;
    height: 32px;
    border: 1px solid var(--ai-border-strong);
    border-radius: 8px;
    background: #ffffff;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

.selection-notice {
  margin: 10px 12px 0;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #334155;

  .selection-title {
    font-weight: 600;
  }

  .selection-content {
    margin-top: 4px;
    color: #475569;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selection-extra {
    margin-top: 4px;
    color: #1e293b;
  }

  .selection-status {
    margin-top: 6px;
    font-weight: 600;
  }

  &.is-running {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  &.is-done {
    border-color: #86efac;
    background: #f0fdf4;
  }

  &.is-error {
    border-color: #fca5a5;
    background: #fef2f2;
  }
}

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
  color: #94a3b8;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
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
    background: var(--ai-user-bg);
    color: white;
    border-bottom-right-radius: 4px;
  }

  &.message-ai {
    background: var(--ai-assistant-bg);
    border: 1px solid var(--ai-border);
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
  }

  .message-time {
    margin-top: 4px;
    font-size: 11px;
    color: var(--ai-text-muted);
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
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.ai-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px 16px;

  .quick-action-card {
    background: #ffffff;
    border: 1px solid var(--ai-border);
    border-radius: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    text-align: left;

    &:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      transform: translateX(4px);
    }

    &:active {
      transform: translateX(0);
    }

    .quick-action-icon {
      font-size: 20px;
      color: #2563eb;
      flex-shrink: 0;
    }

    .quick-action-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--ai-text);
    }
  }
}

.ai-input-area {
  padding: 12px 16px;
  background: var(--ai-bg-soft);
  border-top: 1px solid var(--ai-border);

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
    border: 1px solid var(--ai-border-strong);
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
      color: var(--ai-text);
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
      background: var(--ai-user-bg);
      color: white;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background: var(--ai-user-bg-hover);
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

@media (max-width: 768px) {
  .ai-panel {
    .ai-quick-actions {
      gap: 6px;

      .quick-action-card {
        padding: 10px 12px;

        .quick-action-icon {
          font-size: 18px;
        }

        .quick-action-label {
          font-size: 12px;
        }
      }
    }
  }
}

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
