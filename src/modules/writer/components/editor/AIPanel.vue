<template>
  <div
    class="ai-panel"
    :class="{
      'is-mobile': isMobile,
      'is-tablet': isTablet,
      'is-desktop': isDesktop,
    }"
    :style="panelStyle"
  >
    <!-- 面板内容 -->
    <div class="ai-content">
      <!-- 对话工具栏 -->
      <AIConversationToolbar
        v-model:currentId="currentConversationId"
        :conversation-list="conversationList"
        :disabled="isTyping"
        @clear="handleClearConversation"
        @create="handleCreateConversation"
        @rename="handleRenameConversation"
        @delete="handleDeleteConversation"
      />

      <!-- 选中内容提示 -->
      <AISelectionNotice :notice="visibleSelectionNotice" />

      <!-- 消息列表区域 -->
      <AIChatMessages
        ref="chatMessagesRef"
        :messages="messages"
        :typing-text="typingText"
        :is-typing="isTyping"
      />

      <!-- 快捷操作卡片 -->
      <AIQuickActions
        v-if="messages.length === 0"
        :actions="quickActions"
        :disabled="isTyping"
        @select="handleQuickAction"
      />

      <!-- 输入框区域 -->
      <AIInputArea
        v-model="inputText"
        :context="selectedChatContext"
        v-model:mode="interactionMode"
        :can-edit="canEditDirectly"
        :disabled="isTyping"
        :placeholder="t('ai.inputPlaceholder', '输入消息...')"
        :hint="t('ai.hint', '按 Enter 发送，Shift + Enter 换行')"
        @send="handleSend"
        @clear-context="handleClearSelectedContext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useChatHistory } from '@/composables/useChatHistory'
import { useTypewriter } from '@/composables/useTypewriter'
import { message } from '@/design-system/services'
import { QUICK_ACTION_PROMPTS, getQuickActionPrompt } from '@/utils/mockAIResponse'
import {
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
  summarizeText,
  proofreadText,
} from '@/modules/ai/api'

type DetectedIntentAction = 'summarize' | 'rewrite' | 'continue' | 'proofread' | 'expand'
type DetectedIntentKind = 'edit' | 'analysis'

interface DetectedIntent {
  action: DetectedIntentAction
  confidence: number
  kind: DetectedIntentKind
  targetLength?: number
}

type EditorApplyMode =
  | 'replace_selection'
  | 'insert_after_selection'
  | 'append_paragraph'
  | 'replace_document'

/**
 * 意图识别：基于关键词将自由对话路由到专用 API
 * 返回 null 表示走通用 chat
 */
function extractTargetLength(text: string): number | undefined {
  const directMatch = text.match(/(?:扩写|扩充|扩展|续写|补充|增加)[^\d]{0,8}(\d{2,5})\s*字/i)
  if (directMatch) {
    return Number(directMatch[1])
  }

  const genericMatch = text.match(/(?:到|至|成文约?|写到|补到)?\s*(\d{2,5})\s*字/i)
  if (!genericMatch) {
    return undefined
  }

  const value = Number(genericMatch[1])
  return Number.isFinite(value) ? value : undefined
}

function detectIntent(text: string): DetectedIntent | null {
  const t = text.toLowerCase()
  const rules: Array<{ keywords: string[]; action: DetectedIntentAction; kind: DetectedIntentKind }> = [
    {
      keywords: ['总结', '摘要', '概括', '提取要点', '归纳', 'summarize', 'summary', 'summarise'],
      action: 'summarize',
      kind: 'analysis',
    },
    {
      keywords: ['扩写', '扩充', '扩展', '补充细节', '增加描写', '写长一点', '写到', '补到'],
      action: 'expand',
      kind: 'edit',
    },
    {
      keywords: ['改写', '重写', '换种说法', '润色', '优化表达', '换个写法', '改善', 'rewrite', 'rephrase', 'polish'],
      action: 'rewrite',
      kind: 'edit',
    },
    {
      keywords: ['续写', '继续写', '接着写', '往下写', '继续', 'continue', 'keep writing', '接下来'],
      action: 'continue',
      kind: 'edit',
    },
    {
      keywords: ['校对', '检查错误', '纠错', '错别字', '语法检查', 'proofread', 'check grammar', '拼写'],
      action: 'proofread',
      kind: 'analysis',
    },
  ]
  for (const rule of rules) {
    if (rule.keywords.some((kw) => t.includes(kw))) {
      const targetLength =
        rule.action === 'expand' || rule.action === 'continue' ? extractTargetLength(text) : undefined
      return { action: rule.action, kind: rule.kind, confidence: 0.9, targetLength }
    }
  }
  return null
}

