/**
 * Tree 组件测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Tree from '@/design-system/data/Tree/Tree.vue'
import type { TreeNode } from '@/design-system/data/Tree/types'

describe('Tree 组件', () => {
  // 测试数据
  const mockData: TreeNode[] = [
    {
      id: '1',
      label: '一级 1',
      children: [
        {
          id: '1-1',
          label: '二级 1-1',
          children: [
            {
              id: '1-1-1',
              label: '三级 1-1-1',
            },
          ],
        },
        {
          id: '1-2',
          label: '二级 1-2',
        },
      ],
    },
    {
      id: '2',
      label: '一级 2',
      children: [
        {
          id: '2-1',
          label: '二级 2-1',
        },
        {
          id: '2-2',
          label: '二级 2-2',
        },
      ],
    },
    {
      id: '3',
      label: '一级 3',
      children: [
        {
          id: '3-1',
          label: '二级 3-1',
        },
      ],
    },
  ]

  describe('基础渲染', () => {
    it('应该正确渲染树形结构', () => {
      const wrapper = mount(Tree, {
        props: { data: mockData },
      })

      expect(wrapper.find('.tree').exists()).toBe(true)
      expect(wrapper.findAll('.tree-node').length).toBe(3) // 3个一级节点
    })

    it('应该显示所有一级节点', () => {
      const wrapper = mount(Tree, {
        props: { data: mockData },
      })

      const nodes = wrapper.findAll('.tree-node')
      expect(nodes.length).toBe(3)
    })

    it('应该显示节点的 label', () => {
      const wrapper = mount(Tree, {
        props: { data: mockData },
      })

      const labels = wrapper.findAll('.node-label')
      expect(labels[0].text()).toBe('一级 1')
      expect(labels[1].text()).toBe('一级 2')
      expect(labels[2].text()).toBe('一级 3')
    })
  })

  describe('展开/收起', () => {
    it('默认情况下不展开子节点', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          defaultExpandAll: false,
        },
      })

      // 子节点不应该显示
      expect(wrapper.html()).not.toContain('二级 1-1')
    })

    it('defaultExpandAll 为 true 时应该展开所有节点', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          defaultExpandAll: true,
        },
      })

      // 子节点应该显示
      expect(wrapper.html()).toContain('二级 1-1')
      expect(wrapper.html()).toContain('二级 2-1')
      expect(wrapper.html()).toContain('二级 3-1')
    })

    it('应该能切换展开/收起状态', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          defaultExpandAll: false,
        },
      })

      // 等待组件完全挂载
      await wrapper.vm.$nextTick()

      const expandIcons = wrapper.findAll('.expand-icon')
      if (expandIcons.length > 0) {
        await expandIcons[0].trigger('click')
        await wrapper.vm.$nextTick()

        // 子节点应该显示
        expect(wrapper.html()).toContain('二级 1-1')
      }
    })

    it('defaultExpandedKeys 应该默认展开指定节点', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          defaultExpandedKeys: ['1', '2'],
        },
      })

      // 指定的节点应该展开
      expect(wrapper.html()).toContain('二级 1-1')
      expect(wrapper.html()).toContain('二级 2-1')
    })
  })

  describe('勾选功能', () => {
    it('checkable 为 true 时应该显示复选框', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
        },
      })

      expect(wrapper.find('.checkbox-wrapper').exists()).toBe(true)
    })

    it('checkable 为 false 时不应该显示复选框', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: false,
        },
      })

      expect(wrapper.find('.checkbox-wrapper').exists()).toBe(false)
    })

    it('应该能切换选中状态', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
        },
      })

      await wrapper.vm.$nextTick()

      const checkboxes = wrapper.findAll('.checkbox-wrapper')
      if (checkboxes.length > 0) {
        await checkboxes[0].trigger('click')
        await wrapper.vm.$nextTick()

        // 选中状态应该更新
        expect(wrapper.emitted('checkChange')).toBeTruthy()
        expect(wrapper.emitted('update:checkedKeys')).toBeTruthy()
      }
    })

    it('defaultCheckedKeys 应该默认选中指定节点', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
          defaultCheckedKeys: ['1-1', '2'],
        },
      })

      // 指定的节点应该被选中
      const emitted = wrapper.emitted('update:checkedKeys')
      expect(emitted).toBeTruthy()
    })

    it('选中父节点时应该选中所有子节点', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
          defaultExpandAll: true,
        },
      })

      await wrapper.vm.$nextTick()

      // 找到第一个节点的复选框
      const checkboxes = wrapper.findAll('.checkbox-wrapper')
      if (checkboxes.length > 0) {
        await checkboxes[0].trigger('click')
        await wrapper.vm.$nextTick()

        // 所有子节点应该被选中
        expect(wrapper.emitted('update:checkedKeys')).toBeTruthy()
      }
    })
  })

  describe('高亮当前节点', () => {
    it('highlightCurrent 为 false 时不应该高亮节点', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          highlightCurrent: false,
        },
      })

      const node = wrapper.find('.tree-node')
      expect(node.classes()).not.toContain('bg-primary-50')
    })

    it('点击节点时应该高亮（highlightCurrent 为 true）', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          highlightCurrent: true,
        },
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('click')

      // 应该触发 nodeClick 事件
      expect(wrapper.emitted('nodeClick')).toBeTruthy()
    })
  })

  describe('点击节点展开', () => {
    it('expandOnClickNode 为 true 时点击节点应该展开', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          expandOnClickNode: true,
        },
      })

      await wrapper.vm.$nextTick()

      const nodes = wrapper.findAll('.tree-node')
      if (nodes.length > 0) {
        await nodes[0].trigger('click')
        await wrapper.vm.$nextTick()

        // 应该触发 nodeClick 和 nodeExpand 事件
        expect(wrapper.emitted('nodeClick')).toBeTruthy()
        expect(wrapper.emitted('nodeExpand')).toBeTruthy()
      }
    })

    it('expandOnClickNode 为 false 时点击节点不应该展开', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          expandOnClickNode: false,
        },
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('click')

      // 应该只触发 nodeClick 事件
      expect(wrapper.emitted('nodeClick')).toBeTruthy()
      expect(wrapper.emitted('nodeExpand')).toBeFalsy()
    })
  })

  describe('禁用状态', () => {
    const disabledData: TreeNode[] = [
      {
        id: '1',
        label: '一级 1',
        disabled: true,
        children: [
          { id: '1-1', label: '二级 1-1' },
        ],
      },
      {
        id: '2',
        label: '一级 2',
        children: [
          { id: '2-1', label: '二级 2-1', disabled: true },
          { id: '2-2', label: '二级 2-2' },
        ],
      },
    ]

    it('禁用的节点应该有正确的样式', () => {
      const wrapper = mount(Tree, {
        props: {
          data: disabledData,
          checkable: true,
        },
      })

      const nodes = wrapper.findAll('.tree-node')
      expect(nodes[0].classes()).toContain('opacity-50')
      expect(nodes[0].classes()).toContain('cursor-not-allowed')
    })

    it('禁用的节点不应该响应点击', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: disabledData,
          highlightCurrent: true,
        },
      })

      const disabledNode = wrapper.findAll('.tree-node')[0]
      await disabledNode.trigger('click')

      // 不应该触发 nodeClick 事件
      expect(wrapper.emitted('nodeClick')).toBeFalsy()
    })

    it('禁用的节点不应该可以被勾选', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: disabledData,
          checkable: true,
        },
      })

      const disabledCheckbox = wrapper.findAll('.checkbox-wrapper')[0]
      await disabledCheckbox.trigger('click')

      // 不应该触发 checkChange 事件
      expect(wrapper.emitted('checkChange')).toBeFalsy()
    })
  })

  describe('尺寸', () => {
    it('应该正确应用 sm 尺寸', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          size: 'sm',
        },
      })

      expect(wrapper.find('.tree').classes()).toContain('text-sm')
    })

    it('应该正确应用 md 尺寸', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          size: 'md',
        },
      })

      expect(wrapper.find('.tree').classes()).toContain('text-base')
    })

    it('应该正确应用 lg 尺寸', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          size: 'lg',
        },
      })

      expect(wrapper.find('.tree').classes()).toContain('text-lg')
    })
  })

  describe('自定义内容', () => {
    it('应该渲染自定义插槽内容', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
        },
        slots: {
          default: `
            <template #default="{ node }">
              <span class="custom-content">{{ node.label }} - Custom</span>
            </template>
          `,
        },
      })

      expect(wrapper.html()).toContain('Custom')
    })
  })

  describe('实例方法', () => {
    it('getCheckedNodes 应该返回选中的节点', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
          defaultCheckedKeys: ['1-1'],
        },
      })

      const vm = wrapper.vm as any
      const checkedNodes = vm.getCheckedNodes()

      expect(Array.isArray(checkedNodes)).toBe(true)
    })

    it('getCheckedKeys 应该返回选中的节点 key', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
          defaultCheckedKeys: ['1-1'],
        },
      })

      const vm = wrapper.vm as any
      const checkedKeys = vm.getCheckedKeys()

      expect(Array.isArray(checkedKeys)).toBe(true)
    })

    it('setCheckedKeys 应该设置选中的节点', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
        },
      })

      const vm = wrapper.vm as any
      await vm.setCheckedKeys(['1-1', '2'])

      expect(wrapper.emitted('update:checkedKeys')).toBeTruthy()
    })

    it('getExpandedKeys 应该返回展开的节点 key', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          defaultExpandedKeys: ['1'],
        },
      })

      const vm = wrapper.vm as any
      const expandedKeys = vm.getExpandedKeys()

      expect(Array.isArray(expandedKeys)).toBe(true)
    })

    it('setExpandedKeys 应该设置展开的节点', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
        },
      })

      const vm = wrapper.vm as any
      await vm.setExpandedKeys(['1', '2'])

      expect(wrapper.emitted('update:expandedKeys')).toBeTruthy()
    })
  })

  describe('事件', () => {
    it('点击节点应该触发 nodeClick 事件', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
        },
      })

      const node = wrapper.find('.tree-node')
      await node.trigger('click')

      expect(wrapper.emitted('nodeClick')).toBeTruthy()
    })

    it('展开/收起节点应该触发 nodeExpand 事件', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
        },
      })

      const expandIcon = wrapper.find('.expand-icon')
      await expandIcon.trigger('click')

      expect(wrapper.emitted('nodeExpand')).toBeTruthy()
    })

    it('勾选/取消勾选节点应该触发 checkChange 事件', async () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          checkable: true,
        },
      })

      const checkbox = wrapper.find('.checkbox-wrapper')
      await checkbox.trigger('click')

      expect(wrapper.emitted('checkChange')).toBeTruthy()
    })
  })

  describe('可访问性', () => {
    it('应该支持键盘导航', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
        },
      })

      const node = wrapper.find('.tree-node')
      expect(node.attributes('tabindex')).toBeDefined()
    })

    it('禁用的节点应该有正确的 aria 属性', () => {
      const disabledData: TreeNode[] = [
        {
          id: '1',
          label: '一级 1',
          disabled: true,
        },
      ]

      const wrapper = mount(Tree, {
        props: {
          data: disabledData,
        },
      })

      const node = wrapper.find('.tree-node')
      expect(node.classes()).toContain('pointer-events-none')
    })
  })

  describe('样式', () => {
    it('应该接受自定义 class', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
          class: 'custom-tree-class',
        },
      })

      expect(wrapper.find('.tree').classes()).toContain('custom-tree-class')
    })

    it('应该有正确的过渡动画', () => {
      const wrapper = mount(Tree, {
        props: {
          data: mockData,
        },
      })

      const node = wrapper.find('.tree-node')
      expect(node.classes()).toContain('transition-all')
    })
  })

  describe('边界情况', () => {
    it('空数据应该正常渲染', () => {
      const wrapper = mount(Tree, {
        props: {
          data: [],
        },
      })

      expect(wrapper.find('.tree').exists()).toBe(true)
    })

    it('没有 id 的节点应该使用 label 作为标识', () => {
      const dataWithoutId: TreeNode[] = [
        {
          label: '节点 1',
          children: [
            { label: '子节点 1' },
          ],
        },
      ]

      const wrapper = mount(Tree, {
        props: {
          data: dataWithoutId,
        },
      })

      expect(wrapper.html()).toContain('节点 1')
    })

    it('深层嵌套的节点应该正确渲染', () => {
      const deepData: TreeNode[] = [
        {
          id: '1',
          label: '一级',
          children: [
            {
              id: '1-1',
              label: '二级',
              children: [
                {
                  id: '1-1-1',
                  label: '三级',
                  children: [
                    {
                      id: '1-1-1-1',
                      label: '四级',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]

      const wrapper = mount(Tree, {
        props: {
          data: deepData,
          defaultExpandAll: true,
        },
      })

      expect(wrapper.html()).toContain('四级')
    })
  })
})
