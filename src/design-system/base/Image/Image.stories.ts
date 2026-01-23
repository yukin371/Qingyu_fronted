import type { Meta, StoryObj } from '@storybook/vue3'
import Image from './Image.vue'

/**
 * Image 组件 Storybook 故事
 *
 * 展示所有尺寸、形状和状态
 */

const meta = {
  title: 'Design System/Base/Image',
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: '图片 URL',
    },
    alt: {
      control: 'text',
      description: '图片替代文本',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: '图片尺寸',
    },
    shape: {
      control: 'select',
      options: ['rect', 'circle', 'rounded'],
      description: '图片形状',
    },
    fit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'none', 'scale-down'],
      description: '对象填充方式',
    },
    lazy: {
      control: 'boolean',
      description: '是否懒加载',
    },
    showSkeleton: {
      control: 'boolean',
      description: '是否显示骨架屏',
    },
    fallbackIcon: {
      control: 'text',
      description: '错误状态图标名称',
    },
  },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    src: 'https://picsum.photos/400/400',
    alt: '示例图片',
    size: 'md',
    shape: 'rect',
  },
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="flex flex-wrap items-end gap-4 p-8">
        <Image
          src="https://picsum.photos/100/100"
          alt="XS"
          size="xs"
        />
        <Image
          src="https://picsum.photos/150/150"
          alt="SM"
          size="sm"
        />
        <Image
          src="https://picsum.photos/200/200"
          alt="MD"
          size="md"
        />
        <Image
          src="https://picsum.photos/300/300"
          alt="LG"
          size="lg"
        />
        <Image
          src="https://picsum.photos/400/400"
          alt="XL"
          size="xl"
        />
      </div>
    `,
  }),
}

// 所有形状
export const AllShapes: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="flex items-center gap-4 p-8">
        <Image
          src="https://picsum.photos/200/200"
          alt="矩形"
          shape="rect"
        />
        <Image
          src="https://picsum.photos/200/200"
          alt="圆形"
          shape="circle"
        />
        <Image
          src="https://picsum.photos/200/200"
          alt="圆角"
          shape="rounded"
        />
      </div>
    `,
  }),
}

// 对象填充方式
export const FitOptions: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="space-y-4 p-8">
        <div class="flex gap-4">
          <div class="text-center">
            <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">Cover</div>
            <Image
              src="https://picsum.photos/300/200"
              alt="Cover"
              width="200px"
              height="200px"
              fit="cover"
            />
          </div>
          <div class="text-center">
            <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">Contain</div>
            <Image
              src="https://picsum.photos/300/200"
              alt="Contain"
              width="200px"
              height="200px"
              fit="contain"
            />
          </div>
          <div class="text-center">
            <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">Fill</div>
            <Image
              src="https://picsum.photos/300/200"
              alt="Fill"
              width="200px"
              height="200px"
              fit="fill"
            />
          </div>
          <div class="text-center">
            <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">Scale Down</div>
            <Image
              src="https://picsum.photos/300/200"
              alt="Scale Down"
              width="200px"
              height="200px"
              fit="scale-down"
            />
          </div>
        </div>
      </div>
    `,
  }),
}

// 加载和错误状态
export const States: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="flex items-center gap-4 p-8">
        <div class="text-center">
          <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">加载中</div>
          <Image
            src="https://picsum.photos/200/200"
            alt="加载中"
            size="md"
          />
        </div>
        <div class="text-center">
          <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">错误状态</div>
          <Image
            src="https://invalid-url-that-does-not-exist.com/image.jpg"
            alt="错误"
            size="md"
          />
        </div>
        <div class="text-center">
          <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">无 Src</div>
          <Image
            alt="无图片"
            size="md"
          />
        </div>
      </div>
    `,
  }),
}

// 自定义尺寸
export const CustomSizes: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="flex items-end gap-4 p-8">
        <Image
          src="https://picsum.photos/150/200"
          alt="自定义尺寸 1"
          width="150px"
          height="200px"
        />
        <Image
          src="https://picsum.photos/200/150"
          alt="自定义尺寸 2"
          width="200px"
          height="150px"
        />
        <Image
          src="https://picsum.photos/250/250"
          alt="自定义尺寸 3"
          width="250px"
          height="250px"
        />
      </div>
    `,
  }),
}

// 全宽图片
export const FullWidth: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="w-96 p-8">
        <Image
          src="https://picsum.photos/800/300"
          alt="全宽图片"
          size="full"
          height="200px"
        />
      </div>
    `,
  }),
}

// 头像图片
export const AvatarImages: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="flex items-center gap-4 p-8">
        <Image
          src="https://i.pravatar.cc/150?img=1"
          alt="用户 1"
          size="sm"
          shape="circle"
        />
        <Image
          src="https://i.pravatar.cc/150?img=2"
          alt="用户 2"
          size="md"
          shape="circle"
        />
        <Image
          src="https://i.pravatar.cc/150?img=3"
          alt="用户 3"
          size="lg"
          shape="circle"
        />
        <Image
          src="https://i.pravatar.cc/150?img=4"
          alt="用户 4"
          size="xl"
          shape="circle"
        />
      </div>
    `,
  }),
}

// 懒加载演示
export const LazyLoad: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="h-96 overflow-y-auto p-8 space-y-4">
        <div v-for="i in 10" :key="i">
          <Image
            :src="'https://picsum.photos/800/' + (200 + i * 20)"
            :alt="'图片 ' + i"
            size="full"
            height="200px"
          />
        </div>
      </div>
    `,
  }),
}

// 可点击图片
export const Clickable: Story = {
  render: () => ({
    components: { Image },
    setup() {
      const handleClick = () => {
        alert('图片被点击了!')
      }
      return { handleClick }
    },
    template: `
      <div class="p-8">
        <Image
          src="https://picsum.photos/300/300"
          alt="可点击图片"
          size="lg"
          shape="rounded"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          @click="handleClick"
        />
      </div>
    `,
  }),
}

// 横向图片（风景）
export const LandscapeImages: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Image
          src="https://picsum.photos/400/300"
          alt="风景 1"
          width="400px"
          height="300px"
        />
        <Image
          src="https://picsum.photos/400/300"
          alt="风景 2"
          width="400px"
          height="300px"
          shape="rounded"
        />
      </div>
    `,
  }),
}

// 纵向图片（肖像）
export const PortraitImages: Story = {
  render: () => ({
    components: { Image },
    template: `
      <div class="flex items-center gap-4 p-8">
        <Image
          src="https://picsum.photos/300/400"
          alt="肖像 1"
          width="300px"
          height="400px"
        />
        <Image
          src="https://picsum.photos/300/400"
          alt="肖像 2"
          width="300px"
          height="400px"
          shape="rounded"
        />
      </div>
    `,
  }),
}
