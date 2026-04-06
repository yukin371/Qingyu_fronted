import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import AIWorkbench from '../AIWorkbench.vue'

describe('AIWorkbench', () => {
  const findStateRail = (wrapper: VueWrapper<any>) => {
    const primary = wrapper.find('[data-testid="workflow-state-rail"]')
    if (primary.exists()) {
      return primary
    }
    return wrapper.find('[data-testid="workflow-feedback-strip"]')
  }

  const findResultSection = (wrapper: VueWrapper<any>) => {
    const selectors = ['[data-testid="workflow-result-card"]', '[data-testid="ai-result-card"]']
    for (const selector of selectors) {
      const match = wrapper.find(selector)
      if (match.exists()) {
        return match
      }
    }
    return wrapper.find('[data-testid="result-section"]')
  }

  const findPromoteButton = (sectionWrapper: VueWrapper<any>) => {
    const selectors = [
      '[data-testid="workflow-result-action"]',
      '[data-testid="workflow-result-card-action"]',
    ]
    for (const selector of selectors) {
      const button = sectionWrapper.find(selector)
      if (button.exists()) {
        return button
      }
    }
    const fallback = sectionWrapper.find('button')
    if (fallback.exists()) {
      return fallback
    }
    return sectionWrapper.find('.workflow-result-card__action')
  }

  it('keeps only the compact workbench title in header', () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 3,
        },
        draftProposals: [
          {
            id: 'proposal-1',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '章节方向提案',
            summary: '保留冲突升级主线',
            generatedText: '保留冲突升级主线',
            sourceText: '第一章',
            status: 'draft',
            createdAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    expect(wrapper.find('.ai-workbench__title').text()).toBe('AI 助手')
    expect(wrapper.text()).not.toContain('待处理 3')
    expect(wrapper.text()).not.toContain('草案 1')
  })

  it('renders apply feedback and switches tabs from action triggers', async () => {
    const RewriteWorkbenchToolStub = defineComponent({
      props: ['workflowContext'],
      template: '<div data-testid="rewrite-tool">{{ workflowContext?.chapterTitle }}</div>',
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'fallback',
          title: '选区已失效，改为安全回填',
          detail: '原选区内容已变化，系统改为按段落写回。',
          mode: 'replace_selection',
          updatedAt: Date.now(),
        },
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: RewriteWorkbenchToolStub,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 1,
        action: 'rewrite',
        text: '测试片段',
        applyMode: 'replace_selection',
      },
    })
    await nextTick()

    const rail = findStateRail(wrapper)
    expect(rail.exists()).toBe(true)
    expect(wrapper.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)
    expect(rail.text()).toContain('选区已失效')
    expect(wrapper.get('[data-testid="rewrite-tool"]').text()).toContain('第一章')
  })

  it('promotes AI result candidates into proposal drafts through emitted events', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '生成了一条新方向', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 2,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-result"]').trigger('click')
    const resultSection = findResultSection(wrapper)
    expect(resultSection.exists()).toBe(true)

    const promoteButton = findPromoteButton(resultSection)
    expect(promoteButton.exists()).toBe(true)
    await promoteButton.trigger('click')

    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'chat',
      action: 'chat',
      generatedText: '新的剧情方向',
    })
  })

  it('keeps proposal as primary card while allowing result promotion inside the workflow rail', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '生成了一条新方向', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'success',
          title: '已按选区回填',
          detail: 'AI 结果已替换当前选区。',
          mode: 'replace_selection',
          updatedAt: Date.now(),
        },
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [
          {
            id: 'proposal-1',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '章节方向提案',
            summary: '保留冲突升级主线',
            generatedText: '保留冲突升级主线',
            sourceText: '第一章',
            status: 'draft',
            createdAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          AIPanel: AIPanelStub,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.find('[data-testid="emit-result"]').trigger('click')

    const rail = wrapper.get('[data-testid="workflow-state-rail"]')
    expect(rail.attributes('aria-live')).toBe('polite')
    expect(rail.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)
    expect(rail.find('[data-testid="proposal-card"]').exists()).toBe(true)
    expect(rail.get('[data-testid="proposal-card-meta"]').text()).toContain('草稿')
    expect(rail.get('[data-testid="proposal-card-meta"]').text()).toContain('方向')
    expect(rail.get('[data-testid="proposal-card-meta"]').text()).toContain('总结')
    expect(rail.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
    expect(rail.find('[data-testid="workflow-result-action"]').exists()).toBe(true)
    expect(rail.get('[data-testid="workflow-result-meta"]').text()).toContain('候选结果')
    expect(rail.get('[data-testid="workflow-result-meta"]').text()).toContain('对话')
    expect(rail.get('[data-testid="workflow-result-meta"]').text()).toContain('类型 正文')
    expect(rail.get('[data-testid="workflow-result-action"]').text()).toBe('暂存正文')
    expect(rail.get('[data-testid="workflow-result-action"]').attributes('aria-label')).toContain(
      'AI 对话结果',
    )
    expect(rail.get('.proposal-card__action').attributes('aria-label')).toContain('章节方向提案')
    expect(rail.get('.proposal-card__action').text()).toBe('保留方向')

    await rail.find('[data-testid="workflow-result-action"]').trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'chat',
      action: 'chat',
      generatedText: '新的剧情方向',
    })
  })

  it('renders workflow state rail with aiApplyFeedback and still promotes result card action alongside proposal drafts', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-state-result\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '新状态流结果', generatedText: '新的剧情方向', sourceText: '上次选区' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'success',
          title: '已更新正文',
          detail: 'AI 结果已应用',
          updatedAt: Date.now(),
        },
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [
          {
            id: 'proposal-main',
            kind: 'text-draft',
            source: 'review-workbench',
            title: '审校建议提案',
            summary: '审校完成',
            generatedText: '审校完成',
            sourceText: '第一章',
            status: 'draft',
            createdAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: AIPanelStub,
        },
      },
    })

    expect(wrapper.find('[data-testid="workflow-state-rail"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="workflow-feedback-strip"]').exists()).toBe(true)
    expect(wrapper.get('.proposal-card__action').text()).toBe('保留正文')

    await wrapper.find('[data-testid="emit-state-result"]').trigger('click')
    const resultSection = findResultSection(wrapper)
    expect(resultSection.exists()).toBe(true)

    const promoteButton = findPromoteButton(resultSection)
    expect(promoteButton.exists()).toBe(true)

    await promoteButton.trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'chat',
      action: 'chat',
    })
  })

  it('keeps selected proposal lifecycle feedback quiet once the retained card is visible', () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [
          {
            id: 'proposal-selected',
            kind: 'text-draft',
            source: 'review-workbench',
            title: '审校建议提案',
            summary: '审校完成',
            generatedText: '审校完成',
            sourceText: '第一章',
            status: 'selected',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="proposal-card-meta"]').text()).toContain('状态 保留')
    expect(wrapper.text()).toContain('审校建议提案')
  })

  it('condenses selected proposal card once a newer result candidate is visible', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result-on-selected\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '新的处理建议', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [
          {
            id: 'proposal-selected',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '已保留方向',
            summary: '当前采用方案',
            generatedText: '已保留方向',
            sourceText: '第一章',
            status: 'selected',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: AIPanelStub,
        },
      },
    })

    await wrapper.find('[data-testid="emit-result-on-selected"]').trigger('click')

    const proposalCard = wrapper.get('[data-testid="proposal-card"]')
    expect(proposalCard.classes()).toContain('proposal-card--condensed')
    expect(proposalCard.find('[data-testid="proposal-card-summary"]').exists()).toBe(false)
    expect(proposalCard.text()).toContain('已保留方向')
    expect(proposalCard.text()).toContain('移出')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
  })

  it('prioritizes selected proposal over draft when choosing primary proposal card', () => {
    const now = Date.now()
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [
          {
            id: 'proposal-draft',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '新的草稿方向',
            summary: '还未确认',
            generatedText: '新的草稿方向',
            sourceText: '第一章',
            status: 'draft',
            createdAt: now - 50,
            updatedAt: now,
          },
          {
            id: 'proposal-selected',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '已保留方向',
            summary: '当前采用方案',
            generatedText: '已保留方向',
            sourceText: '第一章',
            status: 'selected',
            createdAt: now - 100,
            updatedAt: now - 10,
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="proposal-card-meta"]').text()).toContain('状态 保留')
    expect(wrapper.text()).toContain('已保留方向')
    expect(wrapper.text()).not.toContain('新的草稿方向')
  })

  it('hides discarded-only proposals while keeping discard feedback inside the rail', () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [
          {
            id: 'proposal-discarded',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '旧方向提案',
            summary: '已不再采用',
            generatedText: '旧方向提案',
            sourceText: '第一章',
            status: 'discarded',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="workflow-state-rail"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="proposal-feedback-strip"]').text()).toContain(
      '方向提案已移出',
    )
    expect(wrapper.get('[data-testid="proposal-feedback-strip"]').text()).toContain('总结')
    expect(wrapper.get('[data-testid="proposal-feedback-strip"]').text()).toContain('旧方向提案')
  })

  it('suppresses discarded lifecycle feedback when a newer result candidate arrives', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-result-after-discard\" @click=\"$emit('result-candidate', { source: 'chat', action: 'chat', title: 'AI 对话结果', summary: '新的处理建议', generatedText: '新的剧情方向', sourceText: '继续推进冲突' })\">emit</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [
          {
            id: 'proposal-discarded',
            kind: 'chapter-direction',
            source: 'summary-workbench',
            title: '旧方向提案',
            summary: '已不再采用',
            generatedText: '旧方向提案',
            sourceText: '第一章',
            status: 'discarded',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      global: {
        stubs: {
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
          AIPanel: AIPanelStub,
        },
      },
    })

    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(true)

    await wrapper.find('[data-testid="emit-result-after-discard"]').trigger('click')

    expect(wrapper.find('[data-testid="proposal-feedback-strip"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="proposal-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
  })

  it('routes add_to_chat actions to chat tab via shared workflow resolver', async () => {
    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 9,
        action: 'add_to_chat',
        text: '来自 Story Harness 的建议',
      },
    })
    await nextTick()

    expect(wrapper.html()).toContain('a-i-panel-stub')
  })

  it('surfaces summary results through the shared workflow result card', async () => {
    const SummaryWorkbenchToolStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-summary\" @click=\"$emit('result-candidate', { source: 'summary', action: 'summarize_chapter', title: '章节方向提案', summary: '本章应聚焦冲突升级', generatedText: '本章应聚焦冲突升级\\n\\n核心要点：\\n- 张三主动试探\\n- 李四暂不表态', sourceText: '第一章' })\">emit-summary</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 1,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: SummaryWorkbenchToolStub,
          ReviewWorkbenchTool: true,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 11,
        action: 'summarize_chapter',
        text: '这是当前章节正文。',
      },
    })
    await nextTick()

    await wrapper.find('[data-testid="emit-summary"]').trigger('click')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('候选结果')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('总结')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('类型 方向')
    expect(wrapper.text()).toContain('章节方向提案')
    expect(wrapper.get('[data-testid="workflow-result-action"]').text()).toBe('暂存方向')

    await wrapper.find('.workflow-result-card__action').trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'summary',
      action: 'summarize_chapter',
      title: '章节方向提案',
    })
  })

  it('surfaces review results through the shared workflow result card', async () => {
    const ReviewWorkbenchToolStub = defineComponent({
      emits: ['result-candidate'],
      template:
        "<button data-testid=\"emit-review\" @click=\"$emit('result-candidate', { source: 'review', action: 'proofread', title: '审校建议提案', summary: '检测到 2 条语言问题', generatedText: '审校评分：8.5\\n1. 语法：建议调整句式', sourceText: '第一章正文' })\">emit-review</button>",
    })

    const wrapper = mount(AIWorkbench, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: null,
        workflowContext: {
          signature: 'chapter-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 1,
        },
        draftProposals: [],
      },
      global: {
        stubs: {
          AIPanel: true,
          SummaryWorkbenchTool: true,
          ReviewWorkbenchTool: ReviewWorkbenchToolStub,
          RewriteWorkbenchTool: true,
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 12,
        action: 'proofread',
        text: '这是当前章节正文。',
      },
    })
    await nextTick()

    await wrapper.find('[data-testid="emit-review"]').trigger('click')
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('候选结果')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('审校')
    expect(wrapper.get('[data-testid="workflow-result-meta"]').text()).toContain('类型 正文')
    expect(wrapper.text()).toContain('审校建议提案')
    expect(wrapper.get('[data-testid="workflow-result-action"]').text()).toBe('暂存正文')

    await wrapper.find('.workflow-result-card__action').trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'review',
      action: 'proofread',
      title: '审校建议提案',
    })
  })
})
