import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { projectId: 'project-1' },
    query: {},
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
    flatDocs: [],
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
    setActiveTool: vi.fn(),
    setCurrentChapter: vi.fn(),
    setContent: vi.fn(),
    markSaved: vi.fn(),
    reset: vi.fn(),
    loadDocument: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => ({
    setSelectedText: vi.fn(),
  }),
}))

import ProjectWorkspace from '../ProjectWorkspace.vue'

describe('ProjectWorkspace Refactor', () => {
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
          ProjectSidebar: { template: '<div data-testid="project-sidebar" />' },
          TipTapEditorView: { template: '<div data-testid="tiptap-editor-view" />' },
          EncyclopediaView: { template: '<div data-testid="encyclopedia-view" />' },
          AIPanel: { template: '<div data-testid="ai-panel" />' },
          'el-dialog': { template: '<div><slot /><slot name="footer" /></div>' },
          'el-form': { template: '<form><slot /></form>' },
          'el-form-item': { template: '<div><slot /></div>' },
          'el-input': { template: '<input />' },
          'el-select': { template: '<select><slot /></select>' },
          'el-option': { template: '<option><slot /></option>' },
          'el-button': { template: '<button><slot /></button>' },
        },
      },
    })

    expect(wrapper.find('[data-testid="tiptap-editor-view"]').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('EditorPanel')
  })
})
