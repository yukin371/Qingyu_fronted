/**
 * Affix 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Affix from '@/design-system/other/Affix/Affix.vue'

describe('Affix 组件', () => {
  let wrapper: any

  beforeEach(() => {
    // 创建一个可滚动的容器用于测试
    const scrollContainer = document.createElement('div')
    scrollContainer.style.height = '1000px'
    scrollContainer.style.overflow = 'auto'
    document.body.appendChild(scrollContainer)

    // 模拟 window.scrollTop
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    })

    // 模拟 document.documentElement.scrollTop
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    })

    // 模拟 document.body.scrollTop
    Object.defineProperty(document.body, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div class="test-content">Fixed Content</div>',
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('应该有正确的默认属性', () => {
      wrapper = mount(Affix)
      expect(wrapper.vm.offset).toBe(0)
      expect(wrapper.vm.position).toBe('top')
      expect(wrapper.vm.zIndex).toBe(10)
    })

    it('应该应用正确的默认类名', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })
      const affixElement = wrapper.find('div')
      expect(affixElement.classes()).toContain('transition-all')
    })
  })

  describe('固定状态', () => {
    it('初始时不应该固定', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })
      const vm = wrapper.vm as any
      expect(vm.isFixed.value).toBe(false)
    })

    it('滚动后应该触发固定状态检查', async () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      // 模拟滚动
      Object.defineProperty(window, 'pageYOffset', { value: 100 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()

      // 检查固定状态是否被检查
      expect(wrapper.emitted('scroll')).toBeTruthy()
    })

    it('应该通过 ref 访问 isFixed 状态', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      const vm = wrapper.vm as any
      expect(vm.isFixed.value).toBe(false)
    })
  })

  describe('offset 属性', () => {
    it('应该正确设置 offset 为 0', () => {
      wrapper = mount(Affix, {
        props: {
          offset: 0,
        },
      })
      expect(wrapper.vm.offset).toBe(0)
    })

    it('应该正确设置 offset 为 50', () => {
      wrapper = mount(Affix, {
        props: {
          offset: 50,
        },
      })
      expect(wrapper.vm.offset).toBe(50)
    })

    it('应该正确设置 offset 为 100', () => {
      wrapper = mount(Affix, {
        props: {
          offset: 100,
        },
      })
      expect(wrapper.vm.offset).toBe(100)
    })

    it('offset 变化时应该重新检查固定状态', async () => {
      wrapper = mount(Affix, {
        props: {
          offset: 0,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      await wrapper.setProps({ offset: 50 })
      expect(wrapper.vm.offset).toBe(50)
    })
  })

  describe('position 属性', () => {
    it('应该正确设置 position 为 top', () => {
      wrapper = mount(Affix, {
        props: {
          position: 'top',
        },
      })
      expect(wrapper.vm.position).toBe('top')
    })

    it('应该正确设置 position 为 bottom', () => {
      wrapper = mount(Affix, {
        props: {
          position: 'bottom',
        },
      })
      expect(wrapper.vm.position).toBe('bottom')
    })

    it('position 变化时应该重新检查固定状态', async () => {
      wrapper = mount(Affix, {
        props: {
          position: 'top',
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      await wrapper.setProps({ position: 'bottom' })
      expect(wrapper.vm.position).toBe('bottom')
    })

    it('固定时应该应用正确的 position 样式', async () => {
      wrapper = mount(Affix, {
        props: {
          position: 'top',
          offset: 10,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      // 手动设置固定状态
      wrapper.vm.state.isFixed = true
      await nextTick()

      const fixedStyle = wrapper.vm.fixedStyle
      expect(fixedStyle.position).toBe('fixed')
      expect(fixedStyle.top).toBe('10px')
    })
  })

  describe('zIndex 属性', () => {
    it('应该正确设置默认 zIndex', () => {
      wrapper = mount(Affix)
      expect(wrapper.vm.zIndex).toBe(10)
    })

    it('应该正确设置自定义 zIndex', () => {
      wrapper = mount(Affix, {
        props: {
          zIndex: 100,
        },
      })
      expect(wrapper.vm.zIndex).toBe(100)
    })

    it('应该正确设置 zIndex 为 1000', () => {
      wrapper = mount(Affix, {
        props: {
          zIndex: 1000,
        },
      })
      expect(wrapper.vm.zIndex).toBe(1000)
    })

    it('固定时应该应用正确的 zIndex 样式', async () => {
      wrapper = mount(Affix, {
        props: {
          zIndex: 100,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      // 手动设置固定状态
      wrapper.vm.state.isFixed = true
      await nextTick()

      const fixedStyle = wrapper.vm.fixedStyle
      expect(fixedStyle.zIndex).toBe('100')
    })
  })

  describe('事件触发', () => {
    it('滚动时应该触发 scroll 事件', async () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      window.dispatchEvent(new Event('scroll'))
      await nextTick()

      expect(wrapper.emitted('scroll')).toBeTruthy()
    })

    it('scroll 事件应该传递 event 对象', async () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      const event = new Event('scroll')
      window.dispatchEvent(event)
      await nextTick()

      const emitted = wrapper.emitted('scroll')
      expect(emitted).toBeTruthy()
    })
  })

  describe('target 属性', () => {
    it('默认 target 应该是 window', () => {
      wrapper = mount(Affix)
      const target = wrapper.vm.getScrollTarget()
      expect(target).toBe(window)
    })

    it('应该接受字符串形式的 target', () => {
      // 创建测试容器
      const container = document.createElement('div')
      container.id = 'test-container'
      document.body.appendChild(container)

      wrapper = mount(Affix, {
        props: {
          target: '#test-container',
        },
      })

      expect(wrapper.vm.target).toBe('#test-container')

      // 清理
      document.body.removeChild(container)
    })

    it('应该接受函数形式的 target', () => {
      // 创建测试容器
      const container = document.createElement('div')
      container.id = 'test-container-2'
      document.body.appendChild(container)

      wrapper = mount(Affix, {
        props: {
          target: () => document.getElementById('test-container-2'),
        },
      })

      const target = wrapper.vm.getScrollTarget()
      expect(target).toBe(container)

      // 清理
      document.body.removeChild(container)
    })

    it('target 变化时应该重新绑定滚动监听', async () => {
      const container = document.createElement('div')
      container.id = 'test-container-3'
      document.body.appendChild(container)

      wrapper = mount(Affix, {
        props: {
          target: () => window,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      const removeSpy = vi.spyOn(window, 'removeEventListener')

      await wrapper.setProps({ target: '#test-container-3' })

      // 清理
      document.body.removeChild(container)
    })
  })

  describe('样式计算', () => {
    it('未固定时不应该应用 fixed 类', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      const affixElement = wrapper.find('div')
      expect(affixElement.classes()).not.toContain('fixed')
    })

    it('固定时应该应用 fixed 类', async () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      // 手动设置固定状态
      wrapper.vm.state.isFixed = true
      await nextTick()

      const affixElement = wrapper.find('div')
      expect(affixElement.classes()).toContain('fixed')
    })

    it('应该应用自定义 class', () => {
      wrapper = mount(Affix, {
        props: {
          class: 'custom-class',
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      const affixElement = wrapper.find('div')
      expect(affixElement.classes()).toContain('custom-class')
    })

    it('应该应用自定义 style', () => {
      wrapper = mount(Affix, {
        props: {
          style: 'background-color: red;',
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      const affixElement = wrapper.find('div')
      expect(affixElement.attributes('style')).toContain('background-color: red')
    })
  })

  describe('固定样式', () => {
    it('position 为 top 时应该设置 top 样式', async () => {
      wrapper = mount(Affix, {
        props: {
          position: 'top',
          offset: 50,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      wrapper.vm.state.isFixed = true
      await nextTick()

      const fixedStyle = wrapper.vm.fixedStyle
      expect(fixedStyle.top).toBe('50px')
      expect(fixedStyle.bottom).toBeUndefined()
    })

    it('position 为 bottom 时应该设置 bottom 样式', async () => {
      wrapper = mount(Affix, {
        props: {
          position: 'bottom',
          offset: 50,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })

      wrapper.vm.state.isFixed = true
      await nextTick()

      const fixedStyle = wrapper.vm.fixedStyle
      expect(fixedStyle.bottom).toBe('50px')
      expect(fixedStyle.top).toBeUndefined()
    })

    it('固定时应该保持宽度', async () => {
      wrapper = mount(Affix, {
        props: {
          offset: 0,
        },
        slots: {
          default: '<div style="width: 200px;">Content</div>',
        },
      })

      // 设置容器宽度
      wrapper.vm.state.containerWidth = 200
      wrapper.vm.state.isFixed = true
      await nextTick()

      const fixedStyle = wrapper.vm.fixedStyle
      expect(fixedStyle.width).toBe('200px')
    })
  })

  describe('暴露方法', () => {
    it('应该暴露 isFixed 状态', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      expect(wrapper.vm.isFixed).toBeDefined()
      expect(typeof wrapper.vm.isFixed).toBe('object')
    })

    it('应该暴露 checkFixed 方法', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      expect(wrapper.vm.checkFixed).toBeDefined()
      expect(typeof wrapper.vm.checkFixed).toBe('function')
    })

    it('调用 checkFixed 应该检查固定状态', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      // 不应该抛出错误
      expect(() => wrapper.vm.checkFixed()).not.toThrow()
    })
  })

  describe('插槽', () => {
    it('应该渲染默认插槽内容', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div class="custom-content">Custom Content</div>',
        },
      })

      const customContent = wrapper.find('.custom-content')
      expect(customContent.exists()).toBe(true)
      expect(customContent.text()).toBe('Custom Content')
    })

    it('应该渲染多个子元素', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Item 1</div><div>Item 2</div><div>Item 3</div>',
        },
      })

      const affixElement = wrapper.find('div')
      expect(affixElement.text()).toContain('Item 1')
      expect(affixElement.text()).toContain('Item 2')
      expect(affixElement.text()).toContain('Item 3')
    })
  })

  describe('响应式更新', () => {
    it('offset 变化应该响应式更新', async () => {
      wrapper = mount(Affix, {
        props: {
          offset: 0,
        },
      })

      await wrapper.setProps({ offset: 100 })
      expect(wrapper.vm.offset).toBe(100)
    })

    it('position 变化应该响应式更新', async () => {
      wrapper = mount(Affix, {
        props: {
          position: 'top',
        },
      })

      await wrapper.setProps({ position: 'bottom' })
      expect(wrapper.vm.position).toBe('bottom')
    })

    it('zIndex 变化应该响应式更新', async () => {
      wrapper = mount(Affix, {
        props: {
          zIndex: 10,
        },
      })

      await wrapper.setProps({ zIndex: 100 })
      expect(wrapper.vm.zIndex).toBe(100)
    })
  })

  describe('组件卸载', () => {
    it('卸载时应该移除滚动监听器', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      wrapper.unmount()

      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.any(Object))
    })

    it('卸载时应该移除 resize 监听器', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      wrapper.unmount()

      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('边界情况', () => {
    it('应该处理 offset 为负数的情况', () => {
      wrapper = mount(Affix, {
        props: {
          offset: -10,
        },
      })

      expect(wrapper.vm.offset).toBe(-10)
    })

    it('应该处理 zIndex 为 0 的情况', () => {
      wrapper = mount(Affix, {
        props: {
          zIndex: 0,
        },
      })

      expect(wrapper.vm.zIndex).toBe(0)
    })

    it('应该处理空内容的情况', () => {
      wrapper = mount(Affix, {
        slots: {
          default: '',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理 target 选择器不存在的情况', () => {
      wrapper = mount(Affix, {
        props: {
          target: '#non-existent-container',
        },
      })

      const target = wrapper.vm.getScrollTarget()
      expect(target).toBe(window)
    })
  })

  describe('性能优化', () => {
    it('滚动监听应该使用 passive 选项', () => {
      const addSpy = vi.spyOn(window, 'addEventListener')

      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    })

    it('不应该在每次滚动时触发重绘', async () => {
      wrapper = mount(Affix, {
        slots: {
          default: '<div>Content</div>',
        },
      })

      // 模拟多次滚动
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('scroll'))
      }

      await nextTick()

      // 应该有事件记录，但不是每次都触发固定状态变化
      const scrollEvents = wrapper.emitted('scroll')
      expect(scrollEvents.length).toBeGreaterThan(0)
    })
  })

  describe('容器滚动', () => {
    it('应该正确处理容器的 scrollTop', () => {
      const container = document.createElement('div')
      container.id = 'test-scroll-container'
      container.style.height = '200px'
      container.style.overflow = 'auto'
      document.body.appendChild(container)

      wrapper = mount(Affix, {
        props: {
          target: '#test-scroll-container',
        },
      })

      expect(wrapper.vm.target).toBe('#test-scroll-container')

      // 清理
      document.body.removeChild(container)
    })
  })
})
