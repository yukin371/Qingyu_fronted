// @ts-nocheck - Storybook file with flexible type assertions
import type { Meta, StoryObj } from '@storybook/vue3'
import { QySelect } from './index'

/**
 * QySelect 组件 Storybook 故事
 *
 * Apple 风格下拉选择器
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Form/QySelect',
  component: QySelect,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'object',
      description: 'v-model 绑定值',
    },
    options: {
      control: 'object',
      description: '选项数组',
    },
    placeholder: {
      control: 'text',
      description: '占位文本',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    clearable: {
      control: 'boolean',
      description: '可清空',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
    },
  },
} satisfies Meta<typeof QySelect>

export default meta
type Story = StoryObj<typeof meta>

const sampleOptions = [
  { label: '选项 1', value: 1 },
  { label: '选项 2', value: 2 },
  { label: '选项 3', value: 3 },
]

// 默认
export const Default: Story = {
  args: {
    placeholder: '请选择',
    options: sampleOptions,
    size: 'md',
  },
  render: (args) => ({
    components: { QySelect },
    setup() {
      const value = ref()
      return { args, value }
    },
    template: `
      <div class="w-64">
        <QySelect v-bind="args" v-model="value" />
        <p class="mt-2 text-sm text-gray-500">当前值: {{ value }}</p>
      </div>
    `,
  }),
}

// 选中状态
export const Selected: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const value = ref(2)
      return { value, options: sampleOptions }
    },
    template: `
      <div class="w-64">
        <QySelect :options="options" v-model="value" />
        <p class="mt-2 text-sm text-gray-500">当前值: {{ value }}</p>
      </div>
    `,
  }),
}

// 可清空
export const Clearable: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const value = ref(1)
      return { value, options: sampleOptions }
    },
    template: `
      <div class="w-64">
        <QySelect :options="options" v-model="value" clearable />
        <p class="mt-2 text-sm text-gray-500">当前值: {{ value }}</p>
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const value = ref(1)
      return { value, options: sampleOptions }
    },
    template: `
      <div class="w-64 space-y-3">
        <QySelect :options="options" v-model="value" disabled placeholder="禁用且有值" />
        <QySelect :options="options" disabled placeholder="禁用且无值" />
      </div>
    `,
  }),
}

// 不同尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const v1 = ref()
      const v2 = ref()
      const v3 = ref()
      return { v1, v2, v3, options: sampleOptions }
    },
    template: `
      <div class="w-64 space-y-4">
        <QySelect size="sm" :options="options" v-model="v1" placeholder="小尺寸 sm" />
        <QySelect size="md" :options="options" v-model="v2" placeholder="中尺寸 md" />
        <QySelect size="lg" :options="options" v-model="v3" placeholder="大尺寸 lg" />
      </div>
    `,
  }),
}

// 禁用选项
export const DisabledOptions: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const value = ref()
      const options = [
        { label: '可用选项 1', value: 1 },
        { label: '禁用选项', value: 2, disabled: true },
        { label: '可用选项 2', value: 3 },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <QySelect :options="options" v-model="value" placeholder="含禁用选项" />
      </div>
    `,
  }),
}

// 空状态
export const Empty: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const value = ref()
      return { value, options: [] }
    },
    template: `
      <div class="w-64">
        <QySelect :options="options" v-model="value" placeholder="暂无数据" />
      </div>
    `,
  }),
}

// 交互测试
export const Interactive: Story = {
  render: () => ({
    components: { QySelect },
    setup() {
      const value = ref()
      const options = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
        { label: 'Durian', value: 'durian' },
      ]
      const handleChange = (val: any) => {
        console.log('选中:', val)
      }
      return { value, options, handleChange }
    },
    template: `
      <div class="w-64">
        <QySelect
          :options="options"
          v-model="value"
          placeholder="选择一种水果"
          clearable
          @change="handleChange"
        />
        <p class="mt-3 text-sm">
          当前值: <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{{ value }}</span>
        </p>
      </div>
    `,
  }),
}
