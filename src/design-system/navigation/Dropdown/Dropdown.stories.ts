import type { Meta, StoryObj } from '@storybook/vue3'
import Dropdown from './Dropdown.vue'
import DropdownItem from './DropdownItem.vue'
import DropdownDivider from './DropdownDivider.vue'

/**
 * Dropdown 下拉菜单组件 Storybook 故事
 *
 * 展示所有触发方式、位置和状态
 */

const meta = {
  title: 'Design System/Navigation/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'focus', 'contextmenu'],
      description: '触发方式',
    },
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ],
      description: '下拉菜单位置',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    hideOnClick: {
      control: 'boolean',
      description: '点击后隐藏',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '菜单尺寸',
    },
    showArrow: {
      control: 'boolean',
      description: '显示箭头',
    },
  },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

// Default - 基础下拉菜单
export const Default: Story = {
  args: {
    trigger: 'click',
    placement: 'bottom',
  },
  render: (args) => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
        alert(`Command: ${command}`)
      }
      return { args, handleCommand }
    },
    template: `
      <div class="p-8">
        <Dropdown v-bind="args" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
              Click Me
            </button>
          </template>
          <DropdownItem command="profile">Profile</DropdownItem>
          <DropdownItem command="settings">Settings</DropdownItem>
          <DropdownItem command="logout">Logout</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// Triggers - 不同触发方式
export const Triggers: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8 flex gap-8">
        <Dropdown trigger="click" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md">Click</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>

        <Dropdown trigger="hover" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-secondary-500 text-white rounded-md">Hover</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>

        <Dropdown trigger="focus" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-success-500 text-white rounded-md">Focus</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>

        <Dropdown trigger="contextmenu" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-warning-500 text-white rounded-md">Right Click</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// Placements - 不同位置
export const Placements: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const placements = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end']
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { placements, handleCommand }
    },
    template: `
      <div class="p-8 grid grid-cols-3 gap-4">
        <Dropdown
          v-for="placement in placements"
          :key="placement"
          :placement="placement"
          @command="handleCommand"
        >
          <template #trigger>
            <button class="px-3 py-2 bg-primary-500 text-white rounded-md text-sm">
              {{ placement }}
            </button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// WithIcons - 带图标
export const WithIcons: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8">
        <Dropdown @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md">
              Menu with Icons
            </button>
          </template>
          <DropdownItem command="profile">
            <template #icon>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </template>
            Profile
          </DropdownItem>
          <DropdownItem command="settings">
            <template #icon>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </template>
            Settings
          </DropdownItem>
          <DropdownItem command="logout">
            <template #icon>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </template>
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// Divided - 分割线
export const Divided: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem, DropdownDivider },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8">
        <Dropdown @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md">
              Menu with Dividers
            </button>
          </template>
          <DropdownItem command="new">New Document</DropdownItem>
          <DropdownItem command="open">Open...</DropdownItem>
          <DropdownItem command="save" divided>Save</DropdownItem>
          <DropdownItem command="print">Print</DropdownItem>
          <DropdownDivider />
          <DropdownItem command="exit">Exit</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// Disabled - 禁用项
export const Disabled: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
        alert(`Command: ${command}`)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8 flex gap-4">
        <Dropdown @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md">
              Menu with Disabled Items
            </button>
          </template>
          <DropdownItem command="edit">Edit</DropdownItem>
          <DropdownItem command="copy">Copy</DropdownItem>
          <DropdownItem command="paste" :disabled="true">Paste (Disabled)</DropdownItem>
          <DropdownItem command="delete" :disabled="true">Delete (Disabled)</DropdownItem>
        </Dropdown>

        <Dropdown :disabled="true" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-slate-400 text-white rounded-md cursor-not-allowed">
              Disabled Menu
            </button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// Sizes - 不同尺寸
export const Sizes: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8 flex gap-8">
        <Dropdown size="small" @command="handleCommand">
          <template #trigger>
            <button class="px-3 py-1.5 bg-primary-500 text-white rounded-md text-sm">Small</button>
          </template>
          <DropdownItem command="1">Small Item 1</DropdownItem>
          <DropdownItem command="2">Small Item 2</DropdownItem>
          <DropdownItem command="3">Small Item 3</DropdownItem>
        </Dropdown>

        <Dropdown size="medium" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-secondary-500 text-white rounded-md">Medium</button>
          </template>
          <DropdownItem command="1">Medium Item 1</DropdownItem>
          <DropdownItem command="2">Medium Item 2</DropdownItem>
          <DropdownItem command="3">Medium Item 3</DropdownItem>
        </Dropdown>

        <Dropdown size="large" @command="handleCommand">
          <template #trigger>
            <button class="px-5 py-2.5 bg-success-500 text-white rounded-md text-lg">Large</button>
          </template>
          <DropdownItem command="1">Large Item 1</DropdownItem>
          <DropdownItem command="2">Large Item 2</DropdownItem>
          <DropdownItem command="3">Large Item 3</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// Nested - 嵌套下拉
