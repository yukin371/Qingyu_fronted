/**
 * Input 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import Input from '@/design-system/form/Input/Input.vue'

describe('Input', () => {
  describe('基础渲染', () => {
    it('默认渲染为 text 类型和 md 尺寸', () => {
      const { container } = render(Input, {
        props: { placeholder: '请输入内容' },
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
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Input, {
          props: { size, placeholder: '测试' },
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

    it('正确渲染所有输入类型', () => {
      const types = ['text', 'password', 'email', 'number', 'tel', 'url'] as const

      for (const type of types) {
        const { container } = render(Input, {
          props: { type, placeholder: '测试' },
        })
        const input = container.querySelector('input')

        expect(input).toBeTruthy()
        expect(input?.getAttribute('type')).toBe(type)
      }
    })
  })

  describe('Props 测试', () => {
    it('正确设置 placeholder', () => {
      const { container } = render(Input, {
        props: { placeholder: '请输入用户名' },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('placeholder')).toBe('请输入用户名')
    })

    it('正确设置禁用状态', () => {
      const { container } = render(Input, {
        props: { disabled: true },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('disabled')).toBeDefined()
      expect(input).toHaveClass('bg-slate-100')
      expect(input).toHaveClass('cursor-not-allowed')
      expect(input).toHaveClass('opacity-60')
    })

    it('正确设置只读状态', () => {
      const { container } = render(Input, {
        props: { readonly: true },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('readonly')).toBeDefined()
    })

    it('正确设置错误状态', () => {
      const { container } = render(Input, {
        props: { error: true },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('border-red-500')
      expect(input).toHaveClass('focus:border-red-500')
      expect(input).toHaveClass('focus:ring-red-500/20')
    })

    it('正确设置 maxlength', () => {
      const { container } = render(Input, {
        props: { maxlength: 50 },
      })
      const input = container.querySelector('input')

      expect(input?.getAttribute('maxlength')).toBe('50')
    })
  })

  describe('v-model 绑定测试', () => {
    it('正确绑定 string 类型值', async () => {
      const { container } = render(Input, {
        props: { modelValue: '' },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '测试内容')

      expect(input.value).toBe('测试内容')
    })

    it('正确绑定 number 类型值', async () => {
      const { container } = render(Input, {
        props: { type: 'number', modelValue: '' },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '123')

      expect(input.value).toBe('123')
    })

    it('正确更新 modelValue', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Input, {
        props: { modelValue: '', 'onUpdate:modelValue': onUpdate },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '新值')

      expect(onUpdate).toHaveBeenCalledWith('新值')
    })

    it('数字类型正确转换为数字', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Input, {
        props: { type: 'number', modelValue: '', 'onUpdate:modelValue': onUpdate },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '42')

      expect(onUpdate).toHaveBeenCalledWith(42)
    })
  })

  describe('前缀/后缀图标测试', () => {
    it('显示前缀图标', () => {
      const { container } = render(Input, {
        props: { prefix: 'user' },
      })
      const iconContainer = container.querySelector('.absolute.left-0')

      expect(iconContainer).toBeTruthy()
    })

    it('显示后缀图标', () => {
      const { container } = render(Input, {
        props: { suffix: 'check' },
      })
      const iconContainer = container.querySelector('.absolute.right-0')

      expect(iconContainer).toBeTruthy()
    })

    it('同时显示前缀和后缀图标', () => {
      const { container } = render(Input, {
        props: { prefix: 'user', suffix: 'check' },
      })
      const prefixIcon = container.querySelector('.absolute.left-0')
      const suffixIcon = container.querySelector('.absolute.right-0')

      expect(prefixIcon).toBeTruthy()
      expect(suffixIcon).toBeTruthy()
    })

    it('前缀图标时输入框有正确的左侧内边距', () => {
      const { container } = render(Input, {
        props: { prefix: 'user' },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('pl-10')
    })

    it('后缀图标时输入框有正确的右侧内边距', () => {
      const { container } = render(Input, {
        props: { suffix: 'check' },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('pr-10')
    })
  })

  describe('插槽测试', () => {
    it('渲染 prepend 插槽内容', () => {
      const { container } = render(Input, {
        slots: { prepend: 'https://' },
      })
      const prependSlot = container.querySelector('.inline-flex.items-center.px-3')

      expect(prependSlot).toBeTruthy()
      expect(prependSlot?.textContent).toContain('https://')
    })

    it('渲染 append 插槽内容', () => {
      const { container } = render(Input, {
        slots: { append: '.com' },
      })
      const appendSlot = container.querySelectorAll('.inline-flex.items-center.px-3')

      expect(appendSlot.length).toBe(1)
      expect(appendSlot[0]?.textContent).toContain('.com')
    })

    it('同时渲染 prepend 和 append 插槽', () => {
      const { container } = render(Input, {
        slots: { prepend: 'https://', append: '.com' },
      })
      const slots = container.querySelectorAll('.inline-flex.items-center.px-3')

      expect(slots.length).toBe(2)
    })

    it('prefix 插槽覆盖 prefix 属性', () => {
      const { container } = render(Input, {
        props: { prefix: 'user' },
        slots: { prefix: 'Custom Prefix' },
      })
      const prefixSlot = container.querySelector('.absolute.left-0')

      expect(prefixSlot?.textContent).toContain('Custom Prefix')
    })

    it('suffix 插槽覆盖 suffix 属性', () => {
      const { container } = render(Input, {
        props: { suffix: 'check' },
        slots: { suffix: 'Custom Suffix' },
      })
      const suffixSlot = container.querySelector('.absolute.right-0 .flex.items-center')

      expect(suffixSlot?.textContent).toContain('Custom Suffix')
    })
  })

  describe('可清空功能测试', () => {
    it('有值时显示清空按钮', () => {
      const { container } = render(Input, {
        props: { modelValue: '测试内容', clearable: true },
      })
      const clearButton = container.querySelector('button')

      expect(clearButton).toBeTruthy()
    })

    it('无值时不显示清空按钮', () => {
      const { container } = render(Input, {
        props: { modelValue: '', clearable: true },
      })
      const clearButton = container.querySelector('button')

      expect(clearButton).toBeFalsy()
    })

    it('禁用状态不显示清空按钮', () => {
      const { container } = render(Input, {
        props: { modelValue: '测试', clearable: true, disabled: true },
      })
      const clearButton = container.querySelector('button')

      expect(clearButton).toBeFalsy()
    })

    it('只读状态不显示清空按钮', () => {
      const { container } = render(Input, {
        props: { modelValue: '测试', clearable: true, readonly: true },
      })
      const clearButton = container.querySelector('button')

      expect(clearButton).toBeFalsy()
    })

    it('点击清空按钮触发 clear 事件', async () => {
      const onClear = vi.fn()
      const onUpdate = vi.fn()
      const { container } = render(Input, {
        props: { modelValue: '测试内容', clearable: true, onClear, 'onUpdate:modelValue': onUpdate },
      })
      const clearButton = container.querySelector('button')

      await fireEvent.click(clearButton!)

      expect(onClear).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalledWith('')
    })

    it('清空后重新聚焦输入框', async () => {
      const { container } = render(Input, {
        props: { modelValue: '测试内容', clearable: true },
      })
      const clearButton = container.querySelector('button')
      const input = container.querySelector('input')

      input?.blur()
      await fireEvent.click(clearButton!)

      expect(document.activeElement).toBe(input)
    })
  })

  describe('字数统计测试', () => {
    it('showCount 和 maxlength 都设置时显示字数统计', () => {
      const { container } = render(Input, {
        props: { showCount: true, maxlength: 50, modelValue: '测试' },
      })
      const countDisplay = container.querySelector('.text-xs.text-slate-400')

      expect(countDisplay).toBeTruthy()
      expect(countDisplay?.textContent).toContain('2/50')
    })

    it('正确计算字符长度', () => {
      const { container } = render(Input, {
        props: { showCount: true, maxlength: 100, modelValue: 'Hello World' },
      })
      const countDisplay = container.querySelector('.text-xs.text-slate-400')

      expect(countDisplay?.textContent).toContain('11/100')
    })

    it('空值显示为 0', () => {
      const { container } = render(Input, {
        props: { showCount: true, maxlength: 50, modelValue: '' },
      })
      const countDisplay = container.querySelector('.text-xs.text-slate-400')

      expect(countDisplay?.textContent).toContain('0/50')
    })

    it('超出长度时显示红色', () => {
      const { container } = render(Input, {
        props: { showCount: true, maxlength: 5, modelValue: 'This is too long' },
      })
      const countDisplay = container.querySelector('.text-xs')

      expect(countDisplay).toHaveClass('text-red-500')
    })
  })

  describe('事件测试', () => {
    it('触发 focus 事件', async () => {
      const onFocus = vi.fn()
      const { container } = render(Input, {
        props: { onFocus },
      })
      const input = container.querySelector('input')

      await fireEvent.focus(input!)

      expect(onFocus).toHaveBeenCalled()
    })

    it('触发 blur 事件', async () => {
      const onBlur = vi.fn()
      const { container } = render(Input, {
        props: { onBlur },
      })
      const input = container.querySelector('input')

      await fireEvent.blur(input!)

      expect(onBlur).toHaveBeenCalled()
    })

    it('触发 change 事件', async () => {
      const onChange = vi.fn()
      const { container } = render(Input, {
        props: { onChange },
      })
      const input = container.querySelector('input')

      await fireEvent.change(input!)

      expect(onChange).toHaveBeenCalled()
    })

    it('change 事件传递正确的值', async () => {
      const onChange = vi.fn()
      const { container } = render(Input, {
        props: { onChange, modelValue: '' },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '新值')
      await fireEvent.change(input)

      expect(onChange).toHaveBeenCalledWith('新值')
    })

    it('数字类型 change 事件传递数字值', async () => {
      const onChange = vi.fn()
      const { container } = render(Input, {
        props: { type: 'number', onChange, modelValue: '' },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '123')
      await fireEvent.change(input)

      expect(onChange).toHaveBeenCalledWith(123)
    })
  })

  describe('错误状态测试', () => {
    it('error 为 true 时应用错误样式', () => {
      const { container } = render(Input, {
        props: { error: true },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('border-red-500')
      expect(input).toHaveClass('focus:border-red-500')
      expect(input).toHaveClass('focus:ring-2')
      expect(input).toHaveClass('focus:ring-red-500/20')
    })

    it('error 为 false 时应用默认样式', () => {
      const { container } = render(Input, {
        props: { error: false },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('border-slate-300')
      expect(input).toHaveClass('focus:border-primary-500')
      expect(input).toHaveClass('focus:ring-2')
      expect(input).toHaveClass('focus:ring-primary-500/20')
    })
  })

  describe('边角情况测试', () => {
    it('modelValue 为 null 时不报错', () => {
      expect(() => {
        render(Input, {
          props: { modelValue: null as any },
        })
      }).not.toThrow()
    })

    it('modelValue 为 undefined 时不报错', () => {
      expect(() => {
        render(Input, {
          props: { modelValue: undefined },
        })
      }).not.toThrow()
    })

    it('数字类型输入空值时返回空字符串', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Input, {
        props: { type: 'number', modelValue: 123, 'onUpdate:modelValue': onUpdate },
      })
      const input = container.querySelector('input') as HTMLInputElement

      await fireEvent.update(input, '')

      expect(onUpdate).toHaveBeenCalledWith('')
    })

    it('同时有 suffix 和 clearable 时右侧内边距正确', () => {
      const { container } = render(Input, {
        props: { suffix: 'check', clearable: true, modelValue: 'test' },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('pr-16')
    })

    it('自定义 class 正确应用', () => {
      const { container } = render(Input, {
        props: { class: 'custom-class' },
      })
      const input = container.querySelector('input')

      expect(input).toHaveClass('custom-class')
    })

    it('所有尺寸的清空按钮都正确渲染', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Input, {
          props: { size, clearable: true, modelValue: 'test' },
        })
        const clearButton = container.querySelector('button')
        const svgIcon = clearButton?.querySelector('svg')

        expect(clearButton).toBeTruthy()
        expect(svgIcon).toBeTruthy()
      }
    })
  })

  describe('暴露方法测试', () => {
    it('暴露 focus 方法', () => {
      const { container } = render(Input)
      const input = container.querySelector('input')

      input?.focus()

      expect(document.activeElement).toBe(input)
    })

    it('暴露 blur 方法', () => {
      const { container } = render(Input)
      const input = container.querySelector('input')

      input?.focus()
      input?.blur()

      expect(document.activeElement).not.toBe(input)
    })
  })
})
