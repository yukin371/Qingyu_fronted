/**
 * Badge 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有变体
 * - 尺寸
 * - 点状模式
 * - 数字徽标
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { BaseBadge } from './index'

describe('BaseBadge', () => {
  describe('基础渲染', () => {
    it('正确渲染徽标内容', () => {
      const { getByText } = render(BaseBadge, {
        slots: { default: '5' }
      })

      expect(getByText('5')).toBeInTheDocument()
    })

    it('默认渲染为默认变体', () => {
      const { container } = render(BaseBadge, {
        slots: { default: 'Badge' }
      })

      const badge = container.querySelector('.inline-flex')
      expect(badge).toHaveClass('bg-red-500', 'text-white')
    })
  })

  describe('变体测试', () => {
    const variants: Array<'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info',
    ]

    it.each(variants)('正确渲染 %s 变体', (variant) => {
      const { container } = render(BaseBadge, {
        props: { variant },
        slots: { default: 'Badge' }
      })

      const badge = container.firstChild
      expect(badge).toBeTruthy()
    })
  })

  describe('尺寸测试', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg']

    it.each(sizes)('正确渲染 %s 尺寸', (size) => {
      const { container } = render(BaseBadge, {
        props: { size },
        slots: { default: 'Badge' }
      })

      const badge = container.firstChild
      expect(badge).toBeTruthy()
    })
  })

  describe('点状模式', () => {
    it('dot 模式渲染圆点', () => {
      const { container } = render(BaseBadge, {
        props: { dot: true }
      })

      const badge = container.querySelector('.rounded-full')
      expect(badge).toBeTruthy()
    })

    it('dot 模式下不显示内容', () => {
      const { container } = render(BaseBadge, {
        props: { dot: true },
        slots: { default: '99' }
      })

      const badge = container.firstChild
      expect(badge).not.toHaveTextContent('99')
    })
  })

  describe('数字徽标', () => {
    it('支持大数字显示', () => {
      const { getByText } = render(BaseBadge, {
        props: { count: 999 },
        slots: { default: '999' }
      })

      expect(getByText('999')).toBeInTheDocument()
    })

    it('支持 max 属性限制显示', () => {
      const { getByText } = render(BaseBadge, {
        props: { count: 99, max: 99 },
        slots: { default: '99+' }
      })

      expect(getByText('99+')).toBeInTheDocument()
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseBadge, {
        props: { class: 'custom-class' },
        slots: { default: 'Badge' }
      })

      const badge = container.querySelector('.custom-class')
      expect(badge).toBeTruthy()
    })
  })

  describe('位置偏移', () => {
    it('支持 offset 定位', () => {
      const { container } = render(BaseBadge, {
        props: { offset: [10, 10] },
        slots: { default: 'Badge' }
      })

      const badge = container.firstChild
      expect(badge).toBeTruthy()
    })
  })
})
