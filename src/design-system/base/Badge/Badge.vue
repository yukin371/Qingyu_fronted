<script setup lang="ts">
/**
 * Badge 组件
 *
 * 用于徽章和通知数量展示
 * 支持数字、点和变体样式
 */

import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { BadgeProps } from './types'

// 使用 CVA 定义 Badge 变体
const badgeVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        primary: 'bg-primary-500 text-white',
        success: 'bg-success-DEFAULT text-white',
        warning: 'bg-warning-DEFAULT text-white',
        danger: 'bg-danger-DEFAULT text-white',
      },
      size: {
        sm: 'h-4 w-4 min-w-4 text-[10px] px-0.5',
        md: 'h-5 w-5 min-w-5 text-xs px-1',
        lg: 'h-6 w-6 min-w-6 text-sm px-1.5',
      },
      dot: {
        true: 'px-0',
        false: '',
      },
      absolute: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      dot: false,
      absolute: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  size: 'md',
  max: 99,
  absolute: false,
  position: 'top-0 right-0 -translate-y-1/2 translate-x-1/2',
  dot: false,
  content: null,
})

// 计算显示内容
const displayContent = computed(() => {
  // 如果是点模式，不显示内容
  if (props.dot) {
    return ''
  }

  // 如果没有内容，返回空（显示为红点）
  if (props.content === null || props.content === undefined) {
    return ''
  }

  // 如果是数字，检查是否超过 max
  if (typeof props.content === 'number') {
    return props.content > props.max ? `${props.max}+` : props.content
  }

  // 返回字符串内容
  return props.content
})

// 计算是否显示为红点
const isDot = computed(() => {
  return props.dot || (props.content === null || props.content === undefined)
})

// 计算样式类名
const classes = computed(() => {
  const baseClasses = badgeVariants({
    variant: props.variant,
    size: props.size,
    dot: isDot.value,
    absolute: props.absolute,
  })

  return cn(
    baseClasses,
    props.absolute ? props.position : '',
    props.class
  )
})
</script>

<template>
  <span :class="classes">
    {{ displayContent }}
  </span>
</template>
