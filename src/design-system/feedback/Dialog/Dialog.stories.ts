import type { Meta, StoryObj } from '@storybook/vue3'
import Dialog from './Dialog.vue'
import DialogFooter from './DialogFooter.vue'
import Button from '../../base/Button/Button.vue'

/**
 * Dialog 组件 Storybook 故事
 *
 * 展示所有尺寸、状态和交互方式
 */

const meta = {
  title: 'Design System/Feedback/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    visible: {
      control: 'boolean',
      description: '对话框显示状态',
    },
    title: {
      control: 'text',
      description: '对话框标题',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: '对话框尺寸',
    },
    center: {
      control: 'boolean',
      description: '是否居中显示',
    },
    modal: {
      control: 'boolean',
      description: '是否显示遮罩层',
    },
    showClose: {
      control: 'boolean',
      description: '是否显示关闭按钮',
    },
    closeOnClickModal: {
      control: 'boolean',
      description: '点击遮罩层是否关闭',
    },
    closeOnPressEscape: {
      control: 'boolean',
      description: '按 ESC 键是否关闭',
    },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

// 1. Default - 基础对话框
export const Default: Story = {
  args: {
    title: '对话框标题',
    visible: true,
    size: 'md',
  },
  render: (args) => ({
    components: { Dialog, Button },
    setup() {
      const { visible: initialVisible, ...restArgs } = args
      const visible = ref(initialVisible)

      return { args: restArgs, visible }
    },
    template: `
      <div>
        <Button @click="visible = true">打开对话框</Button>
        <Dialog v-bind="args" v-model:visible="visible">
          <p class="text-neutral-600 dark:text-neutral-400">
            这是一个基础对话框示例。对话框可以包含各种内容，如文本、表单、图片等。
          </p>
        </Dialog>
      </div>
    `,
  }),
}

// 2. Sizes - 不同尺寸
export const Sizes: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const
      const dialogs = ref(
        Object.fromEntries(sizes.map(s => [s, false]))
      )

      return { sizes, dialogs }
    },
    template: `
      <div class="flex flex-wrap gap-4 p-8">
        <Button
          v-for="size in sizes"
          :key="size"
          @click="dialogs[size] = true"
        >
          {{ size.toUpperCase() }} 对话框
        </Button>

        <Dialog
          v-for="size in sizes"
          :key="size"
          :title="\`\${size.toUpperCase()} 对话框\`"
          :size="size"
          v-model:visible="dialogs[size]"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这是 \{{ size }} 尺寸的对话框。
          </p>
        </Dialog>
      </div>
    `,
  }),
}

// 3. Centered - 居中显示
export const Centered: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开居中对话框</Button>
        <Dialog
          title="居中对话框"
          :center="true"
          v-model:visible="visible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这个对话框在屏幕中垂直和水平居中显示。
          </p>
        </Dialog>
      </div>
    `,
  }),
}

// 4. NoMask - 无遮罩
export const NoMask: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <div class="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p class="mb-4">这是背景内容，对话框没有遮罩层</p>
          <Button @click="visible = true">打开无遮罩对话框</Button>
        </div>
        <Dialog
          title="无遮罩对话框"
          :modal="false"
          v-model:visible="visible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这个对话框没有遮罩层，你可以看到背后的内容。
          </p>
        </Dialog>
      </div>
    `,
  }),
}

// 5. CustomHeader - 自定义头部
export const CustomHeader: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开自定义头部对话框</Button>
        <Dialog v-model:visible="visible">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">自定义头部</h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">带有图标和描述</p>
              </div>
            </div>
          </template>
          <p class="text-neutral-600 dark:text-neutral-400">
            这个对话框使用了自定义头部插槽。
          </p>
        </Dialog>
      </div>
    `,
  }),
}

// 6. CustomFooter - 自定义底部
export const CustomFooter: Story = {
  render: () => ({
    components: { Dialog, DialogFooter, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开自定义底部对话框</Button>
        <Dialog title="自定义底部" v-model:visible="visible">
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这个对话框使用了自定义底部插槽。
          </p>

          <template #footer>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-500 dark:text-neutral-400">
                提示信息
              </span>
              <div class="flex gap-3">
                <Button variant="secondary" @click="visible = false">取消</Button>
                <Button @click="visible = false">确定</Button>
              </div>
            </div>
          </template>
        </Dialog>
      </div>
    `,
  }),
}

