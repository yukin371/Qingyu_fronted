import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import AIPanel from '../AIPanel.vue'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import { continueWriting, expandText, rewriteText, summarizeText } from '@/modules/ai/api'

const messages = ref<Array<{ role: string; content: string }>>([])
const addMessage = vi.fn()
const clearHistory = vi.fn()
const save = vi.fn()
const load = vi.fn()
const setSessionId = vi.fn()
const mockExecuteWriterDocumentCommand = vi.fn()

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
  summarizeText: vi.fn(),
  proofreadText: vi.fn(),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    warning: vi.fn(),
  },
}))

vi.mock('@/modules/writer/services/documentToolCommands.service', () => ({
  executeWriterDocumentCommand: (...args: unknown[]) => mockExecuteWriterDocumentCommand(...args),
}))

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
  emits: ['update:currentId', 'clear', 'create', 'rename', 'delete'],
  template:
    '<div><div data-testid="conversation-toolbar" /><button data-testid="toolbar-clear" @click="$emit(\'clear\')">clear</button></div>',
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
    vi.mocked(expandText).mockReset()
    vi.mocked(rewriteText).mockReset()
    vi.mocked(summarizeText).mockReset()
    mockExecuteWriterDocumentCommand.mockReset()
    mockExecuteWriterDocumentCommand.mockResolvedValue({ handled: false })
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

  it('switches to edit mode with revision seed as current context', async () => {
    const wrapper = mountPanel()

    await wrapper.setProps({
      revisionSeed: {
        id: 1,
        text: '待继续修改的候选正文',
        instructions: '再压缩一点，并强化悬念。',
        applyMode: 'replace_document',
      },
    })
    await nextTick()

    expect(wrapper.get('[data-testid="selection-notice"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-context"]').text()).toContain('待继续修改的候选正文')
    expect(wrapper.get('[data-testid="input-mode"]').text()).toBe('edit')
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
    await flushPromises()
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
    await flushPromises()
    await nextTick()

    expect(vi.mocked(rewriteText)).toHaveBeenCalledWith(
      'project-1',
      '当前整章正文',
      'polish',
      expect.stringContaining('请直接输出可替换整章正文的完整版本。'),
    )
  })

  it('routes explicit expand-length requests into direct edit diff flow', async () => {
    vi.mocked(expandText).mockResolvedValue({
      expanded_text: '扩写后的整章正文',
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
    input.vm.$emit('update:modelValue', '把这一章扩写到300字，增加心理描写')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(expandText)).toHaveBeenCalledWith(
      'project-1',
      '当前整章正文',
      expect.stringContaining('把这一章扩写到300字'),
      300,
    )
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(summarizeText)).not.toHaveBeenCalled()
  })

  it('keeps summarize intent in candidate flow instead of applying正文 diff', async () => {
    vi.mocked(summarizeText).mockResolvedValue({
      summary: '这一章主要呈现双方试探升级。',
      keyPoints: ['张三主动施压'],
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
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '帮我总结一下这一章')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()
    await nextTick()

    expect(vi.mocked(summarizeText)).toHaveBeenCalledWith('当前整章正文', {
      projectId: 'project-1',
      summaryType: 'detailed',
    })
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(expandText)).not.toHaveBeenCalled()
  })

  it('clears current conversation from toolbar action', async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    const wrapper = mountPanel()

    await wrapper.get('[data-testid="toolbar-clear"]').trigger('click')

    expect(clearHistory).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-testid="input-context"]').text()).toBe('empty')
    expect(wrapper.get('[data-testid="input-mode"]').text()).toBe('chat')
  })

  it('intercepts /doc list locally without calling AI', async () => {
    mockExecuteWriterDocumentCommand.mockResolvedValue({
      handled: true,
      userEcho: '/doc list',
      assistantMessage: '当前项目文档：\n- 第一章 [chapter] (chapter-1)',
    })

    const wrapper = mountPanel()
    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '/doc list')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(mockExecuteWriterDocumentCommand).toHaveBeenCalledWith('/doc list', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '章节 chapter-1',
      currentSourceText: '',
    })
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
    expect(vi.mocked(expandText)).not.toHaveBeenCalled()
    expect(addMessage).toHaveBeenCalledWith('assistant', expect.stringContaining('当前项目文档'))
  })

  it('emits applyGeneratedText when /doc patch returns a document diff payload', async () => {
    mockExecuteWriterDocumentCommand.mockResolvedValue({
      handled: true,
      userEcho: '/doc patch replace 2 => 第二行（改）',
      assistantMessage: '已生成正文 diff 预览',
      patchPayload: {
        action: 'rewrite',
        sourceText: '第一行\n第二行',
        generatedText: '第一行\n第二行（改）',
        applyMode: 'replace_document',
      },
    })

    const wrapper = mount(AIPanel, {
      props: {
        sessionId: 'project-1',
        sourceText: '第一行\n第二行',
        workflowContext: buildWorkflowContext('chapter-1'),
        actionTrigger: null,
      },
      global: {
        stubs: {
          AIConversationToolbar: AIConversationToolbarStub,
          AISelectionNotice: AISelectionNoticeStub,
          AIChatMessages: AIChatMessagesStub,
          AIQuickActions: AIQuickActionsStub,
          AIInputArea: AIInputAreaStub,
        },
      },
    })

    const input = wrapper.findComponent(AIInputAreaStub)
    input.vm.$emit('update:modelValue', '/doc patch replace 2 => 第二行（改）')
    await nextTick()
    input.vm.$emit('send')
    await flushPromises()

    expect(wrapper.emitted('applyGeneratedText')?.[0]?.[0]).toEqual({
      action: 'rewrite',
      sourceText: '第一行\n第二行',
      generatedText: '第一行\n第二行（改）',
      applyMode: 'replace_document',
    })
    expect(vi.mocked(rewriteText)).not.toHaveBeenCalled()
  })
})
