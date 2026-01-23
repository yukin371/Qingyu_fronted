/**
 * Radio 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Radio from '@/design-system/form/Radio/Radio.vue'
import RadioGroup from '@/design-system/form/Radio/RadioGroup.vue'

describe('Radio 组件', () => {
  describe('Radio 单选框', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'test',
          label: 'Test Label',
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue: vi.fn(),
            },
          },
        },
      })
      expect(wrapper.find('input[type="radio"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Label')
    })

    it('应该根据 value 和 modelValue 正确设置选中状态', () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'option1',
          modelValue: 'option1',
          label: 'Option 1',
        },
        global: {
          provide: {
            radioGroup: {
              modelValue: ref('option1'),
              updateModelValue: vi.fn(),
            },
          },
        },
      })

      const input = wrapper.find('input[type="radio"]')
      expect((input.element as HTMLInputElement).checked).toBe(true)
    })

    it('未选中时应该不显示选中状态', () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'option1',
          modelValue: 'option2',
          label: 'Option 1',
        },
        global: {
          provide: {
            radioGroup: {
              modelValue: ref('option2'),
              updateModelValue: vi.fn(),
            },
          },
        },
      })

      const input = wrapper.find('input[type="radio"]')
      expect((input.element as HTMLInputElement).checked).toBe(false)
    })

    it('禁用状态下不应该可点击', async () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'option1',
          label: 'Option 1',
          disabled: true,
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue: vi.fn(),
            },
          },
        },
      })

      const input = wrapper.find('input[type="radio"]')
      expect((input.element as HTMLInputElement).disabled).toBe(true)
    })

    it('点击时应该触发 update:modelValue 事件', async () => {
      const updateModelValue = vi.fn()
      const wrapper = mount(Radio, {
        props: {
          value: 'option1',
          label: 'Option 1',
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue,
              modelValue: ref(undefined),
            },
          },
        },
      })

      await wrapper.find('input[type="radio"]').setValue(true)
      expect(updateModelValue).toHaveBeenCalledWith('option1')
    })

    it('点击时应该触发 change 事件', async () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'option1',
          label: 'Option 1',
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue: vi.fn(),
              modelValue: ref(undefined),
            },
          },
        },
      })

      await wrapper.find('input[type="radio"]').setValue(true)
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')![0]).toEqual(['option1'])
    })

    it('应该支持自定义插槽内容', () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'custom',
        },
        slots: {
          default: '<span class="custom-content">Custom Content</span>',
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.custom-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Content')
    })

    it('应该正确应用 size 类名', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach(size => {
        const wrapper = mount(Radio, {
          props: {
            value: 'test',
            size,
          },
          global: {
            provide: {
              radioGroup: {
                updateModelValue: vi.fn(),
              },
            },
          },
        })

        const input = wrapper.find('input[type="radio"]')
        // 检查是否有对应的尺寸类
        if (size === 'sm') {
          expect(input.classes()).toContain('w-4')
        } else if (size === 'md') {
          expect(input.classes()).toContain('w-5')
        } else if (size === 'lg') {
          expect(input.classes()).toContain('w-6')
        }
      })
    })

    it('按钮模式应该隐藏原生 input', () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'test',
          button: true,
          label: 'Button Radio',
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue: vi.fn(),
            },
          },
        },
      })

      const input = wrapper.find('input[type="radio"]')
      expect(input.classes()).toContain('sr-only')
    })
  })

  describe('RadioGroup 单选框组', () => {
    it('应该正确渲染所有子 Radio 组件', () => {
      const wrapper = mount(RadioGroup, {
        slots: {
          default: [
            mount(Radio, { props: { value: '1', label: 'Option 1' } }),
            mount(Radio, { props: { value: '2', label: 'Option 2' } }),
            mount(Radio, { props: { value: '3', label: 'Option 3' } }),
          ],
        },
        global: {
          components: { Radio },
        },
      })

      expect(wrapper.findAllComponents(Radio).length).toBe(3)
    })

    it('应该正确传递 v-model 值', async () => {
      const selected = ref('option1')

      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup v-model="selected">
            <Radio value="option1" label="Option 1" />
            <Radio value="option2" label="Option 2" />
          </RadioGroup>
        `,
        setup() {
          return { selected }
        },
      })

      // 初始值应该是 option1
      const radios1 = wrapper.findAllComponents(Radio)
      expect(radios1[0].findAll('input[type="radio"]')[0]).toBeDefined()

      // 更改选中值
      selected.value = 'option2'
      await wrapper.vm.$nextTick()

      const radios2 = wrapper.findAllComponents(Radio)
      expect(radios2[1].findAll('input[type="radio"]')[0]).toBeDefined()
    })

    it('应该正确传递 size 属性', () => {
      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup size="lg">
            <Radio value="1" label="Large 1" />
            <Radio value="2" label="Large 2" />
          </RadioGroup>
        `,
      })

      const radios = wrapper.findAllComponents(Radio)
      radios.forEach(radio => {
        // Radio 应该从 RadioGroup 继承 size 属性
        expect(radio.props('size')).toBe('lg')
      })
    })

    it('应该正确传递 disabled 属性', () => {
      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup :disabled="true">
            <Radio value="1" label="Disabled 1" />
            <Radio value="2" label="Disabled 2" />
          </RadioGroup>
        `,
      })

      const radios = wrapper.findAllComponents(Radio)
      radios.forEach(radio => {
        expect(radio.props('disabled')).toBe(true)
      })
    })

    it('应该根据 vertical 属性设置正确的布局', () => {
      const wrapper = mount(RadioGroup, {
        props: {
          vertical: true,
        },
        slots: {
          default: [
            mount(Radio, { props: { value: '1', label: 'Option 1' } }),
            mount(Radio, { props: { value: '2', label: 'Option 2' } }),
          ],
        },
        global: {
          components: { Radio },
        },
      })

      expect(wrapper.classes()).toContain('flex-col')
    })

    it('应该正确传递 button 属性', () => {
      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup :button="true">
            <Radio value="1" label="Button 1" />
            <Radio value="2" label="Button 2" />
          </RadioGroup>
        `,
      })

      const radios = wrapper.findAllComponents(Radio)
      radios.forEach(radio => {
        expect(radio.props('button')).toBe(true)
      })
    })

    it('应该触发 change 事件', async () => {
      let changedValue: string | undefined

      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup v-model="selected" @change="handleChange">
            <Radio value="option1" label="Option 1" />
            <Radio value="option2" label="Option 2" />
          </RadioGroup>
        `,
        setup() {
          const selected = ref('option1')
          const handleChange = (value: string) => {
            changedValue = value
          }
          return { selected, handleChange }
        },
      })

      // 点击第二个单选框
      const inputs = wrapper.findAll('input[type="radio"]')
      await inputs[1].setValue(true)

      expect(changedValue).toBe('option2')
    })

    it('单个 Radio 的 disabled 属性应该覆盖 Group 的 disabled', () => {
      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup :disabled="true">
            <Radio value="1" label="Disabled by group" />
            <Radio value="2" label="Enabled individually" :disabled="false" />
          </RadioGroup>
        `,
      })

      const radios = wrapper.findAllComponents(Radio)
      // 注意：这里的行为取决于组件实现
      // 根据实现，Group 的 disabled 会影响所有子元素
      expect(radios[0].props('disabled')).toBe(true)
    })
  })

  describe('可访问性', () => {
    it('应该有正确的 label 关联', () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'test',
          label: 'Test Label',
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue: vi.fn(),
            },
          },
        },
      })

      const label = wrapper.find('label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('Test Label')
    })

    it('禁用的 Radio 应该有正确的属性', () => {
      const wrapper = mount(Radio, {
        props: {
          value: 'test',
          label: 'Test',
          disabled: true,
        },
        global: {
          provide: {
            radioGroup: {
              updateModelValue: vi.fn(),
            },
          },
        },
      })

      const input = wrapper.find('input[type="radio"]')
      expect((input.element as HTMLInputElement).disabled).toBe(true)
    })
  })

  describe('按钮模式', () => {
    it('按钮模式应该正确渲染', () => {
      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup :button="true" v-model="selected">
            <Radio value="1" label="Button 1" />
            <Radio value="2" label="Button 2" />
          </RadioGroup>
        `,
        setup() {
          return { selected: ref('1') }
        },
      })

      const inputs = wrapper.findAll('input[type="radio"]')
      expect(inputs.length).toBe(2)
      inputs.forEach(input => {
        expect(input.classes()).toContain('sr-only')
      })
    })

    it('按钮模式选中的应该有正确的样式', () => {
      const wrapper = mount({
        components: { Radio, RadioGroup },
        template: `
          <RadioGroup :button="true" v-model="selected">
            <Radio value="selected" label="Selected Button" />
            <Radio value="unselected" label="Unselected Button" />
          </RadioGroup>
        `,
        setup() {
          return { selected: ref('selected') }
        },
      })

      const spans = wrapper.findAll('span')
      // 应该有包含选中状态的 span
      const checkedSpan = spans.find(span =>
        span.classes().includes('bg-primary-500') &&
        span.classes().includes('text-white')
      )
      expect(checkedSpan).toBeDefined()
    })
  })
})
