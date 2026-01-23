import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from './Badge.vue'

/**
 * Badge 组件 Storybook 故事
 *
 * 展示所有变体、尺寸和状态
 */

const meta = {
  title: 'Design System/Base/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger'],
      description: 'Badge 变体',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge 尺寸',
    },
    content: {
      control: 'text',
      description: 'Badge 内容',
    },
    max: {
      control: 'number',
      description: '最大显示数字',
    },
    dot: {
      control: 'boolean',
      description: '是否显示为点',
    },
    absolute: {
      control: 'boolean',
      description: '是否绝对定位',
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    content: 5,
  },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args }
    },
    template: '<Badge v-bind="args" />',
  }),
}

// 所有变体
export const AllVariants: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Badge variant="default" :content="5">Default</Badge>
        <Badge variant="primary" :content="10">Primary</Badge>
        <Badge variant="success" :content="3">Success</Badge>
        <Badge variant="warning" :content="8">Warning</Badge>
        <Badge variant="danger" :content="12">Danger</Badge>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex items-center gap-4 p-8">
        <Badge size="sm" :content="5">SM</Badge>
        <Badge size="md" :content="10">MD</Badge>
        <Badge size="lg" :content="99">LG</Badge>
      </div>
    `,
  }),
}

// 数字模式
export const Numbers: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Badge :content="1">1</Badge>
        <Badge :content="42">42</Badge>
        <Badge :content="99">99</Badge>
        <Badge :content="100">100</Badge>
        <Badge :content="999" :max="99">999</Badge>
      </div>
    `,
  }),
}

// 点模式
export const Dots: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex gap-8 p-8 items-center">
        <div class="relative">
          <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            Inbox
          </div>
          <Badge variant="danger" :dot="true" :absolute="true" />
        </div>
        <div class="relative">
          <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            Messages
          </div>
          <Badge variant="success" :dot="true" :absolute="true" />
        </div>
        <div class="relative">
          <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            Alert
          </div>
          <Badge variant="warning" :dot="true" :absolute="true" />
        </div>
      </div>
    `,
  }),
}

// 绝对定位模式
export const AbsolutePosition: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex gap-8 p-8 items-center">
        <div class="relative">
          <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            Inbox
          </div>
          <Badge variant="danger" :content="5" :absolute="true" />
        </div>
        <div class="relative">
          <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            Messages
          </div>
          <Badge variant="primary" :content="12" :absolute="true" />
        </div>
        <div class="relative">
          <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            Alert
          </div>
          <Badge variant="warning" :content="99" :absolute="true" />
        </div>
      </div>
    `,
  }),
}

// 带按钮的 Badge
export const WithButton: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex gap-4 p-8">
        <div class="relative inline-block">
          <button class="px-4 py-2 bg-primary-500 text-white rounded-md">
            Messages
          </button>
          <Badge variant="danger" :content="5" :absolute="true" />
        </div>
        <div class="relative inline-block">
          <button class="px-4 py-2 bg-slate-200 text-slate-700 rounded-md">
            Notifications
          </button>
          <Badge variant="warning" :content="12" :absolute="true" />
        </div>
        <div class="relative inline-block">
          <button class="px-4 py-2 bg-success-DEFAULT text-white rounded-md">
            Tasks
          </button>
          <Badge variant="primary" :dot="true" :absolute="true" />
        </div>
      </div>
    `,
  }),
}

// 不同尺寸组合
export const SizeVariants: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="space-y-8 p-8">
        <div>
          <h3 class="text-sm font-medium mb-2">Small (sm)</h3>
          <div class="flex gap-4">
            <Badge size="sm" :content="5" />
            <Badge size="sm" variant="primary" :content="10" />
            <Badge size="sm" variant="success" :content="3" />
            <Badge size="sm" variant="warning" :content="8" />
            <Badge size="sm" variant="danger" :content="12" />
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium mb-2">Medium (md)</h3>
          <div class="flex gap-4">
            <Badge size="md" :content="5" />
            <Badge size="md" variant="primary" :content="10" />
            <Badge size="md" variant="success" :content="3" />
            <Badge size="md" variant="warning" :content="8" />
            <Badge size="md" variant="danger" :content="12" />
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium mb-2">Large (lg)</h3>
          <div class="flex gap-4">
            <Badge size="lg" :content="5" />
            <Badge size="lg" variant="primary" :content="10" />
            <Badge size="lg" variant="success" :content="3" />
            <Badge size="lg" variant="warning" :content="8" />
            <Badge size="lg" variant="danger" :content="12" />
          </div>
        </div>
      </div>
    `,
  }),
}

// Max 属性演示
export const MaxAttribute: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Badge :content="50" :max="9" />
        <Badge :content="99" :max="99" />
        <Badge :content="100" :max="99" />
        <Badge :content="999" :max="99" variant="primary" />
        <Badge :content="1000" :max="999" variant="success" />
      </div>
    `,
  }),
}

// 空内容（红点）
export const EmptyContent: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Badge variant="danger" />
        <Badge variant="primary" :content="null" />
        <Badge variant="success" :content="undefined" />
        <Badge variant="warning" :dot="true" />
      </div>
    `,
  }),
}
