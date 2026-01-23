/**
 * Tag 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Tag from '@/design-system/base/Tag/Tag.vue'

describe('Tag', () => {
  describe('基础渲染', () => {
    it('默认渲染为 default variant 和 md size', () => {
      const { container } = render(Tag, {
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toBeTruthy()
      expect(tag).toHaveClass('inline-flex')
      expect(tag).toHaveClass('rounded-full')
      expect(tag).toHaveClass('h-7')
      expect(tag).toHaveClass('px-2.5')
      expect(tag).toHaveClass('text-sm')
    })

    it('正确渲染所有变体', () => {
      const variants = ['default', 'primary', 'success', 'warning', 'danger'] as const

      for (const variant of variants) {
        const { container } = render(Tag, {
          props: { variant },
          slots: { default: 'Test Tag' },
        })
        const tag = container.querySelector('span')

        expect(tag).toBeTruthy()

        if (variant === 'default') {
          expect(tag).toHaveClass('bg-slate-100')
        } else if (variant === 'primary') {
          expect(tag).toHaveClass('bg-primary-50')
        } else if (variant === 'success') {
          expect(tag).toHaveClass('bg-emerald-50')
        } else if (variant === 'warning') {
          expect(tag).toHaveClass('bg-amber-50')
        } else if (variant === 'danger') {
          expect(tag).toHaveClass('bg-red-50')
        }
      }
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Tag, {
          props: { size },
          slots: { default: 'Test Tag' },
        })
        const tag = container.querySelector('span')

        expect(tag).toBeTruthy()

        if (size === 'sm') {
          expect(tag).toHaveClass('h-6')
          expect(tag).toHaveClass('px-2')
          expect(tag).toHaveClass('text-xs')
        } else if (size === 'md') {
          expect(tag).toHaveClass('h-7')
          expect(tag).toHaveClass('px-2.5')
          expect(tag).toHaveClass('text-sm')
        } else if (size === 'lg') {
          expect(tag).toHaveClass('h-8')
          expect(tag).toHaveClass('px-3')
          expect(tag).toHaveClass('text-base')
        }
      }
    })

    it('正确渲染插槽内容', () => {
      const { container } = render(Tag, {
        slots: { default: 'Custom Content' },
      })
      const tag = container.querySelector('span')

      expect(tag).toBeTruthy()
      expect(tag?.textContent).toContain('Custom Content')
    })
  })

  describe('可关闭功能', () => {
    it('removable 为 false 时不显示关闭按钮', () => {
      const { container } = render(Tag, {
        props: { removable: false },
        slots: { default: 'Test Tag' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toBeFalsy()
    })

    it('removable 为 true 时显示关闭按钮', () => {
      const { container } = render(Tag, {
        props: { removable: true },
        slots: { default: 'Test Tag' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toBeTruthy()
      expect(closeButton).toHaveAttribute('type', 'button')
      expect(closeButton).toHaveAttribute('aria-label', '关闭标签')
    })

    it('点击关闭按钮触发 close 事件', async () => {
      const onClose = vi.fn()
      const { container } = render(Tag, {
        props: { removable: true, onClose },
        slots: { default: 'Test Tag' },
      })

      const closeButton = container.querySelector('button')!
      await fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('关闭按钮点击不会触发 Tag 的点击事件', async () => {
      const onClick = vi.fn()
      const onClose = vi.fn()
      const { container } = render(Tag, {
        props: { removable: true, onClick, onClose },
        slots: { default: 'Test Tag' },
      })

      const closeButton = container.querySelector('button')!
      await fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('图标功能', () => {
    it('不显示图标时 icon prop 为空', () => {
      const { container } = render(Tag, {
        slots: { default: 'Test Tag' },
      })
      const icon = container.querySelector('.inline-flex-shrink-0')

      expect(icon).toBeFalsy()
    })

    it('显示图标时渲染 Icon 组件', () => {
      const { container } = render(Tag, {
        props: { icon: 'check' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toBeTruthy()
      // Icon 组件应该在 tag 内部渲染
    })
  })

  describe('交互行为', () => {
    it('点击 Tag 触发 click 事件', async () => {
      const onClick = vi.fn()
      const { container } = render(Tag, {
        props: { onClick },
        slots: { default: 'Test Tag' },
      })

      const tag = container.querySelector('span')!
      await fireEvent.click(tag)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('click 事件包含 MouseEvent', async () => {
      const onClick = vi.fn()
      const { container } = render(Tag, {
        props: { onClick },
        slots: { default: 'Test Tag' },
      })

      const tag = container.querySelector('span')!
      await fireEvent.click(tag)

      expect(onClick).toHaveBeenCalledWith(
        expect.any(MouseEvent)
      )
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Tag, {
        props: { class: 'custom-class' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('custom-class')
    })

    it('保持基础类名', () => {
      const { container } = render(Tag, {
        props: { class: 'custom-class' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('inline-flex')
      expect(tag).toHaveClass('items-center')
      expect(tag).toHaveClass('gap-1.5')
      expect(tag).toHaveClass('rounded-full')
      expect(tag).toHaveClass('custom-class')
    })

    it('正确应用 variant 样式', () => {
      const { container } = render(Tag, {
        props: { variant: 'primary' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('bg-primary-50')
      expect(tag).toHaveClass('text-primary-700')
      expect(tag).toHaveClass('border')
      expect(tag).toHaveClass('border-primary-200')
    })

    it('正确应用 size 样式', () => {
      const { container } = render(Tag, {
        props: { size: 'lg' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('h-8')
      expect(tag).toHaveClass('px-3')
      expect(tag).toHaveClass('text-base')
    })
  })

  describe('过渡动画', () => {
    it('包含 transition-colors 类', () => {
      const { container } = render(Tag, {
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('transition-colors')
      expect(tag).toHaveClass('duration-200')
    })

    it('关闭按钮包含 transition 类', () => {
      const { container } = render(Tag, {
        props: { removable: true },
        slots: { default: 'Test Tag' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toHaveClass('transition-colors')
      expect(closeButton).toHaveClass('duration-200')
    })
  })

  describe('可访问性', () => {
    it('关闭按钮有正确的 aria-label', () => {
      const { container } = render(Tag, {
        props: { removable: true },
        slots: { default: 'Test Tag' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toHaveAttribute('aria-label', '关闭标签')
    })

    it('关闭按钮有正确的 type 属性', () => {
      const { container } = render(Tag, {
        props: { removable: true },
        slots: { default: 'Test Tag' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toHaveAttribute('type', 'button')
    })
  })

  describe('边角情况', () => {
    it('处理空内容', () => {
      const { container } = render(Tag, {
        slots: { default: '' },
      })
      const tag = container.querySelector('span')

      expect(tag).toBeTruthy()
    })

    it('处理长文本内容', () => {
      const longText = 'This is a very long tag content that should be truncated'
      const { container } = render(Tag, {
        slots: { default: longText },
      })
      const tag = container.querySelector('span')
      const contentSpan = tag?.querySelector('span.truncate')

      expect(tag).toBeTruthy()
      expect(contentSpan).toHaveClass('truncate')
    })

    it('处理同时有 icon 和 removable', () => {
      const { container } = render(Tag, {
        props: { icon: 'check', removable: true },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')
      const closeButton = container.querySelector('button')

      expect(tag).toBeTruthy()
      expect(closeButton).toBeTruthy()
    })

    it('处理最小尺寸 sm 的关闭按钮', () => {
      const { container } = render(Tag, {
        props: { size: 'sm', removable: true },
        slots: { default: 'Test Tag' },
      })
      const closeButton = container.querySelector('button')
      const svg = closeButton?.querySelector('svg')

      expect(svg).toHaveClass('h-3')
      expect(svg).toHaveClass('w-3')
    })

    it('处理最大尺寸 lg 的关闭按钮', () => {
      const { container } = render(Tag, {
        props: { size: 'lg', removable: true },
        slots: { default: 'Test Tag' },
      })
      const closeButton = container.querySelector('button')
      const svg = closeButton?.querySelector('svg')

      expect(svg).toHaveClass('h-4')
      expect(svg).toHaveClass('w-4')
    })
  })

  describe('不同变体的样式组合', () => {
    it('primary variant 有边框样式', () => {
      const { container } = render(Tag, {
        props: { variant: 'primary' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('border')
      expect(tag).toHaveClass('border-primary-200')
    })

    it('success variant 有边框样式', () => {
      const { container } = render(Tag, {
        props: { variant: 'success' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('border')
      expect(tag).toHaveClass('border-emerald-200')
    })

    it('warning variant 有边框样式', () => {
      const { container } = render(Tag, {
        props: { variant: 'warning' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('border')
      expect(tag).toHaveClass('border-amber-200')
    })

    it('danger variant 有边框样式', () => {
      const { container } = render(Tag, {
        props: { variant: 'danger' },
        slots: { default: 'Test Tag' },
      })
      const tag = container.querySelector('span')

      expect(tag).toHaveClass('border')
      expect(tag).toHaveClass('border-red-200')
    })
  })
})
