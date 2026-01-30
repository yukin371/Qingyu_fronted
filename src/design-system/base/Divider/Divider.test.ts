/**
 * Divider 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 方向（水平/垂直）
 * - 文字分割
 * - 虚线样式
 * - 自定义样式
 */

// vitest globals are configured in tsconfig.json
import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { Divider as BaseDivider } from './index'

describe('BaseDivider', () => {
  describe('基础渲染', () => {
    it('正确渲染水平分割线', () => {
      const { container } = render(BaseDivider)
      const divider = container.querySelector('div')

      expect(divider).toHaveClass('w-full', 'h-px')
    })

    it('默认为水平方向', () => {
      const { container } = render(BaseDivider)
      const divider = container.firstChild

      expect(divider).toHaveClass('border-t')
    })
  })

  describe('方向测试', () => {
    it('支持垂直方向', () => {
      const { container } = render(BaseDivider, {
        props: { direction: 'vertical' }
      })
      const divider = container.firstChild

      expect(divider).toHaveClass('h-full', 'w-px', 'border-l')
    })

    it('支持水平方向', () => {
      const { container } = render(BaseDivider, {
        props: { direction: 'horizontal' }
      })
      const divider = container.firstChild

      expect(divider).toHaveClass('w-full', 'h-px', 'border-t')
    })
  })

  describe('文字分割', () => {
    it('支持带文字的分割线', () => {
      const { getByText } = render(BaseDivider, {
        props: { text: 'Divider Text' }
      })

      expect(getByText('Divider Text')).toBeInTheDocument()
    })

    it('文字居中显示', () => {
      const { container } = render(BaseDivider, {
        props: { text: 'Text' }
      })

      const text = container.querySelector('.text-center')
      expect(text).toBeTruthy()
    })

    it('支持文字位置对齐', () => {
      const { container } = render(BaseDivider, {
        props: { text: 'Left', textAlign: 'left' }
      })

      const text = container.querySelector('.text-left')
      expect(text).toBeTruthy()
    })
  })

  describe('样式变体', () => {
    it('支持虚线样式', () => {
      const { container } = render(BaseDivider, {
        props: { dashed: true }
      })
      const divider = container.firstChild

      expect(divider).toHaveClass('border-dashed')
    })

    it('默认为实线样式', () => {
      const { container } = render(BaseDivider)
      const divider = container.firstChild

      expect(divider).toHaveClass('border-solid')
    })
  })

  describe('颜色主题', () => {
    it('支持默认颜色', () => {
      const { container } = render(BaseDivider)
      const divider = container.firstChild

      expect(divider).toHaveClass('border-slate-200')
    })

    it('支持深色主题', () => {
      const { container } = render(BaseDivider, {
        props: { theme: 'dark' }
      })
      const divider = container.firstChild

      expect(divider).toHaveClass('dark:border-slate-700')
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseDivider, {
        props: { class: 'custom-class' }
      })

      const divider = container.querySelector('.custom-class')
      expect(divider).toBeTruthy()
    })

    it('支持自定义边距', () => {
      const { container } = render(BaseDivider, {
        props: { margin: 'lg' }
      })
      const divider = container.firstChild

      expect(divider).toHaveClass('my-4')
    })
  })

  describe('响应式', () => {
    it('在不同屏幕尺寸下正确显示', () => {
      const { container } = render(BaseDivider)
      const divider = container.firstChild

      expect(divider).toBeInTheDocument()
    })
  })
})
