/**
 * Avatar 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Avatar from './Avatar.vue'

const meta = {
  title: 'Base/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: '头像图片 URL',
    },
    alt: {
      control: 'text',
      description: 'Fallback 文字或图片 alt 文本',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar 尺寸',
    },
    variant: {
      control: 'select',
      options: ['circle', 'square', 'rounded'],
      description: 'Avatar 形状',
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy'],
      description: '在线状态指示器',
    },
    disableStatus: {
      control: 'boolean',
      description: '是否禁用状态指示器',
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 基础用法
 */
export const Default: Story = {
  args: {
    alt: 'John Doe',
    size: 'md',
  },
}

/**
 * 图片头像
 */
export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    alt: 'Jane Smith',
    size: 'md',
  },
}

/**
 * 尺寸变体
 */
export const Sizes: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-end gap-4">
        <Avatar v-bind="args" size="xs" alt="XS" />
        <Avatar v-bind="args" size="sm" alt="SM" />
        <Avatar v-bind="args" size="md" alt="MD" />
        <Avatar v-bind="args" size="lg" alt="LG" />
        <Avatar v-bind="args" size="xl" alt="XL" />
        <Avatar v-bind="args" size="2xl" alt="2XL" />
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  },
}

/**
 * 形状变体
 */
export const Variants: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center gap-4">
        <Avatar v-bind="args" variant="circle" />
        <Avatar v-bind="args" variant="square" />
        <Avatar v-bind="args" variant="rounded" />
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    size: 'lg',
  },
}

/**
 * Fallback 文字
 */
export const Fallback: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center gap-4">
        <Avatar alt="John Doe" size="md" />
        <Avatar alt="Jane Smith" size="md" />
        <Avatar alt="张三" size="md" />
        <Avatar alt="李四" size="md" />
        <Avatar alt="A" size="md" />
      </div>
    `,
  }),
}

/**
 * 在线状态
 */
export const Status: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center gap-4">
        <Avatar v-bind="args" status="online" />
        <Avatar v-bind="args" status="offline" />
        <Avatar v-bind="args" status="away" />
        <Avatar v-bind="args" status="busy" />
      </div>
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
    size: 'lg',
  },
}

/**
 * 无图片状态
 */
export const WithoutImage: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center gap-4">
        <Avatar v-bind="args" status="online" />
        <Avatar v-bind="args" status="offline" />
        <Avatar v-bind="args" status="away" />
        <Avatar v-bind="args" status="busy" />
      </div>
    `,
  }),
  args: {
    alt: 'John Doe',
    size: 'lg',
  },
}

/**
 * 用户列表
 */
export const UserList: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      const users = [
        { name: 'Alice Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', status: 'online' as const },
        { name: 'Bob Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', status: 'offline' as const },
        { name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', status: 'away' as const },
        { name: 'Diana Prince', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', status: 'busy' as const },
        { name: 'Eve Wilson', avatar: null, status: 'online' as const },
      ]
      return { users, args }
    },
    template: `
      <div class="flex flex-col gap-3">
        <div v-for="user in users" :key="user.name" class="flex items-center gap-3">
          <Avatar
            :src="user.avatar || undefined"
            :alt="user.name"
            :status="user.status"
            v-bind="args"
          />
          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ user.name }}</span>
        </div>
      </div>
    `,
  }),
  args: {
    size: 'md',
  },
}

/**
 * Avatar 组
 */
export const AvatarGroup: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      return { args }
    },
    template: `
      <div class="flex -space-x-2">
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" alt="User 1" v-bind="args" />
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" alt="User 2" v-bind="args" />
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=3" alt="User 3" v-bind="args" />
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=4" alt="User 4" v-bind="args" />
        <Avatar alt="+5" v-bind="args" />
      </div>
    `,
  }),
  args: {
    size: 'md',
  },
}

/**
 * 点击事件
 */
export const Clickable: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      const handleClick = () => {
        alert('Avatar clicked!')
      }
      return { args, handleClick }
    },
    template: `
      <Avatar
        v-bind="args"
        class="cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-2"
        @click="handleClick"
      />
    `,
  }),
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
    alt: 'Clickable Avatar',
    size: 'xl',
  },
}
