/**
 * Avatar 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '@/design-system/base/Avatar/Avatar.vue'

describe('Avatar.vue', () => {
  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'John Doe' },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[role="img"]').exists()).toBe(true)
    })

    it('应该设置正确的 aria-label', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'Jane Smith' },
      })
      expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('Jane Smith')
    })

    it('应该在无 alt 时显示问号', () => {
      const wrapper = mount(Avatar)
      expect(wrapper.text()).toBe('?')
    })
  })

  describe('Fallback 文字', () => {
    it('应该显示英文名首字母', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'John Doe' },
      })
      expect(wrapper.text()).toBe('JD')
    })

    it('应该显示单个单词的首字母', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'Alice' },
      })
      expect(wrapper.text()).toBe('A')
    })

    it('应该显示中文的第一个字', () => {
      const wrapper = mount(Avatar, {
        props: { alt: '张三' },
      })
      expect(wrapper.text()).toBe('张')
    })

    it('应该正确处理多余空格', () => {
      const wrapper = mount(Avatar, {
        props: { alt: '  John   Doe  ' },
      })
      expect(wrapper.text()).toBe('JD')
    })
  })

  describe('图片渲染', () => {
    it('应该渲染图片元素', () => {
      const wrapper = mount(Avatar, {
        props: {
          src: 'https://example.com/avatar.jpg',
          alt: 'Test User',
        },
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/avatar.jpg')
      expect(img.attributes('alt')).toBe('Test User')
    })

    it('应该在图片加载失败时显示 fallback', async () => {
      const wrapper = mount(Avatar, {
        props: {
          src: 'https://example.com/invalid.jpg',
          alt: 'Test User',
        },
      })
      
      const img = wrapper.find('img')
      await img.trigger('error')
      
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toBe('TU')
    })

    it('应该在没有 src 时显示 fallback', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'Test User' },
      })
      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.text()).toBe('TU')
    })
  })

  describe('尺寸变体', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
    
    sizes.forEach((size) => {
      it(`应该正确应用 ${size} 尺寸样式`, () => {
        const wrapper = mount(Avatar, {
          props: { size, alt: 'Test' },
        })
        
        const container = wrapper.find('[role="img"]')
        expect(container.classes()).toContain(`h-${size === '2xl' ? '20' : size === 'xl' ? '16' : size === 'lg' ? '12' : size === 'md' ? '10' : size === 'sm' ? '8' : '6'}`)
        expect(container.classes()).toContain(`w-${size === '2xl' ? '20' : size === 'xl' ? '16' : size === 'lg' ? '12' : size === 'md' ? '10' : size === 'sm' ? '8' : '6'}`)
      })
    })
  })

  describe('形状变体', () => {
    it('应该正确应用 circle 样式', () => {
      const wrapper = mount(Avatar, {
        props: { variant: 'circle', alt: 'Test' },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-full')
    })

    it('应该正确应用 square 样式', () => {
      const wrapper = mount(Avatar, {
        props: { variant: 'square', alt: 'Test' },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-none')
    })

    it('应该正确应用 rounded 样式', () => {
      const wrapper = mount(Avatar, {
        props: { variant: 'rounded', alt: 'Test' },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-lg')
    })
  })

  describe('状态指示器', () => {
    it('应该显示 online 状态', () => {
      const wrapper = mount(Avatar, {
        props: { status: 'online', alt: 'Test' },
      })
      const statusIndicator = wrapper.find('span[aria-hidden="true"]')
      expect(statusIndicator.exists()).toBe(true)
      expect(statusIndicator.classes()).toContain('bg-success-DEFAULT')
    })

    it('应该显示 offline 状态', () => {
      const wrapper = mount(Avatar, {
        props: { status: 'offline', alt: 'Test' },
      })
      const statusIndicator = wrapper.find('span[aria-hidden="true"]')
      expect(statusIndicator.classes()).toContain('bg-neutral-400')
    })

    it('应该显示 away 状态', () => {
      const wrapper = mount(Avatar, {
        props: { status: 'away', alt: 'Test' },
      })
      const statusIndicator = wrapper.find('span[aria-hidden="true"]')
      expect(statusIndicator.classes()).toContain('bg-warning-DEFAULT')
    })

    it('应该显示 busy 状态', () => {
      const wrapper = mount(Avatar, {
        props: { status: 'busy', alt: 'Test' },
      })
      const statusIndicator = wrapper.find('span[aria-hidden="true"]')
      expect(statusIndicator.classes()).toContain('bg-danger-DEFAULT')
    })

    it('应该在 disableStatus 为 true 时不显示状态指示器', () => {
      const wrapper = mount(Avatar, {
        props: { status: 'online', disableStatus: true, alt: 'Test' },
      })
      expect(wrapper.find('span[aria-hidden="true"]').exists()).toBe(false)
    })

    it('应该在无 status 时不显示状态指示器', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'Test' },
      })
      expect(wrapper.find('span[aria-hidden="true"]').exists()).toBe(false)
    })
  })

  describe('点击事件', () => {
    it('应该正确触发点击事件', async () => {
      const onClick = vi.fn()
      const wrapper = mount(Avatar, {
        props: {
          alt: 'Test',
          onClick,
        },
        attrs: {
          onClick,
        },
      })
      
      await wrapper.find('[role="img"]').trigger('click')
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('自定义类名', () => {
    it('应该正确应用自定义类名', () => {
      const wrapper = mount(Avatar, {
        props: {
          alt: 'Test',
          class: 'custom-class another-class',
        },
      })
      
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('custom-class')
      expect(container.classes()).toContain('another-class')
    })
  })

  describe('默认属性', () => {
    it('应该使用默认尺寸 md', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'Test' },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('h-10')
      expect(wrapper.find('[role="img"]').classes()).toContain('w-10')
    })

    it('应该使用默认形状 circle', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'Test' },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-full')
    })

    it('应该使用默认 disableStatus false', () => {
      const wrapper = mount(Avatar, {
        props: { status: 'online', alt: 'Test' },
      })
      expect(wrapper.find('span[aria-hidden="true"]').exists()).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该设置正确的 role 属性', () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'Test' },
      })
      expect(wrapper.find('[role="img"]').exists()).toBe(true)
    })

    it('应该为状态指示器设置 aria-hidden', () => {
      const wrapper = mount(Avatar, {
        props: { status: 'online', alt: 'Test' },
      })
      const statusIndicator = wrapper.find('span[aria-hidden="true"]')
      expect(statusIndicator.exists()).toBe(true)
      expect(statusIndicator.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('响应式', () => {
    it('应该在 src prop 变化时更新图片', async () => {
      const wrapper = mount(Avatar, {
        props: {
          src: 'https://example.com/avatar1.jpg',
          alt: 'Test',
        },
      })
      
      expect(wrapper.find('img').attributes('src')).toBe('https://example.com/avatar1.jpg')
      
      await wrapper.setProps({ src: 'https://example.com/avatar2.jpg' })
      expect(wrapper.find('img').attributes('src')).toBe('https://example.com/avatar2.jpg')
    })

    it('应该在 alt prop 变化时更新 fallback 文字', async () => {
      const wrapper = mount(Avatar, {
        props: { alt: 'John Doe' },
      })
      
      expect(wrapper.text()).toBe('JD')
      
      await wrapper.setProps({ alt: 'Jane Smith' })
      expect(wrapper.text()).toBe('JS')
    })

    it('应该在 status prop 变化时更新状态指示器', async () => {
      const wrapper = mount(Avatar, {
        props: { status: 'online', alt: 'Test' },
      })
      
      let statusIndicator = wrapper.find('span[aria-hidden="true"]')
      expect(statusIndicator.classes()).toContain('bg-success-DEFAULT')
      
      await wrapper.setProps({ status: 'busy' })
      statusIndicator = wrapper.find('span[aria-hidden="true"]')
      expect(statusIndicator.classes()).toContain('bg-danger-DEFAULT')
    })
  })
})
