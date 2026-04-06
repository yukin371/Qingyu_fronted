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
