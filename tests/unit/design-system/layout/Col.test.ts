/**
 * Col 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Col from '@/design-system/layout/Col/Col.vue'

describe('Col 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染 Col 组件', () => {
      const wrapper = mount(Col)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('应该渲染默认的 span 为 12', () => {
      const wrapper = mount(Col)
      expect(wrapper.classes()).toContain('w-full')
    })

    it('应该包含 min-w-0 类防止内容溢出', () => {
      const wrapper = mount(Col)
      expect(wrapper.classes()).toContain('min-w-0')
    })
  })

  describe('span 属性', () => {
    it('应该正确应用 span="1"', () => {
      const wrapper = mount(Col, {
        props: { span: 1 },
      })
      expect(wrapper.classes()).toContain('w-1/12')
    })

    it('应该正确应用 span="6"', () => {
      const wrapper = mount(Col, {
        props: { span: 6 },
      })
      expect(wrapper.classes()).toContain('w-6/12')
    })

    it('应该正确应用 span="12"', () => {
      const wrapper = mount(Col, {
        props: { span: 12 },
      })
      expect(wrapper.classes()).toContain('w-full')
    })

    it('应该正确应用所有 span 值', () => {
      const spanClasses: Record<number, string> = {
        1: 'w-1/12',
        2: 'w-2/12',
        3: 'w-3/12',
        4: 'w-4/12',
        5: 'w-5/12',
        6: 'w-6/12',
        7: 'w-7/12',
        8: 'w-8/12',
        9: 'w-9/12',
        10: 'w-10/12',
        11: 'w-11/12',
        12: 'w-full',
      }

      Object.entries(spanClasses).forEach(([span, expectedClass]) => {
        const wrapper = mount(Col, {
          props: { span: Number(span) },
        })
        expect(wrapper.classes()).toContain(expectedClass)
      })
    })

    it('超出范围的 span 应该使用 w-full', () => {
      const wrapper = mount(Col, {
        props: { span: 999 },
      })
      expect(wrapper.classes()).toContain('w-full')
    })
  })

  describe('offset 属性', () => {
    it('应该正确应用 offset="0"', () => {
      const wrapper = mount(Col, {
        props: { offset: 0 },
      })
      // offset 0 不应该添加 ml 类
      expect(wrapper.classes().filter(c => c.startsWith('ml-'))).toHaveLength(0)
    })

    it('应该正确应用 offset="1"', () => {
      const wrapper = mount(Col, {
        props: { offset: 1 },
      })
      expect(wrapper.classes()).toContain('ml-1/12')
    })

    it('应该正确应用 offset="6"', () => {
      const wrapper = mount(Col, {
        props: { offset: 6 },
      })
      expect(wrapper.classes()).toContain('ml-6/12')
    })

    it('应该正确应用所有 offset 值', () => {
      const offsetClasses: Record<number, string> = {
        0: '',
        1: 'ml-1/12',
        2: 'ml-2/12',
        3: 'ml-3/12',
        4: 'ml-4/12',
        5: 'ml-5/12',
        6: 'ml-6/12',
        7: 'ml-7/12',
        8: 'ml-8/12',
        9: 'ml-9/12',
        10: 'ml-10/12',
        11: 'ml-11/12',
      }

      Object.entries(offsetClasses).forEach(([offset, expectedClass]) => {
        const wrapper = mount(Col, {
          props: { offset: Number(offset) },
        })
        if (expectedClass) {
          expect(wrapper.classes()).toContain(expectedClass)
        }
      })
    })

    it('超出范围的 offset 不应该添加 ml 类', () => {
      const wrapper = mount(Col, {
        props: { offset: 999 },
      })
      expect(wrapper.classes().filter(c => c.startsWith('ml-'))).toHaveLength(0)
    })
  })

  describe('order 属性', () => {
    it('应该正确应用 order 属性', () => {
      const wrapper = mount(Col, {
        props: { order: 1 },
      })
      expect(wrapper.classes()).toContain('order-1')
    })

    it('应该支持不同的 order 值', () => {
      for (let i = 0; i <= 5; i++) {
        const wrapper = mount(Col, {
          props: { order: i },
        })
        expect(wrapper.classes()).toContain(`order-${i}`)
      }
    })

    it('未设置 order 时不应该添加 order 类', () => {
      const wrapper = mount(Col)
      expect(wrapper.classes().filter(c => c.startsWith('order-'))).toHaveLength(0)
    })
  })

  describe('响应式断点', () => {
    it('应该正确应用 xs 断点', () => {
      const wrapper = mount(Col, {
        props: { xs: 6 },
      })
      expect(wrapper.classes()).toContain('w-6/12')
    })

    it('应该正确应用 sm 断点', () => {
      const wrapper = mount(Col, {
        props: { sm: 6 },
      })
      expect(wrapper.classes()).toContain('sm:w-6/12')
    })

    it('应该正确应用 md 断点', () => {
      const wrapper = mount(Col, {
        props: { md: 6 },
      })
      expect(wrapper.classes()).toContain('md:w-6/12')
    })

    it('应该正确应用 lg 断点', () => {
      const wrapper = mount(Col, {
        props: { lg: 6 },
      })
      expect(wrapper.classes()).toContain('lg:w-6/12')
    })

    it('应该正确应用 xl 断点', () => {
      const wrapper = mount(Col, {
        props: { xl: 6 },
      })
      expect(wrapper.classes()).toContain('xl:w-6/12')
    })

    it('应该支持多个断点同时设置', () => {
      const wrapper = mount(Col, {
        props: {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 3,
          xl: 2,
        },
      })
      // xs 断点使用 w-full 而不是 w-12/12
      expect(wrapper.classes()).toContain('w-full')
      expect(wrapper.classes()).toContain('sm:w-6/12')
      expect(wrapper.classes()).toContain('md:w-4/12')
      expect(wrapper.classes()).toContain('lg:w-3/12')
      expect(wrapper.classes()).toContain('xl:w-2/12')
    })

    it('设置响应式断点时不应该应用基础 span', () => {
      const wrapper = mount(Col, {
        props: {
          span: 6,
          md: 4,
        },
      })
      // 有响应式断点时，不设置基础 span
      expect(wrapper.classes().filter(c => c.match(/^w-\d+\/12$/) && !c.includes(':'))).toHaveLength(0)
      expect(wrapper.classes()).toContain('md:w-4/12')
    })

    it('xs 断点应该作为基础宽度', () => {
      const wrapper = mount(Col, {
        props: {
          xs: 12,
          md: 6,
        },
      })
      // xs 断点使用 w-full 而不是 w-12/12
      expect(wrapper.classes()).toContain('w-full')
      expect(wrapper.classes()).toContain('md:w-6/12')
    })
  })

  describe('插槽内容', () => {
    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(Col, {
        slots: {
          default: '<div class="test-content">测试内容</div>',
        },
      })
      expect(wrapper.html()).toContain('测试内容')
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('应该支持复杂内容', () => {
      const wrapper = mount(Col, {
        slots: {
          default: `
            <h3>标题</h3>
            <p>段落内容</p>
            <button>按钮</button>
          `,
        },
      })
      expect(wrapper.html()).toContain('标题')
      expect(wrapper.html()).toContain('段落内容')
      expect(wrapper.html()).toContain('按钮')
    })
  })

  describe('组合使用', () => {
    it('应该同时支持 span 和 offset', () => {
      const wrapper = mount(Col, {
        props: {
          span: 6,
          offset: 3,
        },
      })
      expect(wrapper.classes()).toContain('w-6/12')
      expect(wrapper.classes()).toContain('ml-3/12')
    })

    it('应该同时支持 span 和 order', () => {
      const wrapper = mount(Col, {
        props: {
          span: 4,
          order: 2,
        },
      })
      expect(wrapper.classes()).toContain('w-4/12')
      expect(wrapper.classes()).toContain('order-2')
    })

    it('应该同时支持 offset 和 order', () => {
      const wrapper = mount(Col, {
        props: {
          offset: 2,
          order: 1,
        },
      })
      expect(wrapper.classes()).toContain('ml-2/12')
      expect(wrapper.classes()).toContain('order-1')
    })

    it('应该同时支持 span、offset 和 order', () => {
      const wrapper = mount(Col, {
        props: {
          span: 4,
          offset: 2,
          order: 1,
        },
      })
      expect(wrapper.classes()).toContain('w-4/12')
      expect(wrapper.classes()).toContain('ml-2/12')
      expect(wrapper.classes()).toContain('order-1')
    })

    it('应该同时支持响应式断点和 offset', () => {
      const wrapper = mount(Col, {
        props: {
          xs: 12,
          md: 6,
          offset: 2,
        },
      })
      // xs 断点使用 w-full 而不是 w-12/12
      expect(wrapper.classes()).toContain('w-full')
      expect(wrapper.classes()).toContain('md:w-6/12')
      expect(wrapper.classes()).toContain('ml-2/12')
    })
  })

  describe('自定义类名', () => {
    it('应该支持自定义类名', () => {
      const wrapper = mount(Col, {
        props: { class: 'custom-class' },
      })
      expect(wrapper.classes()).toContain('custom-class')
    })

    it('应该支持多个自定义类名', () => {
      const wrapper = mount(Col, {
        props: { class: 'class-1 class-2 class-3' },
      })
      expect(wrapper.classes()).toContain('class-1')
      expect(wrapper.classes()).toContain('class-2')
      expect(wrapper.classes()).toContain('class-3')
    })

    it('自定义类名应该与默认类名共存', () => {
      const wrapper = mount(Col, {
        props: {
          span: 6,
          class: 'custom-class',
        },
      })
      expect(wrapper.classes()).toContain('w-6/12')
      expect(wrapper.classes()).toContain('min-w-0')
      expect(wrapper.classes()).toContain('custom-class')
    })
  })

  describe('边缘情况', () => {
    it('span 为 0 应该有合理的处理', () => {
      const wrapper = mount(Col, {
        props: { span: 0 },
      })
      // 0 会被映射到默认的 w-full
      expect(wrapper.classes()).toContain('w-full')
    })

    it('负数 offset 应该不添加 ml 类', () => {
      const wrapper = mount(Col, {
        props: { offset: -1 },
      })
      expect(wrapper.classes().filter(c => c.startsWith('ml-'))).toHaveLength(0)
    })

    it('应该支持响应式断点为 0', () => {
      const wrapper = mount(Col, {
        props: { xs: 0 },
      })
      // xs 0 会被映射到 w-full
      expect(wrapper.classes()).toContain('w-full')
    })
  })

  describe('响应式行为', () => {
    it('移动端应该使用 xs 断点', () => {
      const wrapper = mount(Col, {
        props: {
          xs: 12,
          md: 6,
        },
      })
      // xs 断点使用 w-full 而不是 w-12/12
      expect(wrapper.classes()).toContain('w-full')
    })

    it('应该正确应用多个响应式类', () => {
      const wrapper = mount(Col, {
        props: {
          sm: 12,
          md: 8,
          lg: 6,
          xl: 4,
        },
      })
      // sm 断点使用 w-full 而不是 sm:w-12/12
      expect(wrapper.classes()).toContain('sm:w-full')
      expect(wrapper.classes()).toContain('md:w-8/12')
      expect(wrapper.classes()).toContain('lg:w-6/12')
      expect(wrapper.classes()).toContain('xl:w-4/12')
    })
  })

  describe('默认值', () => {
    it('span 默认值应该是 12', () => {
      const wrapper = mount(Col)
      expect(wrapper.classes()).toContain('w-full')
    })

    it('offset 默认值应该是 0', () => {
      const wrapper = mount(Col)
      expect(wrapper.classes().filter(c => c.startsWith('ml-'))).toHaveLength(0)
    })

    it('order 默认值应该是 undefined', () => {
      const wrapper = mount(Col)
      expect(wrapper.classes().filter(c => c.startsWith('order-'))).toHaveLength(0)
    })
  })
})
