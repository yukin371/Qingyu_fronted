import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EditorSidebar from '@/modules/writer/components/EditorSidebar.vue'

describe('EditorSidebar - P0测试', () => {
  const mockChapters = [
    { id: 'chapter-1', title: '第一章', children: [] },
    { id: 'chapter-2', title: '第二章', children: [] }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('默认应该展开显示完整内容', () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    expect(wrapper.find('.editor-sidebar').classes()).not.toContain('collapsed')
    expect(wrapper.find('.tool-label').exists()).toBe(true)
  })

  it('点击折叠按钮应该切换状态', async () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    const toggleButton = wrapper.find('.sidebar-toggle')
    await toggleButton.trigger('click')

    expect(wrapper.find('.editor-sidebar').classes()).toContain('collapsed')
  })

  it('折叠状态应该只显示图标', async () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    // 折叠
    await wrapper.find('.sidebar-toggle').trigger('click')

    // 应该不显示文字标签
    expect(wrapper.find('.tool-label').exists()).toBe(false)
    // 应该显示折叠状态的工具项
    expect(wrapper.findAll('.collapsed-tool-item').length).toBeGreaterThan(0)
  })

  it('点击工具应该触发切换事件', async () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    const outlineButton = wrapper.find('.tool-item[data-tool="outline"]')
    await outlineButton.trigger('click')

    expect(wrapper.emitted('toolChange')).toBeTruthy()
    expect(wrapper.emitted('toolChange')?.[0]).toEqual(['outline'])
  })

  it('应该渲染4个工具项', () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    const tools = wrapper.findAll('.tool-item')
    expect(tools.length).toBe(4)
  })

  it('应该显示项目树区域', () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    expect(wrapper.find('.sidebar-section').exists()).toBe(true)
    expect(wrapper.find('.section-header').exists()).toBe(true)
  })

  it('折叠状态应该隐藏项目树', async () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    await wrapper.find('.sidebar-toggle').trigger('click')

    // 折叠后不应该显示项目树
    expect(wrapper.findComponent({ name: 'ProjectTree' }).exists()).toBe(false)
  })

  it('应该传递正确的props给ProjectTree', () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    const projectTree = wrapper.findComponent({ name: 'ProjectTree' })
    expect(projectTree.props('projectId')).toBe('test-project')
    expect(projectTree.props('currentChapterId')).toBe('chapter-1')
    expect(projectTree.props('chapters')).toEqual(mockChapters)
  })

  it('P0修复验证: chapters prop应该正确传递给ProjectTree', () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1',
        chapters: mockChapters
      }
    })

    const projectTree = wrapper.findComponent({ name: 'ProjectTree' })
    // 验证chapters不是空数组
    expect(projectTree.props('chapters')).not.toEqual([])
    expect(projectTree.props('chapters').length).toBe(2)
    expect(projectTree.props('chapters')[0].id).toBe('chapter-1')
    expect(projectTree.props('chapters')[0].title).toBe('第一章')
  })

  it('当chapters为undefined时应该传递空数组', () => {
    const wrapper = mount(EditorSidebar, {
      props: {
        projectId: 'test-project',
        chapterId: 'chapter-1'
        // chapters未提供
      }
    })

    const projectTree = wrapper.findComponent({ name: 'ProjectTree' })
    expect(projectTree.props('chapters')).toEqual([])
  })
})
