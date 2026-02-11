/**
 * QyPagination CVA variants configuration
 *
 * 使用 class-variance-authority 管理分页器变体
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 分页器容器变体配置
 */
export const paginationVariants = cva(
  [
    'flex',
    'items-center',
    'gap-2'
  ],
  {
    variants: {
      size: {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg'
      },
      background: {
        true: 'bg-slate-50 dark:bg-slate-800 p-2 rounded-lg',
        false: ''
      }
    },
    defaultVariants: {
      size: 'medium',
      background: false
    }
  }
)

/**
 * 分页按钮变体配置
 */
export const paginationButtonVariants = cva(
  [
    'min-w-[32px]',
    'h-8',
    'px-1',
    'flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'border',
    'transition-all',
    'duration-200',
    'cursor-pointer',
    'select-none'
  ],
  {
    variants: {
      active: {
        true: 'bg-primary-500 border-primary-500 text-white',
        false: 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: ''
      },
      size: {
        small: 'min-w-[28px] h-7 text-xs',
        medium: 'min-w-[32px] h-8 text-sm',
        large: 'min-w-[36px] h-9 text-base'
      }
    },
    defaultVariants: {
      active: false,
      disabled: false,
      size: 'medium'
    }
  }
)

/**
 * 分页器文字变体配置
 */
export const paginationTextVariants = cva(
  [
    'text-slate-600',
    'dark:text-slate-400'
  ],
  {
    variants: {
      size: {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base'
      }
    },
    defaultVariants: {
      size: 'medium'
    }
  }
)

/**
 * 每页数量选择器变体配置
 */
export const paginationSelectVariants = cva(
  [
    'px-2',
    'py-1',
    'rounded-md',
    'border',
    'border-slate-300',
    'dark:border-slate-600',
    'bg-white',
    'dark:bg-slate-800',
    'text-slate-700',
    'dark:text-slate-300',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500'
  ],
  {
    variants: {
      size: {
        small: 'text-xs h-7',
        medium: 'text-sm h-8',
        large: 'text-base h-9'
      }
    },
    defaultVariants: {
      size: 'medium'
    }
  }
)

/**
 * 分页器变体类型
 */
export type PaginationVariants = VariantProps<typeof paginationVariants>
export type PaginationButtonVariants = VariantProps<typeof paginationButtonVariants>
export type PaginationTextVariants = VariantProps<typeof paginationTextVariants>
export type PaginationSelectVariants = VariantProps<typeof paginationSelectVariants>