function resolveAIErrorMessage(error: unknown): string {
  const fallback = '抱歉，我遇到了一些问题。请稍后再试。'
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const record = error as {
    code?: string
    message?: string
    response?: {
      status?: number
      data?: Record<string, unknown> | string
    }
  }

  const status = record.response?.status
  const responseData = record.response?.data
  const responseMessage =
    typeof responseData === 'string'
      ? responseData
      : typeof responseData?.message === 'string'
        ? responseData.message
        : typeof responseData?.detail === 'string'
          ? responseData.detail
          : typeof responseData?.error === 'string'
            ? responseData.error
            : ''

  if (status === 401) {
    return 'AI 请求未通过鉴权，请刷新页面后重试。'
  }
  if (status === 404) {
    return '当前 AI 接口不可用，请检查服务配置后重试。'
  }
  if (status && status >= 500) {
    return responseMessage || 'AI 服务暂时不可用，请稍后再试。'
  }
  if (record.code === 'ECONNABORTED' || /timeout/i.test(record.message || '')) {
    return 'AI 请求超时，请稍后重试。'
  }
  if (/network error/i.test(record.message || '')) {
    return 'AI 服务连接失败，请确认本地 AI 服务已启动。'
  }

  return responseMessage || fallback
}
import type {
  WriterAIActionTrigger,
  WriterRevisionSeed,
  WriterResultCandidate,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import { buildWriterWorkflowContextPrompt } from '@/modules/writer/types/workflow'

// 子组件
import {
  AIConversationToolbar,
  AISelectionNotice,
  AIChatMessages,
  AIQuickActions,
  AIInputArea,
} from './ai'

// 类型
import type {
  ConversationMeta,
  SelectionNotice,
  SelectionNoticeStatus,
  ChatContextSnippet,
  QuickAction,
} from './ai/types'

// 防抖函数
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
  sourceText?: string
  actionTrigger?: WriterAIActionTrigger | null
  workflowContext?: WriterWorkflowContext | null
  revisionSeed?: WriterRevisionSeed | null
}

interface Emits {
  (
    e: 'applyGeneratedText',
    payload: {
      action: string
      sourceText: string
      generatedText: string
      applyMode?:
        | 'replace_selection'
        | 'insert_after_selection'
        | 'append_paragraph'
        | 'replace_document'
    },
  ): void
  (e: 'resultCandidate', payload: WriterResultCandidate): void
}

// ==================== Props & Emits ====================
const props = withDefaults(defineProps<Props>(), {
  sessionId: 'default',
  width: 320,
})

const emit = defineEmits<Emits>()

// ==================== 国际化 ====================
const { t } = useI18n()

// ==================== 响应式断点 ====================
const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
})

const isMobile = breakpoints.smaller('mobile')
const isTablet = breakpoints.between('mobile', 'desktop')
const isDesktop = breakpoints.greaterOrEqual('desktop')

// ==================== 对话历史管理 ====================
const currentConversationId = ref('default')
const conversationList = ref<ConversationMeta[]>([])
const chatSessionKey = computed(() => `${props.sessionId}:${currentConversationId.value}`)
const { messages, addMessage, clearHistory, save, load, setSessionId } = useChatHistory(
  chatSessionKey.value,
)

