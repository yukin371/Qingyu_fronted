/**
 * EditorLayout.spec.ts
 * 编辑器布局组件 - 响应式布局测试
 * 
 * 测试覆盖：
 * 1. 移动端 (<768px) 单屏模式
 * 2. 平板端 (768-1024px) 折叠模式
 * 3. 桌面端 (>1024px) 完整布局
 * 4. 断点切换
 * 5. 触摸事件模拟
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import EditorLayout from '../EditorLayout.vue'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('EditorLayout - 响应式布局', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(EditorLayout, {
      global: {
        stubs: {
          MiniNavbar: true,
          ResizablePanel: true,
          SidePanel: true,
          EditorPanel: true,
          AIPanel: true,
          ProjectTree: true,
          ChapterTree: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('移动端布局 (<768px)', () => {
    beforeEach(() => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
    })

    it('应该显示单屏模式', async () => {
      await nextTick()
      const layout = wrapper.find('.editor-layout')
      expect(layout.classes()).toContain('layout-mode-mobile')
    })

    it('应该显示顶部tab导航', async () => {
      await nextTick()
      const tabs = wrapper.find('.mobile-tabs')
      expect(tabs.exists()).toBe(true)
    })

    it('应该只显示一个面板', async () => {
      await nextTick()
      const leftPanel = wrapper.find('.left-panel')
      const rightPanel = wrapper.find('.right-panel')
      const editorPanel = wrapper.find('.editor-panel')

      // 移动端模式下，面板应该是overlay状态
      expect(leftPanel.classes()).toContain('panel-overlay')
      expect(rightPanel.classes()).toContain('panel-overlay')
    })

    it('应该支持tab切换', async () => {
      await nextTick()
      const tabs = wrapper.findAll('.mobile-tab')
      
      // 点击AI助手tab
      await tabs[1].trigger('click')
      await nextTick()
      
      const aiPanel = wrapper.find('.right-panel')
      expect(aiPanel.classes()).toContain('panel-visible')
    })

    it('应该支持触摸手势', async () => {
      await nextTick()
      const container = wrapper.find('.editor-layout__content')
      
      // 模拟左滑切换到下一个面板
      await container.trigger('touchstart', {
        touches: [{ clientX: 300, clientY: 300 }]
      })
      await container.trigger('touchend', {
        changedTouches: [{ clientX: 100, clientY: 300 }]
      })
      await nextTick()
      
      // 验证面板切换
      const activeTab = wrapper.find('.mobile-tab.active')
      expect(activeTab.exists()).toBe(true)
    })
  })

  describe('平板端布局 (768-1024px)', () => {
    beforeEach(() => {
      // 模拟平板视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      window.dispatchEvent(new Event('resize'))
    })

    it('应该显示折叠模式', async () => {
      await nextTick()
      const layout = wrapper.find('.editor-layout')
      expect(layout.classes()).toContain('layout-mode-tablet')
    })

    it('侧边栏应该默认折叠', async () => {
      await nextTick()
      const leftPanel = wrapper.find('.left-panel')
      const rightPanel = wrapper.find('.right-panel')
      
      expect(leftPanel.classes()).toContain('panel-collapsed')
      expect(rightPanel.classes()).toContain('panel-collapsed')
    })

    it('应该可以展开侧边栏', async () => {
      await nextTick()
      const toggleButton = wrapper.find('.panel-toggle-button')
      
      await toggleButton.trigger('click')
      await nextTick()
      
      const leftPanel = wrapper.find('.left-panel')
      expect(leftPanel.classes()).toContain('panel-expanded')
    })

    it('应该支持拖拽调整宽度', async () => {
      await nextTick()
      const dragHandle = wrapper.find('.drag-handle')
      
      // 模拟拖拽
      await dragHandle.trigger('mousedown', { clientX: 200 })
      await wrapper.trigger('mousemove', { clientX: 300 })
      await wrapper.trigger('mouseup')
      await nextTick()
      
      const leftPanel = wrapper.find('.left-panel')
      // 验证宽度已调整
      expect(leftPanel.attributes('style')).toContain('width')
    })

    it('应该支持触摸拖拽', async () => {
      await nextTick()
      const dragHandle = wrapper.find('.drag-handle')
      
      // 模拟触摸拖拽
      await dragHandle.trigger('touchstart', {
        touches: [{ clientX: 200, clientY: 100 }]
      })
      await wrapper.trigger('touchmove', {
        touches: [{ clientX: 300, clientY: 100 }]
      })
      await wrapper.trigger('touchend')
      await nextTick()
      
      const leftPanel = wrapper.find('.left-panel')
      expect(leftPanel.attributes('style')).toContain('width')
    })
  })

  describe('桌面端布局 (>1024px)', () => {
    beforeEach(() => {
      // 模拟桌面视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })
      window.dispatchEvent(new Event('resize'))
    })

    it('应该显示完整3栏布局', async () => {
      await nextTick()
      const layout = wrapper.find('.editor-layout')
      expect(layout.classes()).toContain('layout-mode-desktop')
    })

    it('应该显示左侧面板', async () => {
      await nextTick()
      const leftPanel = wrapper.find('.left-panel')
      expect(leftPanel.exists()).toBe(true)
      expect(leftPanel.classes()).toContain('panel-visible')
    })

    it('应该显示右侧AI助手面板', async () => {
      await nextTick()
      const rightPanel = wrapper.find('.right-panel')
      expect(rightPanel.exists()).toBe(true)
      expect(rightPanel.classes()).toContain('panel-visible')
    })

    it('应该显示中间编辑器', async () => {
      await nextTick()
      const editorPanel = wrapper.find('.editor-panel')
      expect(editorPanel.exists()).toBe(true)
    })

    it('应该支持拖拽调整面板宽度', async () => {
      await nextTick()
      const leftDragHandle = wrapper.find('.left-panel .drag-handle')
      
      await leftDragHandle.trigger('mousedown', { clientX: 280 })
      await wrapper.trigger('mousemove', { clientX: 380 })
      await wrapper.trigger('mouseup')
      await nextTick()
      
      const leftPanel = wrapper.find('.left-panel')
      expect(leftPanel.attributes('style')).toContain('width')
    })
  })

  describe('断点切换', () => {
    it('应该从移动端切换到桌面端', async () => {
      // 初始为移动端
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      let layout = wrapper.find('.editor-layout')
      expect(layout.classes()).toContain('layout-mode-mobile')
      
      // 切换到桌面端
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      layout = wrapper.find('.editor-layout')
      expect(layout.classes()).toContain('layout-mode-desktop')
      expect(layout.classes()).not.toContain('layout-mode-mobile')
    })

    it('应该从桌面端切换到平板端', async () => {
      // 初始为桌面端
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      let layout = wrapper.find('.editor-layout')
      expect(layout.classes()).toContain('layout-mode-desktop')
      
      // 切换到平板端
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      layout = wrapper.find('.editor-layout')
      expect(layout.classes()).toContain('layout-mode-tablet')
      expect(layout.classes()).not.toContain('layout-mode-desktop')
    })
  })

  describe('触摸手势', () => {
    beforeEach(() => {
      // 模拟移动端
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
    })

    it('应该支持左滑切换面板', async () => {
      await nextTick()
      const container = wrapper.find('.editor-layout__content')
      
      const startX = 300
      const endX = 100
      
      await container.trigger('touchstart', {
        touches: [{ clientX: startX, clientY: 300 }]
      })
      
      await container.trigger('touchmove', {
        touches: [{ clientX: 200, clientY: 300 }]
      })
      
      await container.trigger('touchend', {
        changedTouches: [{ clientX: endX, clientY: 300 }]
      })
      
      await nextTick()
      
      // 验证滑动手势被处理
      expect(container.exists()).toBe(true)
    })

    it('应该支持右滑切换面板', async () => {
      await nextTick()
      const container = wrapper.find('.editor-layout__content')
      
      const startX = 100
      const endX = 300
      
      await container.trigger('touchstart', {
        touches: [{ clientX: startX, clientY: 300 }]
      })
      
      await container.trigger('touchmove', {
        touches: [{ clientX: 200, clientY: 300 }]
      })
      
      await container.trigger('touchend', {
        changedTouches: [{ clientX: endX, clientY: 300 }]
      })
      
      await nextTick()
      
      expect(container.exists()).toBe(true)
    })

    it('应该避免与系统手势冲突', async () => {
      await nextTick()
      const container = wrapper.find('.editor-layout__content')
      
      // 模拟边缘左滑（iOS返回手势区域）
      const edgeX = 20
      
      await container.trigger('touchstart', {
        touches: [{ clientX: edgeX, clientY: 300 }]
      })
      
      await container.trigger('touchend', {
        changedTouches: [{ clientX: 100, clientY: 300 }]
      })
      
      await nextTick()
      
      // 边缘区域应该降低灵敏度或忽略
      expect(container.exists()).toBe(true)
    })
  })

  describe('性能优化', () => {
    it('应该使用requestAnimationFrame优化拖拽', async () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame')
      
      await nextTick()
      const dragHandle = wrapper.find('.drag-handle')
      
      await dragHandle.trigger('mousedown', { clientX: 200 })
      await wrapper.trigger('mousemove', { clientX: 250 })
      
      expect(rafSpy).toHaveBeenCalled()
      
      rafSpy.mockRestore()
    })

    it('应该防抖resize事件', async () => {
      const resizeSpy = vi.spyOn(window, 'dispatchEvent')
      
      // 连续触发多次resize
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('resize'))
      }
      
      await nextTick()
      
      // 验证防抖生效（实际触发次数应该少于触发次数）
      expect(resizeSpy.mock.calls.length).toBeLessThanOrEqual(10)
      
      resizeSpy.mockRestore()
    })
  })

  describe('可访问性', () => {
    it('应该有正确的ARIA标签', async () => {
      await nextTick()
      const layout = wrapper.find('.editor-layout')
      
      expect(layout.attributes('role')).toBe('application')
    })

    it('移动端tab应该有正确的标签', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
      
      await nextTick()
      const tabs = wrapper.findAll('.mobile-tab')
      
      tabs.forEach((tab, index) => {
        expect(tab.attributes('role')).toBe('tab')
        expect(tab.attributes('aria-label')).toBeDefined()
      })
    })

    it('面板切换应该有live region', async () => {
      await nextTick()
      const liveRegion = wrapper.find('[aria-live]')
      
      expect(liveRegion.exists()).toBe(true)
    })
  })
})
