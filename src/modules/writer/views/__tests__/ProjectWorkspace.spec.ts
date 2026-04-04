import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

const routeState = {
  query: {
    chapterId: 'chapter-1',
    tool: 'writing',
  } as Record<string, unknown>,
}

const routerReplace = vi.fn().mockResolvedValue(undefined)
const setActiveTool = vi.fn()
const setSelectedText = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { projectId: 'project-1' },
    query: routeState.query,
  }),
  useRouter: () => ({
    replace: routerReplace,
    push: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/mock/workspaceMock', () => ({
  getWorkspaceMockProject: () => null,
}))

vi.mock('@/modules/writer/stores/projectStore', () => ({
  useProjectStore: () => ({
    currentProjectId: 'project-1',
    projects: [],
    currentProject: null,
    loadList: vi.fn().mockResolvedValue(undefined),
    loadDetail: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/stores/documentStore', () => ({
  useDocumentStore: () => ({
    currentDocMeta: null,
    flatDocs: [
      {
        id: 'chapter-1',
        title: '第一章',
        type: 'chapter',
        projectId: 'project-1',
      },
      {
        id: 'chapter-2',
        title: '第二章',
        type: 'chapter',
        projectId: 'project-1',
      },
    ],
    loadTree: vi.fn().mockResolvedValue(undefined),
    selectDocument: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/stores/editorStore', () => ({
  useEditorStore: () => ({
    activeTool: ref('writing'),
    editorContent: '',
    content: '',
    tipTapEditor: null,
    setActiveTool,
    setCurrentChapter: vi.fn(),
    setContent: vi.fn(),
    markSaved: vi.fn(),
    reset: vi.fn(),
    loadDocument: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/stores/panelStore', () => ({
  usePanelStore: () => ({
    leftCollapsed: false,
    rightCollapsed: false,
    setLeftCollapsed: vi.fn(),
    setRightCollapsed: vi.fn(),
  }),
}))

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => ({
    setSelectedText,
  }),
}))

import ProjectWorkspace from '../ProjectWorkspace.vue'

const WorkspaceLeftPanelStub = defineComponent({
  emits: ['update:chapter-id', 'dock-select', 'global-graph-click'],
  setup(_, { emit }) {
    return () =>
      h('div', [
        h('button', {
          'data-testid': 'change-chapter',
          onClick: () => emit('update:chapter-id', 'chapter-2'),
        }),
        h('button', {
          'data-testid': 'open-relations',
          onClick: () => emit('dock-select', 'relations'),
        }),
        h('button', {
          'data-testid': 'open-encyclopedia',
          onClick: () => emit('dock-select', 'encyclopedia'),
        }),
        h('button', {
          'data-testid': 'open-structure',
          onClick: () => emit('dock-select', 'structure'),
        }),
        h('button', {
          'data-testid': 'open-writing',
          onClick: () => emit('dock-select', 'writing'),
        }),
        h('button', {
          'data-testid': 'open-global-graph',
          onClick: () => emit('global-graph-click'),
        }),
      ])
  },
})

const WorkspaceRightPanelStub = defineComponent({
  props: {
    aiApplyFeedback: {
      type: Object,
      default: null,
    },
  },
  emits: ['ai-apply'],
  setup(props, { emit }) {
    return () =>
      h('div', [
        h('button', {
          'data-testid': 'apply-ai-result',
          onClick: () =>
            emit('ai-apply', {
              action: 'rewrite',
              sourceText: '旧内容',
              generatedText: '新内容',
              applyMode: 'replace_document',
            }),
        }),
        h(
          'div',
          { 'data-testid': 'apply-feedback-title' },
          props.aiApplyFeedback?.title || '',
        ),
      ])
  },
})

describe('ProjectWorkspace Refactor', () => {
  beforeEach(() => {
    routeState.query = { chapterId: 'chapter-1', tool: 'writing' }
    routerReplace.mockClear()
    setActiveTool.mockClear()
    setSelectedText.mockClear()
  })

  it('写作模式下应渲染 TipTapEditorView 且不渲染旧 EditorPanel', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    expect(wrapper.find('[data-testid="tiptap-editor-view"]').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('EditorPanel')
  })

  it('切换章节时应通过路由保持写作模式', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="change-chapter"]').trigger('click')

    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        chapterId: 'chapter-2',
        tool: 'writing',
      }),
    })
  })

  it('AI 回填后应把反馈重新传给右侧工作台', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="apply-ai-result"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="apply-feedback-title"]').text()).toBe('已整章替换')
    expect(setSelectedText).toHaveBeenCalledWith('')
  })

  it('切到关系图谱 dock 时应写入百科路由查询', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="open-relations"]').trigger('click')

    expect(setActiveTool).toHaveBeenCalledWith('encyclopedia')
    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        tool: 'encyclopedia',
        encyclopediaView: 'relations',
      }),
    })
  })

  it('切到百科 dock 时应进入百科卡片视图', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="open-encyclopedia"]').trigger('click')

    expect(setActiveTool).toHaveBeenCalledWith('encyclopedia')
    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        tool: 'encyclopedia',
        encyclopediaView: 'encyclopedia',
      }),
    })
  })

  it('切到大纲 dock 时应进入结构舞台视图', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="open-structure"]').trigger('click')

    expect(setActiveTool).toHaveBeenCalledWith('encyclopedia')
    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        tool: 'encyclopedia',
        encyclopediaView: 'structure',
      }),
    })
  })

  it('从百科切回写作 dock 时应清理百科查询参数', async () => {
    routeState.query = {
      chapterId: 'chapter-1',
      tool: 'encyclopedia',
      encyclopediaView: 'relations',
      worldView: 'characters',
      worldCategory: 'main',
    }

    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'writing'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="open-writing"]').trigger('click')

    expect(setActiveTool).toHaveBeenCalledWith('writing')
    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.not.objectContaining({
        encyclopediaView: expect.anything(),
        worldView: expect.anything(),
        worldCategory: expect.anything(),
      }),
    })
  })

  it('从结构舞台打开章节图谱时应写入关系图谱路由查询', async () => {
    routeState.query = {
      chapterId: 'chapter-1',
      tool: 'encyclopedia',
      encyclopediaView: 'encyclopedia',
    }

    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'encyclopedia'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          WorkspaceEditorContent: {
            emits: ['open-graph'],
            template:
              '<button data-testid="open-graph" @click="$emit(\'open-graph\', \'chapter-2\')">open</button>',
          },
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="open-graph"]').trigger('click')

    expect(routerReplace).toHaveBeenCalledWith({
      query: expect.objectContaining({
        chapterId: 'chapter-2',
        tool: 'encyclopedia',
        encyclopediaView: 'relations',
      }),
    })
  })

  it('点击全局关系图谱入口时应清理 chapterId 查询', async () => {
    routeState.query = {
      chapterId: 'project-yljs-1-volume-1',
      tool: 'encyclopedia',
      encyclopediaView: 'relations',
    }

    const wrapper = mount(ProjectWorkspace, {
      global: {
        stubs: {
          EditorLayout: {
            template: `
              <div>
                <slot name="left-panel" />
                <slot name="editor" :active-tool="'encyclopedia'" />
                <slot name="right-panel" />
              </div>
            `,
          },
          WorkspaceLeftPanel: WorkspaceLeftPanelStub,
          WorkspaceRightPanel: WorkspaceRightPanelStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="open-global-graph"]').trigger('click')

    expect(routerReplace).toHaveBeenCalledWith({
      query: {
        tool: 'encyclopedia',
        encyclopediaView: 'relations',
      },
    })
  })
})
