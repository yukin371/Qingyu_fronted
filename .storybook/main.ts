import type { StorybookConfig } from '@storybook/vue3-vite'
import { resolve, dirname } from 'path'

/**
 * Storybook 配置
 *
 * 为 Tailwind UI 设计系统提供组件文档和预览
 */

const config: StorybookConfig = {
  stories: [
    // 设计系统组件故事
    '../src/design-system/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    // 现有组件故事（如果有的话）
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],

  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  // Vite 配置
  async viteFinal(config) {
    // 确保正确处理 Vue 单文件组件
    return config
  },
}

export default config