// ==================== 打字机效果 ====================
const typingText = ref('')
const typewriter = useTypewriter('', 30)

// ==================== UI状态 ====================
const inputText = ref('')
const isTyping = ref(false)
const interactionMode = ref<'chat' | 'edit'>('chat')
const chatMessagesRef = ref<InstanceType<typeof AIChatMessages>>()
const selectionNotice = ref<SelectionNotice | null>(null)
const selectedChatContext = ref<ChatContextSnippet | null>(null)
const selectedChatContextScope = ref<{
  sessionId: string
  workflowSignature: string
} | null>(null)

// ==================== 快捷操作 ====================
const quickActions = computed<QuickAction[]>(() => [
  { id: 'continue', ...QUICK_ACTION_PROMPTS.continue },
  { id: 'polish', ...QUICK_ACTION_PROMPTS.polish },
  { id: 'summary', ...QUICK_ACTION_PROMPTS.summary },
])

// ==================== 计算属性 ====================
const panelStyle = computed(() => {
  return {
    '--ai-panel-width': `${props.width}px`,
  }
})

const conversationStorageKey = computed(() => `ai-conversation-list-${props.sessionId}`)
const effectiveWorkflowContext = computed(
  () => props.actionTrigger?.context ?? props.workflowContext ?? null,
)
const effectiveWorkflowSignature = computed(() => effectiveWorkflowContext.value?.signature ?? '')
const canEditDirectly = computed(
  () => !!selectedChatContext.value?.text.trim() || !!props.sourceText?.trim(),
)
const visibleSelectionNotice = computed(() =>
  selectionNotice.value?.action === 'chat' ? null : selectionNotice.value,
)

