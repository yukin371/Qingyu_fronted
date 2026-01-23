import type { Meta, StoryObj } from '@storybook/vue3'
import Icon from './Icon.vue'

/**
 * Icon 组件 Storybook 故事
 *
 * 展示所有图标、尺寸和变体
 */

const meta = {
  title: 'Design System/Base/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'home',
        'user',
        'document',
        'folder',
        'plus',
        'minus',
        'check',
        'x-mark',
        'pencil',
        'trash',
        'arrow-down',
        'arrow-up',
        'arrow-left',
        'arrow-right',
        'chevron-down',
        'chevron-up',
        'chevron-left',
        'chevron-right',
        'magnifying-glass',
        'cog-6-tooth',
        'bell',
        'heart',
        'star',
        'lock-closed',
        'information-circle',
      ],
      description: '图标名称',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: '图标尺寸',
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline'],
      description: '图标变体',
    },
    ariaLabel: {
      control: 'text',
      description: 'ARIA 标签',
    },
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

// 默认故事
export const Default: Story = {
  args: {
    name: 'home',
    size: 'md',
    variant: 'outline',
  },
  render: (args) => ({
    components: { Icon },
    setup() {
      return { args }
    },
    template: '<Icon v-bind="args" />',
  }),
}

// 所有轮廓图标
export const AllOutlineIcons: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div class="grid grid-cols-6 gap-4 p-8">
        <div class="flex flex-col items-center gap-2">
          <Icon name="home" variant="outline" />
          <span class="text-xs">home</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="user" variant="outline" />
          <span class="text-xs">user</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="document" variant="outline" />
          <span class="text-xs">document</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="folder" variant="outline" />
          <span class="text-xs">folder</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="plus" variant="outline" />
          <span class="text-xs">plus</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="minus" variant="outline" />
          <span class="text-xs">minus</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="check" variant="outline" />
          <span class="text-xs">check</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="x-mark" variant="outline" />
          <span class="text-xs">x-mark</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="pencil" variant="outline" />
          <span class="text-xs">pencil</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="trash" variant="outline" />
          <span class="text-xs">trash</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-down" variant="outline" />
          <span class="text-xs">arrow-down</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-up" variant="outline" />
          <span class="text-xs">arrow-up</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-left" variant="outline" />
          <span class="text-xs">arrow-left</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-right" variant="outline" />
          <span class="text-xs">arrow-right</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-down" variant="outline" />
          <span class="text-xs">chevron-down</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-up" variant="outline" />
          <span class="text-xs">chevron-up</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-left" variant="outline" />
          <span class="text-xs">chevron-left</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-right" variant="outline" />
          <span class="text-xs">chevron-right</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="magnifying-glass" variant="outline" />
          <span class="text-xs">magnifying-glass</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="cog-6-tooth" variant="outline" />
          <span class="text-xs">cog-6-tooth</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="bell" variant="outline" />
          <span class="text-xs">bell</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="heart" variant="outline" />
          <span class="text-xs">heart</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="star" variant="outline" />
          <span class="text-xs">star</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="lock-closed" variant="outline" />
          <span class="text-xs">lock-closed</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="information-circle" variant="outline" />
          <span class="text-xs">information-circle</span>
        </div>
      </div>
    `,
  }),
}

// 所有实心图标
export const AllSolidIcons: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div class="grid grid-cols-6 gap-4 p-8">
        <div class="flex flex-col items-center gap-2">
          <Icon name="home" variant="solid" />
          <span class="text-xs">home</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="user" variant="solid" />
          <span class="text-xs">user</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="document" variant="solid" />
          <span class="text-xs">document</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="folder" variant="solid" />
          <span class="text-xs">folder</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="plus" variant="solid" />
          <span class="text-xs">plus</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="minus" variant="solid" />
          <span class="text-xs">minus</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="check" variant="solid" />
          <span class="text-xs">check</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="x-mark" variant="solid" />
          <span class="text-xs">x-mark</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="pencil" variant="solid" />
          <span class="text-xs">pencil</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="trash" variant="solid" />
          <span class="text-xs">trash</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-down" variant="solid" />
          <span class="text-xs">arrow-down</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-up" variant="solid" />
          <span class="text-xs">arrow-up</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-left" variant="solid" />
          <span class="text-xs">arrow-left</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="arrow-right" variant="solid" />
          <span class="text-xs">arrow-right</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-down" variant="solid" />
          <span class="text-xs">chevron-down</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-up" variant="solid" />
          <span class="text-xs">chevron-up</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-left" variant="solid" />
          <span class="text-xs">chevron-left</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="chevron-right" variant="solid" />
          <span class="text-xs">chevron-right</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="magnifying-glass" variant="solid" />
          <span class="text-xs">magnifying-glass</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="cog-6-tooth" variant="solid" />
          <span class="text-xs">cog-6-tooth</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="bell" variant="solid" />
          <span class="text-xs">bell</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="heart" variant="solid" />
          <span class="text-xs">heart</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="star" variant="solid" />
          <span class="text-xs">star</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="lock-closed" variant="solid" />
          <span class="text-xs">lock-closed</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="information-circle" variant="solid" />
          <span class="text-xs">information-circle</span>
        </div>
      </div>
    `,
  }),
}

// 所有尺寸
export const AllSizes: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div class="flex items-center gap-8 p-8">
        <div class="flex flex-col items-center gap-2">
          <Icon name="home" size="xs" />
          <span class="text-xs">XS (16px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="home" size="sm" />
          <span class="text-xs">SM (20px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="home" size="md" />
          <span class="text-xs">MD (24px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="home" size="lg" />
          <span class="text-xs">LG (32px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="home" size="xl" />
          <span class="text-xs">XL (40px)</span>
        </div>
      </div>
    `,
  }),
}

// 变体对比
export const Variants: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div class="flex gap-8 p-8">
        <div class="flex flex-col items-center gap-2">
          <Icon name="heart" variant="outline" size="xl" />
          <span class="text-sm">Outline</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="heart" variant="solid" size="xl" />
          <span class="text-sm">Solid</span>
        </div>
      </div>
    `,
  }),
}

// 带点击事件
export const Interactive: Story = {
  render: () => ({
    components: { Icon },
    setup() {
      const handleClick = () => {
        alert('Icon clicked!')
      }
      return { handleClick }
    },
    template: `
      <div class="flex gap-4 p-8">
        <Icon name="heart" variant="outline" size="xl" class="cursor-pointer hover:text-red-500 transition-colors" @click="handleClick" />
        <Icon name="star" variant="outline" size="xl" class="cursor-pointer hover:text-yellow-500 transition-colors" @click="handleClick" />
        <Icon name="check" variant="outline" size="xl" class="cursor-pointer hover:text-green-500 transition-colors" @click="handleClick" />
      </div>
    `,
  }),
}

// 带文字的图标
export const WithText: Story = {
  render: () => ({
    components: { Icon },
    template: `
      <div class="space-y-4 p-8">
        <div class="flex items-center gap-2">
          <Icon name="check" variant="solid" />
          <span>Task completed</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="information-circle" variant="outline" />
          <span>Important information</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="bell" variant="outline" />
          <span>You have 3 new notifications</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="trash" variant="outline" />
          <span>Delete this item</span>
        </div>
      </div>
    `,
  }),
}
