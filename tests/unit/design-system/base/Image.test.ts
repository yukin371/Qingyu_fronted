/**
 * Image 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Image from '@/design-system/base/Image/Image.vue'

describe('Image.vue', () => {
  describe('基础渲染', () => {
    it('应该正确渲染组件', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试图片',
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[role="img"]').exists()).toBe(true)
    })

    it('应该设置正确的 aria-label', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '示例图片',
        },
      })
      expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('示例图片')
    })

    it('应该在加载时显示骨架屏', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          showSkeleton: true,
        },
      })
      // 初始状态应该显示骨架屏
      expect(wrapper.find('.bg-slate-200, .dark\\:bg-slate-700').exists()).toBe(true)
    })
  })

  describe('图片渲染', () => {
    it('应该渲染图片元素', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试图片',
        },
      })
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/image.jpg')
      expect(img.attributes('alt')).toBe('测试图片')
    })

    it('应该在图片加载完成后隐藏骨架屏', async () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          showSkeleton: true,
        },
      })

      const img = wrapper.find('img')
      await img.trigger('load')
      await wrapper.vm.$nextTick()

      // 加载完成后图片应该可见
      expect(img.isVisible()).toBe(true)
    })

    it('应该在图片加载失败时显示错误状态', async () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://invalid-url.com/image.jpg',
          alt: '测试',
        },
      })

      const img = wrapper.find('img')
      await img.trigger('error')
      await wrapper.vm.$nextTick()

      // 应该显示 fallback 图标
      const fallback = wrapper.find('.text-neutral-400, .dark\\:text-neutral-600')
      expect(fallback.exists()).toBe(true)
    })

    it('应该在没有 src 时显示错误状态', () => {
      const wrapper = mount(Image, {
        props: { alt: '测试' },
      })
      // 没有 src 时应该显示 fallback
      expect(wrapper.find('.text-neutral-400, .dark\\:text-neutral-600').exists()).toBe(true)
    })
  })

  describe('懒加载', () => {
    it('应该默认启用懒加载', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('lazy')
    })

    it('应该支持禁用懒加载', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          lazy: false,
        },
      })
      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('eager')
    })
  })

  describe('尺寸变体', () => {
    it('应该正确应用 xs 尺寸', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          size: 'xs',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('w-16')
      expect(container.classes()).toContain('h-16')
    })

    it('应该正确应用 md 尺寸', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          size: 'md',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('w-32')
      expect(container.classes()).toContain('h-32')
    })

    it('应该正确应用 full 尺寸', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          size: 'full',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('w-full')
      expect(container.classes()).toContain('h-full')
    })
  })

  describe('形状变体', () => {
    it('应该正确应用 rect 形状', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          shape: 'rect',
        },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-md')
    })

    it('应该正确应用 circle 形状', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          shape: 'circle',
        },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-full')
    })

    it('应该正确应用 rounded 形状', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          shape: 'rounded',
        },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-lg')
    })
  })

  describe('对象填充方式', () => {
    it('应该正确应用 cover 填充', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          fit: 'cover',
        },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('object-cover')
    })

    it('应该正确应用 contain 填充', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          fit: 'contain',
        },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('object-contain')
    })

    it('应该正确应用 fill 填充', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          fit: 'fill',
        },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('object-fill')
    })

    it('应该默认使用 cover 填充', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('object-cover')
    })
  })

  describe('自定义尺寸', () => {
    it('应该支持自定义宽度', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          width: '400px',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.attributes('style')).toContain('width: 400px')
    })

    it('应该支持自定义高度', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          height: '300px',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.attributes('style')).toContain('height: 300px')
    })

    it('应该同时支持自定义宽高', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          width: '400px',
          height: '300px',
        },
      })
      const container = wrapper.find('[role="img"]')
      const style = container.attributes('style')
      expect(style).toContain('width: 400px')
      expect(style).toContain('height: 300px')
    })

    it('自定义尺寸应该覆盖预设尺寸', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          size: 'md',
          width: '500px',
          height: '400px',
        },
      })
      const container = wrapper.find('[role="img"]')
      // 不应该包含预设尺寸类
      expect(container.classes()).not.toContain('w-32')
      expect(container.classes()).not.toContain('h-32')
      // 应该有自定义样式
      expect(container.attributes('style')).toContain('width: 500px')
      expect(container.attributes('style')).toContain('height: 400px')
    })
  })

  describe('骨架屏', () => {
    it('应该默认显示骨架屏', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      expect(wrapper.vm.showSkeleton).toBe(true)
    })

    it('应该支持禁用骨架屏', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          showSkeleton: false,
        },
      })
      expect(wrapper.vm.showSkeleton).toBe(false)
    })
  })

  describe('Fallback 图标', () => {
    it('应该支持自定义 fallback 图标', async () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://invalid-url.com/image.jpg',
          alt: '测试',
          fallbackIcon: 'document',
        },
      })
      // 触发错误
      const img = wrapper.find('img')
      await img.trigger('error')
      await wrapper.vm.$nextTick()

      // 应该显示自定义图标
      const fallback = wrapper.find('.text-neutral-400, .dark\\:text-neutral-600')
      expect(fallback.exists()).toBe(true)
    })

    it('应该默认使用 document 图标', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://invalid-url.com/image.jpg',
          alt: '测试',
        },
      })
      expect(wrapper.vm.fallbackIcon).toBe('document')
    })
  })

  describe('事件处理', () => {
    it('应该正确触发 load 事件', async () => {
      const onLoad = vi.fn()
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          onLoad,
        },
        attrs: {
          onLoad,
        },
      })

      const img = wrapper.find('img')
      await img.trigger('load')
      expect(onLoad).toHaveBeenCalledTimes(1)
    })

    it('应该正确触发 error 事件', async () => {
      const onError = vi.fn()
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          onError,
        },
        attrs: {
          onError,
        },
      })

      const img = wrapper.find('img')
      await img.trigger('error')
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('应该正确触发 click 事件', async () => {
      const onClick = vi.fn()
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          onClick,
        },
        attrs: {
          onClick,
        },
      })

      await wrapper.find('[role="img"]').trigger('click')
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('自定义类名', () => {
    it('应该正确应用自定义类名', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          class: 'custom-class another-class',
        },
      })

      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('custom-class')
      expect(container.classes()).toContain('another-class')
    })
  })

  describe('默认属性', () => {
    it('应该使用默认尺寸 md', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('w-32')
      expect(container.classes()).toContain('h-32')
    })

    it('应该使用默认形状 rect', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      expect(wrapper.find('[role="img"]').classes()).toContain('rounded-md')
    })

    it('应该使用默认填充方式 cover', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      expect(wrapper.find('img').classes()).toContain('object-cover')
    })

    it('应该默认启用懒加载', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      expect(wrapper.find('img').attributes('loading')).toBe('lazy')
    })

    it('应该默认显示骨架屏', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      expect(wrapper.vm.showSkeleton).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该设置正确的 role 属性', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      expect(wrapper.find('[role="img"]').exists()).toBe(true)
    })

    it('应该设置 aria-label', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '示例图片',
        },
      })
      expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('示例图片')
    })

    it('应该为图片设置 alt 属性', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试图片',
        },
      })
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('测试图片')
    })
  })

  describe('响应式', () => {
    it('应该在 src prop 变化时重置加载状态', async () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image1.jpg',
          alt: '测试',
        },
      })

      // 加载第一张图片
      const img = wrapper.find('img')
      await img.trigger('load')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.imageStatus).toBe('loaded')

      // 更改 src
      await wrapper.setProps({ src: 'https://example.com/image2.jpg' })
      expect(wrapper.vm.imageStatus).toBe('loading')
    })

    it('应该在 size prop 变化时更新尺寸类', async () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          size: 'sm',
        },
      })

      let container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('w-24')

      await wrapper.setProps({ size: 'lg' })
      container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('w-48')
    })

    it('应该在 shape prop 变化时更新形状类', async () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
          shape: 'rect',
        },
      })

      let container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('rounded-md')

      await wrapper.setProps({ shape: 'circle' })
      container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('rounded-full')
    })
  })

  describe('容器样式', () => {
    it('应该有正确的背景色', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('bg-neutral-100')
      expect(container.classes()).toContain('dark:bg-neutral-800')
    })

    it('应该有 overflow-hidden', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('overflow-hidden')
    })

    it('应该是 inline-flex', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      const container = wrapper.find('[role="img"]')
      expect(container.classes()).toContain('inline-flex')
    })
  })

  describe('图片样式', () => {
    it('应该有 block 和 w-full h-full', () => {
      const wrapper = mount(Image, {
        props: {
          src: 'https://example.com/image.jpg',
          alt: '测试',
        },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('block')
      expect(img.classes()).toContain('w-full')
      expect(img.classes()).toContain('h-full')
    })
  })
})
