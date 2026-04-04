import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}))

const loadCharacters = vi.fn().mockResolvedValue(undefined)
const loadCharacterRelations = vi.fn().mockResolvedValue(undefined)
const loadLocations = vi.fn().mockResolvedValue(undefined)
const loadOutlineTree = vi.fn().mockResolvedValue(undefined)

const writerStoreState = {
  characters: {
    list: [
      {
        id: 'char-1',
        projectId: 'project-1',
        name: '林舟',
        alias: ['阿舟'],
        summary: '主角',
        traits: [],
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      },
    ],
    relations: [],
    loading: false,
  },
  loadCharacters,
  loadCharacterRelations,
  loadLocations,
  loadOutlineTree,
  locations: {
    list: [
      {
        id: 'loc-1',
        projectId: 'project-1',
        name: '云港',
        description: '港口',
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z',
      },
    ],
  },
}

const editorStoreState = {
  currentChapterId: 'chapter-1',
  editorContent: JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '@林舟 来到 #云港，发现 %青铜钥匙。' }],
      },
    ],
  }),
  content: '',
}

vi.mock('../stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
}))
vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => writerStoreState,
}))

vi.mock('../stores/projectStore', () => ({
  useProjectStore: () => ({
    currentProjectId: 'project-1',
  }),
}))
vi.mock('@/modules/writer/stores/projectStore', () => ({
  useProjectStore: () => ({
    currentProjectId: 'project-1',
  }),
}))

vi.mock('../stores/editorStore', () => ({
  useEditorStore: () => editorStoreState,
}))
vi.mock('@/modules/writer/stores/editorStore', () => ({
  useEditorStore: () => editorStoreState,
}))

vi.mock('../api/location', () => ({
  locationApi: {
    create: vi.fn(),
  },
}))

vi.mock('@/design-system/services', () => ({
  message: {
    success: toastMocks.success,
    info: toastMocks.info,
    warning: toastMocks.warning,
    error: toastMocks.error,
  },
  messageBox: {
    prompt: vi.fn(),
    confirm: vi.fn(),
  },
}))

vi.mock('element-plus', () => {
  const actual = {} as Record<string, unknown>
  return {
    ...actual,
    ElMessage: {
      success: toastMocks.success,
      info: toastMocks.info,
      warning: toastMocks.warning,
      error: toastMocks.error,
    },
  }
})

import CharacterGraphView from '../CharacterGraphView.vue'

const ElButtonStub = defineComponent({
  name: 'ElButtonStub',
  props: {
    disabled: Boolean,
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    return () =>
      h(
        'button',
        {
          disabled: props.disabled,
          onClick: () => emit('click'),
        },
        slots.default?.(),
      )
  },
})

const ElTagStub = defineComponent({
  name: 'ElTagStub',
  setup(_, { slots }) {
    return () => h('span', slots.default?.())
  },
})

const ElScrollbarStub = defineComponent({
  name: 'ElScrollbarStub',
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  },
})

const ElDescriptionsStub = defineComponent({
  name: 'ElDescriptionsStub',
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  },
})

const ElDescriptionsItemStub = defineComponent({
  name: 'ElDescriptionsItemStub',
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  },
})

const ElEmptyStub = defineComponent({
  name: 'ElEmptyStub',
  setup(_, { attrs }) {
    return () => h('div', attrs.description as string)
  },
})

const ElProgressStub = defineComponent({
  name: 'ElProgressStub',
  setup() {
    return () => h('div')
  },
})

const ElIconStub = defineComponent({
  name: 'ElIconStub',
  setup(_, { slots }) {
    return () => h('span', slots.default?.())
  },
})

const RelationshipGraphStub = defineComponent({
  name: 'RelationshipGraphStub',
  setup() {
    return () => h('div', { 'data-testid': 'relationship-graph' })
  },
})

describe('CharacterGraphView asset candidates', () => {
  beforeEach(() => {
    localStorage.clear()
    loadCharacters.mockClear()
    loadCharacterRelations.mockClear()
    loadLocations.mockClear()
    toastMocks.success.mockClear()
    toastMocks.info.mockClear()
    toastMocks.warning.mockClear()
    toastMocks.error.mockClear()
  })

  function mountView() {
    return mount(CharacterGraphView, {
      props: {
        chapterId: 'chapter-1',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            parentId: 'volume-1',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
          {
            id: 'volume-1',
            projectId: 'project-1',
            chapterNum: 0,
            title: '第一卷',
            nodeType: 'directory' as const,
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
        ],
      },
      global: {
        stubs: {
          SystemStatCard: true,
          RelationshipGraph: RelationshipGraphStub,
          QyCard: true,
          QyIcon: true,
          'el-button': ElButtonStub,
          'el-tag': ElTagStub,
          'el-scrollbar': ElScrollbarStub,
          'el-descriptions': ElDescriptionsStub,
          'el-descriptions-item': ElDescriptionsItemStub,
          'el-empty': ElEmptyStub,
          'el-progress': ElProgressStub,
          'el-icon': ElIconStub,
          transition: false,
        },
        directives: {
          loading: () => undefined,
        },
      },
    })
  }

  it('shows candidate summary and evidence for resolved and unresolved assets', async () => {
    const wrapper = mountView()
    await nextTick()

    const expandButtons = wrapper
      .findAll('button')
      .filter((button) => button.text().includes('展开'))

    expect(expandButtons).toHaveLength(2)
    await expandButtons[1].trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('可绑定 2')
    expect(wrapper.text()).toContain('待建档 1')
    expect(wrapper.text()).toContain('待建档')
    expect(wrapper.text()).toContain('命中：青铜钥匙')
  })

  it('binds all resolved candidates in one action', async () => {
    const wrapper = mountView()
    await nextTick()

    const bulkButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('全部绑定已建档 2'))

    expect(bulkButton).toBeTruthy()

    await bulkButton!.trigger('click')
    await nextTick()
    await nextTick()

    expect(toastMocks.success).toHaveBeenCalledWith('已批量绑定 2 个候选资产')
  })

  it('binds existing characters into the current scope', async () => {
    let wrapper = mountView()
    await nextTick()

    const bindButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('绑定角色卡 1'))

    expect(bindButton).toBeTruthy()

    await bindButton!.trigger('click')
    await nextTick()
    await nextTick()
    wrapper.unmount()
    wrapper = mountView()
    await nextTick()
    await nextTick()

    expect(toastMocks.success).toHaveBeenCalledWith('已绑定 1 个角色到当前图谱')
  })
})
