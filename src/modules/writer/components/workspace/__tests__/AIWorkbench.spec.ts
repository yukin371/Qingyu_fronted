import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import AIWorkbench from '../AIWorkbench.vue'

describe('AIWorkbench', () => {
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

    expect(wrapper.find('.apply-feedback').exists()).toBe(true)
    expect(wrapper.find('.apply-feedback').text()).toContain('选区已失效')
    expect(wrapper.get('[data-testid="rewrite-tool"]').text()).toContain('第一章')
  })

  it('promotes AI result candidates into proposal drafts through emitted events', async () => {
    const AIPanelStub = defineComponent({
      emits: ['result-candidate'],
      template:
        '<button data-testid="emit-result" @click="$emit(\'result-candidate\', { source: \'chat\', action: \'chat\', title: \'AI 对话结果\', summary: \'生成了一条新方向\', generatedText: \'新的剧情方向\', sourceText: \'继续推进冲突\' })">emit</button>',
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
    expect(wrapper.find('[data-testid="workflow-result-card"]').exists()).toBe(true)

    await wrapper.find('.workflow-result-card__action').trigger('click')
    expect(wrapper.emitted('proposalDraft')?.[0]?.[0]).toMatchObject({
      source: 'chat',
      action: 'chat',
      generatedText: '新的剧情方向',
    })
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
})
