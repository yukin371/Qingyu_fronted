/**
 * Divider 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Divider from '@/design-system/base/Divider/Divider.vue'

describe('Divider 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染默认的水平分隔线', () => {
      const wrapper = mount(Divider)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('应该应用正确的容器类名', () => {
      const wrapper = mount(Divider)
      const container = wrapper.find('div')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('items-center')
      expect(container.classes()).toContain('w-full')
    })

    it('应该应用正确的线条样式', () => {
      const wrapper = mount(Divider)
      const line = wrapper.find('.border-t')
      expect(line.exists()).toBe(true)
      expect(line.classes()).toContain('border-slate-200')
      expect(line.classes()).toContain('border-solid')
    })
  })

  describe('方向切换', () => {
    it('应该正确渲染垂直分隔线', () => {
      const wrapper = mount(Divider, {
        props: { direction: 'vertical' },
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('h-full')
    })

    it('垂直分隔线应该使用 border-l 而不是 border-t', () => {
      const wrapper = mount(Divider, {
        props: { direction: 'vertical' },
      })
      const line = wrapper.find('.border-l')
      expect(line.exists()).toBe(true)
      expect(line.classes()).toContain('w-px')
      expect(line.classes()).not.toContain('h-px')
    })

    it('水平分隔线应该使用 border-t', () => {
      const wrapper = mount(Divider, {
        props: { direction: 'horizontal' },
      })
      const line = wrapper.find('.border-t')
      expect(line.exists()).toBe(true)
      expect(line.classes()).toContain('h-px')
      expect(line.classes()).toContain('w-full')
    })
  })

  describe('标签文字', () => {
    it('应该显示标签文字', () => {
      const wrapper = mount(Divider, {
        props: { label: '测试标签' },
      })
      expect(wrapper.text()).toContain('测试标签')
    })

    it('标签应该有正确的样式类', () => {
      const wrapper = mount(Divider, {
        props: { label: '标签' },
      })
      const label = wrapper.find('span')
      expect(label.exists()).toBe(true)
      expect(label.classes()).toContain('px-3')
      expect(label.classes()).toContain('text-sm')
      expect(label.classes()).toContain('text-slate-500')
    })

    it('有标签时应该渲染两条线', () => {
      const wrapper = mount(Divider, {
        props: { label: '标签' },
      })
      const lines = wrapper.findAll('.border-t')
      expect(lines.length).toBe(2)
    })

    it('无标签时只渲染一条线', () => {
      const wrapper = mount(Divider)
      const lines = wrapper.findAll('.border-t')
      expect(lines.length).toBe(1)
    })

    it('标签应该是不可换行的', () => {
      const wrapper = mount(Divider, {
        props: { label: '长标签文本' },
      })
      const label = wrapper.find('span')
      expect(label.classes()).toContain('whitespace-nowrap')
    })
  })

  describe('变体样式', () => {
    it('应该正确应用 solid 变体', () => {
      const wrapper = mount(Divider, {
        props: { variant: 'solid' },
      })
      const line = wrapper.find('.border-solid')
      expect(line.exists()).toBe(true)
    })

    it('应该正确应用 dashed 变体', () => {
      const wrapper = mount(Divider, {
        props: { variant: 'dashed' },
      })
      const line = wrapper.find('.border-dashed')
      expect(line.exists()).toBe(true)
    })

    it('应该正确应用 dotted 变体', () => {
      const wrapper = mount(Divider, {
        props: { variant: 'dotted' },
      })
      const line = wrapper.find('.border-dotted')
      expect(line.exists()).toBe(true)
    })

    it('默认应该使用 solid 变体', () => {
      const wrapper = mount(Divider)
      const line = wrapper.find('.border-solid')
      expect(line.exists()).toBe(true)
    })
  })

  describe('深色模式', () => {
    it('应该支持深色模式样式', () => {
      const wrapper = mount(Divider)
      const line = wrapper.find('.border-t')
      expect(line.classes()).toContain('dark:border-slate-700')
    })

    it('标签在深色模式下应该有正确的颜色', () => {
      const wrapper = mount(Divider, {
        props: { label: '标签' },
      })
      const label = wrapper.find('span')
      expect(label.classes()).toContain('dark:text-slate-400')
    })
  })

  describe('组合使用', () => {
    it('应该同时支持方向和标签', () => {
      const wrapper = mount(Divider, {
        props: {
          direction: 'vertical',
          label: 'OR',
        },
      })
      expect(wrapper.text()).toContain('OR')
      const label = wrapper.find('span')
      expect(label.classes()).toContain('py-3')
    })

    it('应该同时支持变体和标签', () => {
      const wrapper = mount(Divider, {
        props: {
          variant: 'dashed',
          label: '分隔',
        },
      })
      expect(wrapper.text()).toContain('分隔')
      const line = wrapper.find('.border-dashed')
      expect(line.exists()).toBe(true)
    })

    it('应该同时支持所有属性', () => {
      const wrapper = mount(Divider, {
        props: {
          direction: 'horizontal',
          variant: 'dotted',
          label: '测试',
        },
      })
      expect(wrapper.text()).toContain('测试')
      const line = wrapper.find('.border-dotted')
      expect(line.exists()).toBe(true)
    })
  })

  describe('自定义类名', () => {
    it('应该支持自定义类名', () => {
      const wrapper = mount(Divider, {
        props: { class: 'custom-class' },
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('custom-class')
    })
  })

  describe('响应式行为', () => {
    it('水平分隔线应该占满容器宽度', () => {
      const wrapper = mount(Divider, {
        props: { direction: 'horizontal' },
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('w-full')
    })

    it('垂直分隔线应该占满容器高度', () => {
      const wrapper = mount(Divider, {
        props: { direction: 'vertical' },
      })
      const container = wrapper.find('div')
      expect(container.classes()).toContain('h-full')
    })
  })

  describe('边缘情况', () => {
    it('空标签不应该显示内容', () => {
      const wrapper = mount(Divider, {
        props: { label: '' },
      })
      // 空字符串会被认为是 falsy，所以不会渲染标签
      const label = wrapper.find('span')
      expect(label.exists()).toBe(false)
    })

    it('非常长的标签应该正确显示', () => {
      const longLabel = '这是一个非常非常非常长的标签文本'
      const wrapper = mount(Divider, {
        props: { label: longLabel },
      })
      expect(wrapper.text()).toContain(longLabel)
    })

    it('包含特殊字符的标签应该正确显示', () => {
      const specialLabel = '特殊字符: <>&"\''
      const wrapper = mount(Divider, {
        props: { label: specialLabel },
      })
      expect(wrapper.text()).toContain(specialLabel)
    })
  })
})
