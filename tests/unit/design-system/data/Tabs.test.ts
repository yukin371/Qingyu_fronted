/**
 * Tabs 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Tabs from '@/design-system/data/Tabs/Tabs.vue'
import TabPane from '@/design-system/data/Tabs/TabPane.vue'

describe('Tabs 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染 Tabs 组件', () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
          `,
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.tabs-container').exists()).toBe(true)
    })

    it('应该渲染所有子标签', () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          `,
        },
      })
      expect(wrapper.vm.panes.length).toBe(3)
    })

    it('应该应用正确的容器类名', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabPosition: 'top',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })
      const container = wrapper.find('.tabs-container')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('flex-col')
    })
  })

  describe('v-model 双向绑定', () => {
    it('应该支持 v-model 绑定', () => {
      const activeTab = ref<string>('1')
      const wrapper = mount(Tabs, {
        props: {
          modelValue: activeTab.value,
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
          `,
        },
      })

      expect(wrapper.vm.currentName).toBe('1')
    })

    it('应该正确更新 modelValue', async () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
          `,
        },
      })

      wrapper.vm.currentName.value = '2'
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['2'])
    })

    it('应该触发 tabChange 事件', async () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
          `,
        },
      })

      wrapper.vm.currentName.value = '2'
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('tabChange')).toBeTruthy()
      expect(wrapper.emitted('tabChange')![0]).toEqual(['2'])
    })
  })

  describe('类型变体', () => {
    it('line 类型应该应用正确的样式', () => {
      const wrapper = mount(Tabs, {
        props: {
          type: 'line',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      const nav = wrapper.find('.flex')
      expect(nav.classes()).toContain('border-b')
    })

    it('card 类型应该应用正确的样式', () => {
      const wrapper = mount(Tabs, {
        props: {
          type: 'card',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      const nav = wrapper.find('.flex')
      expect(nav.classes()).toContain('bg-slate-100')
    })

    it('border-card 类型应该应用正确的样式', () => {
      const wrapper = mount(Tabs, {
        props: {
          type: 'border-card',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      const nav = wrapper.find('.flex')
      expect(nav.classes()).toContain('border')
    })
  })

  describe('标签位置', () => {
    it('top 位置应该应用正确的样式', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabPosition: 'top',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      expect(wrapper.vm.containerClasses).toContain('flex-col')
    })

    it('right 位置应该应用正确的样式', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabPosition: 'right',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      expect(wrapper.vm.containerClasses).toContain('flex-row')
    })

    it('bottom 位置应该应用正确的样式', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabPosition: 'bottom',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      expect(wrapper.vm.containerClasses).toContain('flex-col-reverse')
    })

    it('left 位置应该应用正确的样式', () => {
      const wrapper = mount(Tabs, {
        props: {
          tabPosition: 'left',
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      expect(wrapper.vm.containerClasses).toContain('flex-row-reverse')
    })
  })

  describe('标签管理', () => {
    it('应该正确添加标签', () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      expect(wrapper.vm.panes.length).toBe(1)
    })

    it('应该正确移除标签', async () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
          `,
        },
      })

      const paneToRemove = wrapper.vm.panes[0]
      await wrapper.vm.removePane(paneToRemove)

      expect(wrapper.vm.panes.length).toBe(1)
    })
  })

  describe('标签点击', () => {
    it('应该触发 tabClick 事件', async () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `<TabPane name="1" label="标签 1">内容 1</TabPane>`,
        },
      })

      const mockEvent = new MouseEvent('click')
      const pane = wrapper.vm.panes[0]

      await wrapper.vm.handleTabClick(pane, mockEvent)

      expect(wrapper.emitted('tabClick')).toBeTruthy()
    })

    it('点击标签应该切换当前激活的标签', async () => {
      const wrapper = mount(Tabs, {
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
          `,
        },
      })

      const pane = wrapper.vm.panes[1]
      await wrapper.vm.handleTabClick(pane, new MouseEvent('click'))

      expect(wrapper.vm.currentName).toBe('2')
    })
  })

  describe('标签移除', () => {
    it('应该触发 tabRemove 事件', async () => {
      const wrapper = mount(Tabs, {
        props: {
          closable: true,
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
          `,
        },
      })

      const mockEvent = new MouseEvent('click')
      const pane = wrapper.vm.panes[0]

      await wrapper.vm.handleTabRemove(pane, mockEvent)

      expect(wrapper.emitted('tabRemove')).toBeTruthy()
    })

    it('移除当前激活的标签应该激活前一个标签', async () => {
      const wrapper = mount(Tabs, {
        props: {
          modelValue: '2',
          closable: true,
        },
        global: {
          components: { TabPane },
        },
        slots: {
          default: `
            <TabPane name="1" label="标签 1">内容 1</TabPane>
            <TabPane name="2" label="标签 2">内容 2</TabPane>
            <TabPane name="3" label="标签 3">内容 3</TabPane>
          `,
        },
      })

      const pane = wrapper.vm.panes[1] // 标签 2
      await wrapper.vm.handleTabRemove(pane, new MouseEvent('click'))

      expect(wrapper.vm.currentName).toBe('1')
    })
  })
})

describe('TabPane 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染 TabPane 组件', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref('1'),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
        slots: {
          default: '内容 1',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[role="tab"]').exists()).toBe(true)
    })

    it('应该显示标签文本', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(wrapper.text()).toContain('标签 1')
    })

    it('没有 name 时应该使用 uid', () => {
      const wrapper = mount(TabPane, {
        props: {
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(wrapper.vm.paneName).toBeDefined()
    })
  })

  describe('激活状态', () => {
    it('激活状态应该显示面板内容', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref('1'),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
        slots: {
          default: '内容 1',
        },
      })

      expect(wrapper.vm.isActive).toBe(true)
      expect(wrapper.find('.hidden').exists()).toBe(false)
    })

    it('非激活状态应该隐藏面板内容', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref('2'),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
        slots: {
          default: '内容 1',
        },
      })

      expect(wrapper.vm.isActive).toBe(false)
      // 非激活状态下，面板内容不会渲染
    })
  })

  describe('禁用状态', () => {
    it('禁用的标签应该有正确的样式', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
          disabled: true,
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(wrapper.find('.cursor-not-allowed').exists()).toBe(true)
      expect(wrapper.find('.opacity-50').exists()).toBe(true)
    })

    it('禁用的标签不应该响应点击', async () => {
      const handleTabClick = vi.fn()
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
          disabled: true,
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick,
              handleTabRemove: () => {},
            },
          },
        },
      })

      await wrapper.vm.handleClick(new MouseEvent('click'))
      expect(handleTabClick).not.toHaveBeenCalled()
    })

    it('未禁用的标签应该响应点击', async () => {
      const handleTabClick = vi.fn()
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
          disabled: false,
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick,
              handleTabRemove: () => {},
            },
          },
        },
      })

      await wrapper.vm.handleClick(new MouseEvent('click'))
      expect(handleTabClick).toHaveBeenCalled()
    })
  })

  describe('可关闭状态', () => {
    it('closable 为 true 时应该显示关闭按钮', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
          closable: true,
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top', closable: false },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(wrapper.vm.isClosable).toBe(true)
    })

    it('应该继承父组件的 closable 属性', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top', closable: true },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(wrapper.vm.isClosable).toBe(true)
    })

    it('自身的 closable 属性应该优先于父组件', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
          closable: false,
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top', closable: true },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(wrapper.vm.isClosable).toBe(false)
    })
  })

  describe('插槽', () => {
    it('应该支持自定义标签插槽', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '默认标签',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
        slots: {
          label: '<span class="custom-label">自定义标签</span>',
        },
      })

      expect(wrapper.html()).toContain('自定义标签')
    })

    it('应该支持默认内容插槽', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref('1'),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
        slots: {
          default: '<div class="custom-content">自定义内容</div>',
        },
      })

      expect(wrapper.html()).toContain('自定义内容')
    })
  })

  describe('样式类名', () => {
    it('应该应用正确的标签类名', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref('1'),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      const tab = wrapper.find('[role="tab"]')
      expect(tab.exists()).toBe(true)
      expect(tab.classes()).toContain('px-4')
      expect(tab.classes()).toContain('py-2')
    })

    it('应该支持自定义类名', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
          class: 'custom-class',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      const tab = wrapper.find('.custom-class')
      expect(tab.exists()).toBe(true)
    })
  })

  describe('生命周期', () => {
    it('组件挂载时应该注册到 Tabs', () => {
      const addPane = vi.fn()
      mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane,
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(addPane).toHaveBeenCalled()
    })

    it('组件卸载时应该从 Tabs 移除', () => {
      const removePane = vi.fn()
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane,
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      wrapper.unmount()
      expect(removePane).toHaveBeenCalled()
    })
  })

  describe('边缘情况', () => {
    it('数字类型的 name 应该正常工作', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: 1,
          label: '标签 1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(1),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
      })

      expect(wrapper.vm.isActive).toBe(true)
    })

    it('空标签应该使用插槽内容', () => {
      const wrapper = mount(TabPane, {
        props: {
          name: '1',
        },
        global: {
          provide: {
            tabs: {
              props: { type: 'line', tabPosition: 'top' },
              currentName: ref(''),
              panes: [],
              addPane: () => {},
              removePane: () => {},
              handleTabClick: () => {},
              handleTabRemove: () => {},
            },
          },
        },
        slots: {
          label: '<span>插槽标签</span>',
        },
      })

      expect(wrapper.text()).toContain('插槽标签')
    })
  })
})
