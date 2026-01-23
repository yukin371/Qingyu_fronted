/**
 * Textarea 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Textarea from './Textarea.vue'

// Meta 配置
const meta: Meta<typeof Textarea> = {
  title: 'Base/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'v-model 绑定值',
    },
    rows: {
      control: 'number',
      description: '显示行数',
    },
    maxlength: {
      control: 'number',
      description: '最大长度',
    },
    showCount: {
      control: 'boolean',
      description: '显示字数统计',
    },
    resize: {
      control: 'select',
      options: ['none', 'both', 'horizontal', 'vertical'],
      description: '调整大小',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    readonly: {
      control: 'boolean',
      description: '只读状态',
    },
    error: {
      control: 'boolean',
      description: '错误状态',
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
      description: '状态',
    },
    placeholder: {
      control: 'text',
      description: '占位符',
    },
    autofocus: {
      control: 'boolean',
      description: '自动聚焦',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
    },
  },
  args: {
    rows: 3,
    showCount: false,
    resize: 'vertical',
    disabled: false,
    readonly: false,
    error: false,
    state: 'default',
    autofocus: false,
    size: 'md',
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

// 基础用法
export const Default: Story = {
  args: {
    placeholder: '请输入内容...',
  },
}

// 不同尺寸
export const Sizes: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea size="sm" placeholder="小尺寸文本框" />
        <Textarea size="md" placeholder="中等尺寸文本框" />
        <Textarea size="lg" placeholder="大尺寸文本框" />
      </div>
    `,
  }),
}

// 字数统计
export const WithCharacterCount: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return { value: '' }
    },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea
          v-model="value"
          :maxlength="100"
          :show-count="true"
          placeholder="请输入内容（最多100字）"
        />
        <Textarea
          v-model="value"
          :maxlength="500"
          :show-count="true"
          placeholder="请输入内容（最多500字）"
        />
      </div>
    `,
  }),
}

// 不同状态
export const States: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea state="default" placeholder="默认状态" />
        <Textarea state="error" placeholder="错误状态" />
        <Textarea state="success" placeholder="成功状态" />
        <Textarea state="warning" placeholder="警告状态" />
      </div>
    `,
  }),
}

// 禁用和只读
export const DisabledAndReadonly: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea disabled placeholder="禁用状态" />
        <Textarea readonly placeholder="只读状态" value="这是只读内容，无法编辑" />
      </div>
    `,
  }),
}

// 调整大小选项
export const ResizeOptions: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea resize="none" placeholder="不可调整大小" />
        <Textarea resize="vertical" placeholder="垂直调整" />
        <Textarea resize="horizontal" placeholder="水平调整" />
        <Textarea resize="both" placeholder="自由调整" />
      </div>
    `,
  }),
}

// 不同行数
export const DifferentRows: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea :rows="2" placeholder="2 行" />
        <Textarea :rows="4" placeholder="4 行" />
        <Textarea :rows="6" placeholder="6 行" />
      </div>
    `,
  }),
}

// v-model 绑定
export const WithVModel: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return { message: '这是通过 v-model 绑定的内容' }
    },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea v-model="message" placeholder="输入内容会同步到下方" />
        <div class="rounded-md bg-slate-100 p-4 dark:bg-slate-800">
          <p class="text-sm font-medium">绑定值:</p>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ message }}</p>
        </div>
      </div>
    `,
  }),
}

// 表单验证示例
export const FormValidation: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return { value: '' }
    },
    template: `
      <div class="flex flex-col gap-4">
        <Textarea
          v-model="value"
          placeholder="请输入描述（必填，至少10个字符）"
          :minlength="10"
          :maxlength="200"
          :show-count="true"
          :state="value.length > 0 && value.length < 10 ? 'error' : 'default'"
        />
        <p v-if="value.length > 0 && value.length < 10" class="text-sm text-danger-DEFAULT">
          描述至少需要10个字符
        </p>
      </div>
    `,
  }),
}

// 实际使用场景
export const RealWorldUsage: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      return {
        comment: '',
        description: '',
        feedback: '',
      }
    },
    template: `
      <div class="space-y-6">
        <!-- 评论输入 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            发表评论
          </label>
          <Textarea
            v-model="comment"
            placeholder="写下你的评论..."
            :rows="3"
            :maxlength="500"
            :show-count="true"
          />
        </div>

        <!-- 商品描述 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            商品描述
          </label>
          <Textarea
            v-model="description"
            placeholder="请详细描述商品的特点、规格、使用方法等..."
            :rows="6"
            :maxlength="2000"
            :show-count="true"
          />
        </div>

        <!-- 用户反馈 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            您的反馈
          </label>
          <Textarea
            v-model="feedback"
            placeholder="请告诉我们您的意见和建议..."
            :rows="4"
          />
        </div>
      </div>
    `,
  }),
}
