/**
 * Empty 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Empty from './Empty.vue'

const meta = {
  title: 'Base/Empty',
  component: Empty,
  tags: ['autodocs'],
  argTypes: {
    description: {
      control: 'text',
      description: '空状态描述文字',
    },
    title: {
      control: 'text',
      description: '空状态标题',
    },
    icon: {
      control: 'text',
      description: '图标名称（使用 Icon 组件）',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Empty 尺寸',
    },
  },
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 基础用法
 */
export const Default: Story = {
  args: {
    description: '暂无数据',
    size: 'md',
  },
}

/**
 * 带标题
 */
export const WithTitle: Story = {
  args: {
    title: '还没有书单',
    description: '创建你的第一个书单来收藏喜欢的书籍吧',
    size: 'md',
  },
}

/**
 * 带图标
 */
export const WithIcon: Story = {
  args: {
    icon: 'document',
    title: '还没有文档',
    description: '创建你的第一个文档开始写作吧',
    size: 'md',
  },
}

/**
 * 尺寸变体
 */
export const Sizes: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      return { args }
    },
    template: `
      <div class="grid grid-cols-2 gap-8">
        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">Small</p>
          <div class="border border-slate-200 rounded-lg p-4">
            <Empty v-bind="args" size="sm" />
          </div>
        </div>
        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">Medium</p>
          <div class="border border-slate-200 rounded-lg p-4">
            <Empty v-bind="args" size="md" />
          </div>
        </div>
        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">Large</p>
          <div class="border border-slate-200 rounded-lg p-4">
            <Empty v-bind="args" size="lg" />
          </div>
        </div>
        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">Extra Large</p>
          <div class="border border-slate-200 rounded-lg p-4">
            <Empty v-bind="args" size="xl" />
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    icon: 'document',
    description: '暂无数据',
  },
}

/**
 * 带 Action 按钮
 */
export const WithAction: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      return { args }
    },
    template: `
      <div class="border border-slate-200 rounded-lg p-8">
        <Empty v-bind="args">
          <template #action>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
              创建书单
            </button>
          </template>
        </Empty>
      </div>
    `,
  }),
  args: {
    icon: 'document',
    title: '还没有书单',
    description: '创建你的第一个书单来收藏喜欢的书籍吧',
    size: 'md',
  },
}

/**
 * 自定义内容
 */
export const WithCustomContent: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      return { args }
    },
    template: `
      <div class="border border-slate-200 rounded-lg p-8">
        <Empty v-bind="args">
          <div class="flex flex-col items-center gap-3">
            <svg class="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-base font-medium text-slate-700">没有找到相关内容</p>
            <p class="text-sm text-slate-500 text-center max-w-md">
              试试调整搜索关键词或清除筛选条件
            </p>
            <button class="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
              清除筛选
            </button>
          </div>
        </Empty>
      </div>
    `,
  }),
  args: {
    size: 'md',
  },
}

/**
 * 用户列表空状态
 */
export const UserListEmpty: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      return { args }
    },
    template: `
      <div class="border border-slate-200 rounded-lg p-8">
        <Empty v-bind="args">
          <template #action>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
              添加用户
            </button>
          </template>
        </Empty>
      </div>
    `,
  }),
  args: {
    icon: 'user',
    title: '还没有用户',
    description: '添加第一个用户开始管理吧',
    size: 'md',
  },
}

/**
 * 通知空状态
 */
export const NotificationEmpty: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      return { args }
    },
    template: `
      <div class="border border-slate-200 rounded-lg p-8">
        <Empty v-bind="args" />
      </div>
    `,
  }),
  args: {
    icon: 'bell',
    title: '暂无通知',
    description: '当前没有新的通知消息',
    size: 'md',
  },
}

/**
 * 搜索结果空状态
 */
export const SearchEmpty: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      return { args }
    },
    template: `
      <div class="border border-slate-200 rounded-lg p-8">
        <Empty v-bind="args">
          <template #action>
            <button class="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
              清除搜索
            </button>
          </template>
        </Empty>
      </div>
    `,
  }),
  args: {
    icon: 'magnifying-glass',
    title: '没有找到相关结果',
    description: '试试使用不同的关键词进行搜索',
    size: 'md',
  },
}

/**
 * 点击事件
 */
export const Clickable: Story = {
  render: (args) => ({
    components: { Empty },
    setup() {
      const handleClick = () => {
        alert('Empty clicked!')
      }
      return { args, handleClick }
    },
    template: `
      <div class="border border-slate-200 rounded-lg p-8">
        <Empty
          v-bind="args"
          class="cursor-pointer hover:bg-slate-50 transition-colors rounded-lg"
          @click="handleClick"
        />
      </div>
    `,
  }),
  args: {
    icon: 'plus',
    description: '点击创建新内容',
    size: 'md',
  },
}
