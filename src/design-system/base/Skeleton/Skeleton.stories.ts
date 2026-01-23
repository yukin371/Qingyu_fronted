/**
 * Skeleton 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Skeleton from './Skeleton.vue'

const meta = {
  title: 'Base/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'circle', 'rect', 'avatar', 'image'],
      description: 'Skeleton 类型',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Skeleton 尺寸',
    },
    width: {
      control: 'text',
      description: '自定义宽度',
    },
    height: {
      control: 'text',
      description: '自定义高度',
    },
    animated: {
      control: 'boolean',
      description: '是否显示动画',
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

// 默认示例
export const Default: Story = {
  args: {
    type: 'text',
    size: 'md',
    animated: true,
  },
}

// Text 类型
export const Text: Story = {
  args: {
    type: 'text',
    size: 'md',
    animated: true,
  },
}

// Text 尺寸变体
export const TextSizes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-4 p-4">
        <div class="flex items-center gap-4">
          <Skeleton type="text" size="xs" />
          <span class="text-sm text-slate-500">xs</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="text" size="sm" />
          <span class="text-sm text-slate-500">sm</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="text" size="md" />
          <span class="text-sm text-slate-500">md</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="text" size="lg" />
          <span class="text-sm text-slate-500">lg</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="text" size="xl" />
          <span class="text-sm text-slate-500">xl</span>
        </div>
      </div>
    `,
  }),
}

// Circle 类型
export const Circle: Story = {
  args: {
    type: 'circle',
    size: 'md',
    animated: true,
  },
}

// Circle 尺寸变体
export const CircleSizes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-4 p-4">
        <div class="flex items-center gap-4">
          <Skeleton type="circle" size="xs" />
          <span class="text-sm text-slate-500">xs</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="circle" size="sm" />
          <span class="text-sm text-slate-500">sm</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="circle" size="md" />
          <span class="text-sm text-slate-500">md</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="circle" size="lg" />
          <span class="text-sm text-slate-500">lg</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="circle" size="xl" />
          <span class="text-sm text-slate-500">xl</span>
        </div>
      </div>
    `,
  }),
}

// Rect 类型
export const Rect: Story = {
  args: {
    type: 'rect',
    size: 'md',
    animated: true,
  },
}

// Rect 尺寸变体
export const RectSizes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-4 p-4">
        <div>
          <Skeleton type="rect" size="xs" />
          <span class="text-sm text-slate-500 ml-2">xs</span>
        </div>
        <div>
          <Skeleton type="rect" size="sm" />
          <span class="text-sm text-slate-500 ml-2">sm</span>
        </div>
        <div>
          <Skeleton type="rect" size="md" />
          <span class="text-sm text-slate-500 ml-2">md</span>
        </div>
        <div>
          <Skeleton type="rect" size="lg" />
          <span class="text-sm text-slate-500 ml-2">lg</span>
        </div>
        <div>
          <Skeleton type="rect" size="xl" />
          <span class="text-sm text-slate-500 ml-2">xl</span>
        </div>
      </div>
    `,
  }),
}

// Avatar 类型
export const Avatar: Story = {
  args: {
    type: 'avatar',
    size: 'md',
    animated: true,
  },
}

// Avatar 尺寸变体
export const AvatarSizes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-4 p-4">
        <div class="flex items-center gap-4">
          <Skeleton type="avatar" size="xs" />
          <span class="text-sm text-slate-500">xs</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="avatar" size="sm" />
          <span class="text-sm text-slate-500">sm</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="avatar" size="md" />
          <span class="text-sm text-slate-500">md</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="avatar" size="lg" />
          <span class="text-sm text-slate-500">lg</span>
        </div>
        <div class="flex items-center gap-4">
          <Skeleton type="avatar" size="xl" />
          <span class="text-sm text-slate-500">xl</span>
        </div>
      </div>
    `,
  }),
}

// Image 类型
export const Image: Story = {
  args: {
    type: 'image',
    size: 'md',
    animated: true,
  },
}

// Image 尺寸变体
export const ImageSizes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-4 p-4">
        <div>
          <Skeleton type="image" size="xs" />
          <span class="text-sm text-slate-500 ml-2">xs</span>
        </div>
        <div>
          <Skeleton type="image" size="sm" />
          <span class="text-sm text-slate-500 ml-2">sm</span>
        </div>
        <div>
          <Skeleton type="image" size="md" />
          <span class="text-sm text-slate-500 ml-2">md</span>
        </div>
        <div>
          <Skeleton type="image" size="lg" />
          <span class="text-sm text-slate-500 ml-2">lg</span>
        </div>
        <div>
          <Skeleton type="image" size="xl" />
          <span class="text-sm text-slate-500 ml-2">xl</span>
        </div>
      </div>
    `,
  }),
}

// 自定义尺寸
export const CustomSize: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-4 p-4">
        <div>
          <Skeleton type="text" width="200px" height="20px" />
          <p class="text-sm text-slate-500 mt-1">自定义文本骨架: 200px x 20px</p>
        </div>
        <div>
          <Skeleton type="circle" width="60px" height="60px" />
          <p class="text-sm text-slate-500 mt-1">自定义圆形骨架: 60px x 60px</p>
        </div>
        <div>
          <Skeleton type="rect" width="100%" height="120px" />
          <p class="text-sm text-slate-500 mt-1">自定义矩形骨架: 100% x 120px</p>
        </div>
      </div>
    `,
  }),
}

// 无动画
export const NoAnimation: Story = {
  args: {
    type: 'text',
    size: 'md',
    animated: false,
  },
}

// 组合使用 - 用户卡片
export const UserCard: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 w-80">
        <div class="flex items-center gap-4 mb-4">
          <Skeleton type="avatar" size="xl" />
          <div class="flex-1 space-y-2">
            <Skeleton type="text" size="lg" />
            <Skeleton type="text" size="sm" />
          </div>
        </div>
        <div class="space-y-2">
          <Skeleton type="text" size="md" />
          <Skeleton type="text" size="md" />
          <Skeleton type="text" size="md" width="150px" />
        </div>
      </div>
    `,
  }),
}

// 组合使用 - 文章卡片
export const ArticleCard: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden w-96">
        <Skeleton type="image" size="lg" height="200px" />
        <div class="p-6 space-y-4">
          <Skeleton type="text" size="xl" />
          <div class="space-y-2">
            <Skeleton type="text" size="md" />
            <Skeleton type="text" size="md" />
            <Skeleton type="text" size="md" width="200px" />
          </div>
        </div>
      </div>
    `,
  }),
}

// 组合使用 - 列表
export const List: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 w-96">
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4">
            <Skeleton type="avatar" size="md" />
            <div class="flex-1 space-y-2">
              <Skeleton type="text" size="md" />
              <Skeleton type="text" size="sm" width="150px" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 组合使用 - 表格
export const Table: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden w-full max-w-2xl">
        <div class="p-4 border-b border-slate-200 dark:border-slate-700">
          <Skeleton type="text" size="xl" />
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex gap-4">
              <Skeleton type="circle" size="sm" class="flex-shrink-0" />
              <Skeleton type="text" size="md" class="flex-1" />
              <Skeleton type="text" size="md" class="flex-1" />
              <Skeleton type="text" size="md" width="100px" class="flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// 所有类型展示
export const AllTypes: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="space-y-6 p-4">
        <div>
          <h3 class="text-lg font-semibold mb-2">Text</h3>
          <div class="flex items-center gap-4">
            <Skeleton type="text" size="xs" />
            <Skeleton type="text" size="sm" />
            <Skeleton type="text" size="md" />
            <Skeleton type="text" size="lg" />
            <Skeleton type="text" size="xl" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Circle</h3>
          <div class="flex items-center gap-4">
            <Skeleton type="circle" size="xs" />
            <Skeleton type="circle" size="sm" />
            <Skeleton type="circle" size="md" />
            <Skeleton type="circle" size="lg" />
            <Skeleton type="circle" size="xl" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Rect</h3>
          <div class="flex items-end gap-4">
            <Skeleton type="rect" size="xs" />
            <Skeleton type="rect" size="sm" />
            <Skeleton type="rect" size="md" />
            <Skeleton type="rect" size="lg" />
            <Skeleton type="rect" size="xl" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Avatar</h3>
          <div class="flex items-center gap-4">
            <Skeleton type="avatar" size="xs" />
            <Skeleton type="avatar" size="sm" />
            <Skeleton type="avatar" size="md" />
            <Skeleton type="avatar" size="lg" />
            <Skeleton type="avatar" size="xl" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Image</h3>
          <div class="flex items-end gap-4">
            <Skeleton type="image" size="xs" />
            <Skeleton type="image" size="sm" />
            <Skeleton type="image" size="md" />
            <Skeleton type="image" size="lg" />
            <Skeleton type="image" size="xl" />
          </div>
        </div>
      </div>
    `,
  }),
}
