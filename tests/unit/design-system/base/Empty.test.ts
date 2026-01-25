/**
 * Empty 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Empty from '@/design-system/base/Empty/Empty.vue'

describe('Empty 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染默认状态', () => {
      const wrapper = mount(Empty)
      
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无数据')
    })

    it('应该渲染自定义描述', () => {
      const wrapper = mount(Empty, {
        props: {
          description: '没有找到相关内容',
        },
      })
      
      expect(wrapper.text()).toContain('没有找到相关内容')
    })

    it('应该渲染标题', () => {
      const wrapper = mount(Empty, {
        props: {
          title: '还没有书单',
          description: '创建你的第一个书单吧',
        },
      })
      
      expect(wrapper.text()).toContain('还没有书单')
      expect(wrapper.text()).toContain('创建你的第一个书单吧')
    })
  })

  describe('尺寸变体', () => {
    it('应该正确渲染 sm 尺寸', () => {
      const wrapper = mount(Empty, {
        props: {
          size: 'sm',
        },
      })
      
      const container = wrapper.find('[role="status"]')
      expect(container.classes()).toContain('min-h-[120px]')
    })

    it('应该正确渲染 md 尺寸', () => {
      const wrapper = mount(Empty, {
        props: {
          size: 'md',
        },
      })
      
      const container = wrapper.find('[role="status"]')
      expect(container.classes()).toContain('min-h-[200px]')
    })

    it('应该正确渲染 lg 尺寸', () => {
      const wrapper = mount(Empty, {
        props: {
          size: 'lg',
        },
      })
      
      const container = wrapper.find('[role="status"]')
      expect(container.classes()).toContain('min-h-[280px]')
    })

    it('应该正确渲染 xl 尺寸', () => {
      const wrapper = mount(Empty, {
        props: {
          size: 'xl',
        },
      })
      
      const container = wrapper.find('[role="status"]')
      expect(container.classes()).toContain('min-h-[360px]')
    })
  })

  describe('图标渲染', () => {
    it('当没有提供 icon 时不应该渲染图标', () => {
      const wrapper = mount(Empty)
      
      expect(wrapper.findComponent({ name: 'Icon' }).exists()).toBe(false)
    })

    it('应该渲染指定的图标', () => {
      const wrapper = mount(Empty, {
        props: {
          icon: 'document',
        },
        global: {
          stubs: {
            Icon: {
              template: '<div class="icon-stub">Icon</div>',
            },
          },
        },
      })

      // 使用 find 查找存根元素，而不是 findComponent
      expect(wrapper.find('.icon-stub').exists()).toBe(true)
    })
  })

  describe('插槽', () => {
    it('应该渲染 action 插槽内容', () => {
      const wrapper = mount(Empty, {
        slots: {
          action: '<button class="action-btn">创建</button>',
        },
      })
      
      expect(wrapper.find('.action-btn').exists()).toBe(true)
      expect(wrapper.find('.action-btn').text()).toBe('创建')
    })

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(Empty, {
        slots: {
          default: '<div class="custom-content">自定义内容</div>',
        },
      })
      
      expect(wrapper.find('.custom-content').exists()).toBe(true)
      expect(wrapper.find('.custom-content').text()).toContain('自定义内容')
    })
  })

  describe('事件', () => {
    it('应该触发点击事件', async () => {
      const onClick = vi.fn()
      const wrapper = mount(Empty, {
        props: {
          onClick: onClick,
        },
      })
      
      const container = wrapper.find('[role="status"]')
      await container.trigger('click')
      
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent))
    })
  })

  describe('样式类名', () => {
    it('应该应用自定义类名', () => {
      const wrapper = mount(Empty, {
        props: {
          class: 'custom-class',
        },
      })
      
      const container = wrapper.find('[role="status"]')
      expect(container.classes()).toContain('custom-class')
    })

    it('应该包含正确的布局类名', () => {
      const wrapper = mount(Empty)
      
      const container = wrapper.find('[role="status"]')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('flex-col')
      expect(container.classes()).toContain('items-center')
      expect(container.classes()).toContain('justify-center')
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 role 属性', () => {
      const wrapper = mount(Empty)
      
      expect(wrapper.find('[role="status"]').exists()).toBe(true)
    })

    it('应该有 aria-live 属性', () => {
      const wrapper = mount(Empty)
      
      const container = wrapper.find('[role="status"]')
      expect(container.attributes('aria-live')).toBe('polite')
    })
  })

  describe('文字样式', () => {
    it('md 尺寸应该有正确的文字大小', () => {
      const wrapper = mount(Empty, {
        props: {
          size: 'md',
          title: '测试标题',
        },
      })

      // 描述文字样式应用于 <p> 元素，需要找到描述段落
      // 描述文字是 text-sm
      const paragraphs = wrapper.findAll('p')
      const descriptionEl = paragraphs.find(p => p.classes().includes('text-sm'))
      expect(descriptionEl?.classes()).toContain('text-sm')
    })

    it('xl 尺寸应该有更大的文字', () => {
      const wrapper = mount(Empty, {
        props: {
          size: 'xl',
          title: '测试标题',
        },
      })

      // 描述文字样式应用于 <p> 元素
      // xl 尺寸的描述文字是 text-lg
      const paragraphs = wrapper.findAll('p')
      const descriptionEl = paragraphs.find(p => p.classes().includes('text-lg'))
      expect(descriptionEl?.classes()).toContain('text-lg')
    })
  })

  describe('Props 默认值', () => {
    it('description 默认值应该是 "暂无数据"', () => {
      const wrapper = mount(Empty)
      
      expect(wrapper.text()).toContain('暂无数据')
    })

    it('size 默认值应该是 "md"', () => {
      const wrapper = mount(Empty)
      
      const container = wrapper.find('[role="status"]')
      expect(container.classes()).toContain('min-h-[200px]')
    })
  })
})