// 7. AsyncClose - 异步关闭
export const AsyncClose: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)
      const loading = ref(false)

      const beforeClose = async () => {
        loading.value = true
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 1500))
        loading.value = false
        // 可以在这里添加验证逻辑
        const confirmed = confirm('确定要关闭吗？')
        return confirmed
      }

      return { visible, loading, beforeClose }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开异步关闭对话框</Button>
        <Dialog
          title="异步关闭"
          :before-close="beforeClose"
          v-model:visible="visible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            尝试关闭这个对话框时会触发异步验证操作。
          </p>
          <p v-if="loading" class="text-primary-600 dark:text-primary-400 mt-2">
            正在验证...
          </p>
        </Dialog>
      </div>
    `,
  }),
}

// 8. Nested - 嵌套对话框
export const Nested: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible1 = ref(false)
      const visible2 = ref(false)

      return { visible1, visible2 }
    },
    template: `
      <div class="p-8">
        <Button @click="visible1 = true">打开第一个对话框</Button>

        <Dialog title="第一个对话框" v-model:visible="visible1">
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">
            这是第一个对话框。
          </p>
          <Button @click="visible2 = true">打开第二个对话框</Button>

          <Dialog title="第二个对话框" v-model:visible="visible2">
            <p class="text-neutral-600 dark:text-neutral-400">
              这是嵌套的第二个对话框。你可以创建多层嵌套对话框。
            </p>
          </Dialog>
        </Dialog>
      </div>
    `,
  }),
}

// 9. Scrollable - 可滚动内容
export const Scrollable: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开可滚动对话框</Button>
        <Dialog title="可滚动内容" v-model:visible="visible">
          <div class="space-y-4">
            <p v-for="i in 30" :key="i" class="text-neutral-600 dark:text-neutral-400">
              这是第 \{{ i }} 段内容。当内容超出对话框高度时，会自动显示滚动条。
            </p>
          </div>
        </Dialog>
      </div>
    `,
  }),
}

// 10. FullScreen - 全屏对话框
export const FullScreen: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开全屏对话框</Button>
        <Dialog title="全屏对话框" size="full" v-model:visible="visible">
          <div class="h-full flex flex-col items-center justify-center space-y-4">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              全屏对话框
            </h2>
            <p class="text-neutral-600 dark:text-neutral-400">
              这是一个全屏对话框，适合显示大量内容或进行复杂操作。
            </p>
            <Button @click="visible = false">关闭</Button>
          </div>
        </Dialog>
      </div>
    `,
  }),
}

// 11. FormDialog - 表单对话框
export const FormDialog: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)
      const formData = ref({
        name: '',
        email: '',
        message: '',
      })

      const handleSubmit = () => {
        alert('表单提交：' + JSON.stringify(formData.value, null, 2))
        visible.value = false
      }

      return { visible, formData, handleSubmit }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开表单对话框</Button>
        <Dialog title="联系我们" v-model:visible="visible">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                姓名
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                邮箱
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                留言
              </label>
              <textarea
                v-model="formData.message"
                rows="4"
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="请输入留言内容"
              />
            </div>
          </form>

          <template #footer>
            <div class="flex justify-end gap-3">
              <Button variant="secondary" @click="visible = false">取消</Button>
              <Button type="submit" @click="handleSubmit">提交</Button>
            </div>
          </template>
        </Dialog>
      </div>
    `,
  }),
}

// 12. NoCloseButton - 无关闭按钮
export const NoCloseButton: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const visible = ref(false)

      return { visible }
    },
    template: `
      <div class="p-8">
        <Button @click="visible = true">打开无关闭按钮对话框</Button>
        <Dialog
          title="无关闭按钮"
          :show-close="false"
          v-model:visible="visible"
        >
          <p class="text-neutral-600 dark:text-neutral-400">
            这个对话框没有右上角的关闭按钮，用户只能通过底部按钮或按 ESC 键关闭。
          </p>
          <template #footer>
            <div class="flex justify-end gap-3">
              <Button variant="secondary" @click="visible = false">取消</Button>
              <Button @click="visible = false">确定</Button>
            </div>
          </template>
        </Dialog>
      </div>
    `,
  }),
}
