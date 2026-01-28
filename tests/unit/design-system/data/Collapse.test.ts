/**
 * Collapse 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Collapse from '@/design-system/data/Collapse/Collapse.vue'
import CollapseItem from '@/design-system/data/Collapse/CollapseItem.vue'

describe('Collapse 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染 Collapse 组件', () => {
      const wrapper = mount(Collapse, {
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
          `,
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.w-full').exists()).toBe(true)
    })

    it('应该应用正确的容器类名', () => {
      const wrapper = mount(Collapse, {
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
          `,
        },
      })
      const container = wrapper.find('.w-full')
      expect(container.classes()).toContain('border')
      expect(container.classes()).toContain('rounded-lg')
    })

    it('应该渲染所有子面板', () => {
      const wrapper = mount(Collapse, {
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
            <CollapseItem name="3" title="面板 3">内容 3</CollapseItem>
          `,
        },
      })
      const items = wrapper.findAll('.collapse-item')
      expect(items.length).toBe(3)
    })
  })

  describe('v-model 双向绑定', () => {
    it('应该支持 v-model 绑定', () => {
      const activeNames = ref<(string | number)[]>(['1'])
      const wrapper = mount(Collapse, {
        props: {
          modelValue: activeNames.value,
        },
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
          `,
        },
      })

      expect(wrapper.vm.activeNames).toEqual(['1'])
    })

    it('应该正确更新 modelValue', async () => {
      const wrapper = mount(Collapse, {
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
          `,
        },
      })

      await wrapper.vm.handleItemClick('1')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([['1']])
    })

    it('应该触发 change 事件', async () => {
      const wrapper = mount(Collapse, {
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
          `,
        },
      })

      await wrapper.vm.handleItemClick('1')
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')![0]).toEqual([['1']])
    })
  })

  describe('手风琴模式', () => {
    it('手风琴模式下应该只能展开一个面板', async () => {
      const wrapper = mount(Collapse, {
        props: {
          accordion: true,
        },
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
            <CollapseItem name="3" title="面板 3">内容 3</CollapseItem>
          `,
        },
      })

      // 点击面板 1
      await wrapper.vm.handleItemClick('1')
      expect(wrapper.vm.activeNames).toEqual(['1'])

      // 点击面板 2
      await wrapper.vm.handleItemClick('2')
      expect(wrapper.vm.activeNames).toEqual(['2'])
    })

    it('点击已展开的面板应该收起它', async () => {
      const wrapper = mount(Collapse, {
        props: {
          accordion: true,
          modelValue: ['1'],
        },
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
          `,
        },
      })

      await wrapper.vm.handleItemClick('1')
      expect(wrapper.vm.activeNames).toEqual([])
    })
  })

  describe('非手风琴模式', () => {
    it('应该支持多个面板同时展开', async () => {
      const wrapper = mount(Collapse, {
        props: {
          accordion: false,
        },
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
          `,
        },
      })

      // 点击面板 1
      await wrapper.vm.handleItemClick('1')
      expect(wrapper.vm.activeNames).toEqual(['1'])

      // 点击面板 2
      await wrapper.vm.handleItemClick('2')
      expect(wrapper.vm.activeNames).toEqual(['1', '2'])
    })

    it('应该能够收起单个面板', async () => {
      const wrapper = mount(Collapse, {
        props: {
          accordion: false,
          modelValue: ['1', '2'],
        },
        global: {
          components: { CollapseItem },
        },
        slots: {
          default: `
            <CollapseItem name="1" title="面板 1">内容 1</CollapseItem>
            <CollapseItem name="2" title="面板 2">内容 2</CollapseItem>
          `,
        },
      })

      await wrapper.vm.handleItemClick('1')
      expect(wrapper.vm.activeNames).toEqual(['2'])
    })
  })
})

describe('CollapseItem 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染 CollapseItem 组件', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
        slots: {
          default: '内容 1',
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.collapse-item').exists()).toBe(true)
    })

    it('应该显示标题', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
      })
      expect(wrapper.text()).toContain('面板 1')
    })

    it('应该显示箭头图标', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
          components: {
            Icon: {
              template: '<span>Icon</span>',
            },
          },
        },
      })
      expect(wrapper.find('.text-slate-400').exists()).toBe(true)
    })
  })

  describe('展开/收起状态', () => {
    it('展开状态应该显示内容', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: ['1'],
              isItemActive: (name: string | number) => name === '1',
              handleItemClick: () => {},
            },
          },
        },
        slots: {
          default: '内容 1',
        },
      })
      expect(wrapper.vm.isActive).toBe(true)
      expect(wrapper.find('.max-h-96').exists()).toBe(true)
    })

    it('收起状态应该隐藏内容', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
        slots: {
          default: '内容 1',
        },
      })
      expect(wrapper.vm.isActive).toBe(false)
      expect(wrapper.find('.max-h-0').exists()).toBe(true)
    })

    it('展开时箭头应该旋转', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: ['1'],
              isItemActive: (name: string | number) => name === '1',
              handleItemClick: () => {},
            },
          },
        },
      })
      expect(wrapper.find('.rotate-180').exists()).toBe(true)
    })
  })

  describe('禁用状态', () => {
    it('禁用的面板应该有正确的样式', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
          disabled: true,
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
      })
      expect(wrapper.find('.cursor-not-allowed').exists()).toBe(true)
      expect(wrapper.find('.opacity-50').exists()).toBe(true)
    })

    it('禁用的面板不应该响应点击', async () => {
      const handleItemClick = vi.fn()
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
          disabled: true,
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick,
            },
          },
        },
      })

      await wrapper.vm.handleClick()
      expect(handleItemClick).not.toHaveBeenCalled()
    })

    it('未禁用的面板应该响应点击', async () => {
      const handleItemClick = vi.fn()
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
          disabled: false,
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick,
            },
          },
        },
      })

      await wrapper.vm.handleClick()
      expect(handleItemClick).toHaveBeenCalledWith('1')
    })
  })

  describe('插槽', () => {
    it('应该支持自定义标题插槽', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '默认标题',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
        slots: {
          title: '<span class="custom-title">自定义标题</span>',
        },
      })
      expect(wrapper.html()).toContain('自定义标题')
    })

    it('应该支持默认内容插槽', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: ['1'],
              isItemActive: (name: string | number) => name === '1',
              handleItemClick: () => {},
            },
          },
        },
        slots: {
          default: '<div class="custom-content">自定义内容</div>',
        },
      })
      expect(wrapper.html()).toContain('自定义内容')
    })

    it('应该支持自定义箭头插槽', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
        slots: {
          arrow: '<span class="custom-arrow">→</span>',
        },
      })
      expect(wrapper.html()).toContain('→')
    })
  })

  describe('样式类名', () => {
    it('应该应用正确的头部类名', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
      })
      const header = wrapper.find('.flex.items-center.justify-between')
      expect(header.exists()).toBe(true)
      expect(header.classes()).toContain('px-4')
      expect(header.classes()).toContain('py-3')
    })

    it('应该应用正确的内容区域类名', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
      })
      const content = wrapper.find('.overflow-hidden')
      expect(content.exists()).toBe(true)
      expect(content.classes()).toContain('transition-all')
    })

    it('应该支持自定义类名', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
          title: '面板 1',
          class: 'custom-class',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
      })
      const header = wrapper.find('.custom-class')
      expect(header.exists()).toBe(true)
    })
  })

  describe('边缘情况', () => {
    it('没有 name 时应该使用空字符串', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
      })
      expect(wrapper.vm.itemName).toBe('')
    })

    it('数字类型的 name 应该正常工作', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: 1,
          title: '面板 1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [1],
              isItemActive: (name: string | number) => name === 1,
              handleItemClick: () => {},
            },
          },
        },
      })
      expect(wrapper.vm.isActive).toBe(true)
    })

    it('空标题应该使用插槽内容', () => {
      const wrapper = mount(CollapseItem, {
        props: {
          name: '1',
        },
        global: {
          provide: {
            collapse: {
              activeNames: [],
              isItemActive: () => false,
              handleItemClick: () => {},
            },
          },
        },
        slots: {
          title: '<span>插槽标题</span>',
        },
      })
      expect(wrapper.text()).toContain('插槽标题')
    })
  })
})
