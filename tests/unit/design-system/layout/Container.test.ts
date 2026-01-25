/**
 * Container 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Container from '@/design-system/layout/Container/Container.vue'

describe('Container 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染 Container 组件', () => {
      const wrapper = mount(Container)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('应该渲染默认的 size 为 full', () => {
      const wrapper = mount(Container)
      expect(wrapper.classes()).toContain('max-w-full')
    })

    it('应该包含默认的宽度类', () => {
      const wrapper = mount(Container)
      expect(wrapper.classes()).toContain('w-full')
    })

    it('应该包含默认的居中类', () => {
      const wrapper = mount(Container)
      expect(wrapper.classes()).toContain('mx-auto')
    })

    it('应该包含默认的内边距类', () => {
      const wrapper = mount(Container)
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('sm:px-6')
      expect(wrapper.classes()).toContain('lg:px-8')
    })
  })

  describe('size 属性', () => {
    it('应该正确应用 size="xs"', () => {
      const wrapper = mount(Container, {
        props: { size: 'xs' },
      })
      expect(wrapper.classes()).toContain('max-w-xs')
    })

    it('应该正确应用 size="sm"', () => {
      const wrapper = mount(Container, {
        props: { size: 'sm' },
      })
      expect(wrapper.classes()).toContain('max-w-sm')
    })

    it('应该正确应用 size="md"', () => {
      const wrapper = mount(Container, {
        props: { size: 'md' },
      })
      expect(wrapper.classes()).toContain('max-w-md')
    })

    it('应该正确应用 size="lg"', () => {
      const wrapper = mount(Container, {
        props: { size: 'lg' },
      })
      expect(wrapper.classes()).toContain('max-w-lg')
    })

    it('应该正确应用 size="xl"', () => {
      const wrapper = mount(Container, {
        props: { size: 'xl' },
      })
      expect(wrapper.classes()).toContain('max-w-xl')
    })

    it('应该正确应用 size="full"', () => {
      const wrapper = mount(Container, {
        props: { size: 'full' },
      })
      expect(wrapper.classes()).toContain('max-w-full')
    })

    it('应该正确应用所有 size 值', () => {
      const sizeClasses: Record<string, string> = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full',
      }

      Object.entries(sizeClasses).forEach(([size, expectedClass]) => {
        const wrapper = mount(Container, {
          props: { size: size as any },
        })
        expect(wrapper.classes()).toContain(expectedClass)
      })
    })
  })

  describe('fluid 属性', () => {
    it('应该正确应用 fluid="true"', () => {
      const wrapper = mount(Container, {
        props: { fluid: true },
      })
      expect(wrapper.props('fluid')).toBe(true)
      expect(wrapper.classes()).toContain('w-full')
    })

    it('应该正确应用 fluid="false"', () => {
      const wrapper = mount(Container, {
        props: { fluid: false },
      })
      expect(wrapper.props('fluid')).toBe(false)
    })

    it('fluid 模式应该包含 w-full 类', () => {
      const wrapper = mount(Container, {
        props: { fluid: true },
      })
      expect(wrapper.classes()).toContain('w-full')
    })
  })

  describe('padding 属性', () => {
    it('应该正确应用 padding="true"', () => {
      const wrapper = mount(Container, {
        props: { padding: true },
      })
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('sm:px-6')
      expect(wrapper.classes()).toContain('lg:px-8')
    })

    it('应该正确应用 padding="false"', () => {
      const wrapper = mount(Container, {
        props: { padding: false },
      })
      expect(wrapper.classes()).not.toContain('px-4')
      expect(wrapper.classes()).not.toContain('sm:px-6')
      expect(wrapper.classes()).not.toContain('lg:px-8')
    })

    it('padding 为 false 时不应该包含任何内边距类', () => {
      const wrapper = mount(Container, {
        props: { padding: false },
      })
      const paddingClasses = wrapper.classes().filter(c => 
        c.startsWith('px-') || c.startsWith('py-') || c.startsWith('p-')
      )
      expect(paddingClasses.length).toBe(0)
    })
  })

  describe('centered 属性', () => {
    it('应该正确应用 centered="true"', () => {
      const wrapper = mount(Container, {
        props: { centered: true },
      })
      expect(wrapper.classes()).toContain('mx-auto')
    })

    it('应该正确应用 centered="false"', () => {
      const wrapper = mount(Container, {
        props: { centered: false },
      })
      expect(wrapper.classes()).not.toContain('mx-auto')
    })

    it('centered 为 false 时不应该包含 mx-auto 类', () => {
      const wrapper = mount(Container, {
        props: { centered: false },
      })
      expect(wrapper.classes()).not.toContain('mx-auto')
    })
  })

  describe('插槽内容', () => {
    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(Container, {
        slots: {
          default: '<div class="test-content">测试内容</div>',
        },
      })
      expect(wrapper.html()).toContain('测试内容')
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('应该支持复杂内容', () => {
      const wrapper = mount(Container, {
        slots: {
          default: `
            <h1>标题</h1>
            <p>段落内容</p>
            <button>按钮</button>
          `,
        },
      })
      expect(wrapper.html()).toContain('标题')
      expect(wrapper.html()).toContain('段落内容')
      expect(wrapper.html()).toContain('按钮')
    })

    it('应该支持嵌套组件', () => {
      const wrapper = mount(Container, {
        slots: {
          default: '<div class="nested"><span class="deep">深度嵌套</span></div>',
        },
      })
      expect(wrapper.find('.nested').exists()).toBe(true)
      expect(wrapper.find('.deep').exists()).toBe(true)
    })
  })

  describe('组合使用', () => {
    it('应该同时支持 size 和 fluid', () => {
      const wrapper = mount(Container, {
        props: {
          size: 'lg',
          fluid: true,
        },
      })
      expect(wrapper.classes()).toContain('max-w-lg')
      expect(wrapper.classes()).toContain('w-full')
    })

    it('应该同时支持 size 和 padding', () => {
      const wrapper = mount(Container, {
        props: {
          size: 'md',
          padding: true,
        },
      })
      expect(wrapper.classes()).toContain('max-w-md')
      expect(wrapper.classes()).toContain('px-4')
    })

    it('应该同时支持 size 和 centered', () => {
      const wrapper = mount(Container, {
        props: {
          size: 'sm',
          centered: true,
        },
      })
      expect(wrapper.classes()).toContain('max-w-sm')
      expect(wrapper.classes()).toContain('mx-auto')
    })

    it('应该同时支持 padding 和 centered', () => {
      const wrapper = mount(Container, {
        props: {
          padding: true,
          centered: true,
        },
      })
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('mx-auto')
    })

    it('应该同时支持 size、padding 和 centered', () => {
      const wrapper = mount(Container, {
        props: {
          size: 'xl',
          padding: true,
          centered: true,
        },
      })
      expect(wrapper.classes()).toContain('max-w-xl')
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('mx-auto')
    })

    it('应该同时支持所有属性', () => {
      const wrapper = mount(Container, {
        props: {
          size: 'lg',
          fluid: false,
          padding: true,
          centered: true,
        },
      })
      expect(wrapper.classes()).toContain('max-w-lg')
      expect(wrapper.classes()).toContain('w-full')
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('mx-auto')
    })

    it('应该支持 padding 为 false 且 centered 为 true', () => {
      const wrapper = mount(Container, {
        props: {
          padding: false,
          centered: true,
        },
      })
      expect(wrapper.classes()).not.toContain('px-4')
      expect(wrapper.classes()).toContain('mx-auto')
    })

    it('应该支持 padding 为 true 且 centered 为 false', () => {
      const wrapper = mount(Container, {
        props: {
          padding: true,
          centered: false,
        },
      })
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).not.toContain('mx-auto')
    })

    it('应该支持 padding 为 false 且 centered 为 false', () => {
      const wrapper = mount(Container, {
        props: {
          padding: false,
          centered: false,
        },
      })
      expect(wrapper.classes()).not.toContain('px-4')
      expect(wrapper.classes()).not.toContain('mx-auto')
    })
  })

  describe('自定义类名', () => {
    it('应该支持自定义类名', () => {
      const wrapper = mount(Container, {
        props: { class: 'custom-class' },
      })
      expect(wrapper.classes()).toContain('custom-class')
    })

    it('应该支持多个自定义类名', () => {
      const wrapper = mount(Container, {
        props: { class: 'class-1 class-2 class-3' },
      })
      expect(wrapper.classes()).toContain('class-1')
      expect(wrapper.classes()).toContain('class-2')
      expect(wrapper.classes()).toContain('class-3')
    })

    it('自定义类名应该与默认类名共存', () => {
      const wrapper = mount(Container, {
        props: {
          size: 'md',
          class: 'custom-class',
        },
      })
      expect(wrapper.classes()).toContain('max-w-md')
      expect(wrapper.classes()).toContain('w-full')
      expect(wrapper.classes()).toContain('custom-class')
    })

    it('自定义类名应该与响应式内边距共存', () => {
      const wrapper = mount(Container, {
        props: {
          padding: true,
          class: 'custom-class',
        },
      })
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('custom-class')
    })
  })

  describe('响应式内边距', () => {
    it('应该包含所有响应式内边距类', () => {
      const wrapper = mount(Container, {
        props: { padding: true },
      })
      expect(wrapper.classes()).toContain('px-4')
      expect(wrapper.classes()).toContain('sm:px-6')
      expect(wrapper.classes()).toContain('lg:px-8')
    })

    it('padding 为 false 时应该移除所有内边距类', () => {
      const wrapper = mount(Container, {
        props: { padding: false },
      })
      expect(wrapper.classes()).not.toContain('px-4')
      expect(wrapper.classes()).not.toContain('sm:px-6')
      expect(wrapper.classes()).not.toContain('lg:px-8')
    })
  })

  describe('默认值', () => {
    it('size 默认值应该是 full', () => {
      const wrapper = mount(Container)
      expect(wrapper.props('size')).toBe('full')
      expect(wrapper.classes()).toContain('max-w-full')
    })

    it('fluid 默认值应该是 false', () => {
      const wrapper = mount(Container)
      expect(wrapper.props('fluid')).toBe(false)
    })

    it('padding 默认值应该是 true', () => {
      const wrapper = mount(Container)
      expect(wrapper.props('padding')).toBe(true)
      expect(wrapper.classes()).toContain('px-4')
    })

    it('centered 默认值应该是 true', () => {
      const wrapper = mount(Container)
      expect(wrapper.props('centered')).toBe(true)
      expect(wrapper.classes()).toContain('mx-auto')
    })
  })

  describe('边缘情况', () => {
    it('应该支持空内容', () => {
      const wrapper = mount(Container, {
        slots: { default: '' },
      })
      expect(wrapper.html()).toContain('<div')
    })

    it('应该支持纯文本内容', () => {
      const wrapper = mount(Container, {
        slots: { default: '纯文本内容' },
      })
      expect(wrapper.text()).toContain('纯文本内容')
    })

    it('应该支持包含特殊字符的内容', () => {
      const wrapper = mount(Container, {
        slots: { default: '<div>特殊字符: < > & " \'</div>' },
      })
      expect(wrapper.html()).toContain('特殊字符:')
    })
  })

  describe('动态属性', () => {
    it('应该支持动态改变 size', async () => {
      const wrapper = mount(Container, {
        props: { size: 'sm' },
      })
      expect(wrapper.classes()).toContain('max-w-sm')

      await wrapper.setProps({ size: 'lg' })
      expect(wrapper.classes()).toContain('max-w-lg')
      expect(wrapper.classes()).not.toContain('max-w-sm')
    })

    it('应该支持动态改变 padding', async () => {
      const wrapper = mount(Container, {
        props: { padding: true },
      })
      expect(wrapper.classes()).toContain('px-4')

      await wrapper.setProps({ padding: false })
      expect(wrapper.classes()).not.toContain('px-4')
    })

    it('应该支持动态改变 centered', async () => {
      const wrapper = mount(Container, {
        props: { centered: true },
      })
      expect(wrapper.classes()).toContain('mx-auto')

      await wrapper.setProps({ centered: false })
      expect(wrapper.classes()).not.toContain('mx-auto')
    })

    it('应该支持动态改变 fluid', async () => {
      const wrapper = mount(Container, {
        props: { fluid: false },
      })
      expect(wrapper.props('fluid')).toBe(false)

      await wrapper.setProps({ fluid: true })
      expect(wrapper.props('fluid')).toBe(true)
    })
  })

  describe('宽度类', () => {
    it('应该始终包含 w-full 类', () => {
      const wrapper = mount(Container)
      expect(wrapper.classes()).toContain('w-full')
    })

    it('fluid 为 true 时应该包含 w-full 类', () => {
      const wrapper = mount(Container, {
        props: { fluid: true },
      })
      expect(wrapper.classes()).toContain('w-full')
    })

    it('fluid 为 false 时也应该包含 w-full 类', () => {
      const wrapper = mount(Container, {
        props: { fluid: false },
      })
      expect(wrapper.classes()).toContain('w-full')
    })
  })

  describe('类名优先级', () => {
    it('自定义类名应该覆盖默认类名（通过 tailwind-merge）', () => {
      const wrapper = mount(Container, {
        props: {
          padding: true,
          class: 'px-0',
        },
      })
      // tailwind-merge 应该合并冲突的类名，后者优先
      expect(wrapper.classes()).toContain('px-0')
    })
  })
})
