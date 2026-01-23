/**
 * Button 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Button from '@/design-system/base/Button/Button.vue'

describe('Button', () => {
  describe('基础渲染', () => {
    it('默认渲染为 primary variant 和 md size', () => {
      const { getByRole } = render(Button)
      const button = getByRole('button')

      expect(button).toHaveClass('bg-primary-500')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('px-4')
    })

    it('正确渲染所有变体', () => {
      const variants = ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'] as const

      for (const variant of variants) {
        const { getByRole } = render(Button, { props: { variant } })
        const button = getByRole('button')

        expect(button).toHaveClass(
          expect.stringContaining(variant === 'primary' ? 'bg-primary-500' : variant)
        )
      }
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

      for (const size of sizes) {
        const { getByRole } = render(Button, { props: { size } })
        const button = getByRole('button')

        if (size === 'xs') expect(button).toHaveClass('h-7')
        else if (size === 'sm') expect(button).toHaveClass('h-8')
        else if (size === 'md') expect(button).toHaveClass('h-10')
        else if (size === 'lg') expect(button).toHaveClass('h-11')
        else if (size === 'xl') expect(button).toHaveClass('h-12')
      }
    })
  })

  describe('交互行为', () => {
    it('点击时触发 click 事件', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(Button, { props: { onClick } })

      await fireEvent.click(getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('disabled 状态不触发点击', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(Button, {
        props: { disabled: true, onClick },
      })

      await fireEvent.click(getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('loading 状态不触发点击', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(Button, {
        props: { loading: true, onClick },
      })

      await fireEvent.click(getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('loading 状态显示加载动画', () => {
      const { getByRole } = render(Button, { props: { loading: true } })
      const button = getByRole('button')

      expect(button).toBeDisabled()
      expect(button.querySelector('.animate-spin')).toBeTruthy()
    })

    it('block 状态占满容器宽度', () => {
      const { getByRole } = render(Button, { props: { block: true } })
      const button = getByRole('button')

      expect(button).toHaveClass('w-full')
    })
  })

  describe('可访问性', () => {
    it('支持键盘 Enter 键', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(Button, { props: { onClick } })
      const button = getByRole('button')

      button.focus()
      await fireEvent.keyDown(button, { key: 'Enter' })
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('支持空格键', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(Button, { props: { onClick } })
      const button = getByRole('button')

      button.focus()
      await fireEvent.keyDown(button, { key: ' ' })
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('disabled 时不响应键盘', async () => {
      const onClick = vi.fn()
      const { getByRole } = render(Button, {
        props: { disabled: true, onClick },
      })
      const button = getByRole('button')

      await fireEvent.keyDown(button, { key: 'Enter' })
      expect(onClick).not.toHaveBeenCalled()
    })

    it('有正确的 type 属性', () => {
      const { getByRole } = render(Button, { props: { type: 'submit' } })
      const button = getByRole('button')

      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('插槽内容', () => {
    it('渲染默认插槽内容', () => {
      const { getByRole } = render(Button, {}, {
        slots: { default: 'Click Me' },
      })
      const button = getByRole('button')

      expect(button.textContent).toContain('Click Me')
    })

    it('loading 时保留插槽内容', () => {
      const { getByRole } = render(Button,
        { props: { loading: true } },
        { slots: { default: 'Loading...' } }
      )
      const button = getByRole('button')

      expect(button.textContent).toContain('Loading...')
      expect(button.querySelector('.animate-spin')).toBeTruthy()
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { getByRole } = render(Button, {
        props: { class: 'custom-class' },
      })
      const button = getByRole('button')

      expect(button).toHaveClass('custom-class')
    })

    it('有 focus-visible 样式', () => {
      const { getByRole } = render(Button)
      const button = getByRole('button')

      expect(button.className).toContain('focus-visible:ring-2')
    })

    it('有 transition 动画', () => {
      const { getByRole } = render(Button)
      const button = getByRole('button')

      expect(button.className).toContain('transition-all')
    })
  })
})