// ==================== 对话管理方法 ====================
function loadConversations() {
  try {
    const raw = localStorage.getItem(conversationStorageKey.value)
    const parsed = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed : []
    const deduped = list.filter((item, index, arr) => {
      if (!item?.id) return false
      return arr.findIndex((x) => x?.id === item.id) === index
    })
    conversationList.value =
      list.length > 0
        ? list
        : [
            {
              id: 'default',
              title: '默认对话',
              updatedAt: Date.now(),
            },
          ]
    if (deduped.length > 0) {
      conversationList.value = deduped
    }
  } catch {
    conversationList.value = [
      {
        id: 'default',
        title: '默认对话',
        updatedAt: Date.now(),
      },
    ]
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

function handleClearConversation() {
  if (!confirm(t('ai.clearConfirm', '确定要清空当前对话吗？'))) {
    return
  }

  clearHistory()
  inputText.value = ''
  selectionNotice.value = null
  selectedChatContext.value = null
  selectedChatContextScope.value = null
  interactionMode.value = 'chat'
}

// ==================== 选中提示管理 ====================
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

function resolveEditApplyMode(action: DetectedIntentAction | 'direct_edit', hasSelectionContext: boolean): EditorApplyMode {
  if (action === 'continue') {
    return hasSelectionContext ? 'insert_after_selection' : 'append_paragraph'
  }

  return hasSelectionContext ? 'replace_selection' : 'replace_document'
}

function buildAnalysisCandidate(
  intent: DetectedIntent,
  generatedText: string,
  sourceText: string,
): WriterResultCandidate {
  if (intent.action === 'summarize') {
    return {
      source: 'summary',
      action: 'summary',
      title: '章节方向提案',
      summary: generatedText.slice(0, 72) || '已生成新的摘要结果。',
      generatedText,
      sourceText,
    }
  }

  return {
    source: 'review',
    action: 'proofread',
    title: '审校建议提案',
    summary: generatedText.slice(0, 72) || '已生成新的审校建议。',
    generatedText,
    sourceText,
  }
}

async function requestEditIntent(
  projectId: string,
  sourceText: string,
  instruction: string,
  intent: DetectedIntent | null,
  applyMode: EditorApplyMode,
  baseInstructions?: string,
) {
  const action = intent?.action ?? 'rewrite'
  const workflowContextPrompt = buildWriterWorkflowContextPrompt(effectiveWorkflowContext.value)
  const replacementHint =
    applyMode === 'replace_document'
      ? '请直接输出可替换整章正文的完整版本。'
      : applyMode === 'replace_selection'
        ? '请直接输出可替换当前选中文本的完整版本。'
        : ''
  const mergedInstructions = [instruction, baseInstructions || '', replacementHint, workflowContextPrompt]
    .filter((item) => item && item.trim())
    .join('\n\n')

  if (action === 'continue') {
    const response = await continueWriting(
      projectId,
      sourceText,
      intent?.targetLength ?? 300,
      mergedInstructions || undefined,
    )
    return {
      emittedAction: 'continue' as const,
      label: '续写',
      generatedText: response.generated_text || '',
      applyMode,
    }
  }

  if (action === 'expand') {
    const response = await expandText(
      projectId,
      sourceText,
      mergedInstructions || undefined,
      intent?.targetLength,
    )
    return {
      emittedAction: 'expand' as const,
      label: '扩写',
      generatedText: response.expanded_text || response.rewritten_text || '',
      applyMode,
    }
  }

  const response = await rewriteText(
    projectId,
    sourceText,
    'polish',
    mergedInstructions || undefined,
  )
  return {
    emittedAction: 'rewrite' as const,
    label: '改写',
    generatedText: response.rewritten_text || response.polished_text || '',
    applyMode,
  }
}

// ==================== 消息发送方法 ====================
async function sendMessage(content: string) {
  if (!content.trim() || isTyping.value) return

  const trimmedContent = content.trim()

  // ── 先识别意图 ──
  const intent = detectIntent(trimmedContent)

  // edit 模式下，默认将输入视为正文修改要求；分析类意图仍回到普通对话/候选流程。
  if (
    interactionMode.value === 'edit' &&
    canEditDirectly.value &&
    (!intent || intent.kind === 'edit')
  ) {
    await runDirectEdit(trimmedContent, intent)
    return
  }
  const requestMessage = selectedChatContext.value
    ? `参考片段：${selectedChatContext.value.text}\n\n用户需求：${trimmedContent}`
    : trimmedContent
  const workflowContextPrompt = buildWriterWorkflowContextPrompt(effectiveWorkflowContext.value)
  const finalRequestMessage = workflowContextPrompt
    ? `${workflowContextPrompt}\n\n${requestMessage}`
    : requestMessage

  // 添加用户消息
  addMessage('user', trimmedContent)

  // 清空输入框
  inputText.value = ''

  // 滚动到底部
  await scrollToBottom()

  // 调用真实AI API
  isTyping.value = true
  try {
    // ── 意图识别路由 ──
    const intent = detectIntent(trimmedContent)
    const hasSourceText =
      !!selectedChatContext.value?.text.trim() || !!props.sourceText?.trim()

    if (intent && hasSourceText) {
      const sourceText =
        selectedChatContext.value?.text.trim() || props.sourceText?.trim() || ''
      const projectId = props.sessionId || 'demo-project'
      let generatedText = ''
      const hasSelectionContext = !!selectedChatContext.value?.text.trim()

      if (intent.kind === 'analysis') {
        if (intent.action === 'proofread') {
          const proofread = await proofreadText(sourceText, {
            projectId,
          })
          generatedText = proofread.issues
            .map((issue, index) => {
              const suggestions = Array.isArray(issue.suggestions) && issue.suggestions.length > 0
                ? ` 建议：${issue.suggestions.join('；')}`
                : ''
              return `${index + 1}. ${issue.message || '检测到可优化项。'}${suggestions}`
            })
            .join('\n')
        } else {
          const response = await summarizeText(sourceText, {
            projectId,
            summaryType: 'detailed',
          })
          generatedText = response.summary || response.keyPoints.join('\n')
        }

        if (generatedText.trim()) {
          addMessage('assistant', generatedText)
          emit('resultCandidate', buildAnalysisCandidate(intent, generatedText, sourceText))
        } else {
          addMessage('assistant', '未返回有效结果，请重试。')
        }
      } else {
        const applyMode = resolveEditApplyMode(intent.action, hasSelectionContext)
        const editResult = await requestEditIntent(
          projectId,
          sourceText,
          trimmedContent,
          intent,
          applyMode,
        )
        generatedText = editResult.generatedText

        if (generatedText.trim()) {
          addMessage('assistant', generatedText)
          emit('resultCandidate', {
            source: 'rewrite',
            action: editResult.emittedAction,
            title: `${editResult.label}结果`,
            summary: generatedText.slice(0, 72),
            generatedText,
            sourceText,
          })
          emit('applyGeneratedText', {
            action: editResult.emittedAction,
            sourceText,
            generatedText,
            applyMode: editResult.applyMode,
          })
        } else {
          addMessage('assistant', `${editResult.label}未返回有效内容，请重试。`)
        }
      }

      if (selectedChatContext.value) handleClearSelectedContext()
      isTyping.value = false
      await scrollToBottom()
      return
    }

    // ── 通用聊天（无匹配意图或无选中文本）──
    // 构建对话历史
    const history = messages.value
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    const response = await chatWithAI(finalRequestMessage, history)
    const aiResponseText = response.reply || '抱歉，我没有理解您的问题。'

    // 通用对话：只在聊天气泡中显示，不触发编辑器候选
    addMessage('assistant', aiResponseText)
    if (selectedChatContext.value) {
      handleClearSelectedContext()
    }
    isTyping.value = false

    // 滚动到底部
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to get AI response:', error)
    addMessage('assistant', resolveAIErrorMessage(error))
    isTyping.value = false
  }
}

async function runDirectEdit(instruction: string, intent: DetectedIntent | null = null) {
  const context = selectedChatContext.value
  const sourceText = context?.text.trim() || props.sourceText?.trim() || ''
  if (!sourceText) return
  const hasSelectionContext = !!context?.text.trim()
  const applyMode = resolveEditApplyMode(intent?.action ?? 'direct_edit', hasSelectionContext)

  isTyping.value = true
  addMessage(
    'user',
    `[直接修改正文]\n目标${applyMode === 'replace_document' ? '章节' : '片段'}：${sourceText}\n修改要求：${instruction}`,
  )
  inputText.value = ''
  await scrollToBottom()

  try {
    const projectId = props.sessionId || 'demo-project'
    const editResult = await requestEditIntent(
      projectId,
      sourceText,
      instruction,
      intent,
      applyMode,
      context?.instructions?.trim() || '',
    )
    const generatedText = editResult.generatedText

    if (!generatedText.trim()) {
      addMessage('assistant', '未生成可应用的正文，请调整要求后重试。')
      return
    }

    addMessage('assistant', generatedText)
    emit('resultCandidate', {
      source: 'rewrite',
      action: editResult.emittedAction,
      title: `AI 直接${editResult.label}结果`,
      summary: generatedText.slice(0, 72) || '已生成新的正文版本。',
      generatedText,
      sourceText,
    })
    emit('applyGeneratedText', {
      action: editResult.emittedAction,
      sourceText,
      generatedText,
      applyMode: editResult.applyMode,
    })
    if (context) {
      handleClearSelectedContext()
    }
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to run direct edit:', error)
    addMessage('assistant', '直接修改失败，请稍后重试。')
  } finally {
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
    const workflowContextPrompt = buildWriterWorkflowContextPrompt(effectiveWorkflowContext.value)
    const mergedInstructions = [trimmedInstructions, workflowContextPrompt]
      .filter((item) => item && item.trim())
      .join('\n\n')
    const userPrompt = trimmedInstructions
      ? `[${label}] ${selectedText}\n要求：${trimmedInstructions}`
      : `[${label}] ${selectedText}`
    addMessage('user', userPrompt)

    const projectId = props.sessionId || 'demo-project'
    let response: Record<string, any> = {}
    if (action === 'continue') {
      response = await continueWriting(
        projectId,
        selectedText,
        200,
        mergedInstructions || undefined,
      )
    } else if (action === 'polish') {
      response = await polishText(projectId, selectedText, mergedInstructions || undefined)
    } else if (action === 'expand') {
      response = await expandText(projectId, selectedText, mergedInstructions || undefined)
    } else if (action === 'rewrite') {
      response = await rewriteText(
        projectId,
        selectedText,
        'polish',
        mergedInstructions || undefined,
      )
    }

    const generatedText = getGeneratedTextByAction(action, response)
    if (!generatedText) {
      addMessage('assistant', '未生成有效内容，请稍后重试。')
      return
    }

    addMessage('assistant', generatedText)
    emit('resultCandidate', {
      source:
        action === 'continue' || action === 'expand' || action === 'polish' || action === 'rewrite'
          ? 'rewrite'
          : 'chat',
      action,
      title: `${label}结果`,
      summary: generatedText.slice(0, 72) || '已生成新的处理结果。',
      generatedText,
      sourceText: selectedText,
    })
    emit('applyGeneratedText', {
      action,
      sourceText: selectedText,
      generatedText,
      applyMode:
        action === 'continue' || action === 'expand'
          ? 'insert_after_selection'
          : 'replace_selection',
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

// ==================== 事件处理 ====================
function handleSend() {
  sendMessage(inputText.value)
}

function handleQuickAction(action: QuickAction) {
  const prompt = getQuickActionPrompt(action.id)
  sendMessage(prompt)
}

async function scrollToBottom() {
  await nextTick()
  chatMessagesRef.value?.scrollToBottom()
}

function handleClearSelectedContext() {
  selectedChatContext.value = null
  selectedChatContextScope.value = null
  interactionMode.value = 'chat'
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
watch(
  () => messages.value,
  () => {
    debouncedSave()
    touchConversationTitle()
  },
  { deep: true },
)

watch(
  () => currentConversationId.value,
  () => {
    setSessionId(chatSessionKey.value)
    load()
    nextTick(() => {
      scrollToBottom()
    })
  },
)

watch(
  () => props.sessionId,
  () => {
    loadConversations()
    ensureCurrentConversation()
    setSessionId(chatSessionKey.value)
    load()
  },
)

watch(
  () => ({
    sessionId: props.sessionId,
    workflowSignature: effectiveWorkflowSignature.value,
  }),
  (nextScope) => {
    const currentScope = selectedChatContextScope.value
    if (!currentScope) return

    if (
      currentScope.sessionId === nextScope.sessionId &&
      currentScope.workflowSignature === nextScope.workflowSignature
    ) {
      return
    }

    handleClearSelectedContext()
  },
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
      selectedChatContextScope.value = {
        sessionId: props.sessionId,
        workflowSignature: effectiveWorkflowSignature.value,
      }
      interactionMode.value = 'edit'
      selectionNotice.value = null
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
  },
)

watch(
  () => props.revisionSeed?.id,
  (newId, oldId) => {
    if (!newId || newId === oldId || !props.revisionSeed?.text.trim()) {
      return
    }

    selectedChatContext.value = {
      text: props.revisionSeed.text.trim(),
      instructions: props.revisionSeed.instructions?.trim() || undefined,
      addedAt: Date.now(),
    }
    selectedChatContextScope.value = {
      sessionId: props.sessionId,
      workflowSignature: effectiveWorkflowSignature.value,
    }
    interactionMode.value = 'edit'
    selectionNotice.value = null
  },
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

  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: var(--ai-text);
  border-left: none;
  border-radius: 0;
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

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(252, 253, 255, 0.72));
}

@media (prefers-reduced-motion: reduce) {
  .ai-panel {
    transition: none;
  }
}
</style>
