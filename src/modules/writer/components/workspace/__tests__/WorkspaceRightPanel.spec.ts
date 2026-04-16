import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import WorkspaceRightPanel from '../WorkspaceRightPanel.vue'

describe('WorkspaceRightPanel', () => {
  it('forwards source text into AIWorkbench and relays ai-apply outward', async () => {
    const AIWorkbenchStub = defineComponent({
      props: ['sourceText'],
      emits: ['apply-generated-text'],
      template:
        "<div><div data-testid=\"forwarded-source-text\">{{ sourceText }}</div><button data-testid=\"forward-apply\" @click=\"$emit('apply-generated-text', { action: 'rewrite', sourceText: '原文', generatedText: '新文', applyMode: 'replace_document' })\">apply</button></div>",
    })

    const wrapper = mount(WorkspaceRightPanel, {
      props: {
        collapsed: false,
        isImmersiveMode: false,
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        aiActionTrigger: null,
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
          AIWorkbench: AIWorkbenchStub,
          StoryHarnessPanel: true,
          QyIcon: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="forwarded-source-text"]').text()).toBe('这是当前章节正文。')

    await wrapper.get('[data-testid="forward-apply"]').trigger('click')

    expect(wrapper.emitted('ai-apply')?.[0]?.[0]).toMatchObject({
      action: 'rewrite',
      sourceText: '原文',
      generatedText: '新文',
      applyMode: 'replace_document',
    })
  })
})
