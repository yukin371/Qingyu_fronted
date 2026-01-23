/**
 * Textarea 组件单元测试
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import Textarea from '@/design-system/base/Textarea/Textarea.vue'

describe('Textarea', () => {
  describe('基础渲染', () => {
    it('默认渲染为 md size', () => {
      const { getByRole } = render(Textarea)
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('px-4')
      expect(textarea).toHaveClass('py-3')
      expect(textarea).toHaveClass('text-base')
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach((size) => {
        const { getByRole, unmount } = render(Textarea, { props: { size } })
        const textarea = getByRole('textbox')

        if (size === 'sm') {
          expect(textarea).toHaveClass('px-3')
          expect(textarea).toHaveClass('py-2')
          expect(textarea).toHaveClass('text-sm')
        } else if (size === 'md') {
          expect(textarea).toHaveClass('px-4')
          expect(textarea).toHaveClass('py-3')
          expect(textarea).toHaveClass('text-base')
        } else if (size === 'lg') {
          expect(textarea).toHaveClass('px-5')
          expect(textarea).toHaveClass('py-4')
          expect(textarea).toHaveClass('text-lg')
        }

        unmount()
      })
    })
  })

  describe('Props 测试', () => {
    it('正确设置 placeholder', () => {
      const { getByRole } = render(Textarea, {
        props: { placeholder: '请输入内容' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('placeholder', '请输入内容')
    })

    it('正确设置 rows', () => {
      const { getByRole } = render(Textarea, { props: { rows: 5 } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('正确设置 disabled 状态', () => {
      const { getByRole } = render(Textarea, { props: { disabled: true } })
      const textarea = getByRole('textbox')

      expect(textarea).toBeDisabled()
    })

    it('正确设置 readonly 状态', () => {
      const { getByRole } = render(Textarea, { props: { readonly: true } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('readonly')
    })

    it('正确设置 maxlength', () => {
      const { getByRole } = render(Textarea, { props: { maxlength: 100 } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('maxlength', '100')
    })

    it('正确设置 minlength', () => {
      const { getByRole } = render(Textarea, { props: { minlength: 10 } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('minlength', '10')
    })

    it('正确设置 name 属性', () => {
      const { getByRole } = render(Textarea, { props: { name: 'content' } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('name', 'content')
    })

    it('正确设置 id 属性', () => {
      const { getByRole } = render(Textarea, { props: { id: 'my-textarea' } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('id', 'my-textarea')
    })

    it('正确设置 required 属性', () => {
      const { getByRole } = render(Textarea, { props: { required: true } })
      const textarea = getByRole('textbox')

      expect(textarea).toBeRequired()
    })

    it('正确设置 autofocus 属性', () => {
      const { getByRole } = render(Textarea, { props: { autofocus: true } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('autofocus')
    })

    it('正确设置 autocomplete 属性', () => {
      const { getByRole } = render(Textarea, {
        props: { autocomplete: 'off' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('autocomplete', 'off')
    })
  })

  describe('状态测试', () => {
    it('正确应用默认状态样式', () => {
      const { getByRole } = render(Textarea, {
        props: { state: 'default' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('border-slate-300')
    })

    it('正确应用错误状态样式', () => {
      const { getByRole } = render(Textarea, { props: { state: 'error' } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('border-danger-DEFAULT')
    })

    it('正确应用成功状态样式', () => {
      const { getByRole } = render(Textarea, {
        props: { state: 'success' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('border-success-DEFAULT')
    })

    it('正确应用警告状态样式', () => {
      const { getByRole } = render(Textarea, {
        props: { state: 'warning' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('border-warning-DEFAULT')
    })

    it('error 属性覆盖 state 属性', () => {
      const { getByRole } = render(Textarea, {
        props: { state: 'success', error: true },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('border-danger-DEFAULT')
    })
  })

  describe('调整大小测试', () => {
    it('正确应用 resize: none 样式', () => {
      const { getByRole } = render(Textarea, { props: { resize: 'none' } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('resize-none')
    })

    it('正确应用 resize: both 样式', () => {
      const { getByRole } = render(Textarea, { props: { resize: 'both' } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('resize')
    })

    it('正确应用 resize: horizontal 样式', () => {
      const { getByRole } = render(Textarea, {
        props: { resize: 'horizontal' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('resize-x')
    })

    it('正确应用 resize: vertical 样式', () => {
      const { getByRole } = render(Textarea, {
        props: { resize: 'vertical' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('resize-y')
    })
  })

  describe('字数统计测试', () => {
    it('showCount 和 maxlength 都设置时显示字数统计', () => {
      const { container } = render(Textarea, {
        props: {
          showCount: true,
          maxlength: 100,
          modelValue: '测试内容',
        },
      })

      const countElement = container.querySelector('.text-xs')
      expect(countElement).toBeTruthy()
      expect(countElement?.textContent).toContain('4')
      expect(countElement?.textContent).toContain('100')
    })

    it('showCount 为 false 时不显示字数统计', () => {
      const { queryByTestId } = render(Textarea, {
        props: {
          showCount: false,
          maxlength: 100,
        },
      })

      // 应该没有字数统计元素
      const countElements = document.querySelectorAll('.text-xs')
      expect(countElements.length).toBe(0)
    })
  })

  describe('v-model 测试', () => {
    it('正确绑定初始值', () => {
      const { getByRole } = render(Textarea, {
        props: { modelValue: '初始值' },
      })
      const textarea = getByRole('textbox') as HTMLTextAreaElement

      expect(textarea.value).toBe('初始值')
    })
  })

  describe('可访问性测试', () => {
    it('禁用状态正确设置', () => {
      const { getByRole } = render(Textarea, { props: { disabled: true } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('disabled')
    })

    it('只读状态正确设置', () => {
      const { getByRole } = render(Textarea, { props: { readonly: true } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('readonly')
    })

    it('必填状态正确设置', () => {
      const { getByRole } = render(Textarea, { props: { required: true } })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveAttribute('required')
    })
  })

  describe('边角情况测试', () => {
    it('空字符串正确处理', () => {
      const { getByRole } = render(Textarea, {
        props: { modelValue: '' },
      })
      const textarea = getByRole('textbox') as HTMLTextAreaElement

      expect(textarea.value).toBe('')
    })

    it('自定义 class 正确应用', () => {
      const { getByRole } = render(Textarea, {
        props: { class: 'custom-class' },
      })
      const textarea = getByRole('textbox')

      expect(textarea).toHaveClass('custom-class')
    })
  })
})