export const Nested: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8">
        <Dropdown @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md">
              Nested Menu
            </button>
          </template>
          <DropdownItem command="file">File</DropdownItem>
          <DropdownItem command="edit">Edit</DropdownItem>
          <DropdownItem command="view">
            View
            <Dropdown placement="right-start" @command="handleCommand" class="ml-2">
              <template #trigger>
                <span class="flex items-center">
                  Zoom
                  <svg class="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </template>
              <DropdownItem command="zoom-in">Zoom In</DropdownItem>
              <DropdownItem command="zoom-out">Zoom Out</DropdownItem>
              <DropdownItem command="reset-zoom">Reset Zoom</DropdownItem>
            </Dropdown>
          </DropdownItem>
          <DropdownItem command="help">Help</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// CustomTrigger - 自定义触发器
export const CustomTrigger: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8 flex gap-8">
        <Dropdown @command="handleCommand">
          <template #trigger>
            <div class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full cursor-pointer hover:shadow-lg transition-shadow">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" class="w-8 h-8 rounded-full bg-white" alt="Avatar" />
              <span>John Doe</span>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </template>
          <DropdownItem command="profile">Profile</DropdownItem>
          <DropdownItem command="settings">Settings</DropdownItem>
          <DropdownItem command="logout">Logout</DropdownItem>
        </Dropdown>

        <Dropdown @command="handleCommand" trigger="hover">
          <template #trigger>
            <div class="flex items-center gap-2 p-3 border-2 border-dashed border-primary-500 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
              <svg class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="text-primary-700 font-medium">Create New</span>
            </div>
          </template>
          <DropdownItem command="file">File</DropdownItem>
          <DropdownItem command="folder">Folder</DropdownItem>
          <DropdownItem command="project">Project</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}

// ClickEvent - 点击事件
export const ClickEvent: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command received:', command)
        alert(`You clicked: ${command}`)
      }
      const handleClick = (event: MouseEvent) => {
        console.log('Dropdown clicked!', event)
      }
      const handleVisibleChange = (visible: boolean) => {
        console.log('Dropdown visible:', visible)
      }
      return { handleCommand, handleClick, handleVisibleChange }
    },
    template: `
      <div class="p-8">
        <Dropdown
          @command="handleCommand"
          @click="handleClick"
          @visible-change="handleVisibleChange"
        >
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
              Events Demo (Check Console)
            </button>
          </template>
          <DropdownItem command="option1">Option 1</DropdownItem>
          <DropdownItem command="option2">Option 2</DropdownItem>
          <DropdownItem command="option3">Option 3</DropdownItem>
        </Dropdown>
        <p class="mt-4 text-sm text-slate-600">
          Open the browser console to see event logs
        </p>
      </div>
    `,
  }),
}

// ArrowExample - 带箭头示例
export const ArrowExample: Story = {
  render: () => ({
    components: { Dropdown, DropdownItem },
    setup() {
      const handleCommand = (command: any) => {
        console.log('Command:', command)
      }
      return { handleCommand }
    },
    template: `
      <div class="p-8 flex gap-8">
        <Dropdown placement="top" :show-arrow="true" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-primary-500 text-white rounded-md">Top with Arrow</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>

        <Dropdown placement="bottom" :show-arrow="true" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-secondary-500 text-white rounded-md">Bottom with Arrow</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>

        <Dropdown placement="left" :show-arrow="true" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-success-500 text-white rounded-md">Left with Arrow</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>

        <Dropdown placement="right" :show-arrow="true" @command="handleCommand">
          <template #trigger>
            <button class="px-4 py-2 bg-warning-500 text-white rounded-md">Right with Arrow</button>
          </template>
          <DropdownItem command="1">Item 1</DropdownItem>
          <DropdownItem command="2">Item 2</DropdownItem>
          <DropdownItem command="3">Item 3</DropdownItem>
        </Dropdown>
      </div>
    `,
  }),
}
