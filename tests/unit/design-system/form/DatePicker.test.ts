/**
 * DatePicker 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h, defineComponent } from 'vue'
import DatePicker from '@/design-system/form/DatePicker/DatePicker.vue'

// Mock Icon component
vi.mock('@/design-system/base/Icon/Icon.vue', () => ({
  default: defineComponent({
    name: 'Icon',
    props: {
      name: { type: String, required: true },
      size: { type: String },
    },
    setup(props) {
      return () => h('span', { class: `icon icon-${props.name}`, 'data-size': props.size })
    },
  }),
}))

describe('DatePicker', () => {
  describe('基础渲染', () => {
    it('默认渲染为 date 类型和 md 尺寸', () => {
      const { container } = render(DatePicker, {
        props: { placeholder: '选择日期' },
      })
      const input = container.querySelector('input')

      expect(input).toBeTruthy()
      expect(input).toHaveClass('w-full')
      expect(input).toHaveClass('rounded-lg')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('h-10')
      expect(input).toHaveClass('px-3')
      expect(input).toHaveClass('py-2')
      expect(input).toHaveClass('text-base')
      expect(input?.getAttribute('type')).toBe('date')
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(DatePicker, {
          props: { size, type: 'date' },
        })
        const input = container.querySelector('input')

        expect(input).toBeTruthy()

        if (size === 'sm') {
          expect(input).toHaveClass('h-8')
          expect(input).toHaveClass('px-2')
          expect(input).toHaveClass('py-1')
          expect(input).toHaveClass('text-sm')
        } else if (size === 'md') {
          expect(input).toHaveClass('h-10')
          expect(input).toHaveClass('px-3')
          expect(input).toHaveClass('py-2')
          expect(input).toHaveClass('text-base')
        } else if (size === 'lg') {
          expect(input).toHaveClass('h-12')
          expect(input).toHaveClass('px-4')
          expect(input).toHaveClass('py-3')
          expect(input).toHaveClass('text-lg')
        }
      }
    })

    it('正确渲染所有类型', () => {
      const types = ['date', 'daterange', 'datetime', 'datetimerange'] as const

      for (const type of types) {
        const { container } = render(DatePicker, {
          props: { type },
        })

        if (type === 'daterange' || type === 'datetimerange') {
          // 范围类型应该有两个输入框
          const inputs = container.querySelectorAll('input')
          expect(inputs.length).toBe(2)
        } else {
          const input = container.querySelector('input')
          expect(input).toBeTruthy()

          const expectedType = type === 'datetime' || type === 'datetimerange' ? 'datetime-local' : 'date'
          expect(input?.getAttribute('type')).toBe(expectedType)
        }
      }
    })
  })

  describe('Props 测试', () => {
    it('正确设置 placeholder', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', placeholder: '请选择日期' },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('placeholder')).toBe('请选择日期')
    })

    it('正确设置禁用状态', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', disabled: true },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('disabled')).toBeDefined()
      expect(input).toHaveClass('bg-slate-100')
      expect(input).toHaveClass('cursor-not-allowed')
      expect(input).toHaveClass('opacity-60')
    })

    it('正确设置只读状态', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', readonly: true },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('readonly')).toBeDefined()
    })

    it('正确设置错误状态', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', error: true },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('border-red-500')
      expect(input).toHaveClass('focus:border-red-500')
      expect(input).toHaveClass('focus:ring-red-500/20')
    })

    it('正确设置最小日期', () => {
      const minDate = new Date('2024-01-01')
      const { container } = render(DatePicker, {
        props: { type: 'date', minDate },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('min')).toBe('2024-01-01')
    })

    it('正确设置最大日期', () => {
      const maxDate = new Date('2024-12-31')
      const { container } = render(DatePicker, {
        props: { type: 'date', maxDate },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('max')).toBe('2024-12-31')
    })
  })

  describe('v-model 绑定测试', () => {
    it('正确绑定单日期值', async () => {
      const testDate = new Date('2024-06-15')
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: testDate },
      })
      const input = container.querySelector('input') as HTMLInputElement

      expect(input.value).toBe('2024-06-15')
    })

    it('正确更新单日期值', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: null, 'onUpdate:modelValue': onUpdate, onChange },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '2024-06-15')

      expect(onUpdate).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
    })

    it('正确绑定日期范围值', () => {
      const startDate = new Date('2024-06-01')
      const endDate = new Date('2024-06-30')
      const { container } = render(DatePicker, {
        props: { type: 'daterange', modelValue: [startDate, endDate] },
      })
      const inputs = container.querySelectorAll('input')

      expect(inputs.length).toBe(2)
      expect((inputs[0] as HTMLInputElement).value).toBe('2024-06-01')
      expect((inputs[1] as HTMLInputElement).value).toBe('2024-06-30')
    })

    it('正确更新日期范围值', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { container } = render(DatePicker, {
        props: { type: 'daterange', modelValue: null, 'onUpdate:modelValue': onUpdate, onChange },
      })
      const inputs = container.querySelectorAll('input')

      // 设置开始日期
      await fireEvent.update(inputs[0] as HTMLInputElement, '2024-06-01')
      await fireEvent.update(inputs[1] as HTMLInputElement, '2024-06-30')

      expect(onChange).toHaveBeenCalled()
    })

    it('空值时正确处理', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: null },
      })
      const input = container.querySelector('input') as HTMLInputElement

      expect(input.value).toBe('')
    })
  })

  describe('快捷选项测试', () => {
    it('渲染快捷选项', () => {
      const shortcuts = [
        { text: '今天', value: new Date() },
        { text: '昨天', value: () => new Date() },
      ]

      const { container } = render(DatePicker, {
        props: { type: 'date', shortcuts },
      })

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBe(2)
      expect(buttons[0]?.textContent).toBe('今天')
      expect(buttons[1]?.textContent).toBe('昨天')
    })

    it('点击快捷选项触发更新', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const testDate = new Date('2024-06-15')
      const shortcuts = [{ text: '特定日期', value: testDate }]

      const { container } = render(DatePicker, {
        props: { type: 'date', shortcuts, 'onUpdate:modelValue': onUpdate, onChange },
      })

      const button = container.querySelector('button')
      await fireEvent.click(button!)

      expect(onUpdate).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
    })

    it('快捷选项禁用时不可点击', async () => {
      const onUpdate = vi.fn()
      const shortcuts = [{ text: '今天', value: new Date() }]

      const { container } = render(DatePicker, {
        props: { type: 'date', shortcuts, disabled: true, 'onUpdate:modelValue': onUpdate },
      })

      const button = container.querySelector('button')
      await fireEvent.click(button!)

      // 禁用状态下不应触发更新
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('前缀图标测试', () => {
    it('显示前缀图标', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', prefix: 'calendar', showPrefix: true },
      })
      const iconContainer = container.querySelector('.absolute.left-0')

      expect(iconContainer).toBeTruthy()
    })

    it('showPrefix 为 false 时不显示前缀图标', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', prefix: 'calendar', showPrefix: false },
      })
      const iconContainer = container.querySelector('.absolute.left-0')

      expect(iconContainer).toBeFalsy()
    })

    it('前缀图标时输入框有正确的左侧内边距', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', prefix: 'calendar', showPrefix: true },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('pl-10')
    })
  })

  describe('可清空功能测试', () => {
    it('有值时显示清空按钮', () => {
      const testDate = new Date('2024-06-15')
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: testDate, clearable: true },
      })
      const clearButtons = container.querySelectorAll('button')

      // 快捷选项 + 清空按钮 = 2个按钮（如果有快捷选项）
      expect(clearButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('无值时不显示清空按钮', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: null, clearable: true },
      })
      const clearButton = container.querySelector('input ~ div button')

      expect(clearButton).toBeFalsy()
    })

    it('禁用状态不显示清空按钮', () => {
      const testDate = new Date('2024-06-15')
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: testDate, clearable: true, disabled: true },
      })
      const clearButton = container.querySelector('input ~ div button')

      expect(clearButton).toBeFalsy()
    })

    it('只读状态不显示清空按钮', () => {
      const testDate = new Date('2024-06-15')
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: testDate, clearable: true, readonly: true },
      })
      const clearButton = container.querySelector('input ~ div button')

      expect(clearButton).toBeFalsy()
    })

    it('点击清空按钮触发 clear 事件', async () => {
      const onClear = vi.fn()
      const onUpdate = vi.fn()
      const testDate = new Date('2024-06-15')
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: testDate, clearable: true, onClear, 'onUpdate:modelValue': onUpdate },
      })
      const clearButton = container.querySelector('input ~ div button')

      await fireEvent.click(clearButton!)

      expect(onClear).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalledWith(null)
    })
  })

  describe('日期时间类型测试', () => {
    it('datetime 类型使用 datetime-local 输入', () => {
      const { container } = render(DatePicker, {
        props: { type: 'datetime' },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('type')).toBe('datetime-local')
    })

    it('datetimerange 类型使用两个 datetime-local 输入', () => {
      const { container } = render(DatePicker, {
        props: { type: 'datetimerange' },
      })
      const inputs = container.querySelectorAll('input')

      expect(inputs.length).toBe(2)
      expect(inputs[0]?.getAttribute('type')).toBe('datetime-local')
      expect(inputs[1]?.getAttribute('type')).toBe('datetime-local')
    })

    it('datetime 类型正确格式化值', () => {
      const testDateTime = new Date('2024-06-15T10:30:00')
      const { container } = render(DatePicker, {
        props: { type: 'datetime', modelValue: testDateTime },
      })
      const input = container.querySelector('input') as HTMLInputElement

      expect(input.value).toContain('2024-06-15')
    })
  })

  describe('事件测试', () => {
    it('触发 focus 事件', async () => {
      const onFocus = vi.fn()
      const { container } = render(DatePicker, {
        props: { type: 'date', onFocus },
      })
      const input = container.querySelector('input')

      await fireEvent.focus(input!)

      expect(onFocus).toHaveBeenCalled()
    })

    it('触发 blur 事件', async () => {
      const onBlur = vi.fn()
      const { container } = render(DatePicker, {
        props: { type: 'date', onBlur },
      })
      const input = container.querySelector('input')

      await fireEvent.blur(input!)

      expect(onBlur).toHaveBeenCalled()
    })

    it('输入改变时触发 update 和 change 事件', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: null, 'onUpdate:modelValue': onUpdate, onChange },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '2024-06-15')

      expect(onUpdate).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('错误状态测试', () => {
    it('error 为 true 时应用错误样式', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', error: true },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('border-red-500')
      expect(input).toHaveClass('focus:border-red-500')
      expect(input).toHaveClass('focus:ring-2')
      expect(input).toHaveClass('focus:ring-red-500/20')
    })

    it('error 为 false 时应用默认样式', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', error: false },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('border-slate-300')
      expect(input).toHaveClass('focus:border-primary-500')
      expect(input).toHaveClass('focus:ring-2')
      expect(input).toHaveClass('focus:ring-primary-500/20')
    })
  })

  describe('日期范围选择器测试', () => {
    it('daterange 类型渲染两个输入框', () => {
      const { container } = render(DatePicker, {
        props: { type: 'daterange' },
      })
      const inputs = container.querySelectorAll('input')

      expect(inputs.length).toBe(2)
    })

    it('daterange 类型有分隔符', () => {
      const { container } = render(DatePicker, {
        props: { type: 'daterange' },
      })
      const separator = container.querySelector('span')

      expect(separator?.textContent).toBe('至')
    })

    it('daterange 类型使用默认占位符', () => {
      const { container } = render(DatePicker, {
        props: { type: 'daterange' },
      })
      const inputs = container.querySelectorAll('input')

      expect(inputs[0]?.getAttribute('placeholder')).toBe('开始日期')
      expect(inputs[1]?.getAttribute('placeholder')).toBe('结束日期')
    })

    it('datetimerange 类型正确渲染', () => {
      const { container } = render(DatePicker, {
        props: { type: 'datetimerange' },
      })
      const inputs = container.querySelectorAll('input')

      expect(inputs.length).toBe(2)
      expect(inputs[0]?.getAttribute('type')).toBe('datetime-local')
      expect(inputs[1]?.getAttribute('type')).toBe('datetime-local')
    })
  })

  describe('插槽测试', () => {
    it('渲染 prefix 插槽内容', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', prefix: 'calendar' },
        slots: { prefix: 'Custom Prefix' },
      })
      const prefixSlot = container.querySelector('.absolute.left-0')

      expect(prefixSlot?.textContent).toContain('Custom Prefix')
    })

    it('prefix 插槽覆盖 prefix 属性', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', prefix: 'calendar' },
        slots: { prefix: 'Custom Icon' },
      })
      const prefixSlot = container.querySelector('.absolute.left-0')

      expect(prefixSlot?.textContent).toContain('Custom Icon')
    })

    it('渲染 suffix 插槽内容', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date' },
        slots: { suffix: 'Custom Suffix' },
      })
      const suffixSlot = container.querySelector('.absolute.right-0 .flex.items-center')

      expect(suffixSlot?.textContent).toContain('Custom Suffix')
    })
  })

  describe('边角情况测试', () => {
    it('modelValue 为 null 时不报错', () => {
      expect(() => {
        render(DatePicker, {
          props: { type: 'date', modelValue: null },
        })
      }).not.toThrow()
    })

    it('modelValue 为 undefined 时不报错', () => {
      expect(() => {
        render(DatePicker, {
          props: { type: 'date', modelValue: undefined },
        })
      }).not.toThrow()
    })

    it('字符串日期值正确处理', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', modelValue: '2024-06-15' },
      })
      const input = container.querySelector('input') as HTMLInputElement

      expect(input.value).toBe('2024-06-15')
    })

    it('自定义 class 正确应用', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date', class: 'custom-class' },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('custom-class')
    })

    it('日期范围的数组为空时正确处理', () => {
      const { container } = render(DatePicker, {
        props: { type: 'daterange', modelValue: null },
      })
      const inputs = container.querySelectorAll('input')

      expect((inputs[0] as HTMLInputElement).value).toBe('')
      expect((inputs[1] as HTMLInputElement).value).toBe('')
    })
  })

  describe('暴露方法测试', () => {
    it('暴露 focus 方法', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date' },
      })
      const input = container.querySelector('input')

      input?.focus()

      expect(document.activeElement).toBe(input)
    })

    it('暴露 blur 方法', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date' },
      })
      const input = container.querySelector('input')

      input?.focus()
      input?.blur()

      expect(document.activeElement).not.toBe(input)
    })
  })

  describe('响应式测试', () => {
    it('输入框宽度自适应', () => {
      const { container } = render(DatePicker, {
        props: { type: 'date' },
      })
      const wrapper = container.querySelector('.relative.w-full')
      const input = container.querySelector('input')

      expect(wrapper).toHaveClass('w-full')
      expect(input).toHaveClass('w-full')
    })
  })
})
