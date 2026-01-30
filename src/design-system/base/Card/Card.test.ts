/**
 * Card 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有变体
 * - 阴影效果
 * - 插槽内容
 * - 自定义样式
 */

// vitest globals are configured in tsconfig.json
import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { Card as BaseCard } from './index'

describe('BaseCard', () => {
  describe('基础渲染', () => {
    it('正确渲染卡片容器', () => {
      const { container } = render(BaseCard)
      const card = container.querySelector('.bg-white')

      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border')
    })

    it('正确渲染默认插槽内容', () => {
      const { getByText } = render(BaseCard, {
        slots: { default: 'Card Content' }
      })

      expect(getByText('Card Content')).toBeInTheDocument()
    })
  })

  describe('变体测试', () => {
    it('支持 bordered 变体', () => {
      const { container } = render(BaseCard, {
        props: { variant: 'bordered' }
      })
      const card = container.firstChild

      expect(card).toHaveClass('border')
    })

    it('支持 shadow 变体', () => {
      const { container } = render(BaseCard, {
        props: { variant: 'shadow' }
      })
      const card = container.firstChild

      expect(card).toHaveClass('shadow-md')
    })

    it('支持 flat 变体', () => {
      const { container } = render(BaseCard, {
        props: { variant: 'flat' }
      })
      const card = container.firstChild

      expect(card).toHaveClass('shadow-none')
    })
  })

  describe('阴影级别', () => {
    const shadows: Array<'none' | 'sm' | 'md' | 'lg' | 'xl'> = [
      'none',
      'sm',
      'md',
      'lg',
      'xl',
    ]

    it.each(shadows)('正确渲染 %s 阴影级别', (shadow) => {
      const { container } = render(BaseCard, {
        props: { shadow }
      })
      const card = container.firstChild

      expect(card).toBeInTheDocument()
    })
  })

  describe('可悬停效果', () => {
    it('hoverable 为 true 时添加悬停效果', () => {
      const { container } = render(BaseCard, {
        props: { hoverable: true }
      })
      const card = container.firstChild

      expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow')
    })
  })

  describe('插槽测试', () => {
    it('支持 header 插槽', () => {
      const { getByText } = render(BaseCard, {
        slots: {
          header: 'Card Header'
        }
      })

      expect(getByText('Card Header')).toBeInTheDocument()
    })

    it('支持 footer 插槽', () => {
      const { getByText } = render(BaseCard, {
        slots: {
          footer: 'Card Footer'
        }
      })

      expect(getByText('Card Footer')).toBeInTheDocument()
    })

    it('同时支持 header, default, footer 插槽', () => {
      const { getByText } = render(BaseCard, {
        slots: {
          header: 'Header',
          default: 'Content',
          footer: 'Footer'
        }
      })

      expect(getByText('Header')).toBeInTheDocument()
      expect(getByText('Content')).toBeInTheDocument()
      expect(getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseCard, {
        props: { class: 'custom-class' }
      })
      const card = container.querySelector('.custom-class')

      expect(card).toBeTruthy()
    })

    it('支持自定义 padding', () => {
      const { container } = render(BaseCard, {
        props: { padding: 'lg' }
      })
      const card = container.firstChild

      expect(card).toHaveClass('p-6')
    })
  })

  describe('深色模式', () => {
    it('支持深色模式样式', () => {
      const { container } = render(BaseCard, {
        props: { darkMode: true }
      })
      const card = container.firstChild

      expect(card).toHaveClass('dark:bg-slate-800', 'dark:border-slate-700')
    })
  })
})
