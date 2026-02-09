/**
 * QyTag CVA variants configuration
 *
 * 使用 class-variance-authority 管理标签变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 标签变体配置
 *
 * 包含以下维度：
 * - type: 颜色类型
 * - size: 尺寸变体
 * - effect: 视觉效果（light/dark/plain）
 * - round: 圆角样式
 * - hit: 带边框效果
 */
export const tagVariants = cva(
  // 基础样式
  [
    'inline-flex items-center gap-1.5 font-medium',
    'transition-all duration-200',
    'select-none',
    'backdrop-blur-sm'
  ],
  {
    variants: {
      /**
       * 颜色类型
       */
      type: {
        primary: '',
        success: '',
        warning: '',
        danger: '',
        info: ''
      },

      /**
       * 尺寸变体
       */
      size: {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-3.5 py-2 text-base'
      },

      /**
       * 视觉效果
       * - light: 浅色背景（默认）
       * - dark: 深色背景
       * - plain: 朴素样式（仅边框）
       */
      effect: {
        light: '',
        dark: '',
        plain: ''
      },

      /**
       * 圆角样式
       */
      round: {
        true: 'rounded-full',
        false: 'rounded-md'
      },

      /**
       * 带边框效果
       */
      hit: {
        true: 'border-2',
        false: 'border'
      }
    },

    // 组合变体（type + effect 的样式组合）
    compoundVariants: [
      // primary type
      { type: 'primary', effect: 'light', class: 'bg-primary-50/95 border-primary-200/70 text-primary-700 hover:bg-primary-100' },
      { type: 'primary', effect: 'dark', class: 'bg-primary-500 border-primary-600 text-white hover:bg-primary-600' },
      { type: 'primary', effect: 'plain', class: 'bg-transparent border-primary-500 text-primary-500 hover:bg-primary-50' },

      // success type
      { type: 'success', effect: 'light', class: 'bg-success-50/95 border-success-200/70 text-success-700 hover:bg-success-100' },
      { type: 'success', effect: 'dark', class: 'bg-success-500 border-success-600 text-white hover:bg-success-600' },
      { type: 'success', effect: 'plain', class: 'bg-transparent border-success-500 text-success-500 hover:bg-success-50' },

      // warning type
      { type: 'warning', effect: 'light', class: 'bg-warning-50/95 border-warning-200/70 text-warning-700 hover:bg-warning-100' },
      { type: 'warning', effect: 'dark', class: 'bg-warning-500 border-warning-600 text-white hover:bg-warning-600' },
      { type: 'warning', effect: 'plain', class: 'bg-transparent border-warning-500 text-warning-500 hover:bg-warning-50' },

      // danger type
      { type: 'danger', effect: 'light', class: 'bg-danger-50/95 border-danger-200/70 text-danger-700 hover:bg-danger-100' },
      { type: 'danger', effect: 'dark', class: 'bg-danger-500 border-danger-600 text-white hover:bg-danger-600' },
      { type: 'danger', effect: 'plain', class: 'bg-transparent border-danger-500 text-danger-500 hover:bg-danger-50' },

      // info type
      { type: 'info', effect: 'light', class: 'bg-info-50/95 border-info-200/70 text-info-700 hover:bg-info-100' },
      { type: 'info', effect: 'dark', class: 'bg-info-500 border-info-600 text-white hover:bg-info-600' },
      { type: 'info', effect: 'plain', class: 'bg-transparent border-info-500 text-info-500 hover:bg-info-50' }
    ],

    // 默认变体
    defaultVariants: {
      type: 'primary',
      size: 'md',
      effect: 'light',
      round: true,
      hit: false
    }
  }
)

/**
 * 标签变体类型
 * 从 CVA 配置中自动推导
 */
export type TagVariants = VariantProps<typeof tagVariants>
