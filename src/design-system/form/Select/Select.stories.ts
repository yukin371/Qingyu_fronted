import type { Meta, StoryObj } from '@storybook/vue3'
import Select from './Select.vue'

/**
 * Select 组件 Storybook 故事
 *
 * 展示单选、多选、可搜索、可清空等各种功能
 */

import { ref } from 'vue'

const meta = {
  title: 'Design System/Form/Select',
  component: Select,
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
      description: '占位符',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    clearable: {
      control: 'boolean',
      description: '可清空',
    },
    multiple: {
      control: 'boolean',
      description: '多选',
    },
    filterable: {
      control: 'boolean',
      description: '可搜索',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    placeholder: '请选择',
    options: [
      { label: '选项 1', value: 1 },
      { label: '选项 2', value: 2 },
      { label: '选项 3', value: 3 },
    ],
    size: 'md',
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref()
      return { args, value }
    },
    template: `
      <div class="w-64">
        <Select v-bind="args" v-model="value" />
        <p class="mt-2 text-sm text-muted-foreground">选中的值: {{ value }}</p>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value1 = ref()
      const value2 = ref()
      const value3 = ref()
      const options = [
        { label: '选项 1', value: 1 },
        { label: '选项 2', value: 2 },
        { label: '选项 3', value: 3 },
      ]
      return { value1, value2, value3, options }
    },
    template: `
      <div class="space-y-4 w-64">
        <Select size="sm" :options="options" v-model="value1" placeholder="小尺寸" />
        <Select size="md" :options="options" v-model="value2" placeholder="中等尺寸" />
        <Select size="lg" :options="options" v-model="value3" placeholder="大尺寸" />
      </div>
    `,
  }),
}

// 可清空
export const Clearable: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref('option2')
      const options = [
        { label: '选项 1', value: 'option1' },
        { label: '选项 2', value: 'option2' },
        { label: '选项 3', value: 'option3' },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="请选择" clearable />
      </div>
    `,
  }),
}

// 可搜索
export const Filterable: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref()
      const options = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
        { label: 'Durian', value: 'durian' },
        { label: 'Elderberry', value: 'elderberry' },
        { label: 'Fig', value: 'fig' },
        { label: 'Grape', value: 'grape' },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="搜索水果" filterable />
      </div>
    `,
  }),
}

// 多选
export const Multiple: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref([1, 2])
      const options = [
        { label: '选项 1', value: 1 },
        { label: '选项 2', value: 2 },
        { label: '选项 3', value: 3 },
        { label: '选项 4', value: 4 },
        { label: '选项 5', value: 5 },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="请选择" multiple clearable />
        <p class="mt-2 text-sm text-muted-foreground">选中的值: {{ value }}</p>
      </div>
    `,
  }),
}

// 多选 + 可搜索
export const MultipleFilterable: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref([])
      const options = [
        { label: 'JavaScript', value: 'js' },
        { label: 'TypeScript', value: 'ts' },
        { label: 'Python', value: 'py' },
        { label: 'Java', value: 'java' },
        { label: 'Go', value: 'go' },
        { label: 'Rust', value: 'rust' },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="选择编程语言" multiple filterable clearable />
      </div>
    `,
  }),
}

// 禁用选项
export const DisabledOptions: Story = {
  render: () => ({
    components: { Select },
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
        <Select :options="options" v-model="value" placeholder="请选择" />
      </div>
    `,
  }),
}

// 禁用状态
export const Disabled: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref(1)
      const options = [
        { label: '选项 1', value: 1 },
        { label: '选项 2', value: 2 },
        { label: '选项 3', value: 3 },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="请选择" disabled />
      </div>
    `,
  }),
}

// 加载状态
export const Loading: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref()
      const options = []
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="加载中..." loading />
      </div>
    `,
  }),
}

// 空状态
export const Empty: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref()
      const options = []
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="暂无数据" />
      </div>
    `,
  }),
}

// 带前缀图标
export const WithPrefix: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref()
      const options = [
        { label: '中国', value: 'cn' },
        { label: '美国', value: 'us' },
        { label: '日本', value: 'jp' },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="选择国家">
          <template #prefix>
            <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </template>
        </Select>
      </div>
    `,
  }),
}

// 自定义选项内容
export const CustomOption: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref()
      const options = [
        { label: 'Alice', value: 'alice', role: 'Admin' },
        { label: 'Bob', value: 'bob', role: 'User' },
        { label: 'Charlie', value: 'charlie', role: 'User' },
      ]
      return { value, options }
    },
    template: `
      <div class="w-64">
        <Select :options="options" v-model="value" placeholder="选择用户">
          <template #default="{ option }">
            <div class="flex items-center justify-between w-full">
              <span>{{ option.label }}</span>
              <span class="text-xs text-muted-foreground">{{ option.role }}</span>
            </div>
          </template>
        </Select>
      </div>
    `,
  }),
}

// 远程搜索示例
export const RemoteSearch: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref()
      const options = ref([])
      const loading = ref(false)
      
      const remoteMethod = async (query: string) => {
        if (query) {
          loading.value = true
          // 模拟远程搜索
          setTimeout(() => {
            options.value = [
              { label: `${query} - 结果 1`, value: `${query}1` },
              { label: `${query} - 结果 2`, value: `${query}2` },
              { label: `${query} - 结果 3`, value: `${query}3` },
            ]
            loading.value = false
          }, 500)
        } else {
          options.value = []
        }
      }
      
      return { value, options, loading, remoteMethod }
    },
    template: `
      <div class="w-64">
        <Select 
          v-model="value" 
          :options="options" 
          :loading="loading"
          :remote-method="remoteMethod"
          remote
          filterable
          placeholder="输入关键词搜索"
        />
      </div>
    `,
  }),
}

// 交互测试
export const Interactive: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref()
      const options = [
        { label: '选项 1', value: 1 },
        { label: '选项 2', value: 2 },
        { label: '选项 3', value: 3 },
      ]
      
      const handleChange = (val: any) => {
        console.log('选中的值:', val)
      }
      
      return { value, options, handleChange }
    },
    template: `
      <div class="w-64">
        <Select 
          :options="options" 
          v-model="value" 
          placeholder="选择一个选项"
          @change="handleChange"
        />
        <p class="mt-4 text-sm">
          当前值: <span class="font-mono bg-muted px-2 py-1 rounded">{{ value }}</span>
        </p>
      </div>
    `,
  }),
}

// 完整示例
export const FullFeatured: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref([])
      const options = Array.from({ length: 20 }, (_, i) => ({
        label: `选项 ${i + 1}`,
        value: i + 1,
      }))
      
      return { value, options }
    },
    template: `
      <div class="w-80">
        <Select 
          :options="options" 
          v-model="value" 
          placeholder="请选择多个选项"
          multiple
          filterable
          clearable
        />
        <p class="mt-2 text-sm text-muted-foreground">
          已选择 {{ value.length }} 项
        </p>
      </div>
    `,
  }),
}
