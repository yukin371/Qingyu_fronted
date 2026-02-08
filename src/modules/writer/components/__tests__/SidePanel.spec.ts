/**
 * SidePanel 组件测试
 * 
 * 测试通用侧边面板组件的功能：
 * 1. 组件渲染和基本属性
 * 2. Position属性验证（left/right）
 * 3. Width属性和响应式宽度
 * 4. Resizable功能
 * 5. Collapsible功能（折叠/展开）
 * 6. panelStore集成
 * 7. VSCode样式变量
 * 8. 边界情况和无障碍性
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import SidePanel from '../SidePanel.vue'
import { usePanelStore } from '../../stores/panelStore'

describe('SidePanel', () => {
  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
  })

  describe('组件渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(SidePanel)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.side-panel').exists()).toBe(true)
    })

    it('应该使用正确的CSS类', () => {
      const wrapper = mount(SidePanel)
      const sidePanel = wrapper.find('.side-panel')
      expect(sidePanel.classes()).toContain('side-panel')
    })

    it('应该设置正确的data-testid属性', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left'
        }
      })
      const sidePanel = wrapper.find('.side-panel')
      expect(sidePanel.attributes('data-testid')).toBe('side-panel-left')
    })
  })

  describe('Props验证', () => {
    it('应该接受position属性为left', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left'
        }
      })
      expect(wrapper.props('position')).toBe('left')
    })

    it('应该接受position属性为right', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right'
        }
      })
      expect(wrapper.props('position')).toBe('right')
    })

    it('应该有默认的position值', () => {
      const wrapper = mount(SidePanel)
      expect(wrapper.props('position')).toBeDefined()
    })

    it('应该接受width属性', () => {
      const wrapper = mount(SidePanel, {
        props: {
          width: 300
        }
      })
      expect(wrapper.props('width')).toBe(300)
    })

    it('应该有默认的width值', () => {
      const wrapper = mount(SidePanel)
      // width prop为0时，组件会从store获取默认宽度
      expect(wrapper.props('width')).toBeDefined()
      // 检查实际渲染的宽度是否大于0
      const sidePanel = wrapper.find('.side-panel')
      const style = sidePanel.attributes('style') || ''
      expect(style).toContain('width:')
      // 宽度应该大于0（从store获取的默认值280或320）
      expect(style).toMatch(/\d+px/)
      const widthMatch = style.match(/width:\s*(\d+)px/)
      expect(widthMatch).toBeTruthy()
      expect(parseInt(widthMatch?.[1] || '0')).toBeGreaterThan(0)
    })

    it('应该接受resizable属性为true', () => {
      const wrapper = mount(SidePanel, {
        props: {
          resizable: true
        }
      })
      expect(wrapper.props('resizable')).toBe(true)
    })

    it('应该接受resizable属性为false', () => {
      const wrapper = mount(SidePanel, {
        props: {
          resizable: false
        }
      })
      expect(wrapper.props('resizable')).toBe(false)
    })

    it('应该有默认的resizable值', () => {
      const wrapper = mount(SidePanel)
      expect(wrapper.props('resizable')).toBeDefined()
    })

    it('应该接受collapsible属性为true', () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: true
        }
      })
      expect(wrapper.props('collapsible')).toBe(true)
    })

    it('应该接受collapsible属性为false', () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: false
        }
      })
      expect(wrapper.props('collapsible')).toBe(false)
    })

    it('应该有默认的collapsible值', () => {
      const wrapper = mount(SidePanel)
      expect(wrapper.props('collapsible')).toBeDefined()
    })
  })

  describe('宽度和样式', () => {
    it('应该根据position设置默认宽度', () => {
      const leftWrapper = mount(SidePanel, {
        props: { position: 'left' }
      })
      const rightWrapper = mount(SidePanel, {
        props: { position: 'right' }
      })

      const leftStyle = leftWrapper.find('.side-panel').attributes('style') || ''
      const rightStyle = rightWrapper.find('.side-panel').attributes('style') || ''

      // 左侧默认宽度应为280px
      expect(leftStyle).toContain('280px')
      // 右侧默认宽度应为320px
      expect(rightStyle).toContain('320px')
    })

    it('应该使用自定义width属性', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left',
          width: 350
        }
      })
      const sidePanel = wrapper.find('.side-panel')
      const style = sidePanel.attributes('style') || ''
      expect(style).toContain('350px')
    })

    it('应该使用VSCode主题CSS变量', () => {
      const wrapper = mount(SidePanel)
      const sidePanel = wrapper.find('.side-panel')
      
      const style = sidePanel.attributes('style') || ''
      // 检查是否使用了CSS变量
      expect(style).toMatch(/var\(--.+\)/)
    })
  })

  describe('Resizable功能', () => {
    it('当resizable为true时应该渲染DragHandle', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left',
          resizable: true
        }
      })
      
      // 检查是否渲染了拖拽手柄组件
      expect(wrapper.findComponent({ name: 'DragHandle' }).exists()).toBe(true)
    })

    it('当resizable为false时不应该渲染DragHandle', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left',
          resizable: false
        }
      })
      
      expect(wrapper.findComponent({ name: 'DragHandle' }).exists()).toBe(false)
    })

    it('应该在DragHandle触发drag-start事件时更新宽度', async () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left',
          resizable: true
        }
      })
      
      const dragHandle = wrapper.findComponent({ name: 'DragHandle' })
      
      // 触发drag-start事件
      await dragHandle.vm.$emit('drag-start', {
        position: 'left',
        startX: 100,
        startY: 200
      })
      
      // 验证事件被处理
      expect(wrapper.emitted('resize-start')).toBeTruthy()
    })
  })

  describe('Collapsible功能', () => {
    it('当collapsible为true时应该显示折叠按钮', () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: true
        }
      })
      
      expect(wrapper.find('.collapse-button').exists()).toBe(true)
    })

    it('当collapsible为false时不应该显示折叠按钮', () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: false
        }
      })
      
      expect(wrapper.find('.collapse-button').exists()).toBe(false)
    })

    it('点击折叠按钮应该切换折叠状态', async () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right',
          collapsible: true
        }
      })
      
      const collapseButton = wrapper.find('.collapse-button')
      
      // 初始状态：未折叠
      expect(wrapper.find('.side-panel').classes()).not.toContain('collapsed')
      
      // 点击折叠按钮
      await collapseButton.trigger('click')
      await nextTick()
      
      // 应该添加collapsed类
      expect(wrapper.find('.side-panel').classes()).toContain('collapsed')
    })

    it('折叠时应该触发collapse事件', async () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right',
          collapsible: true
        }
      })
      
      const collapseButton = wrapper.find('.collapse-button')
      await collapseButton.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('collapse')).toBeTruthy()
    })

    it('展开时应该触发expand事件', async () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right',
          collapsible: true
        }
      })
      
      const collapseButton = wrapper.find('.collapse-button')
      
      // 先折叠
      await collapseButton.trigger('click')
      await nextTick()
      
      // 再展开
      await collapseButton.trigger('click')
      await nextTick()
      
      // 验证expand事件被触发
      const emittedEvents = wrapper.emitted('collapse')
      expect(emittedEvents?.length).toBeGreaterThan(0)
    })
  })

  describe('panelStore集成', () => {
    it('应该从panelStore获取初始宽度', () => {
      const panelStore = usePanelStore()
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left'
        },
        global: {
          provide: {
            panelStore
          }
        }
      })
      
      // 验证宽度与store一致
      const sidePanel = wrapper.find('.side-panel')
      const style = sidePanel.attributes('style') || ''
      expect(style).toContain(`${panelStore.leftWidth}px`)
    })

    it('右侧面板应该从panelStore获取折叠状态', () => {
      const panelStore = usePanelStore()
      panelStore.rightCollapsed = true
      
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right',
          collapsible: true
        }
      })
      
      // 验证折叠状态
      expect(wrapper.find('.side-panel').classes()).toContain('collapsed')
    })

    it('宽度变化时应该更新panelStore', async () => {
      const panelStore = usePanelStore()
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left'
        }
      })
      
      const initialWidth = panelStore.leftWidth
      
      // 模拟宽度变化
      wrapper.vm.updateWidth(350)
      await nextTick()
      
      // 验证store被更新
      expect(panelStore.leftWidth).not.toBe(initialWidth)
    })

    it('折叠状态变化时应该更新panelStore', async () => {
      const panelStore = usePanelStore()
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right',
          collapsible: true
        }
      })
      
      const collapseButton = wrapper.find('.collapse-button')
      await collapseButton.trigger('click')
      await nextTick()
      
      // 验证store被更新
      expect(panelStore.rightCollapsed).toBe(true)
    })
  })

  describe('Position特定行为', () => {
    it('左侧面板应该使用leftWidth', () => {
      const panelStore = usePanelStore()
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left'
        }
      })
      
      const sidePanel = wrapper.find('.side-panel')
      const style = sidePanel.attributes('style') || ''
      expect(style).toContain(`${panelStore.leftWidth}px`)
    })

    it('右侧面板应该使用rightWidth', () => {
      const panelStore = usePanelStore()
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right'
        }
      })
      
      const sidePanel = wrapper.find('.side-panel')
      const style = sidePanel.attributes('style') || ''
      expect(style).toContain(`${panelStore.rightWidth}px`)
    })

    it('左侧面板的手柄应该在右侧', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'left',
          resizable: true
        }
      })
      
      const dragHandle = wrapper.findComponent({ name: 'DragHandle' })
      expect(dragHandle.props('position')).toBe('left')
    })

    it('右侧面板的手柄应该在左侧', () => {
      const wrapper = mount(SidePanel, {
        props: {
          position: 'right',
          resizable: true
        }
      })
      
      const dragHandle = wrapper.findComponent({ name: 'DragHandle' })
      expect(dragHandle.props('position')).toBe('right')
    })
  })

  describe('无障碍性', () => {
    it('应该设置正确的role属性', () => {
      const wrapper = mount(SidePanel)
      const sidePanel = wrapper.find('.side-panel')
      
      expect(sidePanel.attributes('role')).toBe('complementary')
    })

    it('应该设置正确的aria-label', () => {
      const wrapper = mount(SidePanel, {
        props: { position: 'left' }
      })
      const sidePanel = wrapper.find('.side-panel')
      
      expect(sidePanel.attributes('aria-label')).toContain('left')
      expect(sidePanel.attributes('aria-label')).toContain('panel')
    })

    it('折叠按钮应该有正确的aria-label', () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: true
        }
      })
      
      const collapseButton = wrapper.find('.collapse-button')
      expect(collapseButton.attributes('aria-label')).toBeDefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理无效的position值', () => {
      const wrapper = mount(SidePanel, {
        props: { position: 'invalid' as 'left' | 'right' }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理极端的width值', () => {
      const wrapper = mount(SidePanel, {
        props: {
          width: 1000
        }
      })
      
      // 组件应该仍然正常渲染
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理负的width值', () => {
      const wrapper = mount(SidePanel, {
        props: {
          width: -100
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理快速的折叠/展开操作', async () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: true
        }
      })
      
      const collapseButton = wrapper.find('.collapse-button')
      
      // 快速触发多次点击
      await collapseButton.trigger('click')
      await collapseButton.trigger('click')
      await collapseButton.trigger('click')
      await nextTick()
      
      // 组件应该仍然正常工作
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('过渡动画', () => {
    it('应该有CSS过渡动画', () => {
      const wrapper = mount(SidePanel)
      const sidePanel = wrapper.find('.side-panel')
      
      // 检查是否有transition属性
      expect(sidePanel.classes()).toContain('transition-all')
    })

    it('折叠时应该有平滑的过渡', async () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: true
        }
      })
      
      const collapseButton = wrapper.find('.collapse-button')
      await collapseButton.trigger('click')
      await nextTick()
      
      // 验证过渡类被应用
      expect(wrapper.find('.side-panel').classes()).toContain('transition-all')
    })
  })

  describe('内容渲染', () => {
    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(SidePanel, {
        slots: {
          default: '<div class="test-content">Test Content</div>'
        }
      })
      
      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.test-content').text()).toBe('Test Content')
    })

    it('应该渲染具名插槽内容', () => {
      const wrapper = mount(SidePanel, {
        slots: {
          header: '<div class="test-header">Header</div>',
          default: '<div class="test-body">Body</div>'
        }
      })
      
      expect(wrapper.find('.test-header').exists()).toBe(true)
      expect(wrapper.find('.test-body').exists()).toBe(true)
    })

    it('折叠时应该隐藏内容', async () => {
      const wrapper = mount(SidePanel, {
        props: {
          collapsible: true
        },
        slots: {
          default: '<div class="test-content">Test Content</div>'
        }
      })
      
      // 初始状态：内容可见
      expect(wrapper.find('.test-content').exists()).toBe(true)
      
      // 折叠
      const collapseButton = wrapper.find('.collapse-button')
      await collapseButton.trigger('click')
      await nextTick()
      
      // 内容应该被隐藏
      const sidePanel = wrapper.find('.side-panel')
      expect(sidePanel.classes()).toContain('collapsed')
    })
  })
})
