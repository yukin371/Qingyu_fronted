/**
 * QyCard CVA variants configuration
 *
 * 使用 class-variance-authority 管理卡片变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 卡片变体配置
 *
 * 包含以下维度：
 * - shadow: 阴影效果
 * - variant: 视觉样式变体
 * - padding: 内边距变体
 */
export const cardVariants = cva(
  // 基础样式
  [
    'relative overflow-hidden',
    'bg-white rounded-2xl',
    'transition-all duration-300'
  ],
  {
    variants: {
      /**
       * 阴影效果
       * - always: 始终显示阴影
       * - hover: 悬停时显示阴影
       * - never: 从不显示阴影
       */
      shadow: {
        always: 'shadow-lg shadow-slate-200/50',
        hover: 'hover:shadow-lg hover:shadow-slate-200/50',
        never: ''
      },
      /**
       * 视觉样式变体
       * - default: 默认样式（白色背景）
       * - glass: 玻璃拟态效果
       * - outlined: 轮廓样式
       * - elevated: 提升效果
       */
      variant: {
        default: [
          'bg-white',
          'border-0'
        ],
        glass: [
          'bg-white/70 backdrop-blur-xl',
          'border border-white/50'
        ],
        outlined: [
          'bg-white',
          'border-2 border-slate-200'
        ],
        elevated: [
          'bg-white',
          'shadow-xl shadow-slate-300/50',
          'border-0'
        ]
      },
      /**
       * 内边距变体
       * - none: 无内边距
       * - sm: 小内边距
       * - md: 中等内边距
       * - lg: 大内边距
       */
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    // 默认变体
    defaultVariants: {
      shadow: 'hover',
      variant: 'default',
      padding: 'md'
    },
    // 组合变体（特殊情况的样式覆盖）
    compoundVariants: [
      // glass + always 组合时增加阴影
      {
        variant: 'glass',
        shadow: 'always',
        class: 'shadow-xl shadow-slate-300/30'
      },
      // elevated + hover 组合时增强悬停效果
      {
        variant: 'elevated',
        shadow: 'hover',
        class: 'hover:shadow-2xl hover:shadow-slate-400/40 hover:-translate-y-1'
      }
    ]
  }
)

/**
 * 卡片头部样式变体
 */
export const cardHeaderVariants = cva(
  [
    'border-b border-slate-100',
    'pb-4 mb-4'
  ],
  {
    variants: {
      padding: {
        none: 'px-0 pt-0',
        sm: 'px-4 pt-4',
        md: 'px-6 pt-6',
        lg: 'px-8 pt-8'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
)

/**
 * 卡片底部样式变体
 */
export const cardFooterVariants = cva(
  [
    'border-t border-slate-100',
    'pt-4 mt-4'
  ],
  {
    variants: {
      padding: {
        none: 'px-0 pb-0',
        sm: 'px-4 pb-4',
        md: 'px-6 pb-6',
        lg: 'px-8 pb-8'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
)

/**
 * 卡片变体类型
 * 从 CVA 配置中自动推导
 */
export type CardVariants = VariantProps<typeof cardVariants>
