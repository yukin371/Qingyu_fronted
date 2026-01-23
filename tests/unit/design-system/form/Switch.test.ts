/**
 * Switch 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Switch from '@/design-system/form/Switch/Switch.vue'

describe('Switch', () => {
  describe('基础渲染', () => {
    it('默认渲染为 unchecked 状态和 md size', () => {
      const { container } = render(Switch)
      const button = container.querySelector('button')

      expect(button).toBeTruthy()
      expect(button).toHaveAttribute('role', 'switch')
      expect(button).toHaveAttribute('aria-checked', 'false')
      expect(button).toHaveClass('h-6')
      expect(button).toHaveClass('w-11')
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Switch, {
          props: { size },
        })
        const button = container.querySelector('button')

        expect(button).toBeTruthy()

        if (size === 'sm') {
          expect(button).toHaveClass('h-5')
          expect(button).toHaveClass('w-9')
        } else if (size === 'md') {
          expect(button).toHaveClass('h-6')
          expect(button).toHaveClass('w-11')
        } else if (size === 'lg') {
          expect(button).toHaveClass('h-7')
          expect(button).toHaveClass('w-13')
        }
      }
    })

    it('正确渲染所有颜色', () => {
      const colors = ['primary', 'success', 'warning', 'danger'] as const

      for (const color of colors) {
        const { container } = render(Switch, {
          props: { color, modelValue: true },
        })
        const button = container.querySelector('button')

        expect(button).toBeTruthy()

        if (color === 'primary') {
          expect(button).toHaveClass('bg-primary-500')
        } else if (color === 'success') {
          expect(button).toHaveClass('bg-success-DEFAULT')
        } else if (color === 'warning') {
          expect(button).toHaveClass('bg-warning-DEFAULT')
        } else if (color === 'danger') {
          expect(button).toHaveClass('bg-danger-DEFAULT')
        }
      }
    })

    it('未选中状态有正确的样式', () => {
      const { container } = render(Switch, {
        props: { modelValue: false },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('bg-slate-200')
    })

    it('选中状态有正确的样式', () => {
      const { container } = render(Switch, {
        props: { modelValue: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('bg-primary-500')
    })
  })

  describe('v-model 双向绑定', () => {
    it('点击切换状态', async () => {
      const { container, emitted } = render(Switch, {
        props: { modelValue: false },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(emitted('update:modelValue')).toBeTruthy()
      expect(emitted('update:modelValue')![0]).toEqual([true])
      expect(emitted('change')).toBeTruthy()
      expect(emitted('change')![0]).toEqual([true])
    })

    it('从选中到未选中', async () => {
      const { container, emitted } = render(Switch, {
        props: { modelValue: true },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(emitted('update:modelValue')).toBeTruthy()
      expect(emitted('update:modelValue')![0]).toEqual([false])
    })

    it('响应 modelValue 的变化', async () => {
      const { container, rerender } = render(Switch, {
        props: { modelValue: false },
      })
      const button = container.querySelector('button')!

      expect(button).toHaveAttribute('aria-checked', 'false')

      await rerender({ modelValue: true })

      expect(button).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('禁用状态', () => {
    it('禁用状态下不可点击', async () => {
      const { container, emitted } = render(Switch, {
        props: { disabled: true, modelValue: false },
      })
      const button = container.querySelector('button')!

      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')

      await fireEvent.click(button)

      expect(emitted('update:modelValue')).toBeFalsy()
    })

    it('禁用状态有正确的样式', () => {
      const { container } = render(Switch, {
        props: { disabled: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('disabled:cursor-not-allowed')
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })

  describe('加载状态', () => {
    it('加载状态下不可点击', async () => {
      const { container, emitted } = render(Switch, {
        props: { loading: true, modelValue: false },
      })
      const button = container.querySelector('button')!

      expect(button).toBeDisabled()

      await fireEvent.click(button)

      expect(emitted('update:modelValue')).toBeFalsy()
    })

    it('加载状态显示加载动画', () => {
      const { container } = render(Switch, {
        props: { loading: true },
      })
      const spinner = container.querySelector('.animate-spin')

      expect(spinner).toBeTruthy()
    })
  })

  describe('标签和文本', () => {
    it('渲染标签文本', () => {
      const { container } = render(Switch, {
        props: { label: 'Enable feature' },
      })
      const label = container.querySelector('.text-sm.font-medium')

      expect(label).toBeTruthy()
      expect(label?.textContent).toContain('Enable feature')
    })

    it('渲染 activeText 和 inactiveText', () => {
      const { container } = render(Switch, {
        props: {
          activeText: 'On',
          inactiveText: 'Off',
          modelValue: true,
        },
      })
      // 查找包含状态文本的元素（最后一个 .text-sm 元素）
      const textSpans = container.querySelectorAll('.text-sm')
      const textSpan = textSpans[textSpans.length - 1]

      expect(textSpan?.textContent).toContain('On')
    })

    it('切换时文本会更新', async () => {
      const { container, rerender } = render(Switch, {
        props: {
          activeText: 'On',
          inactiveText: 'Off',
          modelValue: false,
        },
      })
      const button = container.querySelector('button')!
      const getTextSpan = () => {
        const textSpans = container.querySelectorAll('.text-sm')
        return textSpans[textSpans.length - 1]
      }

      expect(getTextSpan()?.textContent).toContain('Off')

      await fireEvent.click(button)

      // 更新 modelValue prop 以模拟 v-model 绑定
      await rerender({ modelValue: true, activeText: 'On', inactiveText: 'Off' })

      expect(getTextSpan()?.textContent).toContain('On')
    })
  })

  describe('beforeChange 回调', () => {
    it('同步回调返回 true 时允许切换', async () => {
      const beforeChange = vi.fn(() => true)
      const { container, emitted } = render(Switch, {
        props: {
          modelValue: false,
          beforeChange,
        },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(beforeChange).toHaveBeenCalledTimes(1)
      expect(emitted('update:modelValue')).toBeTruthy()
    })

    it('同步回调返回 false 时阻止切换', async () => {
      const beforeChange = vi.fn(() => false)
      const { container, emitted } = render(Switch, {
        props: {
          modelValue: false,
          beforeChange,
        },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(beforeChange).toHaveBeenCalledTimes(1)
      expect(emitted('update:modelValue')).toBeFalsy()
    })

    it('异步回调解析为 true 时允许切换', async () => {
      const beforeChange = vi.fn(() => Promise.resolve(true))
      const { container, emitted } = render(Switch, {
        props: {
          modelValue: false,
          beforeChange,
        },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(beforeChange).toHaveBeenCalledTimes(1)
      expect(emitted('update:modelValue')).toBeTruthy()
    })

    it('异步回调解析为 false 时阻止切换', async () => {
      const beforeChange = vi.fn(() => Promise.resolve(false))
      const { container, emitted } = render(Switch, {
        props: {
          modelValue: false,
          beforeChange,
        },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(beforeChange).toHaveBeenCalledTimes(1)
      expect(emitted('update:modelValue')).toBeFalsy()
    })

    it('异步回调被拒绝时阻止切换', async () => {
      const beforeChange = vi.fn(() => Promise.reject(new Error('Cancelled')))
      const { container, emitted } = render(Switch, {
        props: {
          modelValue: false,
          beforeChange,
        },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(beforeChange).toHaveBeenCalledTimes(1)
      expect(emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('自定义值', () => {
    it('使用自定义 activeValue 和 inactiveValue（反向）', async () => {
      const { container, emitted } = render(Switch, {
        props: {
          modelValue: true,
          activeValue: false,
          inactiveValue: true,
        },
      })
      const button = container.querySelector('button')!

      // 因为 modelValue (true) 等于 inactiveValue (true)，所以是未选中状态
      expect(button).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(button)

      // 点击后应该切换到 activeValue (false)
      expect(emitted('update:modelValue')![0]).toEqual([false])
    })

    it('点击两次恢复到初始值（反向值）', async () => {
      const { container, emitted, rerender } = render(Switch, {
        props: {
          modelValue: false,
          activeValue: true,
          inactiveValue: false,
        },
      })
      const button = container.querySelector('button')!

      // 因为 modelValue (false) 等于 inactiveValue (false)，所以是未选中状态
      expect(button).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(button)
      expect(emitted('update:modelValue')![0]).toEqual([true])

      // 更新 modelValue prop 以模拟 v-model 绑定
      await rerender({ modelValue: true, activeValue: true, inactiveValue: false })

      await fireEvent.click(button)
      expect(emitted('update:modelValue')![1]).toEqual([false])
    })
  })

  describe('插槽', () => {
    it('渲染 label 插槽内容', () => {
      const { container } = render(Switch, {
        slots: {
          label: '<span class="custom-label">Custom Label</span>',
        },
      })
      const customLabel = container.querySelector('.custom-label')

      expect(customLabel).toBeTruthy()
      expect(customLabel?.textContent).toContain('Custom Label')
    })

    it('渲染 active 插槽内容', () => {
      const { container } = render(Switch, {
        props: { modelValue: true },
        slots: {
          active: '<svg class="test-icon" data-test="active"></svg>',
        },
      })
      const icon = container.querySelector('[data-test="active"]')

      expect(icon).toBeTruthy()
    })

    it('渲染 inactive 插槽内容', () => {
      const { container } = render(Switch, {
        props: { modelValue: false },
        slots: {
          inactive: '<svg class="test-icon" data-test="inactive"></svg>',
        },
      })
      const icon = container.querySelector('[data-test="inactive"]')

      expect(icon).toBeTruthy()
    })
  })

  describe('点击事件', () => {
    it('触发 click 事件', async () => {
      const onClick = vi.fn()
      const { container } = render(Switch, {
        props: { onClick },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('click 事件包含 MouseEvent', async () => {
      const onClick = vi.fn()
      const { container } = render(Switch, {
        props: { onClick },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent))
    })

    it('禁用状态不触发 click 事件', async () => {
      const onClick = vi.fn()
      const { container } = render(Switch, {
        props: { disabled: true, onClick },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Switch, {
        props: { class: 'custom-class' },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('custom-class')
    })

    it('保持基础类名', () => {
      const { container } = render(Switch, {
        props: { class: 'custom-class' },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('relative')
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('rounded-full')
      expect(button).toHaveClass('custom-class')
    })

    it('包含过渡动画类', () => {
      const { container } = render(Switch)
      const button = container.querySelector('button')

      expect(button).toHaveClass('transition-colors')
      expect(button).toHaveClass('duration-200')
    })
  })

  describe('滑块', () => {
    it('未选中时滑块在左侧', () => {
      const { container } = render(Switch, {
        props: { modelValue: false },
      })
      const thumb = container.querySelector('.pointer-events-none')

      expect(thumb).toHaveClass('translate-x-0')
      expect(thumb?.getAttribute('data-state')).toBe('unchecked')
    })

    it('选中时滑块向右移动', () => {
      const { container } = render(Switch, {
        props: { modelValue: true },
      })
      const thumb = container.querySelector('.pointer-events-none')

      expect(thumb?.getAttribute('data-state')).toBe('checked')
    })

    it('不同尺寸有不同的滑块大小', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Switch, {
          props: { size },
        })
        const thumb = container.querySelector('.pointer-events-none')

        expect(thumb).toBeTruthy()

        if (size === 'sm') {
          expect(thumb).toHaveClass('h-4')
          expect(thumb).toHaveClass('w-4')
        } else if (size === 'md') {
          expect(thumb).toHaveClass('h-5')
          expect(thumb).toHaveClass('w-5')
        } else if (size === 'lg') {
          expect(thumb).toHaveClass('h-6')
          expect(thumb).toHaveClass('w-6')
        }
      }
    })
  })

  describe('可访问性', () => {
    it('有正确的 role 属性', () => {
      const { container } = render(Switch)
      const button = container.querySelector('button')

      expect(button).toHaveAttribute('role', 'switch')
    })

    it('有正确的 aria-checked 属性', () => {
      const { container } = render(Switch, {
        props: { modelValue: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveAttribute('aria-checked', 'true')
    })

    it('有正确的 aria-disabled 属性', () => {
      const { container } = render(Switch, {
        props: { disabled: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('有正确的 aria-label 属性', () => {
      const { container } = render(Switch, {
        props: { label: 'Enable notifications' },
      })
      const button = container.querySelector('button')

      expect(button).toHaveAttribute('aria-label', 'Enable notifications')
    })

    it('包含 focus-visible 样式', () => {
      const { container } = render(Switch)
      const button = container.querySelector('button')

      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('边角情况', () => {
    it('处理没有 props 的情况', () => {
      const { container } = render(Switch)
      const button = container.querySelector('button')

      expect(button).toBeTruthy()
    })

    it('处理同时有 beforeChange 和 loading', async () => {
      const beforeChange = vi.fn(() => true)
      const { container, emitted } = render(Switch, {
        props: {
          loading: true,
          beforeChange,
        },
      })
      const button = container.querySelector('button')!

      await fireEvent.click(button)

      expect(beforeChange).not.toHaveBeenCalled()
      expect(emitted('update:modelValue')).toBeFalsy()
    })

    it('处理同时有 disabled 和 loading', () => {
      const { container } = render(Switch, {
        props: {
          disabled: true,
          loading: true,
        },
      })
      const button = container.querySelector('button')

      expect(button).toBeDisabled()
    })

    it('处理最小尺寸 sm', () => {
      const { container } = render(Switch, {
        props: { size: 'sm' },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('h-5')
      expect(button).toHaveClass('w-9')
    })

    it('处理最大尺寸 lg', () => {
      const { container } = render(Switch, {
        props: { size: 'lg' },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('h-7')
      expect(button).toHaveClass('w-13')
    })
  })

  describe('颜色和状态组合', () => {
    it('primary 颜色选中状态', () => {
      const { container } = render(Switch, {
        props: { color: 'primary', modelValue: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('bg-primary-500')
    })

    it('success 颜色选中状态', () => {
      const { container } = render(Switch, {
        props: { color: 'success', modelValue: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('bg-success-DEFAULT')
    })

    it('warning 颜色选中状态', () => {
      const { container } = render(Switch, {
        props: { color: 'warning', modelValue: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('bg-warning-DEFAULT')
    })

    it('danger 颜色选中状态', () => {
      const { container } = render(Switch, {
        props: { color: 'danger', modelValue: true },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('bg-danger-DEFAULT')
    })
  })
})
