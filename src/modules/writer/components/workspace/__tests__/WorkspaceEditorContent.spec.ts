import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WorkspaceEditorContent from '../WorkspaceEditorContent.vue'

describe('WorkspaceEditorContent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('在写作模式下应渲染 Story Harness 面板', () => {
    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        activeTool: 'writing',
        isEncyclopedia: false,
        subView: 'home',
        category: 'all',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
        scopeLabel: '第一章 / 当前章节',
        activeCharacters: [
          { id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' },
          { id: 'char-2', name: '李四', traits: ['冷静'] },
        ],
        activeRelations: [
          { id: 'rel-1', fromName: '张三', toName: '李四', type: '朋友', strength: 80 },
        ],
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
        ],
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          TipTapEditorView: { template: '<div data-testid="tiptap-editor" />' },
          WorkspaceToolOverlay: { template: '<div data-testid="tool-overlay" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="workspace-writing-surface"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="story-harness-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).toContain('张三 · 朋友 · 李四')
    expect(wrapper.text()).toContain('角色状态可能需要更新：张三')
  })

  it('在百科模式下不应渲染 Story Harness 面板', () => {
    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        activeTool: 'encyclopedia',
        isEncyclopedia: true,
        subView: 'relations',
        category: 'all',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        chapters: [{ id: 'chapter-1', title: '第一章' }],
        content: '这里是正文。',
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          CharacterGraphView: { template: '<div data-testid="graph-view" />' },
          WorkspaceToolOverlay: { template: '<div data-testid="tool-overlay" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="graph-view"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="story-harness-panel"]').exists()).toBe(false)
  })

  it('未选择章节时应保持空态而不渲染 Story Harness 面板', () => {
    const wrapper = mount(WorkspaceEditorContent, {
      props: {
        activeTool: 'writing',
        isEncyclopedia: false,
        subView: 'home',
        category: 'all',
        projectId: 'project-1',
        chapterId: '',
        chapterTitle: '',
        chapters: [],
        content: '',
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          WorkspaceToolOverlay: { template: '<div data-testid="tool-overlay" />' },
          QyIcon: { template: '<span />' },
          QyGhostButton: { template: '<button><slot /></button>' },
        },
      },
    })

    expect(wrapper.text()).toContain('请选择章节')
    expect(wrapper.find('[data-testid="story-harness-panel"]').exists()).toBe(false)
  })
})
