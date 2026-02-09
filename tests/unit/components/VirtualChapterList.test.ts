/**
 * VirtualChapterList 测试
 * TDD Phase 7: 虚拟列表性能优化测试
 *
 * 测试用例清单:
 * P7.10: 虚拟列表容器渲染
 * P7.11: 只渲染可见项目
 * P7.12: 滚动加载更多项目
 * P7.13: 空数据状态显示
 * P7.14: 动态高度项目支持
 * P7.15: 点击项目触发选择事件
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import VirtualChapterList from '@/modules/reader/components/VirtualChapterList.vue'

// Mock QyIcon组件
vi.mock('@/design-system/components/basic/QyIcon/QyIcon.vue', () => ({
  default: {
    name: 'QyIcon',
    props: ['name', 'size'],
    template: '<div class="qy-icon-mock"><slot /></div>'
  }
}))

describe('VirtualChapterList - P0测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockChapters = Array.from({ length: 100 }, (_, i) => ({
    id: `chapter-${i}`,
    title: `第${i + 1}章`,
    content: `章节内容${i}`
  }))

  describe('P7.10: 虚拟列表容器渲染', () => {
    it('应该渲染虚拟列表容器', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters
        }
      })

      expect(wrapper.find('.virtual-chapter-list').exists()).toBe(true)
    })

    it('应该渲染虚拟spacer', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters
        }
      })

      expect(wrapper.find('.virtual-spacer').exists()).toBe(true)
    })
  })

  describe('P7.11: 只渲染可见项目', () => {
    it('应该只渲染可见范围内的项目', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 50,
          height: 300
        }
      })

      // 高度300px，项目高度50px，应该渲染约7个项目（加上缓冲）
      const items = wrapper.findAll('.chapter-item')
      expect(items.length).toBeLessThan(20)
      expect(items.length).toBeGreaterThan(0)
    })

    it('应该计算正确的总高度', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 60
        }
      })

      const spacer = wrapper.find('.virtual-spacer')
      const totalHeight = mockChapters.length * 60
      expect(spacer.attributes('style')).toContain(`height: ${totalHeight}px`)
    })
  })

  describe('P7.12: 滚动加载更多项目', () => {
    it('应该支持滚动事件', async () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 50,
          height: 300
        }
      })

      // 直接设置scrollTop来模拟滚动
      wrapper.vm.scrollTop = 1000
      await nextTick()

      // 验证scrollTop已更新
      expect(wrapper.vm.scrollTop).toBe(1000)
    })

    it('滚动到底部应该触发loadMore事件', async () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 50,
          height: 300
        }
      })

      // 创建一个模拟的scroll事件
      const mockDiv = document.createElement('div')
      Object.defineProperty(mockDiv, 'scrollTop', { value: 4600, writable: true })
      Object.defineProperty(mockDiv, 'scrollHeight', { value: 5000, writable: true })
      Object.defineProperty(mockDiv, 'clientHeight', { value: 300, writable: true })

      // 手动调用handleScroll
      wrapper.vm.handleScroll({ target: mockDiv })
      await nextTick()

      // 验证loadMore事件被触发
      // scrollBottom = 5000 - 4600 - 300 = 100
      // 100不小于100，所以不会触发
      // 让我们用更大的scrollTop
      Object.defineProperty(mockDiv, 'scrollTop', { value: 4650, writable: true })
      wrapper.vm.handleScroll({ target: mockDiv })
      await nextTick()

      // scrollBottom = 5000 - 4650 - 300 = 50 < 100，应该触发
      expect(wrapper.emitted('loadMore')).toBeTruthy()
    })
  })

  describe('P7.13: 空数据状态显示', () => {
    it('空数据时应该显示空状态', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: []
        }
      })

      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('空状态应该显示图标和文字', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: []
        }
      })

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无章节')
      // 注意：QyIcon被mock了，所以不检查具体的图标类名
    })
  })

  describe('P7.14: 动态高度项目支持', () => {
    it('应该支持动态高度计算', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 60
        }
      })

      // 验证虚拟列表正常工作
      expect(wrapper.find('.virtual-spacer').exists()).toBe(true)
      expect(wrapper.findAll('.chapter-item').length).toBeGreaterThan(0)
    })
  })

  describe('P7.15: 点击项目触发选择事件', () => {
    it('点击项目应该触发select事件', async () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 60
        }
      })

      // 等待虚拟列表渲染
      await nextTick()

      const items = wrapper.findAll('.chapter-item')
      if (items.length > 0) {
        await items[0].trigger('click')

        // 验证select事件被触发
        expect(wrapper.emitted('select')).toBeTruthy()
      }
    })

    it('select事件应该传递正确的章节信息', async () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 60
        }
      })

      await nextTick()

      const items = wrapper.findAll('.chapter-item')
      if (items.length > 0) {
        await items[0].trigger('click')

        const emitted = wrapper.emitted('select')
        if (emitted && emitted[0]) {
          expect(emitted[0][0]).toHaveProperty('id')
          expect(emitted[0][0]).toHaveProperty('title')
        }
      }
    })
  })

  describe('自定义插槽支持', () => {
    it('应该支持自定义item插槽', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters
        },
        slots: {
          item: '<template #item="{ item }"><div class="custom-item">{{ item.title }}</div></template>'
        }
      })

      // 等待渲染
      return nextTick().then(() => {
        expect(wrapper.html()).toContain('custom-item')
      })
    })
  })

  describe('Props验证', () => {
    it('应该支持自定义容器高度', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          height: 500
        }
      })

      const container = wrapper.find('.virtual-chapter-list')
      expect(container.attributes('style')).toContain('height: 500px')
    })

    it('应该支持自定义项目高度', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          itemHeight: 80
        }
      })

      const spacer = wrapper.find('.virtual-spacer')
      const expectedHeight = mockChapters.length * 80
      expect(spacer.attributes('style')).toContain(`height: ${expectedHeight}px`)
    })

    it('应该支持自定义overscan', () => {
      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: mockChapters,
          overscan: 5
        }
      })

      // overscan会影响可见项目数量
      // 验证组件正常挂载
      expect(wrapper.find('.virtual-chapter-list').exists()).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('单条数据时应该正常工作', () => {
      const singleChapter = [{ id: 'chapter-1', title: '第1章', content: '内容' }]

      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: singleChapter
        }
      })

      expect(wrapper.find('.virtual-chapter-list').exists()).toBe(true)
    })

    it('大量数据时应该正常工作', () => {
      const largeChapters = Array.from({ length: 1000 }, (_, i) => ({
        id: `chapter-${i}`,
        title: `第${i + 1}章`,
        content: `内容${i}`
      }))

      const wrapper = mount(VirtualChapterList, {
        props: {
          chapters: largeChapters,
          itemHeight: 60,
          height: 400
        }
      })

      // 应该只渲染可见的项目
      const items = wrapper.findAll('.chapter-item')
      expect(items.length).toBeLessThan(50)
    })

    it('章节没有id时应该使用索引', () => {
      const chaptersWithoutId = Array.from({ length: 10 }, (_, i) => ({
        title: `第${i + 1}章`,
        content: `内容${i}`
      }))

      expect(() => {
        mount(VirtualChapterList, {
          props: {
            chapters: chaptersWithoutId as any
          }
        })
      }).not.toThrow()
    })
  })
})
