/**
 * QyBadge CVA variants configuration
 *
 * 使用 class-variance-authority 管理徽章变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 徽章变体配置
 *
 * 包含以下维度：
 * - type: 徽章类型（dot/text/number）
 * - color: 颜色变体（primary/success/warning/danger/info）
 * - size: 尺寸变体（sm/md/lg）
 */
export const badgeVariants = cva(
  // 基础样式
  [
    'inline-flex items-center justify-center',
    'font-semibold',
    'transition-all duration-200',
    'select-none'
  ],
  {
    variants: {
      /**
       * 徽章类型
       * - dot: 只显示小圆点
       * - text: 文本徽章
       * - number: 数字徽章（支持max值显示）
       */
      type: {
        dot: [
          'rounded-full',
          'flex-shrink-0'
        ],
        text: [
          'px-2.5 py-0.5 rounded-full',
          'text-sm'
        ],
        number: [
          'px-2 py-0.5 rounded-full',
          'text-xs',
          'min-w-[20px]',
          'border border-white/40',
          'shadow-[0_8px_16px_-10px_rgba(15,23,42,0.45)]'
        ]
      },

      /**
       * 颜色变体
       * - primary: 主要（青蓝渐变）
       * - success: 成功（绿色渐变）
       * - warning: 警告（黄色渐变）
       * - danger: 危险（红色渐变）
       * - info: 信息（蓝色渐变）
       */
      color: {
        primary: [
          'text-white',
          'bg-gradient-to-br from-primary-500 to-secondary-600'
        ],
        success: [
          'text-white',
          'bg-gradient-to-br from-success-500 to-success-600'
        ],
        warning: [
          'text-white',
          'bg-gradient-to-br from-warning-500 to-warning-600'
        ],
        danger: [
          'text-white',
          'bg-gradient-to-br from-danger-500 to-danger-600'
        ],
        info: [
          'text-white',
          'bg-gradient-to-br from-info-500 to-info-600'
        ]
      },

      /**
       * 尺寸变体
       */
      size: {
        sm: '',
        md: '',
        lg: ''
      }
    },

    // 默认变体
    defaultVariants: {
      type: 'number',
      color: 'primary',
      size: 'md'
    },

    // 组合变体（特殊情况的样式覆盖）
    compoundVariants: [
      // dot 类型特殊尺寸处理
      {
        type: 'dot',
        size: 'sm',
        class: 'w-2 h-2 ring-2 ring-white shadow-[0_0_0_1px_rgba(15,23,42,0.08)]'
      },
      {
        type: 'dot',
        size: 'md',
        class: 'w-3 h-3 ring-2 ring-white shadow-[0_0_0_1px_rgba(15,23,42,0.08)]'
      },
      {
        type: 'dot',
        size: 'lg',
        class: 'w-4 h-4 ring-2 ring-white shadow-[0_0_0_1px_rgba(15,23,42,0.08)]'
      },
      // text 类型尺寸处理
      {
        type: 'text',
        size: 'sm',
        class: 'text-xs px-2 py-0.5'
      },
      {
        type: 'text',
        size: 'md',
        class: 'text-sm px-2.5 py-1'
      },
      {
        type: 'text',
        size: 'lg',
        class: 'text-base px-3 py-1.5'
      },
      // number 类型尺寸处理
      {
        type: 'number',
        size: 'sm',
        class: 'text-[10px] h-4 min-w-[16px]'
      },
      {
        type: 'number',
        size: 'md',
        class: 'text-xs h-5 min-w-[20px]'
      },
      {
        type: 'number',
        size: 'lg',
        class: 'text-sm h-6 min-w-[24px]'
      }
    ]
  }
)

/**
 * 徽章变体类型
 * 从 CVA 配置中自动推导
 */
export type BadgeVariants = VariantProps<typeof badgeVariants>
