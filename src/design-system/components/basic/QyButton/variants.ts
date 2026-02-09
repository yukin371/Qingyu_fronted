/**
 * QyButton CVA variants configuration
 *
 * 使用 class-variance-authority 管理按钮变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 按钮变体配置
 *
 * 包含以下维度：
 * - variant: 视觉样式变体
 * - size: 尺寸变体
 * - stateLayer: Fluent Design 风格的状态层
 */
export const buttonVariants = cva(
  // 基础样式
  [
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
    'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none relative overflow-hidden'
  ],
  {
    variants: {
      /**
       * 视觉样式变体
       * - primary: 主要按钮（青蓝渐变 + Apple 风格）
       * - secondary: 次要按钮（玻璃拟态效果）
       * - danger: 危险按钮（红色渐变）
       * - ghost: 幽灵按钮（Material Design 风格状态层）
       * - outline: 轮廓按钮（带边框）
       * - text: 文字按钮（最小样式）
       */
      variant: {
        primary: [
          'text-white rounded-xl',
          'bg-gradient-to-r from-primary-600 to-secondary-600',
          'shadow-md shadow-primary-500/20',
          'hover:shadow-lg hover:shadow-primary-500/30',
          'hover:-translate-y-0.5 hover:scale-105',
          'active:scale-95 active:translate-y-0'
        ],
        secondary: [
          'text-slate-700 rounded-xl',
          'bg-white/60 backdrop-blur-md',
          'border border-white/50',
          'hover:bg-white/80 hover:-translate-y-0.5',
          'active:scale-95'
        ],
        danger: [
          'text-white rounded-xl',
          'bg-gradient-to-r from-danger-500 to-danger-600',
          'shadow-md shadow-danger-500/20',
          'hover:shadow-lg hover:shadow-danger-500/30',
          'hover:-translate-y-0.5 hover:scale-105',
          'active:scale-95 active:translate-y-0'
        ],
        ghost: [
          'text-slate-600 rounded-xl',
          'hover:bg-slate-100 active:bg-slate-200',
          'active:scale-95'
        ],
        outline: [
          'text-slate-700 rounded-xl',
          'border-2 border-slate-300',
          'hover:border-primary-500 hover:text-primary-600',
          'hover:bg-primary-50',
          'active:scale-95'
        ],
        text: [
          'text-primary-600 rounded-lg',
          'hover:bg-primary-50 active:bg-primary-100',
          'active:scale-95'
        ]
      },

      /**
       * 尺寸变体
       */
      size: {
        xs: 'px-2.5 py-1 text-xs min-h-[28px]',
        sm: 'px-3 py-1.5 text-sm min-h-[32px]',
        md: 'px-6 py-3 text-base min-h-[40px]',
        lg: 'px-8 py-4 text-lg min-h-[48px]',
        xl: 'px-10 py-5 text-xl min-h-[56px]'
      },

      /**
       * Fluent Design 风格的状态层
       * 在悬停或聚焦时显示半透明层
       */
      stateLayer: {
        none: '',
        hover: 'hover:after:absolute hover:after:inset-0 hover:after:bg-current hover:after:opacity-8',
        focus: 'focus:after:absolute focus:after:inset-0 focus:after:bg-current focus:after:opacity-12'
      }
    },

    // 默认变体
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      stateLayer: 'none'
    },

    // 组合变体（特殊情况的样式覆盖）
    compoundVariants: [
      // primary + lg 组合时增加阴影
      {
        variant: 'primary',
        size: 'lg',
        class: 'shadow-xl shadow-primary-500/25'
      },
      // danger + lg 组合时增加阴影
      {
        variant: 'danger',
        size: 'lg',
        class: 'shadow-xl shadow-danger-500/25'
      }
    ]
  }
)

/**
 * 按钮变体类型
 * 从 CVA 配置中自动推导
 */
export type ButtonVariants = VariantProps<typeof buttonVariants>
