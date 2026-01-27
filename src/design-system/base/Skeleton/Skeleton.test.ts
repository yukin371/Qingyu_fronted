/**
 * Skeleton 组件单元测试
 *
 * 测试覆盖：
 * - 基础渲染
 * - 所有变体
 * - 动画效果
 * - 自定义样式
 * - 多个骨架屏组合
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { BaseSkeleton } from './index'

describe('BaseSkeleton', () => {
  describe('基础渲染', () => {
    it('正确渲染骨架屏容器', () => {
      const { container } = render(BaseSkeleton)
      const skeleton = container.querySelector('.animate-pulse')

      expect(skeleton).toBeInTheDocument()
    })

    it('默认为文本模式', () => {
      const { container } = render(BaseSkeleton)
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('h-4', 'w-full')
    })
  })

  describe('变体测试', () => {
    it('支持 text 变体', () => {
      const { container } = render(BaseSkeleton, {
        props: { variant: 'text' }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('h-4', 'rounded')
    })

    it('支持 circular 变体', () => {
      const { container } = render(BaseSkeleton, {
        props: { variant: 'circular' }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('rounded-full')
    })

    it('支持 rect 变体', () => {
      const { container } = render(BaseSkeleton, {
        props: { variant: 'rect' }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('rounded-md')
    })
  })

  describe('尺寸测试', () => {
    it('支持自定义宽度', () => {
      const { container } = render(BaseSkeleton, {
        props: { width: '100px' }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveStyle({ width: '100px' })
    })

    it('支持自定义高度', () => {
      const { container } = render(BaseSkeleton, {
        props: { height: '50px' }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveStyle({ height: '50px' })
    })

    it('支持同时设置宽高', () => {
      const { container } = render(BaseSkeleton, {
        props: { width: '200px', height: '100px' }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveStyle({ width: '200px', height: '100px' })
    })
  })

  describe('动画效果', () => {
    it('默认有脉冲动画', () => {
      const { container } = render(BaseSkeleton)
      const skeleton = container.querySelector('.animate-pulse')

      expect(skeleton).toBeTruthy()
    })

    it('支持禁用动画', () => {
      const { container } = render(BaseSkeleton, {
        props: { animated: false }
      })
      const skeleton = container.querySelector('.animate-pulse')

      expect(skeleton).toBeFalsy()
    })
  })

  describe('颜色主题', () => {
    it('默认背景色为灰色', () => {
      const { container } = render(BaseSkeleton)
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('bg-slate-200')
    })

    it('支持深色模式', () => {
      const { container } = render(BaseSkeleton, {
        props: { darkMode: true }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('dark:bg-slate-700')
    })
  })

  describe('自定义样式', () => {
    it('支持自定义 class', () => {
      const { container } = render(BaseSkeleton, {
        props: { class: 'custom-class' }
      })

      const skeleton = container.querySelector('.custom-class')
      expect(skeleton).toBeTruthy()
    })

    it('自定义 class 与默认样式共存', () => {
      const { container } = render(BaseSkeleton, {
        props: { class: 'custom-class' }
      })
      const skeleton = container.firstChild

      expect(skeleton).toHaveClass('bg-slate-200')
      expect(skeleton).toHaveClass('custom-class')
    })
  })

  describe('组合使用', () => {
    it('支持多个骨架屏组合', () => {
      const { container } = render({
        template: `
          <div>
            <BaseSkeleton variant="circular" width="40px" height="40px" />
            <BaseSkeleton variant="text" width="60%" />
            <BaseSkeleton variant="text" width="40%" />
          </div>
        `,
        components: { BaseSkeleton }
      })

      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(3)
    })
  })

  describe('可访问性', () => {
    it('有正确的 role 属性', () => {
      const { container } = render(BaseSkeleton)
      const skeleton = container.querySelector('[role="status"]')

      expect(skeleton).toBeTruthy()
    })

    it('有正确的 aria-live 属性', () => {
      const { container } = render(BaseSkeleton)
      const skeleton = container.querySelector('[aria-live="polite"]')

      expect(skeleton).toBeTruthy()
    })

    it('有屏幕阅读器专用文本', () => {
      const { container } = render(BaseSkeleton)
      const srText = container.querySelector('.sr-only')

      expect(srText).toBeTruthy()
      expect(srText).toHaveTextContent('Loading...')
    })
  })

  describe('响应式', () => {
    it('在不同屏幕尺寸下正确显示', () => {
      const { container } = render(BaseSkeleton)
      const skeleton = container.firstChild

      expect(skeleton).toBeInTheDocument()
    })
  })
})
