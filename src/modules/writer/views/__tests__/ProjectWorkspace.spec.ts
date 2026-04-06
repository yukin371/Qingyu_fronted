import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { createPinia } from 'pinia'

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

vi.mock('@/modules/writer/stores/editorThemeStore', () => ({
  useEditorThemeStore: () => ({
    currentTheme: 'light',
    initTheme: vi.fn(),
  }),
}))

const loadCharacters = vi.fn().mockResolvedValue(undefined)
const loadCharacterRelations = vi.fn().mockResolvedValue(undefined)
const loadLocations = vi.fn().mockResolvedValue(undefined)
const loadOutlineTree = vi.fn().mockResolvedValue(undefined)
const loadTimelines = vi.fn().mockResolvedValue(undefined)
const loadTimelineEvents = vi.fn().mockResolvedValue(undefined)

const writerStoreState = {
  characters: {
    list: [],
    relations: [],
    loading: false,
  },
  locations: { list: [] },
  loadCharacters,
  loadCharacterRelations,
  loadLocations,
  loadOutlineTree,
  loadTimelines,
  loadTimelineEvents,
  outline: {
    currentNode: null,
    tree: [],
    loading: false,
  },
  timeline: {
    currentTimeline: null,
    events: [],
  },
  setSelectedText,
}

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
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
    aiActionTrigger: {
      type: Object,
      default: null,
    },
    workflowContext: {
      type: Object,
      default: null,
    },
    draftProposals: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['ai-apply', 'proposal-draft', 'proposal-status-change'],
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
        h('button', {
          'data-testid': 'save-proposal-draft',
          onClick: () =>
            emit('proposal-draft', {
              source: 'chat',
              action: 'chat',
              title: 'AI 对话结果',
              summary: '新的推进方向',
              generatedText: '新的推进方向',
              sourceText: '继续推进冲突',
            }),
        }),
        h('button', {
          'data-testid': 'save-summary-proposal',
          onClick: () =>
            emit('proposal-draft', {
              source: 'summary',
              action: 'summarize_chapter',
              title: '章节方向提案',
              summary: '本章应聚焦冲突升级',
              generatedText: '本章应聚焦冲突升级\n\n核心要点：\n- 张三主动试探\n- 李四暂不表态',
              sourceText: '第一章',
            }),
        }),
        h('button', {
          'data-testid': 'save-review-proposal',
          onClick: () =>
            emit('proposal-draft', {
              source: 'review',
              action: 'proofread',
              title: '审校建议提案',
              summary: '检测到 2 条语言问题',
              generatedText: '审校评分：8.5\n1. 语法：建议调整句式\n2. 标点：补充逗号',
              sourceText: '第一章正文',
            }),
        }),
        h('div', { 'data-testid': 'apply-feedback-title' }, props.aiApplyFeedback?.title || ''),
        h('div', { 'data-testid': 'trigger-action' }, props.aiActionTrigger?.action || ''),
        h('div', { 'data-testid': 'trigger-source' }, props.aiActionTrigger?.source || ''),
        h('div', { 'data-testid': 'trigger-text' }, props.aiActionTrigger?.text || ''),
        h('div', { 'data-testid': 'context-signature' }, props.workflowContext?.signature || ''),
        h(
          'div',
          { 'data-testid': 'proposal-count' },
          String((props.draftProposals as unknown[]).length || 0),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-status' },
          String((props.draftProposals as Array<{ status?: string }>)[0]?.status || ''),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-id' },
          String((props.draftProposals as Array<{ id?: string }>)[0]?.id || ''),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-kind' },
          String((props.draftProposals as Array<{ kind?: string }>)[0]?.kind || ''),
        ),
        h(
          'div',
          { 'data-testid': 'proposal-source' },
          String((props.draftProposals as Array<{ source?: string }>)[0]?.source || ''),
        ),
      ])
  },
})

const WorkflowRelayEditorContentStub = defineComponent({
  emits: ['trigger-ai-action'],
  setup(_, { emit }) {
    return () =>
      h('button', {
        'data-testid': 'relay-workflow-action',
        onClick: () =>
          emit('trigger-ai-action', {
            source: 'story_harness',
            action: 'add_to_chat',
            text: '请基于这条建议补写下一段冲突',
            title: '来自 Story Harness',
            instructions: '保留当前章节语气',
            applyMode: 'append_paragraph',
          }),
      })
  },
})

describe('ProjectWorkspace Refactor', () => {
  beforeEach(() => {
    routeState.query = { chapterId: 'chapter-1', tool: 'writing' }
    routerReplace.mockClear()
    setActiveTool.mockClear()
    setSelectedText.mockClear()
    loadCharacters.mockClear()
    loadCharacterRelations.mockClear()
  })

  it('写作模式下应渲染 TipTapEditorView 且不渲染旧 EditorPanel', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
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
    expect(loadCharacters).toHaveBeenCalledWith('project-1')
    expect(loadCharacterRelations).toHaveBeenCalledWith('project-1')
  })

  it('切换章节时应通过路由保持写作模式', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
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
        plugins: [createPinia()],
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
        plugins: [createPinia()],
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
        plugins: [createPinia()],
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
        plugins: [createPinia()],
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
        plugins: [createPinia()],
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
        plugins: [createPinia()],
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
        plugins: [createPinia()],
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

  it('保存 AI 结果为提案后应把草案回传给右侧工作台', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
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

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('0')

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
  })

  it('工作流触发应注入 aiActionTrigger 与 workflowContext 到右侧面板', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
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
          WorkspaceEditorContent: WorkflowRelayEditorContentStub,
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
        },
      },
    })

    await wrapper.find('[data-testid="relay-workflow-action"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="trigger-action"]').text()).toBe('add_to_chat')
    expect(wrapper.find('[data-testid="trigger-source"]').text()).toBe('story_harness')
    expect(wrapper.find('[data-testid="trigger-text"]').text()).toContain('补写下一段冲突')
    expect(wrapper.find('[data-testid="context-signature"]').text()).toContain('"chapterId":"chapter-1"')
  })

  it.todo('提案应按当前章节过滤展示（Phase 2: chapter-scoped proposal visibility）')

  it('章节总结结果应映射为 chapter-direction proposal', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
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

    await wrapper.find('[data-testid="save-summary-proposal"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="proposal-kind"]').text()).toBe('chapter-direction')
    expect(wrapper.find('[data-testid="proposal-source"]').text()).toBe('summary-workbench')
  })

  it('审校结果应映射为 review-workbench proposal', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
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

    await wrapper.find('[data-testid="save-review-proposal"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="proposal-count"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="proposal-kind"]').text()).toBe('text-draft')
    expect(wrapper.find('[data-testid="proposal-source"]').text()).toBe('review-workbench')
  })

  it('提案状态变更后再次暂存应复位为 draft', async () => {
    const wrapper = mount(ProjectWorkspace, {
      global: {
        plugins: [createPinia()],
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

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()
    const proposalId = wrapper.find('[data-testid="proposal-id"]').text()
    expect(proposalId).toContain('proposal-')
    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('draft')

    await wrapper.findComponent(WorkspaceRightPanelStub).vm.$emit('proposal-status-change', {
      proposalId,
      status: 'discarded',
    })
    await nextTick()
    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('discarded')

    await wrapper.find('[data-testid="save-proposal-draft"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="proposal-status"]').text()).toBe('draft')
  })
})
