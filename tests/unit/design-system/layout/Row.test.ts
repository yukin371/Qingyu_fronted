/**
 * Row 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Row from '@/design-system/layout/Row/Row.vue'
import Col from '@/design-system/layout/Col/Col.vue'

describe('Row 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染 Row 组件', () => {
      const wrapper = mount(Row)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('flex')
    })

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(Row, {
        slots: {
          default: '<div class="test-content">测试内容</div>',
        },
      })
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('测试内容')
    })

    it('应该正确应用自定义类名', () => {
      const wrapper = mount(Row, {
        props: {
          class: 'custom-class',
        },
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })

  describe('justify 属性', () => {
    it('默认应该有 justify-start 类', () => {
      const wrapper = mount(Row)
      expect(wrapper.classes()).toContain('justify-start')
    })

    it('应该正确应用 justify-center', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'center',
        },
      })
      expect(wrapper.classes()).toContain('justify-center')
    })

    it('应该正确应用 justify-end', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'end',
        },
      })
      expect(wrapper.classes()).toContain('justify-end')
    })

    it('应该正确应用 justify-space-between', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'space-between',
        },
      })
      expect(wrapper.classes()).toContain('justify-between')
    })

    it('应该正确应用 justify-space-around', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'space-around',
        },
      })
      expect(wrapper.classes()).toContain('justify-around')
    })

    it('应该正确应用 justify-space-evenly', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'space-evenly',
        },
      })
      expect(wrapper.classes()).toContain('justify-evenly')
    })
  })

  describe('align 属性', () => {
    it('默认应该有 items-start 类', () => {
      const wrapper = mount(Row)
      expect(wrapper.classes()).toContain('items-start')
    })

    it('应该正确应用 align-center', () => {
      const wrapper = mount(Row, {
        props: {
          align: 'center',
        },
      })
      expect(wrapper.classes()).toContain('items-center')
    })

    it('应该正确应用 align-bottom', () => {
      const wrapper = mount(Row, {
        props: {
          align: 'bottom',
        },
      })
      expect(wrapper.classes()).toContain('items-end')
    })

    it('应该正确应用 align-stretch', () => {
      const wrapper = mount(Row, {
        props: {
          align: 'stretch',
        },
      })
      expect(wrapper.classes()).toContain('items-stretch')
    })
  })

  describe('gutter 属性', () => {
    it('默认不应该有负 margin 类', () => {
      const wrapper = mount(Row)
      expect(wrapper.classes()).not.toContain('-mx-2')
      expect(wrapper.classes()).not.toContain('-mx-4')
      expect(wrapper.classes()).not.toContain('-mx-6')
      expect(wrapper.classes()).not.toContain('-mx-8')
    })

    it('gutter=8 应该有 -mx-2 类', () => {
      const wrapper = mount(Row, {
        props: {
          gutter: 8,
        },
      })
      expect(wrapper.classes()).toContain('-mx-2')
    })

    it('gutter=16 应该有 -mx-4 类', () => {
      const wrapper = mount(Row, {
        props: {
          gutter: 16,
        },
      })
      expect(wrapper.classes()).toContain('-mx-4')
    })

    it('gutter=24 应该有 -mx-6 类', () => {
      const wrapper = mount(Row, {
        props: {
          gutter: 24,
        },
      })
      expect(wrapper.classes()).toContain('-mx-6')
    })

    it('gutter=32 应该有 -mx-8 类', () => {
      const wrapper = mount(Row, {
        props: {
          gutter: 32,
        },
      })
      expect(wrapper.classes()).toContain('-mx-8')
    })
  })

  describe('wrap 属性', () => {
    it('默认应该有 flex-wrap 类', () => {
      const wrapper = mount(Row)
      expect(wrapper.classes()).toContain('flex-wrap')
    })

    it('wrap=true 应该有 flex-wrap 类', () => {
      const wrapper = mount(Row, {
        props: {
          wrap: true,
        },
      })
      expect(wrapper.classes()).toContain('flex-wrap')
    })

    it('wrap=false 应该有 flex-nowrap 类', () => {
      const wrapper = mount(Row, {
        props: {
          wrap: false,
        },
      })
      expect(wrapper.classes()).toContain('flex-nowrap')
      expect(wrapper.classes()).not.toContain('flex-wrap')
    })
  })

  describe('与 Col 组件配合', () => {
    it('应该正确渲染子 Col 组件', () => {
      const wrapper = mount(Row, {
        global: {
          components: {
            Col,
          },
        },
        slots: {
          default: `
            <Col :span="6">列 1</Col>
            <Col :span="6">列 2</Col>
            <Col :span="12">列 3</Col>
          `,
        },
      })

      const cols = wrapper.findAllComponents(Col)
      expect(cols.length).toBe(3)
    })

    it('应该向子 Col 组件提供 gutter 值', () => {
      const wrapper = mount(Row, {
        props: {
          gutter: 16,
        },
        global: {
          components: {
            Col,
          },
        },
        slots: {
          default: '<Col :span="12">测试列</Col>',
        },
      })

      const col = wrapper.findComponent(Col)
      // Col 组件应该有 padding 类
      expect(col.classes()).toContain('px-4')
    })

    it('gutter=0 时子 Col 不应该有 padding', () => {
      const wrapper = mount(Row, {
        props: {
          gutter: 0,
        },
        global: {
          components: {
            Col,
          },
        },
        slots: {
          default: '<Col :span="12">测试列</Col>',
        },
      })

      const col = wrapper.findComponent(Col)
      // Col 组件不应该有 padding 类
      expect(col.classes()).not.toContain('px-2')
      expect(col.classes()).not.toContain('px-4')
      expect(col.classes()).not.toContain('px-6')
      expect(col.classes()).not.toContain('px-8')
    })
  })

  describe('组合使用', () => {
    it('应该正确应用 justify 和 align 组合', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'center',
          align: 'center',
        },
      })
      expect(wrapper.classes()).toContain('justify-center')
      expect(wrapper.classes()).toContain('items-center')
    })

    it('应该正确应用所有属性', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'space-between',
          align: 'stretch',
          gutter: 16,
          wrap: true,
        },
      })
      expect(wrapper.classes()).toContain('justify-between')
      expect(wrapper.classes()).toContain('items-stretch')
      expect(wrapper.classes()).toContain('-mx-4')
      expect(wrapper.classes()).toContain('flex-wrap')
    })
  })

  describe('边缘情况', () => {
    it('应该处理空插槽', () => {
      const wrapper = mount(Row)
      expect(wrapper.html()).toContain('<div')
    })

    it('应该处理多个子元素', () => {
      const wrapper = mount(Row, {
        slots: {
          default: `
            <div>子元素 1</div>
            <div>子元素 2</div>
            <div>子元素 3</div>
            <div>子元素 4</div>
            <div>子元素 5</div>
          `,
        },
      })
      const children = wrapper.findAll('div')
      expect(children.length).toBeGreaterThan(1)
    })

    it('应该处理嵌套 Row 组件', () => {
      const wrapper = mount(Row, {
        slots: {
          default: `
            <Row>
              <div>嵌套内容</div>
            </Row>
          `,
        },
      })
      const nestedRow = wrapper.findComponent(Row)
      expect(nestedRow.exists()).toBe(true)
    })
  })

  describe('默认值', () => {
    it('justify 默认值应该是 start', () => {
      const wrapper = mount(Row)
      expect(wrapper.props('justify')).toBe('start')
      expect(wrapper.classes()).toContain('justify-start')
    })

    it('align 默认值应该是 top', () => {
      const wrapper = mount(Row)
      expect(wrapper.props('align')).toBe('top')
      expect(wrapper.classes()).toContain('items-start')
    })

    it('gutter 默认值应该是 0', () => {
      const wrapper = mount(Row)
      expect(wrapper.props('gutter')).toBe(0)
    })

    it('wrap 默认值应该是 true', () => {
      const wrapper = mount(Row)
      expect(wrapper.props('wrap')).toBe(true)
      expect(wrapper.classes()).toContain('flex-wrap')
    })
  })

  describe('类名合并', () => {
    it('应该正确合并多个类名', () => {
      const wrapper = mount(Row, {
        props: {
          justify: 'center',
          align: 'center',
          gutter: 16,
          wrap: false,
          class: 'my-custom-class',
        },
      })
      expect(wrapper.classes()).toContain('flex')
      expect(wrapper.classes()).toContain('flex-nowrap')
      expect(wrapper.classes()).toContain('justify-center')
      expect(wrapper.classes()).toContain('items-center')
      expect(wrapper.classes()).toContain('-mx-4')
      expect(wrapper.classes()).toContain('my-custom-class')
    })
  })
})
