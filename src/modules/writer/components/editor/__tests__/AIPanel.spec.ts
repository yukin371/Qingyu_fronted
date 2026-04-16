import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import AIPanel from '../AIPanel.vue'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import { continueWriting, rewriteText } from '@/modules/ai/api'

const messages = ref<Array<{ role: string; content: string }>>([])
const addMessage = vi.fn()
const clearHistory = vi.fn()
const save = vi.fn()
const load = vi.fn()
const setSessionId = vi.fn()

vi.mock('@/composables/useI18n', () => ({
  useI18n: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}))

vi.mock('@/composables/useBreakpoints', () => ({
  useBreakpoints: () => ({
    smaller: () => false,
    between: () => false,
    greaterOrEqual: () => true,
  }),
}))

vi.mock('@/composables/useChatHistory', () => ({
  useChatHistory: () => ({
    messages,
    addMessage,
    clearHistory,
    save,
    load,
    setSessionId,
  }),
}))

vi.mock('@/composables/useTypewriter', () => ({
  useTypewriter: () => ({
    stop: vi.fn(),
  }),
}))

vi.mock('@/modules/ai/api', () => ({
  chatWithAI: vi.fn(),
  continueWriting: vi.fn(),
  polishText: vi.fn(),
  expandText: vi.fn(),
  rewriteText: vi.fn(),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    warning: vi.fn(),
  },
}))

const AIHeaderStub = defineComponent({
  template: '<div data-testid="ai-header" />',
})

const AIConversationToolbarStub = defineComponent({
  props: {
    currentId: {
      type: String,
      default: 'default',
    },
    conversationList: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:currentId', 'create', 'rename', 'delete'],
  template: '<div data-testid="conversation-toolbar" />',
})

const AISelectionNoticeStub = defineComponent({
  props: {
    notice: {
      type: Object,
      default: null,
    },
  },
  template:
    '<div data-testid="selection-notice">{{ notice ? `${notice.action}:${notice.text}` : "empty" }}</div>',
})

const AIChatMessagesStub = defineComponent({
  template: '<div data-testid="chat-messages" />',
  methods: {
    scrollToBottom() {},
  },
})

const AIQuickActionsStub = defineComponent({
  template: '<div data-testid="quick-actions" />',
})

const AIInputAreaStub = defineComponent({
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    context: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      default: 'chat',
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'update:mode', 'send', 'clear-context'],
  template:
    '<div><div data-testid="input-context">{{ context ? context.text : "empty" }}</div><div data-testid="input-mode">{{ mode }}</div><button data-testid="input-send" @click="$emit(\'send\')">send</button></div>',
})

function buildWorkflowContext(signature: string, chapterId = signature): WriterWorkflowContext {
  return {
    signature,
    projectId: 'project-1',
    chapterId,
    chapterTitle: `章节 ${chapterId}`,
    scopeLabel: `scope-${chapterId}`,
    activeCharacters: [],
    activeRelations: [],
    pendingChangeRequests: [],
    pendingChangeRequestCount: 0,
  }
}

function mountPanel() {
  return mount(AIPanel, {
    props: {
      sessionId: 'project-1',
      sourceText: '',
      workflowContext: buildWorkflowContext('chapter-1'),
      actionTrigger: null,
    },
    global: {
      stubs: {
        AIHeader: AIHeaderStub,
        AIConversationToolbar: AIConversationToolbarStub,
        AISelectionNotice: AISelectionNoticeStub,
        AIChatMessages: AIChatMessagesStub,
        AIQuickActions: AIQuickActionsStub,
        AIInputArea: AIInputAreaStub,
      },
    },
  })
}

describe('AIPanel', () => {
  beforeEach(() => {
    messages.value = []
    addMessage.mockReset()
    clearHistory.mockReset()
    save.mockReset()
    load.mockReset()
    setSessionId.mockReset()
    vi.mocked(rewriteText).mockReset()
    localStorage.clear()
  })

  it('clears add_to_chat handoff state when workflow scope changes', async () => {
    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 1,
        action: 'add_to_chat',
        text: '上一章的重点片段',
        instructions: '保留人物语气',
      },
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toContain('上一章的重点片段')

    await wrapper.setProps({
      workflowContext: buildWorkflowContext('chapter-2'),
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
  })

  it('clears add_to_chat handoff state when session changes', async () => {
    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 2,
        action: 'add_to_chat',
        text: '需要带到对话里的旧上下文',
      },
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toContain(
      '需要带到对话里的旧上下文',
    )

    await wrapper.setProps({
      sessionId: 'project-2',
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
  })

  it('keeps execution status in selection notice for continue action while chat context stays empty', async () => {
    vi.mocked(continueWriting).mockResolvedValue({
      generated_text: '续写后的内容',
    } as never)

    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 3,
        action: 'continue',
        text: '原始选中文本',
        instructions: '延续当前语气',
      },
    })
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toContain(
      'continue:原始选中文本',
    )
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
  })

  it('directly applies rewritten text when sending an edit instruction with selected context', async () => {
    vi.mocked(rewriteText).mockResolvedValue({
      rewritten_text: '修改后的正文',
    } as never)

    const wrapper = mountPanel()

    await wrapper.setProps({
      actionTrigger: {
        id: 4,
        action: 'add_to_chat',
        text: '原始正文片段',
        instructions: '保留悬疑氛围',
        from: 2,
        to: 6,
      },
    })
    await nextTick()

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '把语气改得更紧张')
    await nextTick()
    input.vm.$emit('send')
    await Promise.resolve()
    await Promise.resolve()
    await nextTick()

    expect(vi.mocked(rewriteText)).toHaveBeenCalledTimes(1)
  })

  it('supports direct whole-document rewriting when no selection context exists', async () => {
    vi.mocked(rewriteText).mockResolvedValue({
      rewritten_text: '整章重写后的正文',
    } as never)

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '当前整章正文',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIHeader: AIHeaderStub,
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:mode', 'edit')
    input.vm.$emit('update:modelValue', '把这一章改得更紧张')
    await nextTick()
    input.vm.$emit('send')
    await Promise.resolve()
    await Promise.resolve()
    await nextTick()

    expect(vi.mocked(rewriteText)).toHaveBeenCalledWith(
      'project-1',
      '当前整章正文',
      'polish',
      expect.stringContaining('请直接输出可替换整章正文的完整版本。'),
    )
  })
})
