/**
 * Skeleton 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Skeleton from '@/design-system/base/Skeleton/Skeleton.vue'

describe('Skeleton 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染默认的 text 类型骨架', () => {
      const wrapper = mount(Skeleton)
      expect(wrapper.find('div').exists()).toBe(true)
      expect(wrapper.find('div').classes()).toContain('bg-slate-200')
      expect(wrapper.find('div').classes()).toContain('rounded-sm')
    })

    it('应该正确渲染 circle 类型骨架', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'circle' },
      })
      expect(wrapper.find('div').classes()).toContain('rounded-full')
    })

    it('应该正确渲染 rect 类型骨架', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'rect' },
      })
      expect(wrapper.find('div').classes()).toContain('rounded-md')
    })

    it('应该正确渲染 avatar 类型骨架', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'avatar' },
      })
      expect(wrapper.find('div').classes()).toContain('rounded-full')
    })

    it('应该正确渲染 image 类型骨架', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'image' },
      })
      expect(wrapper.find('div').classes()).toContain('rounded-md')
    })

    it('应该设置 aria-hidden 为 true', () => {
      const wrapper = mount(Skeleton)
      expect(wrapper.find('div').attributes('aria-hidden')).toBe('true')
    })
  })

  describe('尺寸变体', () => {
    it('应该正确应用 text 类型的 xs 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text', size: 'xs' },
      })
      expect(wrapper.find('div').classes()).toContain('w-12')
      expect(wrapper.find('div').classes()).toContain('h-3')
    })

    it('应该正确应用 text 类型的 sm 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text', size: 'sm' },
      })
      expect(wrapper.find('div').classes()).toContain('w-16')
      expect(wrapper.find('div').classes()).toContain('h-4')
    })

    it('应该正确应用 text 类型的 md 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text', size: 'md' },
      })
      expect(wrapper.find('div').classes()).toContain('w-24')
      expect(wrapper.find('div').classes()).toContain('h-5')
    })

    it('应该正确应用 text 类型的 lg 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text', size: 'lg' },
      })
      expect(wrapper.find('div').classes()).toContain('w-32')
      expect(wrapper.find('div').classes()).toContain('h-6')
    })

    it('应该正确应用 text 类型的 xl 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text', size: 'xl' },
      })
      expect(wrapper.find('div').classes()).toContain('w-48')
      expect(wrapper.find('div').classes()).toContain('h-7')
    })

    it('应该正确应用 circle 类型的 md 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'circle', size: 'md' },
      })
      expect(wrapper.find('div').classes()).toContain('w-10')
      expect(wrapper.find('div').classes()).toContain('h-10')
    })

    it('应该正确应用 rect 类型的 md 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'rect', size: 'md' },
      })
      expect(wrapper.find('div').classes()).toContain('w-full')
      expect(wrapper.find('div').classes()).toContain('h-32')
    })

    it('应该正确应用 avatar 类型的 md 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'avatar', size: 'md' },
      })
      expect(wrapper.find('div').classes()).toContain('w-10')
      expect(wrapper.find('div').classes()).toContain('h-10')
    })

    it('应该正确应用 image 类型的 md 尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'image', size: 'md' },
      })
      expect(wrapper.find('div').classes()).toContain('w-full')
      expect(wrapper.find('div').classes()).toContain('h-32')
    })
  })

  describe('自定义尺寸', () => {
    it('应该正确应用自定义宽度', () => {
      const wrapper = mount(Skeleton, {
        props: { width: '200px' },
      })
      expect(wrapper.find('div').attributes('style')).toContain('width: 200px')
    })

    it('应该正确应用自定义高度', () => {
      const wrapper = mount(Skeleton, {
        props: { height: '50px' },
      })
      expect(wrapper.find('div').attributes('style')).toContain('height: 50px')
    })

    it('应该正确应用自定义宽度和高度', () => {
      const wrapper = mount(Skeleton, {
        props: { width: '150px', height: '30px' },
      })
      const style = wrapper.find('div').attributes('style') || ''
      expect(style).toContain('width: 150px')
      expect(style).toContain('height: 30px')
    })

    it('自定义尺寸应该覆盖默认尺寸类', () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text', size: 'md', width: '200px', height: '30px' },
      })
      // 不应该包含默认的尺寸类
      expect(wrapper.find('div').classes()).not.toContain('w-24')
      expect(wrapper.find('div').classes()).not.toContain('h-5')
      // 应该包含自定义样式
      const style = wrapper.find('div').attributes('style') || ''
      expect(style).toContain('width: 200px')
      expect(style).toContain('height: 30px')
    })
  })

  describe('动画效果', () => {
    it('默认应该有动画效果', () => {
      const wrapper = mount(Skeleton)
      expect(wrapper.find('div').classes()).toContain('animate-pulse')
    })

    it('应该支持禁用动画', () => {
      const wrapper = mount(Skeleton, {
        props: { animated: false },
      })
      expect(wrapper.find('div').classes()).not.toContain('animate-pulse')
    })

    it('应该支持启用动画', () => {
      const wrapper = mount(Skeleton, {
        props: { animated: true },
      })
      expect(wrapper.find('div').classes()).toContain('animate-pulse')
    })
  })

  describe('自定义类名', () => {
    it('应该支持自定义类名', () => {
      const wrapper = mount(Skeleton, {
        props: { class: 'custom-class' },
      })
      expect(wrapper.find('div').classes()).toContain('custom-class')
    })

    it('应该保留基础类名', () => {
      const wrapper = mount(Skeleton, {
        props: { class: 'custom-class' },
      })
      expect(wrapper.find('div').classes()).toContain('bg-slate-200')
      expect(wrapper.find('div').classes()).toContain('rounded-sm')
    })
  })

  describe('组合使用', () => {
    it('应该可以组合多个 Skeleton 组件', () => {
      const wrapper = mount({
        template: `
          <div>
            <Skeleton type="avatar" size="xl" />
            <Skeleton type="text" size="lg" />
            <Skeleton type="text" size="md" />
          </div>
        `,
        components: { Skeleton },
      })
      expect(wrapper.findAllComponents(Skeleton)).toHaveLength(3)
    })

    it('应该可以在卡片中组合使用', () => {
      const wrapper = mount({
        template: `
          <div class="card">
            <div class="flex items-center gap-4">
              <Skeleton type="avatar" size="xl" />
              <div class="flex-1 space-y-2">
                <Skeleton type="text" size="lg" />
                <Skeleton type="text" size="sm" />
              </div>
            </div>
          </div>
        `,
        components: { Skeleton },
      })
      expect(wrapper.findAllComponents(Skeleton)).toHaveLength(3)
    })
  })

  describe('暗色模式', () => {
    it('应该支持暗色模式样式', () => {
      const wrapper = mount(Skeleton)
      expect(wrapper.find('div').classes()).toContain('dark:bg-slate-700')
    })
  })

  describe('响应式更新', () => {
    it('应该响应 type 属性变化', async () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text' },
      })
      expect(wrapper.find('div').classes()).toContain('rounded-sm')

      await wrapper.setProps({ type: 'circle' })
      expect(wrapper.find('div').classes()).toContain('rounded-full')
    })

    it('应该响应 size 属性变化', async () => {
      const wrapper = mount(Skeleton, {
        props: { type: 'text', size: 'sm' },
      })
      expect(wrapper.find('div').classes()).toContain('w-16')

      await wrapper.setProps({ size: 'lg' })
      expect(wrapper.find('div').classes()).toContain('w-32')
    })

    it('应该响应 animated 属性变化', async () => {
      const wrapper = mount(Skeleton, {
        props: { animated: true },
      })
      expect(wrapper.find('div').classes()).toContain('animate-pulse')

      await wrapper.setProps({ animated: false })
      expect(wrapper.find('div').classes()).not.toContain('animate-pulse')
    })

    it('应该响应 width 属性变化', async () => {
      const wrapper = mount(Skeleton, {
        props: { width: '100px' },
      })
      expect(wrapper.find('div').attributes('style')).toContain('width: 100px')

      await wrapper.setProps({ width: '200px' })
      expect(wrapper.find('div').attributes('style')).toContain('width: 200px')
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串宽度', () => {
      const wrapper = mount(Skeleton, {
        props: { width: '' },
      })
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('应该处理空字符串高度', () => {
      const wrapper = mount(Skeleton, {
        props: { height: '' },
      })
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('应该处理百分比尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { width: '100%', height: '50%' },
      })
      const style = wrapper.find('div').attributes('style') || ''
      expect(style).toContain('width: 100%')
      expect(style).toContain('height: 50%')
    })

    it('应该处理像素尺寸', () => {
      const wrapper = mount(Skeleton, {
        props: { width: '200px', height: '100px' },
      })
      const style = wrapper.find('div').attributes('style') || ''
      expect(style).toContain('width: 200px')
      expect(style).toContain('height: 100px')
    })

    it('应该处理 rem 单位', () => {
      const wrapper = mount(Skeleton, {
        props: { width: '10rem', height: '2rem' },
      })
      const style = wrapper.find('div').attributes('style') || ''
      expect(style).toContain('width: 10rem')
      expect(style).toContain('height: 2rem')
    })
  })

  describe('默认值', () => {
    it('应该使用默认的 type 为 text', () => {
      const wrapper = mount(Skeleton)
      expect(wrapper.find('div').classes()).toContain('rounded-sm')
    })

    it('应该使用默认的 size 为 md', () => {
      const wrapper = mount(Skeleton)
      expect(wrapper.find('div').classes()).toContain('w-24')
      expect(wrapper.find('div').classes()).toContain('h-5')
    })

    it('应该使用默认的 animated 为 true', () => {
      const wrapper = mount(Skeleton)
      expect(wrapper.find('div').classes()).toContain('animate-pulse')
    })
  })
})
