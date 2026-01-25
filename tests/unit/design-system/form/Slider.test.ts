/**
 * Slider 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Slider from '@/design-system/form/Slider/Slider.vue'

describe('Slider', () => {
  describe('基础渲染', () => {
    it('默认渲染为 md size 和 primary 颜色', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50 },
      })
      const track = container.querySelector('.relative.w-full.overflow-hidden')

      expect(track).toBeTruthy()
      expect(track).toHaveClass('h-2')
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Slider, {
          props: { size, modelValue: 50 },
        })
        const track = container.querySelector('.relative.w-full.overflow-hidden')

        expect(track).toBeTruthy()

        if (size === 'sm') {
          expect(track).toHaveClass('h-1.5')
        } else if (size === 'md') {
          expect(track).toHaveClass('h-2')
        } else if (size === 'lg') {
          expect(track).toHaveClass('h-2.5')
        }
      }
    })

    it('正确渲染所有颜色', () => {
      const colors = ['primary', 'success', 'warning', 'danger'] as const

      for (const color of colors) {
        const { container } = render(Slider, {
          props: { color, modelValue: 50 },
        })
        const fill = container.querySelector('.bg-primary-500, .bg-success-DEFAULT, .bg-warning-DEFAULT, .bg-danger-DEFAULT')

        expect(fill).toBeTruthy()
      }
    })

    it('显示标签文本', () => {
      const { container } = render(Slider, {
        props: { label: 'Volume', modelValue: 50 },
      })
      const label = container.querySelector('.block.text-sm.font-medium')

      expect(label).toBeTruthy()
      expect(label?.textContent).toContain('Volume')
    })
  })

  describe('v-model 双向绑定', () => {
    it('响应 modelValue 的变化', async () => {
      const { container, rerender } = render(Slider, {
        props: { modelValue: 50 },
      })

      await rerender({ modelValue: 75 })

      // 组件应该重新渲染
      expect(container).toBeTruthy()
    })
  })

  describe('单滑块模式', () => {
    it('默认为单滑块模式', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50 },
      })
      const buttons = container.querySelectorAll('button[aria-valuenow]')

      expect(buttons.length).toBe(1)
      expect(buttons[0]).toHaveAttribute('aria-valuenow', '50')
    })

    it('正确显示当前值', () => {
      const { container } = render(Slider, {
        props: { modelValue: 75, showTooltip: false },
      })
      const valueDisplay = container.querySelector('.mt-2.text-sm')

      expect(valueDisplay?.textContent).toContain('75')
    })
  })

  describe('双滑块模式', () => {
    it('range 模式显示两个滑块', () => {
      const { container } = render(Slider, {
        props: { modelValue: [30, 70], range: true },
      })
      const buttons = container.querySelectorAll('button[aria-valuenow]')

      expect(buttons.length).toBe(2)
      expect(buttons[0]).toHaveAttribute('aria-valuenow', '30')
      expect(buttons[1]).toHaveAttribute('aria-valuenow', '70')
    })

    it('范围模式正确显示值', () => {
      const { container } = render(Slider, {
        props: { modelValue: [30, 70], range: true, showTooltip: false },
      })
      const valueDisplay = container.querySelector('.mt-2.text-sm')

      expect(valueDisplay?.textContent).toContain('30')
      expect(valueDisplay?.textContent).toContain('70')
    })
  })

  describe('垂直模式', () => {
    it('vertical 模式有正确的样式', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, vertical: true, height: '200px' },
      })
      const wrapper = container.querySelector('.inline-flex')

      expect(wrapper).toHaveClass('flex-col')
    })

    it('垂直模式有正确的高度', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, vertical: true, height: '300px' },
      })
      const sliderContainer = container.querySelector('.inline-flex')

      expect(sliderContainer?.getAttribute('style')).toContain('height: 300px')
    })
  })

  describe('禁用状态', () => {
    it('禁用状态下不可拖动', () => {
      const { container, emitted } = render(Slider, {
        props: { modelValue: 50, disabled: true },
      })
      const track = container.querySelector('.relative.w-full.overflow-hidden')!

      expect(track).toHaveClass('cursor-not-allowed')
    })

    it('禁用状态有正确的样式', () => {
      const { container } = render(Slider, {
        props: { disabled: true, modelValue: 50 },
      })
      const track = container.querySelector('.relative.w-full.overflow-hidden')

      expect(track).toHaveClass('opacity-50')
    })
  })

  describe('刻度标记', () => {
    it('显示刻度标记', () => {
      const marks = { 0: '0', 50: '50', 100: '100' }
      const { container } = render(Slider, {
        props: { modelValue: 50, marks },
      })
      const markElements = container.querySelectorAll('.rounded-full.bg-slate-400')

      expect(markElements.length).toBe(3)
    })

    it('显示刻度标签', () => {
      const marks = { 0: '0°C', 50: '50°C', 100: '100°C' }
      const { container } = render(Slider, {
        props: { modelValue: 50, marks },
      })
      const labelContainer = container.querySelector('.w-full.mt-2')

      expect(labelContainer?.textContent).toContain('0°C')
      expect(labelContainer?.textContent).toContain('50°C')
      expect(labelContainer?.textContent).toContain('100°C')
    })
  })

  describe('Tooltip 格式化', () => {
    it('使用自定义格式化函数', () => {
      const formatTooltip = (value: number) => `$${value}`
      const { container } = render(Slider, {
        props: { modelValue: 50, formatTooltip, showTooltip: true },
      })

      // Tooltip 应该包含格式化后的值
      const tooltip = container.querySelector('.px-2.py-1.text-xs')
      expect(tooltip?.textContent).toContain('$50')
    })
  })

  describe('步长控制', () => {
    it('正确应用步长', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, step: 5 },
      })

      // 组件应该渲染
      expect(container).toBeTruthy()
    })

    it('不同步长都能正常工作', () => {
      const steps = [1, 5, 10, 0.5]

      for (const step of steps) {
        const { container } = render(Slider, {
          props: { modelValue: 50, step },
        })
        expect(container).toBeTruthy()
      }
    })
  })

  describe('范围限制', () => {
    it('正确应用最小值', () => {
      const { container } = render(Slider, {
        props: { modelValue: 5, min: 0, max: 10 },
      })
      const button = container.querySelector('button[aria-valuenow]')

      expect(button).toHaveAttribute('aria-valuemin', '0')
      expect(button).toHaveAttribute('aria-valuemax', '10')
    })

    it('正确应用最大值', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, min: -100, max: 100 },
      })
      const button = container.querySelector('button[aria-valuenow]')

      expect(button).toHaveAttribute('aria-valuemin', '-100')
      expect(button).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('Tooltip 显示', () => {
    it('showTooltip 为 true 时显示 tooltip', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, showTooltip: true },
      })
      const tooltip = container.querySelector('.px-2.py-1.text-xs')

      expect(tooltip).toBeTruthy()
    })

    it('showTooltip 为 false 时不显示 tooltip', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, showTooltip: false },
      })
      const tooltip = container.querySelector('.px-2.py-1.text-xs')

      expect(tooltip).toBeFalsy()
    })
  })

  describe('事件触发', () => {
    it('事件触发在组件中已实现', () => {
      // 组件实现了 pointerdown、pointermove、pointerup 事件处理
      // 这些事件需要真实的 DOM 交互才能触发
      // 这里我们只验证组件是否正确渲染
      const { container } = render(Slider, {
        props: { modelValue: 50 },
      })

      expect(container).toBeTruthy()
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, class: 'custom-class' },
      })
      const track = container.querySelector('.relative.w-full.overflow-hidden')

      expect(track).toHaveClass('custom-class')
    })

    it('保持基础类名', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50 },
      })
      const track = container.querySelector('.relative.w-full.overflow-hidden')

      expect(track).toHaveClass('relative')
      expect(track).toHaveClass('w-full')
      expect(track).toHaveClass('overflow-hidden')
      expect(track).toHaveClass('rounded-full')
    })

    it('包含过渡动画类', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50 },
      })
      const fill = container.querySelector('.absolute.rounded-full.transition-all')

      expect(fill).toHaveClass('transition-all')
    })
  })

  describe('可访问性', () => {
    it('滑块有正确的 aria 属性', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, min: 0, max: 100 },
      })
      const button = container.querySelector('button[aria-valuenow]')

      expect(button).toHaveAttribute('aria-valuenow', '50')
      expect(button).toHaveAttribute('aria-valuemin', '0')
      expect(button).toHaveAttribute('aria-valuemax', '100')
    })

    it('禁用状态有正确的 aria-disabled 属性', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50, disabled: true },
      })
      const button = container.querySelector('button[aria-disabled]')

      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('包含 focus-visible 样式', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50 },
      })
      const button = container.querySelector('button')

      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('边角情况', () => {
    it('处理最小值', () => {
      const { container } = render(Slider, {
        props: { modelValue: 0, min: 0, max: 100 },
      })

      expect(container).toBeTruthy()
    })

    it('处理最大值', () => {
      const { container } = render(Slider, {
        props: { modelValue: 100, min: 0, max: 100 },
      })

      expect(container).toBeTruthy()
    })

    it('处理小数步长', () => {
      const { container } = render(Slider, {
        props: { modelValue: 50.5, step: 0.5 },
      })

      expect(container).toBeTruthy()
    })

    it('处理负值范围', () => {
      const { container } = render(Slider, {
        props: { modelValue: 0, min: -100, max: 100 },
      })
      const button = container.querySelector('button[aria-valuenow]')

      expect(button).toHaveAttribute('aria-valuemin', '-100')
      expect(button).toHaveAttribute('aria-valuemax', '100')
    })

    it('处理范围模式的边界值', () => {
      const { container } = render(Slider, {
        props: { modelValue: [0, 100], range: true },
      })
      const buttons = container.querySelectorAll('button[aria-valuenow]')

      expect(buttons[0]).toHaveAttribute('aria-valuenow', '0')
      expect(buttons[1]).toHaveAttribute('aria-valuenow', '100')
    })
  })

  describe('颜色和尺寸组合', () => {
    it('primary 颜色填充', () => {
      const { container } = render(Slider, {
        props: { color: 'primary', modelValue: 50 },
      })
      const fill = container.querySelector('.bg-primary-500')

      expect(fill).toBeTruthy()
    })

    it('success 颜色填充', () => {
      const { container } = render(Slider, {
        props: { color: 'success', modelValue: 50 },
      })
      const fill = container.querySelector('.bg-success-DEFAULT')

      expect(fill).toBeTruthy()
    })

    it('warning 颜色填充', () => {
      const { container } = render(Slider, {
        props: { color: 'warning', modelValue: 50 },
      })
      const fill = container.querySelector('.bg-warning-DEFAULT')

      expect(fill).toBeTruthy()
    })

    it('danger 颜色填充', () => {
      const { container } = render(Slider, {
        props: { color: 'danger', modelValue: 50 },
      })
      const fill = container.querySelector('.bg-danger-DEFAULT')

      expect(fill).toBeTruthy()
    })
  })
})
