/**
 * Badge 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import Badge from '@/design-system/base/Badge/Badge.vue'

describe('Badge', () => {
  describe('基础渲染', () => {
    it('默认渲染为 default variant 和 md size', () => {
      const { container } = render(Badge)
      const badge = container.querySelector('span')

      expect(badge).toBeTruthy()
      expect(badge).toHaveClass('bg-slate-100')
      expect(badge).toHaveClass('h-5')
      expect(badge).toHaveClass('w-5')
    })

    it('正确渲染所有变体', () => {
      const variants = ['default', 'primary', 'success', 'warning', 'danger'] as const

      for (const variant of variants) {
        const { container } = render(Badge, { props: { variant, content: 5 } })
        const badge = container.querySelector('span')

        expect(badge).toBeTruthy()

        if (variant === 'default') {
          expect(badge).toHaveClass('bg-slate-100')
        } else if (variant === 'primary') {
          expect(badge).toHaveClass('bg-primary-500')
        } else if (variant === 'success') {
          expect(badge).toHaveClass('bg-success-DEFAULT')
        } else if (variant === 'warning') {
          expect(badge).toHaveClass('bg-warning-DEFAULT')
        } else if (variant === 'danger') {
          expect(badge).toHaveClass('bg-danger-DEFAULT')
        }
      }
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Badge, { props: { size, content: 5 } })
        const badge = container.querySelector('span')

        expect(badge).toBeTruthy()

        if (size === 'sm') {
          expect(badge).toHaveClass('h-4')
          expect(badge).toHaveClass('w-4')
          expect(badge).toHaveClass('text-[10px]')
        } else if (size === 'md') {
          expect(badge).toHaveClass('h-5')
          expect(badge).toHaveClass('w-5')
          expect(badge).toHaveClass('text-xs')
        } else if (size === 'lg') {
          expect(badge).toHaveClass('h-6')
          expect(badge).toHaveClass('w-6')
          expect(badge).toHaveClass('text-sm')
        }
      }
    })
  })

  describe('内容显示', () => {
    it('正确显示数字内容', () => {
      const { container } = render(Badge, { props: { content: 5 } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('5')
    })

    it('正确显示字符串内容', () => {
      const { container } = render(Badge, { props: { content: 'NEW' } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('NEW')
    })

    it('空内容时显示为空（红点）', () => {
      const { container } = render(Badge, { props: { content: null } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('')
      expect(badge).toHaveClass('px-0')
    })

    it('undefined 内容时显示为空（红点）', () => {
      const { container } = render(Badge, { props: { content: undefined } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('')
      expect(badge).toHaveClass('px-0')
    })

    it('dot 模式下不显示内容', () => {
      const { container } = render(Badge, { props: { content: 99, dot: true } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('')
      expect(badge).toHaveClass('px-0')
    })
  })

  describe('max 属性', () => {
    it('小于 max 时显示原数字', () => {
      const { container } = render(Badge, { props: { content: 50, max: 99 } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('50')
    })

    it('等于 max 时显示原数字', () => {
      const { container } = render(Badge, { props: { content: 99, max: 99 } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('99')
    })

    it('大于 max 时显示 max+', () => {
      const { container } = render(Badge, { props: { content: 100, max: 99 } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('99+')
    })

    it('远大于 max 时显示 max+', () => {
      const { container } = render(Badge, { props: { content: 999, max: 99 } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('99+')
    })

    it('自定义 max 值', () => {
      const { container } = render(Badge, { props: { content: 1000, max: 999 } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('999+')
    })

    it('max 对字符串内容无效', () => {
      const { container } = render(Badge, { props: { content: 'TEST', max: 99 } })
      const badge = container.querySelector('span')

      expect(badge?.textContent).toBe('TEST')
    })
  })

  describe('定位', () => {
    it('absolute 为 false 时不添加定位类', () => {
      const { container } = render(Badge, { props: { absolute: false, content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).not.toHaveClass('top-0')
      expect(badge).not.toHaveClass('right-0')
    })

    it('absolute 为 true 时添加定位类', () => {
      const { container } = render(Badge, { props: { absolute: true, content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('top-0')
      expect(badge).toHaveClass('right-0')
      expect(badge).toHaveClass('-translate-y-1/2')
      expect(badge).toHaveClass('translate-x-1/2')
    })

    it('支持自定义 position', () => {
      const { container } = render(Badge, {
        props: { absolute: true, position: 'bottom-0 right-0', content: 5 },
      })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('bottom-0')
      expect(badge).toHaveClass('right-0')
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Badge, {
        props: { class: 'custom-class', content: 5 },
      })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('custom-class')
    })

    it('有 rounded-full 类', () => {
      const { container } = render(Badge, { props: { content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('rounded-full')
    })

    it('有 transition 动画', () => {
      const { container } = render(Badge, { props: { content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('transition-all')
    })

    it('有 flex 居中对齐', () => {
      const { container } = render(Badge, { props: { content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('items-center')
      expect(badge).toHaveClass('justify-center')
    })
  })

  describe('颜色主题', () => {
    it('default 变体有正确的文字颜色', () => {
      const { container } = render(Badge, { props: { variant: 'default', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('text-slate-700')
    })

    it('primary 变体有白色文字', () => {
      const { container } = render(Badge, { props: { variant: 'primary', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('text-white')
    })

    it('success 变体有白色文字', () => {
      const { container } = render(Badge, { props: { variant: 'success', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('text-white')
    })

    it('warning 变体有白色文字', () => {
      const { container } = render(Badge, { props: { variant: 'warning', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('text-white')
    })

    it('danger 变体有白色文字', () => {
      const { container } = render(Badge, { props: { variant: 'danger', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('text-white')
    })
  })

  describe('最小宽度', () => {
    it('sm 尺寸有最小宽度', () => {
      const { container } = render(Badge, { props: { size: 'sm', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('min-w-4')
    })

    it('md 尺寸有最小宽度', () => {
      const { container } = render(Badge, { props: { size: 'md', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('min-w-5')
    })

    it('lg 尺寸有最小宽度', () => {
      const { container } = render(Badge, { props: { size: 'lg', content: 5 } })
      const badge = container.querySelector('span')

      expect(badge).toHaveClass('min-w-6')
    })
  })
})
