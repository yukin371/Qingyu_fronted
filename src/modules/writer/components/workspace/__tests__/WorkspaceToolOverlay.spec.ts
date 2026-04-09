import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import WorkspaceToolOverlay from '../WorkspaceToolOverlay.vue'

vi.mock('@/modules/writer/views/CharacterGraphView.vue', () => ({
  default: defineComponent({
    name: 'CharacterGraphViewStub',
    template: '<div data-testid="tool-view-stub">graph</div>',
  }),
}))

vi.mock('@/modules/writer/views/TimelineOutlineView.vue', () => ({
  default: defineComponent({
    name: 'TimelineOutlineViewStub',
    template: '<div data-testid="tool-view-stub">timeline</div>',
  }),
}))

vi.mock('@/modules/writer/views/StoryBranchView.vue', () => ({
  default: defineComponent({
    name: 'StoryBranchViewStub',
    template: '<div data-testid="tool-view-stub">branch</div>',
  }),
}))

vi.mock('@/modules/writer/components/workspace/structure/StructureStageView.vue', () => ({
  default: defineComponent({
    name: 'StructureStageViewStub',
    template: '<div data-testid="tool-view-stub">structure</div>',
  }),
}))

describe('WorkspaceToolOverlay', () => {
  it('应在工具层显示共享上下文摘要', () => {
    const wrapper = mount(WorkspaceToolOverlay, {
      props: {
        visible: true,
        activeTool: 'timeline',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [],
        workflowContext: {
          signature: 'ctx-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一幕 / 港口追踪',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        activeEntities: [
          { id: 'char-1', name: '林舟', type: 'character', summary: '戒备' },
          { id: 'loc-1', name: '云港', type: 'location' },
          { id: 'item-1', name: '铜钥匙', type: 'item' },
          { id: 'org-1', name: '巡夜司', type: 'organization' },
          { id: 'concept-1', name: '旧码头传闻', type: 'concept' },
        ],
      },
      global: {
        stubs: {
          QyIcon: { template: '<span />' },
          QyGhostButton: { template: '<button><slot /></button>' },
          ToolSidebar: { template: '<aside />' },
        },
      },
    })

    const contextBar = wrapper.get('[data-testid="tool-overlay-context"]')
    expect(contextBar.text()).toContain('当前上下文')
    expect(contextBar.text()).toContain('章节 第一章')
    expect(contextBar.text()).toContain('场景 第一幕 / 港口追踪')
    expect(contextBar.text()).toContain('角色')
    expect(contextBar.text()).toContain('林舟')
    expect(contextBar.text()).toContain('地点')
    expect(contextBar.text()).toContain('云港')
    expect(contextBar.text()).toContain('物品')
    expect(contextBar.text()).toContain('+1')
  })
})
