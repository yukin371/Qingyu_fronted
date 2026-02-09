/**
 * QyAvatar CVA variants configuration
 *
 * 使用 class-variance-authority 管理头像变体
 * 提供类型安全的 variant 定义
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 头像容器变体配置
 *
 * 包含以下维度：
 * - size: 尺寸变体
 * - shape: 形状变体
 */
export const avatarVariants = cva(
  // 基础样式
  [
    'relative inline-flex overflow-hidden',
    'bg-white/70 backdrop-blur-md',
    'border-2 border-white/85',
    'shadow-[0_10px_24px_-16px_rgba(15,23,42,0.5)]',
    'transition-all duration-300 ease-out',
    'hover:shadow-[0_14px_30px_-16px_rgba(37,99,235,0.45)]',
    'hover:scale-105 hover:-translate-y-0.5'
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
      },
      /**
       * 形状变体
       */
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl'
      }
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle'
    }
  }
)

/**
 * 头像图片变体配置
 */
export const avatarImageVariants = cva(
  // 基础样式
  [
    'w-full h-full',
    'saturate-[1.05]'
  ],
  {
    variants: {
      /**
       * 图片适配方式
       */
      fit: {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        none: 'object-none',
        'scale-down': 'object-scale-down'
      }
    },
    defaultVariants: {
      fit: 'cover'
    }
  }
)

/**
 * 头像占位符变体配置
 */
export const avatarPlaceholderVariants = cva(
  // 基础样式
  [
    'w-full h-full',
    'flex items-center justify-center',
    'bg-gradient-to-br from-slate-100 to-slate-200',
    'text-slate-500'
  ],
  {
    variants: {
      /**
       * 尺寸变体（用于图标大小）
       */
      size: {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

/**
 * 文本头像背景色变体配置
 */
export const avatarTextBgVariants = cva(
  // 基础样式
  [],
  {
    variants: {
      /**
       * 颜色变体
       */
      color: {
        cyan: 'bg-gradient-to-br from-primary-400 to-primary-600',
        blue: 'bg-gradient-to-br from-secondary-400 to-secondary-600',
        green: 'bg-gradient-to-br from-green-400 to-green-600',
        red: 'bg-gradient-to-br from-red-400 to-red-600',
        yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
        pink: 'bg-gradient-to-br from-pink-400 to-pink-600'
      }
    },
    defaultVariants: {
      color: 'cyan'
    }
  }
)

/**
 * 头像文本变体配置
 */
export const avatarTextVariants = cva(
  // 基础样式
  [
    'font-semibold text-white'
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

/**
 * 头像组容器变体配置
 */
export const avatarGroupVariants = cva(
  // 基础样式
  [
    'flex items-center'
  ],
  {
    variants: {}
  }
)

/**
 * 头像组中单个头像变体配置
 */
export const avatarGroupItemVariants = cva(
  // 基础样式
  [
    'relative overflow-hidden',
    'border-2 border-white/90',
    'shadow-[0_8px_20px_-14px_rgba(15,23,42,0.45)]'
  ],
  {
    variants: {
      /**
       * 尺寸变体
       */
      size: {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
      },
      /**
       * 形状变体
       */
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl'
      }
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle'
    }
  }
)

/**
 * 头像变体类型
 * 从 CVA 配置中自动推导
 */
export type AvatarVariants = VariantProps<typeof avatarVariants>
export type AvatarImageVariants = VariantProps<typeof avatarImageVariants>
export type AvatarPlaceholderVariants = VariantProps<typeof avatarPlaceholderVariants>
export type AvatarTextBgVariants = VariantProps<typeof avatarTextBgVariants>
export type AvatarTextVariants = VariantProps<typeof avatarTextVariants>
export type AvatarGroupItemVariants = VariantProps<typeof avatarGroupItemVariants>
