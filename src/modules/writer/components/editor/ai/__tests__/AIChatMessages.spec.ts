/**
 * AIChatMessages 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AIChatMessages from '../AIChatMessages.vue'
import type { ChatMessage } from '../types'

vi.mock('marked', () => ({
  marked: (content: string) => `<p>${content}</p>`,
}))

vi.mock('@/utils/sanitize', () => ({
  sanitizeMarkdownHtml: (html: string) => html,
}))

// Mock QyIcon
vi.mock('@/design-system/components/basic/QyIcon/QyIcon.vue', () => ({
  default: {
    name: 'QyIcon',
    template: '<span class="qy-icon"><slot /></span>',
  },
}))

// Mock useI18n
vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}))

describe('AIChatMessages', () => {
  const buildWrapper = (props: Record<string, unknown>) =>
    mount(AIChatMessages, {
      props,
      global: {
        directives: {
          safeHtml: {
            mounted(el, binding) {
              el.innerHTML = binding.value ?? ''
            },
            updated(el, binding) {
              el.innerHTML = binding.value ?? ''
            },
          },
        },
      },
    })

  it('should show empty state when no messages', () => {
    const wrapper = buildWrapper({ messages: [] })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-text').text()).toContain('开始与AI助手对话')
  })

  it('should render user message correctly', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })
    expect(wrapper.find('.message-user').exists()).toBe(true)
    expect(wrapper.find('.message-user .message-content').text()).toBe('Hello')
  })

  it('should render AI message correctly', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })
    expect(wrapper.find('.message-ai').exists()).toBe(true)
    expect(wrapper.find('.message-ai .message-content').html()).toContain('<p>Hi there!</p>')
  })

  it('should show typing indicator when message is typing', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: '', timestamp: Date.now(), typing: true },
    ]
    const wrapper = buildWrapper({ messages, typingText: 'Loading...', isTyping: true })
    expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    expect(wrapper.find('.message-ai .message-content').html()).toContain('<p>Loading...</p>')
  })

  it('should render markdown content for assistant messages', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: '**重点**', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-ai .message-content').html()).toContain('<p>**重点**</p>')
  })

  it('should render structured patch preview card when assistant message carries meta', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '已为第二章生成 patch 预览。',
        timestamp: Date.now(),
        meta: {
          kind: 'document_tool_patch_preview',
          status: 'switching',
          statusText: '正在切换章节并准备正文 diff',
          documentLabel: '第二章（chapter-2）',
          operationType: 'delete_lines',
          blockCount: 1,
          totalLines: 12,
          blocks: [
            {
              header: '变更 1 [delete_lines] 8-10',
              before: ['旧内容一', '旧内容二'],
              after: [],
            },
          ],
        },
      },
    ]

    const wrapper = buildWrapper({ messages })

    expect(wrapper.find('.message-tool-card').exists()).toBe(true)
    expect(wrapper.find('.message-tool-card__title').text()).toBe('第二章（chapter-2）')
    expect(wrapper.find('.message-tool-card__status').text()).toContain('正在切换章节')
    expect(wrapper.find('.message-tool-block__title').text()).toContain('delete_lines')
    expect(wrapper.find('.message-tool-block__panel--before').text()).toContain('旧内容一')
    expect(wrapper.find('.message-tool-block__panel--after').text()).toContain('删除')
  })

  it('should show pending assistant bubble when panel is typing without persisted typing message', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: '继续写', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages, isTyping: true, typingText: '正在思考，请稍候…' })

    expect(wrapper.find('.message-ai-pending').exists()).toBe(true)
    expect(wrapper.find('.message-ai-pending .message-content').html()).toContain(
      '<p>正在思考，请稍候…</p>',
    )
    expect(wrapper.find('.message-ai-pending .message-time').text()).toBe('思考中')
  })

  it('should format recent timestamp as "刚刚"', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Test', timestamp: Date.now() },
    ]
    const wrapper = buildWrapper({ messages })
    expect(wrapper.find('.message-time').text()).toBe('刚刚')
  })

  it('should expose scrollToBottom method', () => {
    const wrapper = buildWrapper({ messages: [] })
    expect(typeof wrapper.vm.scrollToBottom).toBe('function')
  })
})
