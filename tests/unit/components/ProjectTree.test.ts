import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProjectTree from '@/modules/writer/components/ProjectTree.vue'

describe('ProjectTree - P0测试', () => {
  const mockChapters = [
    { id: 'chapter-1', title: '第一章', children: [] },
    { id: 'chapter-2', title: '第二章', children: [] }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该渲染章节列表', () => {
    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: mockChapters,
        currentChapterId: 'chapter-1'
      }
    })

    const chapters = wrapper.findAll('.chapter-item')
    expect(chapters.length).toBe(2)
  })

  it('当前章节应该高亮', () => {
    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: mockChapters,
        currentChapterId: 'chapter-1'
      }
    })

    const currentChapter = wrapper.find('.chapter-item[data-id="chapter-1"]')
    expect(currentChapter.classes()).toContain('active')
  })

  it('点击章节应该触发选择事件', async () => {
    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: mockChapters,
        currentChapterId: 'chapter-1'
      }
    })

    const chapter = wrapper.find('.chapter-item[data-id="chapter-2"]')
    await chapter.trigger('click')

    expect(wrapper.emitted('chapterSelect')).toBeTruthy()
    expect(wrapper.emitted('chapterSelect')?.[0]).toEqual(['chapter-2'])
  })

  it('应该支持折叠展开子章节', async () => {
    const mockNestedChapters = [
      {
        id: 'chapter-1',
        title: '第一章',
        children: [
          { id: 'chapter-1-1', title: '第一节', children: [] }
        ]
      }
    ]

    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: mockNestedChapters,
        currentChapterId: 'chapter-1'
      }
    })

    const expandButton = wrapper.find('.expand-button')
    await expandButton.trigger('click')

    expect(wrapper.find('.child-chapters').exists()).toBe(true)
  })

  it('应该显示章节标题', () => {
    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: mockChapters,
        currentChapterId: 'chapter-1'
      }
    })

    const titles = wrapper.findAll('.chapter-title')
    expect(titles.length).toBe(2)
    expect(titles[0].text()).toBe('第一章')
    expect(titles[1].text()).toBe('第二章')
  })

  it('没有子章节的章节不应该显示展开按钮', () => {
    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: mockChapters,
        currentChapterId: 'chapter-1'
      }
    })

    const expandButtons = wrapper.findAll('.expand-button')
    expect(expandButtons.length).toBe(0)
  })

  it('应该支持嵌套章节结构', () => {
    const mockNestedChapters = [
      {
        id: 'chapter-1',
        title: '第一章',
        children: [
          { id: 'chapter-1-1', title: '第一节', children: [] },
          { id: 'chapter-1-2', title: '第二节', children: [] }
        ]
      }
    ]

    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: mockNestedChapters,
        currentChapterId: 'chapter-1'
      }
    })

    expect(wrapper.findAll('.chapter-item').length).toBe(1)
  })

  it('应该正确处理空章节列表', () => {
    const wrapper = mount(ProjectTree, {
      props: {
        projectId: 'test-project',
        chapters: [],
        currentChapterId: ''
      }
    })

    expect(wrapper.findAll('.chapter-item').length).toBe(0)
  })
})
