/**
 * 对话历史管理组合式函数
 *
 * 管理AI助手面板的消息列表和会话状态，集成LocalStorage持久化。
 * 提供消息添加、历史加载、清空等功能。
 *
 * @param sessionId - 会话ID，用于区分不同的对话会话
 * @returns 对话历史管理对象
 *
 * @example
 * ```typescript
 * const { messages, addMessage, clearHistory, save, load } = useChatHistory('session-1')
 * ```
 *
 * @author 猫娘Kore
 * @date 2026-02-08
 */

import { ref, watch } from 'vue'
import { useLocalStorage } from './useLocalStorage'

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  /** 消息唯一标识 */
  id: string
  /** 消息角色 */
  role: 'user' | 'assistant' | 'system'
  /** 消息内容 */
  content: string
  /** 时间戳 */
  timestamp: number
  /** 是否正在打字中 */
  typing?: boolean
}

export interface UseChatHistoryReturn {
  /** 消息列表 */
  messages: ReturnType<typeof ref<ChatMessage[]>>
  /** 会话ID */
  sessionId: ReturnType<typeof ref<string>>
  /** 添加消息 */
  addMessage: (role: ChatMessage['role'], content: string) => ChatMessage
  /** 清空历史 */
  clearHistory: () => void
  /** 保存历史 */
  save: () => void
  /** 加载历史 */
  load: () => void
  /** 删除指定消息 */
  deleteMessage: (messageId: string) => void
  /** 更新消息内容 */
  updateMessage: (messageId: string, content: string) => void
  /** 获取用户消息数量 */
  userMessageCount: ReturnType<typeof computed<number>>
  /** 获取AI消息数量 */
  aiMessageCount: ReturnType<typeof computed<number>>
}

import { computed } from 'vue'

export function useChatHistory(sessionId: string): UseChatHistoryReturn {
  const storageKey = `ai-chat-${sessionId}`
  const { data: messages, save: saveToStorage, load: loadFromStorage } = useLocalStorage<ChatMessage[]>(storageKey, [])

  const currentSessionId = ref(sessionId)

  /**
   * 生成唯一消息ID
   */
  function generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 添加消息
   */
  function addMessage(role: ChatMessage['role'], content: string): ChatMessage {
    const message: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
      typing: role === 'assistant' // AI消息默认为打字状态
    }

    messages.value.push(message)
    saveToStorage()

    return message
  }

  /**
   * 清空历史
   */
  function clearHistory() {
    messages.value = []
    saveToStorage()
  }

  /**
   * 保存历史（手动触发）
   */
  function save() {
    saveToStorage()
  }

  /**
   * 加载历史（手动触发）
   */
  function load() {
    loadFromStorage()
  }

  /**
   * 删除指定消息
   */
  function deleteMessage(messageId: string) {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
      saveToStorage()
    }
  }

  /**
   * 更新消息内容
   */
  function updateMessage(messageId: string, content: string) {
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.content = content
      message.typing = false
      saveToStorage()
    }
  }

  /**
   * 计算用户消息数量
   */
  const userMessageCount = computed(() => {
    return messages.value.filter(m => m.role === 'user').length
  })

  /**
   * 计算AI消息数量
   */
  const aiMessageCount = computed(() => {
    return messages.value.filter(m => m.role === 'assistant').length
  })

  return {
    messages,
    sessionId: currentSessionId,
    addMessage,
    clearHistory,
    save,
    load,
    deleteMessage,
    updateMessage,
    userMessageCount,
    aiMessageCount
  }
}

/**
 * 对话历史管理钩子（带预设消息）
 *
 * @param sessionId - 会话ID
 * @param presetMessages - 预设消息列表
 * @returns 对话历史管理对象
 */
export interface UseChatHistoryWithPresetReturn extends UseChatHistoryReturn {
  /** 重置到预设消息 */
  resetToPreset: () => void
  /** 是否使用预设消息 */
  isUsingPreset: ReturnType<typeof ref<boolean>>
}

export function useChatHistoryWithPreset(
  sessionId: string,
  presetMessages: ChatMessage[] = []
): UseChatHistoryWithPresetReturn {
  const history = useChatHistory(sessionId)
  const isUsingPreset = ref(false)

  /**
   * 重置到预设消息
   */
  function resetToPreset() {
    history.messages.value = [...presetMessages]
    history.save()
    isUsingPreset.value = true
  }

  // 监听消息变化，如果与预设不同则标记为非预设状态
  watch(() => history.messages.value, (newMessages) => {
    if (JSON.stringify(newMessages) !== JSON.stringify(presetMessages)) {
      isUsingPreset.value = false
    }
  }, { deep: true })

  return {
    ...history,
    resetToPreset,
    isUsingPreset
  }
}
