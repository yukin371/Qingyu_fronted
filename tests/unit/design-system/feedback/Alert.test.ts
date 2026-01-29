/**
 * Alert 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import Alert from '@/design-system/feedback/Alert/Alert.vue'

describe('Alert', () => {
  describe('基础渲染', () => {
    it('默认渲染为 info 类型', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toBeTruthy()
      expect(alert).toHaveClass('bg-sky-50')
      expect(alert).toHaveClass('border-sky-200')
      expect(alert).toHaveClass('text-sky-800')
    })

    it('正确渲染 success 类型', () => {
      const { container } = render(Alert, {
        props: { type: 'success', description: 'Success message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('bg-emerald-50')
      expect(alert).toHaveClass('border-emerald-200')
      expect(alert).toHaveClass('text-emerald-800')
    })

    it('正确渲染 info 类型', () => {
      const { container } = render(Alert, {
        props: { type: 'info', description: 'Info message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('bg-sky-50')
      expect(alert).toHaveClass('border-sky-200')
      expect(alert).toHaveClass('text-sky-800')
    })

    it('正确渲染 warning 类型', () => {
      const { container } = render(Alert, {
        props: { type: 'warning', description: 'Warning message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('bg-amber-50')
      expect(alert).toHaveClass('border-amber-200')
      expect(alert).toHaveClass('text-amber-800')
    })

    it('正确渲染 error 类型', () => {
      const { container } = render(Alert, {
        props: { type: 'error', description: 'Error message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('bg-red-50')
      expect(alert).toHaveClass('border-red-200')
      expect(alert).toHaveClass('text-red-800')
    })

    it('正确渲染描述内容', () => {
      const { container } = render(Alert, {
        props: { description: 'Test description' },
      })
      const alert = container.querySelector('.relative')

      expect(alert?.textContent).toContain('Test description')
    })

    it('正确渲染标题', () => {
      const { container } = render(Alert, {
        props: { title: 'Test Title', description: 'Test description' },
      })
      const title = container.querySelector('.font-semibold')

      expect(title).toBeTruthy()
      expect(title?.textContent).toContain('Test Title')
    })

    it('有正确的 role 属性', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const alert = container.querySelector('[role="alert"]')

      expect(alert).toBeTruthy()
    })

    it('有正确的 aria-live 属性', () => {
      const { container } = render(Alert, {
        props: { type: 'info', description: 'Test message' },
      })
      const alert = container.querySelector('[aria-live="polite"]')

      expect(alert).toBeTruthy()
    })

    it('error 类型有 aria-live="assertive"', () => {
      const { container } = render(Alert, {
        props: { type: 'error', description: 'Error message' },
      })
      const alert = container.querySelector('[aria-live="assertive"]')

      expect(alert).toBeTruthy()
    })

    it('warning 类型有 aria-live="assertive"', () => {
      const { container } = render(Alert, {
        props: { type: 'warning', description: 'Warning message' },
      })
      const alert = container.querySelector('[aria-live="assertive"]')

      expect(alert).toBeTruthy()
    })
  })

  describe('图标功能', () => {
    it('默认显示图标', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toBeTruthy()
    })

    it('showIcon 为 false 时不显示图标', () => {
      const { container } = render(Alert, {
        props: { showIcon: false, description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toBeFalsy()
    })

    it('success 类型显示 check 图标', () => {
      const { container } = render(Alert, {
        props: { type: 'success', description: 'Test message' },
      })
      // Icon 组件会渲染，这里检查图标容器
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toBeTruthy()
    })

    it('info 类型显示 information-circle 图标', () => {
      const { container } = render(Alert, {
        props: { type: 'info', description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toBeTruthy()
    })

    it('warning 类型显示图标', () => {
      const { container } = render(Alert, {
        props: { type: 'warning', description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toBeTruthy()
    })

    it('error 类型显示图标', () => {
      const { container } = render(Alert, {
        props: { type: 'error', description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toBeTruthy()
    })
  })

  describe('关闭功能', () => {
    it('closable 为 false 时不显示关闭按钮', () => {
      const { container } = render(Alert, {
        props: { closable: false, description: 'Test message' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toBeFalsy()
    })

    it('closable 为 true 时显示关闭按钮', () => {
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toBeTruthy()
      expect(closeButton).toHaveAttribute('type', 'button')
      expect(closeButton).toHaveAttribute('aria-label', '关闭警告')
    })

    it('点击关闭按钮触发 close 事件', async () => {
      const onClose = vi.fn()
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message', onClose },
      })

      const closeButton = container.querySelector('button')!
      await fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('点击关闭按钮后触发 afterClose 事件', async () => {
      const onAfterClose = vi.fn()
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message', onAfterClose },
      })

      const closeButton = container.querySelector('button')!
      await fireEvent.click(closeButton)

      // 等待动画结束
      await waitFor(
        () => {
          expect(onAfterClose).toHaveBeenCalledTimes(1)
        },
        { timeout: 500 }
      )
    })

    it('关闭后 Alert 被隐藏', async () => {
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message' },
      })

      const closeButton = container.querySelector('button')!
      await fireEvent.click(closeButton)

      // 等待动画结束和DOM移除
      await waitFor(
        () => {
          const alert = container.querySelector('.relative')
          expect(alert).toBeFalsy()
        },
        { timeout: 1000 }
      )
    })

    it('关闭按钮有正确的样式', () => {
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toHaveClass('flex-shrink-0')
      expect(closeButton).toHaveClass('ml-3')
      expect(closeButton).toHaveClass('rounded-md')
    })
  })

  describe('居中功能', () => {
    it('center 为 false 时默认左对齐', () => {
      const { container } = render(Alert, {
        props: { center: false, description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('text-left')
      expect(alert).not.toHaveClass('text-center')
    })

    it('center 为 true 时文字居中', () => {
      const { container } = render(Alert, {
        props: { center: true, description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('text-center')
      expect(alert).not.toHaveClass('text-left')
    })

    it('center 为 true 时图标居中', () => {
      const { container } = render(Alert, {
        props: { center: true, showIcon: true, description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toHaveClass('mx-auto')
      expect(iconContainer).toHaveClass('mb-2')
    })

    it('center 为 false 时图标不居中', () => {
      const { container } = render(Alert, {
        props: { center: false, showIcon: true, description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toHaveClass('mr-3')
      expect(iconContainer).not.toHaveClass('mx-auto')
    })
  })

  describe('插槽功能', () => {
    it('默认插槽渲染描述内容', () => {
      const { container } = render(Alert, {
        slots: { default: 'Custom description' },
      })
      const alert = container.querySelector('.relative')

      expect(alert?.textContent).toContain('Custom description')
    })

    it('title 插槽覆盖 title prop', () => {
      const { container } = render(Alert, {
        props: { title: 'Prop Title' },
        slots: { title: 'Slot Title' },
      })
      const title = container.querySelector('.font-semibold')

      expect(title?.textContent).toContain('Slot Title')
      expect(title?.textContent).not.toContain('Prop Title')
    })

    it('title 插槽可以包含 HTML', () => {
      const { container } = render(Alert, {
        slots: {
          title: '<span class="text-red-500">HTML Title</span>',
        },
      })
      const title = container.querySelector('.font-semibold')

      expect(title?.innerHTML).toContain('text-red-500')
    })

    it('默认插槽可以包含 HTML', () => {
      const { container } = render(Alert, {
        slots: {
          default: '<p class="custom">Custom content</p>',
        },
      })
      const alert = container.querySelector('.relative')

      expect(alert?.innerHTML).toContain('custom')
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Alert, {
        props: { class: 'custom-class', description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('custom-class')
    })

    it('保持基础样式类', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('relative')
      expect(alert).toHaveClass('w-full')
      expect(alert).toHaveClass('rounded-lg')
      expect(alert).toHaveClass('border')
      expect(alert).toHaveClass('p-4')
    })

    it('有过渡动画类', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('transition-all')
      expect(alert).toHaveClass('duration-300')
    })

    it('有正确的边框样式', () => {
      const { container } = render(Alert, {
        props: { type: 'success', description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('border-emerald-200')
    })
  })

  describe('可访问性', () => {
    it('关闭按钮有正确的 aria-label', () => {
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toHaveAttribute('aria-label', '关闭警告')
    })

    it('关闭按钮有正确的 type 属性', () => {
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message' },
      })
      const closeButton = container.querySelector('button')

      expect(closeButton).toHaveAttribute('type', 'button')
    })

    it('Alert 有 role="alert"', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const alert = container.querySelector('[role="alert"]')

      expect(alert).toBeTruthy()
    })

    it('success 类型有 aria-live="polite"', () => {
      const { container } = render(Alert, {
        props: { type: 'success', description: 'Test message' },
      })
      const alert = container.querySelector('[aria-live="polite"]')

      expect(alert).toBeTruthy()
    })

    it('info 类型有 aria-live="polite"', () => {
      const { container } = render(Alert, {
        props: { type: 'info', description: 'Test message' },
      })
      const alert = container.querySelector('[aria-live="polite"]')

      expect(alert).toBeTruthy()
    })
  })

  describe('边角情况', () => {
    it('处理空描述', () => {
      const { container } = render(Alert, {
        props: { description: '' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toBeTruthy()
    })

    it('处理只有标题没有描述', () => {
      const { container } = render(Alert, {
        props: { title: 'Only Title' },
      })
      const title = container.querySelector('.font-semibold')

      expect(title).toBeTruthy()
      expect(title?.textContent).toContain('Only Title')
    })

    it('处理长文本描述', () => {
      const longText = 'This is a very long description that should wrap properly in the Alert component'
      const { container } = render(Alert, {
        props: { description: longText },
      })
      const alert = container.querySelector('.relative')

      expect(alert?.textContent).toContain(longText)
    })

    it('处理所有属性组合', () => {
      const { container } = render(Alert, {
        props: {
          type: 'success',
          title: 'Title',
          description: 'Description',
          closable: true,
          showIcon: true,
          center: true,
        },
      })
      const alert = container.querySelector('.relative')
      const closeButton = container.querySelector('button')
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(alert).toBeTruthy()
      expect(closeButton).toBeTruthy()
      expect(iconContainer).toBeTruthy()
      expect(alert).toHaveClass('text-center')
    })
  })

  describe('动画', () => {
    it('初始状态显示', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const alert = container.querySelector('.relative')

      expect(alert).toHaveClass('opacity-100')
      expect(alert).toHaveClass('scale-100')
    })

    it('关闭时添加关闭动画类', async () => {
      const { container } = render(Alert, {
        props: { closable: true, description: 'Test message' },
      })

      const closeButton = container.querySelector('button')!
      await fireEvent.click(closeButton)

      const alert = container.querySelector('.relative')
      expect(alert).toHaveClass('opacity-0')
      expect(alert).toHaveClass('scale-95')
    })
  })

  describe('图标样式', () => {
    it('图标容器有正确的间距', () => {
      const { container } = render(Alert, {
        props: { showIcon: true, description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toHaveClass('mr-3')
    })

    it('center 模式下图标有正确的样式', () => {
      const { container } = render(Alert, {
        props: { center: true, showIcon: true, description: 'Test message' },
      })
      const iconContainer = container.querySelector('.flex-shrink-0')

      expect(iconContainer).toHaveClass('mx-auto')
      expect(iconContainer).toHaveClass('mb-2')
    })
  })

  describe('内容区域', () => {
    it('内容区域有 flex-1 类', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const contentDiv = container.querySelector('.flex-1')

      expect(contentDiv).toBeTruthy()
    })

    it('标题有 font-semibold 类', () => {
      const { container } = render(Alert, {
        props: { title: 'Test Title', description: 'Test message' },
      })
      const title = container.querySelector('.font-semibold')

      expect(title).toBeTruthy()
    })

    it('描述有 text-sm 类', () => {
      const { container } = render(Alert, {
        props: { description: 'Test message' },
      })
      const description = container.querySelector('.text-sm')

      expect(description).toBeTruthy()
    })
  })
})
