/**
 * QyInput CVA variants configuration
 *
 * 使用 class-variance-authority 管理输入框变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 输入框变体配置
 *
 * 包含以下维度：
 * - size: 尺寸变体
 * - state: 状态变体（默认/错误/成功/警告）
 */
export const inputVariants = cva(
  // 基础样式
  [
    'w-full',
    'rounded-xl',
    'bg-white/72 backdrop-blur-md',
    'border',
    'text-slate-800 placeholder:text-slate-400/95',
    'transition-all duration-300',
    'focus:outline-none',
    'shadow-[0_10px_24px_-16px_rgba(15,23,42,0.35)]',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/80 disabled:border-slate-200'
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        md: 'px-4 py-3 text-base min-h-[44px]',
        lg: 'px-5 py-4 text-lg min-h-[52px]'
      },

      /**
       * 状态变体
       */
      state: {
        default: [
          'border-white/80',
          'hover:border-blue-100',
          'focus:border-blue-300 focus:ring-4 focus:ring-blue-500/15 focus:bg-white'
        ],
        error: [
          'border-red-300 bg-red-50/85',
          'hover:border-red-400',
          'focus:border-red-400 focus:ring-4 focus:ring-red-500/15 focus:bg-red-50'
        ],
        success: [
          'border-emerald-300 bg-emerald-50/85',
          'hover:border-emerald-400',
          'focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 focus:bg-emerald-50'
        ],
        warning: [
          'border-amber-300 bg-amber-50/85',
          'hover:border-amber-400',
          'focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 focus:bg-amber-50'
        ]
      }
    },

    // 默认变体
    defaultVariants: {
      size: 'md',
      state: 'default'
    }
  }
)

/**
 * 输入框变体类型
 * 从 CVA 配置中自动推导
 */
export type InputVariants = VariantProps<typeof inputVariants>
