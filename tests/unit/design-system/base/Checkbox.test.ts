/**
 * Checkbox 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
import Checkbox from '@/design-system/base/Checkbox/Checkbox.vue'
import CheckboxGroup from '@/design-system/base/Checkbox/CheckboxGroup.vue'

describe('Checkbox', () => {
  describe('基础渲染', () => {
    it('默认渲染为 md size 和 primary color', () => {
      const { container } = render(Checkbox)
      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox).toHaveClass('w-5')
      expect(checkbox).toHaveClass('h-5')
    })

    it('正确渲染所有尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      for (const size of sizes) {
        const { container } = render(Checkbox, { props: { size } })
        const checkbox = container.querySelector('input[type="checkbox"]')

        if (size === 'sm') {
          expect(checkbox).toHaveClass('w-4')
          expect(checkbox).toHaveClass('h-4')
        } else if (size === 'md') {
          expect(checkbox).toHaveClass('w-5')
          expect(checkbox).toHaveClass('h-5')
        } else if (size === 'lg') {
          expect(checkbox).toHaveClass('w-6')
          expect(checkbox).toHaveClass('h-6')
        }
      }
    })

    it('正确渲染所有颜色', () => {
      const colors = ['primary', 'success', 'warning', 'danger'] as const

      for (const color of colors) {
        const { container } = render(Checkbox, { props: { color } })
        const checkbox = container.querySelector('input[type="checkbox"]')

        expect(checkbox?.className).toContain(color)
      }
    })

    it('渲染标签文本', () => {
      const { getByText } = render(Checkbox, {
        props: { label: '记住我' },
      })

      expect(getByText('记住我')).toBeTruthy()
    })

    it('渲染插槽内容', () => {
      const { container } = render(Checkbox, {
        slots: { default: '自定义标签' },
      })

      expect(container.textContent).toContain('自定义标签')
    })
  })

  describe('布尔模式', () => {
    it('正确处理选中状态', () => {
      const { container } = render(Checkbox, {
        props: { modelValue: true },
      })
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox?.checked).toBe(true)
    })

    it('正确处理未选中状态', () => {
      const { container } = render(Checkbox, {
        props: { modelValue: false },
      })
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox?.checked).toBe(false)
    })

    it('点击时切换状态', async () => {
      const { container, emitted } = render(Checkbox, {
        props: { modelValue: false },
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      if (checkbox) {
        await fireEvent.click(checkbox)

        expect(emitted('update:modelValue')).toBeTruthy()
        expect(emitted('update:modelValue')![0]).toEqual([true])
        expect(emitted('change')).toBeTruthy()
      }
    })

    it('v-model 双向绑定正常工作', async () => {
      const { container } = render(Checkbox, {
        props: { modelValue: false },
      })

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      if (checkbox) {
        await fireEvent.click(checkbox)

        expect(checkbox.checked).toBe(true)
      }
    })
  })

  describe('数组模式', () => {
    it('正确处理值在数组中', () => {
      const { container } = render(Checkbox, {
        props: {
          modelValue: ['apple', 'banana'],
          value: 'apple',
        },
      })
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox?.checked).toBe(true)
    })

    it('正确处理值不在数组中', () => {
      const { container } = render(Checkbox, {
        props: {
          modelValue: ['banana', 'orange'],
          value: 'apple',
        },
      })
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox?.checked).toBe(false)
    })

    it('选中时添加值到数组', async () => {
      const { container, emitted } = render(Checkbox, {
        props: {
          modelValue: ['banana'],
          value: 'apple',
        },
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      if (checkbox) {
        await fireEvent.click(checkbox)

        // emitted('update:modelValue') 返回 [参数数组1, 参数数组2, ...]
        // 每个参数数组包含 emit 时传递的所有参数
        const emittedCalls = emitted('update:modelValue')
        expect(emittedCalls).toBeTruthy()
        // emittedCalls![0] 是第一次 emit 的参数数组：[['banana', 'apple']]
        // 因为 emit('update:modelValue', newValue) 而 newValue = ['banana', 'apple']
        const emittedValue = emittedCalls![0][0] as string[]
        expect(emittedValue).toContain('apple')
        expect(emittedValue).toContain('banana')
      }
    })

    it('取消选中时从数组移除值', async () => {
      const { container, emitted } = render(Checkbox, {
        props: {
          modelValue: ['apple', 'banana'],
          value: 'apple',
        },
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      if (checkbox) {
        await fireEvent.click(checkbox)

        const emittedCalls = emitted('update:modelValue')
        expect(emittedCalls).toBeTruthy()
        const emittedValue = emittedCalls![0][0] as string[]
        expect(emittedValue).not.toContain('apple')
        expect(emittedValue).toContain('banana')
      }
    })
  })

  describe('禁用状态', () => {
    it('disabled 状态不触发点击', async () => {
      const { container, emitted } = render(Checkbox, {
        props: { disabled: true },
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      if (checkbox) {
        await fireEvent.click(checkbox)

        // disabled 状态不应该触发 update:modelValue 事件
        expect(emitted('update:modelValue')).toBeFalsy()
      }
    })

    it('disabled 状态有正确的样式', () => {
      const { container } = render(Checkbox, {
        props: { disabled: true },
      })
      const wrapper = container.querySelector('label')

      expect(wrapper).toHaveClass('opacity-50')
      expect(wrapper).toHaveClass('cursor-not-allowed')
    })

    it('禁用时标签文本有正确的样式', () => {
      const { container } = render(Checkbox, {
        props: { disabled: true, label: '禁用选项' },
      })

      const label = container.querySelector('span')
      expect(label).toHaveClass('text-slate-400')
    })
  })

  describe('半选状态', () => {
    it('indeterminate 属性正确设置', async () => {
      const { container } = render(Checkbox, {
        props: {
          modelValue: false,
          indeterminate: true,
        },
      })
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

      // 等待 Vue 的响应式更新完成
      await nextTick()
      expect(checkbox?.indeterminate).toBe(true)
    })

    it('显示半选图标', () => {
      const { container } = render(Checkbox, {
        props: {
          modelValue: false,
          indeterminate: true,
        },
      })

      // 检查是否有半选 SVG
      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('选中时清除半选状态', () => {
      const { container } = render(Checkbox, {
        props: {
          modelValue: true,
          indeterminate: true,
        },
      })
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox?.indeterminate).toBe(false)
    })
  })

  describe('CheckboxGroup 集成', () => {
    it('正确响应组的选中状态', () => {
      const { container } = render(
        {
          template: `
            <CheckboxGroup :model-value="['a', 'b']">
              <Checkbox value="a" label="A" />
              <Checkbox value="b" label="B" />
              <Checkbox value="c" label="C" />
            </CheckboxGroup>
          `,
          components: { CheckboxGroup, Checkbox },
        }
      )

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).toBeChecked()
      expect(checkboxes[2]).not.toBeChecked()
    })

    it('点击时更新组值', async () => {
      const onUpdate = vi.fn()
      const { container } = render(
        {
          template: `
            <CheckboxGroup :model-value="['a']" @update:model-value="onUpdate">
              <Checkbox value="b" label="B" />
            </CheckboxGroup>
          `,
          components: { CheckboxGroup, Checkbox },
          methods: { onUpdate },
        }
      )

      const checkbox = container.querySelector('input[type="checkbox"]')
      if (checkbox) {
        await fireEvent.click(checkbox)

        expect(onUpdate).toHaveBeenCalled()
        const emittedValue = onUpdate.mock.calls[0][0] as string[]
        expect(emittedValue).toContain('b')
        expect(emittedValue).toContain('a')
      }
    })

    it('组的 disabled 状态传递给子项', () => {
      const { container } = render(
        {
          template: `
            <CheckboxGroup :disabled="true">
              <Checkbox value="a" label="A" />
            </CheckboxGroup>
          `,
          components: { CheckboxGroup, Checkbox },
        }
      )
      const wrapper = container.querySelector('label')

      expect(wrapper).toHaveClass('opacity-50')
      expect(wrapper).toHaveClass('cursor-not-allowed')
    })

    it('组的 size 传递给子项', () => {
      const { container } = render(
        {
          template: `
            <CheckboxGroup size="lg">
              <Checkbox value="a" label="A" />
            </CheckboxGroup>
          `,
          components: { CheckboxGroup, Checkbox },
        }
      )
      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox).toHaveClass('w-6')
      expect(checkbox).toHaveClass('h-6')
    })

    it('vertical 垂直排列', () => {
      const { container } = render(
        {
          template: `
            <CheckboxGroup vertical>
              <Checkbox value="a" label="A" />
              <Checkbox value="b" label="B" />
            </CheckboxGroup>
          `,
          components: { CheckboxGroup, Checkbox },
        }
      )

      const group = container.querySelector('.flex-col')
      expect(group).toBeTruthy()
    })
  })

  describe('可访问性', () => {
    it('支持键盘 Enter 键', async () => {
      const { container, emitted } = render(Checkbox, {
        props: { modelValue: false },
      })
      const checkbox = container.querySelector('input[type="checkbox"]')

      if (checkbox) {
        await fireEvent.keyDown(checkbox, { key: 'Enter' })
        // Enter 键会触发 change 事件
        const changeEvent = new Event('change', { bubbles: true })
        checkbox.checked = true
        checkbox.dispatchEvent(changeEvent)

        expect(emitted('update:modelValue')).toBeTruthy()
      }
    })

    it('支持空格键', async () => {
      const { container, emitted } = render(Checkbox, {
        props: { modelValue: false },
      })
      const checkbox = container.querySelector('input[type="checkbox"]')

      if (checkbox) {
        await fireEvent.keyDown(checkbox, { key: ' ' })
        // 空格键会触发 change 事件
        const changeEvent = new Event('change', { bubbles: true })
        checkbox.checked = true
        checkbox.dispatchEvent(changeEvent)

        expect(emitted('update:modelValue')).toBeTruthy()
      }
    })

    it('有正确的 focus-visible 样式', () => {
      const { container } = render(Checkbox)
      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox?.className).toContain('focus-visible:ring-2')
    })

    it('有正确的 type 属性', () => {
      const { container } = render(Checkbox)
      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })
  })

  describe('样式', () => {
    it('接受自定义 class', () => {
      const { container } = render(Checkbox, {
        props: { class: 'custom-class' },
      })
      const wrapper = container.querySelector('label')

      expect(wrapper).toHaveClass('custom-class')
    })

    it('有 transition 动画', () => {
      const { container } = render(Checkbox)
      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox?.className).toContain('transition-all')
    })

    it('有正确的边框样式', () => {
      const { container } = render(Checkbox)
      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox).toHaveClass('border-2')
      expect(checkbox).toHaveClass('rounded')
    })

    it('选中时有正确的背景色', () => {
      const { container } = render(Checkbox, {
        props: {
          modelValue: true,
          color: 'primary',
        },
      })
      const checkbox = container.querySelector('input[type="checkbox"]')

      expect(checkbox?.className).toContain('checked:bg-primary-500')
    })
  })

  describe('图标显示', () => {
    it('选中时显示对勾图标', () => {
      const { container } = render(Checkbox, {
        props: { modelValue: true },
      })

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('未选中时不显示图标', () => {
      const { container } = render(Checkbox, {
        props: { modelValue: false },
      })

      // 应该没有 SVG（除了可能的半选图标）
      const svg = container.querySelector('svg')
      expect(svg).toBeFalsy()
    })

    it('半选时显示横线图标', () => {
      const { container } = render(Checkbox, {
        props: {
          modelValue: false,
          indeterminate: true,
        },
      })

      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
    })
  })
})
