/**
 * Divider 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Divider from './Divider.vue'

const meta = {
  title: 'Base/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Divider 方向',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Divider 线型',
    },
    label: {
      control: 'text',
      description: '标签文字',
    },
  },
  args: {
    direction: 'horizontal',
    variant: 'solid',
    label: undefined,
  },
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 默认水平分隔线
 */
export const Default: Story = {
  args: {
    direction: 'horizontal',
    variant: 'solid',
  },
  render: (args) => ({
    components: { Divider },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full">
        <div class="h-20 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          内容上方
        </div>
        <Divider v-bind="args" />
        <div class="h-20 bg-slate-50 dark:bg-slate-800 rounded-md p-4 mt-4">
          内容下方
        </div>
      </div>
    `,
  }),
}

/**
 * 实线分隔线
 */
export const Solid: Story = {
  args: {
    variant: 'solid',
  },
  render: (args) => ({
    components: { Divider },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full space-y-4">
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          第一部分内容
        </div>
        <Divider v-bind="args" />
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          第二部分内容
        </div>
        <Divider v-bind="args" />
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          第三部分内容
        </div>
      </div>
    `,
  }),
}

/**
 * 虚线分隔线
 */
export const Dashed: Story = {
  args: {
    variant: 'dashed',
  },
  render: (args) => ({
    components: { Divider },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full space-y-4">
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          第一部分内容
        </div>
        <Divider v-bind="args" />
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          第二部分内容
        </div>
      </div>
    `,
  }),
}

/**
 * 点线分隔线
 */
export const Dotted: Story = {
  args: {
    variant: 'dotted',
  },
  render: (args) => ({
    components: { Divider },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full space-y-4">
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          第一部分内容
        </div>
        <Divider v-bind="args" />
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          第二部分内容
        </div>
      </div>
    `,
  }),
}

/**
 * 带标签的分隔线
 */
export const WithLabel: Story = {
  args: {
    label: '文字标签',
  },
  render: (args) => ({
    components: { Divider },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full space-y-4">
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          上方内容
        </div>
        <Divider v-bind="args" />
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          下方内容
        </div>
        <Divider label="另一个标签" />
        <div class="h-16 bg-slate-50 dark:bg-slate-800 rounded-md p-4">
          更多内容
        </div>
      </div>
    `,
  }),
}

/**
 * 所有线型变体
 */
export const AllVariants: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="w-full space-y-8">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">实线 (Solid)</div>
          <Divider variant="solid" />
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">虚线 (Dashed)</div>
          <Divider variant="dashed" />
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">点线 (Dotted)</div>
          <Divider variant="dotted" />
        </div>
      </div>
    `,
  }),
}

/**
 * 所有带标签变体
 */
export const AllLabelVariants: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="w-full space-y-8">
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">实线 + 标签</div>
          <Divider variant="solid" label="Solid" />
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">虚线 + 标签</div>
          <Divider variant="dashed" label="Dashed" />
        </div>
        <div>
          <div class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">点线 + 标签</div>
          <Divider variant="dotted" label="Dotted" />
        </div>
      </div>
    `,
  }),
}

/**
 * 垂直分隔线
 */
export const Vertical: Story = {
  args: {
    direction: 'vertical',
  },
  render: (args) => ({
    components: { Divider },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center gap-4 h-40">
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          左侧内容
        </div>
        <Divider v-bind="args" />
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          中间内容
        </div>
        <Divider v-bind="args" variant="dashed" />
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          右侧内容
        </div>
      </div>
    `,
  }),
}

/**
 * 垂直分隔线（带标签）
 */
export const VerticalWithLabel: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="flex items-center gap-4 h-48">
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          第一部分
        </div>
        <Divider direction="vertical" label="OR" />
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          第二部分
        </div>
      </div>
    `,
  }),
}

/**
 * 垂直分隔线所有变体
 */
export const VerticalAllVariants: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div class="flex items-center gap-6 h-48">
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          内容 1
        </div>
        <Divider direction="vertical" variant="solid" />
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          内容 2
        </div>
        <Divider direction="vertical" variant="dashed" />
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          内容 3
        </div>
        <Divider direction="vertical" variant="dotted" />
        <div class="flex-1 bg-slate-50 dark:bg-slate-800 rounded-md p-4 text-center">
          内容 4
        </div>
      </div>
    `,
  }),
}
