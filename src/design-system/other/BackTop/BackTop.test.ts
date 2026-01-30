/**
 * BackTop 组件单元测试
 */

// vitest globals are configured in tsconfig.json
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import BackTop from './BackTop.vue'

describe('BackTop 组件', () => {
  let wrapper: any
  let scrollContainer: HTMLElement

  beforeEach(() => {
    // 创建一个可滚动的容器用于测试
    scrollContainer = document.createElement('div')
    scrollContainer.style.height = '1000px'
    scrollContainer.style.overflow = 'auto'
    document.body.appendChild(scrollContainer)
    
    // 模拟 window.scrollTop
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    if (scrollContainer && scrollContainer.parentNode) {
      scrollContainer.parentNode.removeChild(scrollContainer)
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      wrapper = mount(BackTop)
      expect(wrapper.exists()).toBe(true)
    })

    it('应该有正确的默认属性', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
          backPosition: 0,
          duration: 300,
          shape: 'circle',
          size: 'medium',
          position: 'bottom-right',
        },
      })
      expect(wrapper.vm.visibilityHeight).toBe(400)
      expect(wrapper.vm.backPosition).toBe(0)
      expect(wrapper.vm.duration).toBe(300)
    })

    it('应该应用正确的默认类名', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.exists()).toBe(true)
      expect(button.classes()).toContain('bg-primary-500')
    })
  })

  describe('可见性控制', () => {
    it('初始时不应该显示按钮', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
        },
      })
      expect(wrapper.vm.visible).toBe(false)
    })

    it('滚动超过 visibilityHeight 时应该显示按钮', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
        },
      })
      
      // 模拟滚动
      Object.defineProperty(window, 'pageYOffset', { value: 500 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      expect(wrapper.vm.visible).toBe(true)
    })

    it('滚动未达到 visibilityHeight 时不应该显示按钮', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
        },
      })
      
      Object.defineProperty(window, 'pageYOffset', { value: 300 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      expect(wrapper.vm.visible).toBe(false)
    })

    it('自定义 visibilityHeight 应该正确工作', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 200,
        },
      })
      
      Object.defineProperty(window, 'pageYOffset', { value: 250 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      expect(wrapper.vm.visible).toBe(true)
    })
  })

  describe('样式变体', () => {
    it('circle shape 应该应用圆形样式', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          shape: 'circle',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('rounded-full')
    })

    it('square shape 应该应用方形样式', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          shape: 'square',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('rounded-lg')
    })

    it('small size 应该应用小尺寸样式', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          size: 'small',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('w-10')
      expect(button.classes()).toContain('h-10')
    })

    it('medium size 应该应用中尺寸样式', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          size: 'medium',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('w-12')
      expect(button.classes()).toContain('h-12')
    })

    it('large size 应该应用大尺寸样式', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          size: 'large',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('w-14')
      expect(button.classes()).toContain('h-14')
    })

    it('top-right position 应该应用右上角位置', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          position: 'top-right',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('top-8')
      expect(button.classes()).toContain('right-8')
    })

    it('top-left position 应该应用左上角位置', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          position: 'top-left',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('top-8')
      expect(button.classes()).toContain('left-8')
    })

    it('bottom-right position 应该应用右下角位置', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          position: 'bottom-right',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('bottom-8')
      expect(button.classes()).toContain('right-8')
    })

    it('bottom-left position 应该应用左下角位置', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          position: 'bottom-left',
        },
      })
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('bottom-8')
      expect(button.classes()).toContain('left-8')
    })
  })

  describe('点击事件', () => {
    it('点击按钮应该触发 click 事件', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      
      await wrapper.find('.fixed').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('点击按钮应该触发 scrollToTop 方法', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          smooth: false,
        },
      })
      
      const scrollToTopSpy = vi.spyOn(wrapper.vm, 'scrollToTop')
      await wrapper.find('.fixed').trigger('click')
      
      expect(scrollToTopSpy).toHaveBeenCalled()
    })
  })

  describe('平滑滚动', () => {
    it('smooth 为 true 时应该使用平滑滚动', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          smooth: true,
          duration: 100,
        },
      })
      
      const scrollToSpy = vi.spyOn(window, 'scrollTo')
      await wrapper.find('.fixed').trigger('click')
      
      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 由于使用了 requestAnimationFrame，scrollTo 会被调用
      expect(scrollToSpy).toHaveBeenCalled()
    })

    it('smooth 为 false 时应该直接跳转', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          smooth: false,
        },
      })
      
      const scrollToSpy = vi.spyOn(window, 'scrollTo')
      await wrapper.find('.fixed').trigger('click')
      
      expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
    })
  })

  describe('自动隐藏', () => {
    it('autoHide 为 true 时返回顶部后应该隐藏按钮', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
          autoHide: true,
          smooth: false,
        },
      })
      
      // 模拟滚动
      Object.defineProperty(window, 'pageYOffset', { value: 500 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      expect(wrapper.vm.visible).toBe(true)
      
      // 点击返回顶部
      await wrapper.find('.fixed').trigger('click')
      await nextTick()
      
      expect(wrapper.vm.visible).toBe(false)
    })

    it('autoHide 为 false 时返回顶部后不应该隐藏按钮', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
          autoHide: false,
          smooth: false,
        },
      })
      
      // 模拟滚动
      Object.defineProperty(window, 'pageYOffset', { value: 500 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      expect(wrapper.vm.visible).toBe(true)
      
      // 点击返回顶部
      await wrapper.find('.fixed').trigger('click')
      await nextTick()
      
      // 应该仍然可见
      expect(wrapper.vm.visible).toBe(true)
    })
  })

  describe('事件触发', () => {
    it('显示时应该触发 show 事件', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
        },
      })
      
      Object.defineProperty(window, 'pageYOffset', { value: 500 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      expect(wrapper.emitted('show')).toBeTruthy()
    })

    it('隐藏时应该触发 hide 事件', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
          autoHide: true,
          smooth: false,
        },
      })
      
      // 先显示
      Object.defineProperty(window, 'pageYOffset', { value: 500 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      // 清空之前的 emit 记录
      wrapper.vm.$$.emits = {}
      
      // 点击返回顶部，触发隐藏
      await wrapper.find('.fixed').trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('hide')).toBeTruthy()
    })
  })

  describe('滚动进度', () => {
    it('showProgress 为 true 时应该显示进度', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          showProgress: true,
        },
      })
      
      const progressText = wrapper.find('.absolute')
      expect(progressText.exists()).toBe(true)
    })

    it('进度百分比应该正确计算', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          showProgress: true,
        },
      })
      
      // 模拟滚动到一半
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 2000,
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      })
      
      Object.defineProperty(window, 'pageYOffset', { value: 500 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      
      // 滚动 500px，总可滚动 1000px，进度应该是 50%
      expect(wrapper.vm.scrollProgress).toBe(50)
    })
  })

  describe('自定义内容', () => {
    it('应该渲染默认图标插槽', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
        slots: {
          icon: '<svg data-test="custom-icon"></svg>',
        },
      })
      
      const customIcon = wrapper.find('[data-test="custom-icon"]')
      expect(customIcon.exists()).toBe(true)
    })

    it('应该渲染默认内容插槽', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
        slots: {
          default: '<span data-test="custom-content">Custom</span>',
        },
      })
      
      const customContent = wrapper.find('[data-test="custom-content"]')
      expect(customContent.exists()).toBe(true)
    })
  })

  describe('暴露方法', () => {
    it('应该暴露 scrollToTop 方法', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      
      expect(wrapper.vm.scrollToTop).toBeDefined()
      expect(typeof wrapper.vm.scrollToTop).toBe('function')
    })

    it('应该暴露 scrollToElement 方法', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      
      expect(wrapper.vm.scrollToElement).toBeDefined()
      expect(typeof wrapper.vm.scrollToElement).toBe('function')
    })

    it('应该暴露 visible 响应式状态', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      
      expect(wrapper.vm.visible).toBeDefined()
    })
  })

  describe('自定义样式', () => {
    it('应该应用自定义 class', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          class: 'custom-class',
        },
      })
      
      const button = wrapper.find('.fixed')
      expect(button.classes()).toContain('custom-class')
    })

    it('应该应用自定义 style', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          style: 'background-color: red;',
        },
      })
      
      const button = wrapper.find('.fixed')
      expect(button.attributes('style')).toContain('background-color: red')
    })
  })

  describe('键盘交互', () => {
    it('按 Enter 键应该触发点击', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          smooth: false,
        },
      })
      
      const scrollToSpy = vi.spyOn(window, 'scrollTo')
      await wrapper.find('.fixed').trigger('keydown.enter')
      
      expect(scrollToSpy).toHaveBeenCalled()
    })

    it('按 Space 键应该触发点击', async () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          smooth: false,
        },
      })
      
      const scrollToSpy = vi.spyOn(window, 'scrollTo')
      await wrapper.find('.fixed').trigger('keydown.space')
      
      expect(scrollToSpy).toHaveBeenCalled()
    })
  })

  describe('自定义滚动容器', () => {
    it('target 属性应该正确工作', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
          target: '#test-container',
        },
      })
      
      expect(wrapper.vm.target).toBe('#test-container')
    })
  })

  describe('组件卸载', () => {
    it('卸载时应该移除滚动监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 400,
        },
      })
      
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.any(Object))
    })
  })

  describe('无障碍性', () => {
    it('应该有正确的 role 属性', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      
      const button = wrapper.find('[role="button"]')
      expect(button.exists()).toBe(true)
    })

    it('应该有正确的 aria-label', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      
      const button = wrapper.find('[aria-label="返回顶部"]')
      expect(button.exists()).toBe(true)
    })

    it('应该有 tabindex', () => {
      wrapper = mount(BackTop, {
        props: {
          visibilityHeight: 0,
        },
      })
      
      const button = wrapper.find('[tabindex="0"]')
      expect(button.exists()).toBe(true)
    })
  })
})
