/**
 * Icon 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Icon from '@/design-system/base/Icon/Icon.vue'

describe('Icon', () => {
  describe('基础渲染', () => {
    it('默认渲染为 outline variant 和 md size', () => {
      const { container } = render(Icon, {
        props: { name: 'home' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
      expect(svg).toHaveClass('h-6')
      expect(svg).toHaveClass('w-6')
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

      for (const size of sizes) {
        const { container } = render(Icon, {
          props: { name: 'home', size },
        })
        const svg = container.querySelector('svg')

        expect(svg).toBeTruthy()

        if (size === 'xs') {
          expect(svg).toHaveClass('h-4')
        } else if (size === 'sm') {
          expect(svg).toHaveClass('h-5')
        } else if (size === 'md') {
          expect(svg).toHaveClass('h-6')
        } else if (size === 'lg') {
          expect(svg).toHaveClass('h-8')
        } else if (size === 'xl') {
          expect(svg).toHaveClass('h-10')
        }
      }
    })

    it('正确渲染 outline 变体', () => {
      const { container } = render(Icon, {
        props: { name: 'home', variant: 'outline' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
      expect(svg).toHaveAttribute('fill', 'none')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })

    it('正确渲染 solid 变体', () => {
      const { container } = render(Icon, {
        props: { name: 'home', variant: 'solid' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
      expect(svg).toHaveAttribute('fill', 'currentColor')
    })

    it('渲染不存在的图标显示占位符', () => {
      const { container } = render(Icon, {
        props: { name: 'nonexistent' },
      })

      const span = container.querySelector('span')
      expect(span).toBeTruthy()
      expect(span?.textContent).toBe('?')
    })
  })

  describe('图标名称', () => {
    it('正确渲染 home 图标', () => {
      const { container } = render(Icon, {
        props: { name: 'home' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
    })

    it('正确渲染 user 图标', () => {
      const { container } = render(Icon, {
        props: { name: 'user' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
    })

    it('正确渲染 check 图标', () => {
      const { container } = render(Icon, {
        props: { name: 'check' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
    })

    it('正确渲染 arrow-down 图标', () => {
      const { container } = render(Icon, {
        props: { name: 'arrow-down' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toBeTruthy()
    })
  })

  describe('交互行为', () => {
    it('点击时触发 click 事件', async () => {
      const onClick = vi.fn()
      const { container } = render(Icon, {
        props: { name: 'home', onClick },
      })

      const svg = container.querySelector('svg')!
      await fireEvent.click(svg)

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('可访问性', () => {
    it('使用 name 作为默认 aria-label', () => {
      const { container } = render(Icon, {
        props: { name: 'home' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('aria-label', 'home')
    })

    it('支持自定义 aria-label', () => {
      const { container } = render(Icon, {
        props: { name: 'home', ariaLabel: 'Go to home page' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('aria-label', 'Go to home page')
    })

    it('有正确的 inline-flex-shrink-0 类', () => {
      const { container } = render(Icon, {
        props: { name: 'home' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('inline-flex-shrink-0')
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Icon, {
        props: {
          name: 'home',
          class: 'text-red-500',
        },
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('text-red-500')
    })

    it('保持基础类名', () => {
      const { container } = render(Icon, {
        props: {
          name: 'home',
          class: 'custom-class',
        },
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('h-6')
      expect(svg).toHaveClass('w-6')
      expect(svg).toHaveClass('inline-flex-shrink-0')
      expect(svg).toHaveClass('custom-class')
    })
  })

  describe('边角情况', () => {
    it('处理空字符串 name', () => {
      const { container } = render(Icon, {
        props: { name: '' },
      })

      const span = container.querySelector('span')
      expect(span).toBeTruthy()
    })

    it('处理特殊字符的 ariaLabel', () => {
      const { container } = render(Icon, {
        props: { name: 'home', ariaLabel: 'Home & Settings' },
      })
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('aria-label', 'Home & Settings')
    })
  })
})
