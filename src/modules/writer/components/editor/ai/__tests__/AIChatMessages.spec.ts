/**
 * AIChatMessages 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AIChatMessages from '../AIChatMessages.vue'
import type { ChatMessage } from '../types'

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
  it('should show empty state when no messages', () => {
    const wrapper = mount(AIChatMessages, {
      props: { messages: [] },
    })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-text').text()).toContain('开始与AI助手对话')
  })

  it('should render user message correctly', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
    ]
    const wrapper = mount(AIChatMessages, {
      props: { messages },
    })
    expect(wrapper.find('.message-user').exists()).toBe(true)
    expect(wrapper.find('.message-user .message-content').text()).toBe('Hello')
  })

  it('should render AI message correctly', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
    ]
    const wrapper = mount(AIChatMessages, {
      props: { messages },
    })
    expect(wrapper.find('.message-ai').exists()).toBe(true)
    expect(wrapper.find('.message-ai .message-content').text()).toBe('Hi there!')
  })

  it('should show typing indicator when message is typing', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: '', timestamp: Date.now(), typing: true },
    ]
    const wrapper = mount(AIChatMessages, {
      props: { messages, typingText: 'Loading...', isTyping: true },
    })
    expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    expect(wrapper.find('.message-ai .message-content').text()).toBe('Loading...')
  })

  it('should format recent timestamp as "刚刚"', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Test', timestamp: Date.now() },
    ]
    const wrapper = mount(AIChatMessages, {
      props: { messages },
    })
    expect(wrapper.find('.message-time').text()).toBe('刚刚')
  })

  it('should expose scrollToBottom method', () => {
    const wrapper = mount(AIChatMessages, {
      props: { messages: [] },
    })
    expect(typeof wrapper.vm.scrollToBottom).toBe('function')
  })
})
