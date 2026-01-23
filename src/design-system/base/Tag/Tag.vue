<script setup lang="ts">
/**
 * Tag 组件
 *
 * 用于标签和分类展示的基础组件，支持多种变体和尺寸
 */

import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../Icon/Icon.vue'
import type { TagProps } from './types'

// 使用 CVA 定义 Tag 变体
const tagVariants = cva(
  // 基础样式
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        primary: 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-950 dark:text-primary-300 dark:border-primary-800',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
        danger: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      },
      size: {
        sm: 'h-6 px-2 text-xs',
        md: 'h-7 px-2.5 text-sm',
        lg: 'h-8 px-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

// 关闭按钮尺寸映射
const closeIconSizes: Record<string, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

// 组件 Props
const props = withDefaults(defineProps<TagProps>(), {
  variant: 'default',
  size: 'md',
  removable: false,
})

// 组件 Emits
const emit = defineEmits<{
  close: []
  click: [event: MouseEvent]
}>()

// 计算样式类名
const classes = computed(() =>
  cn(
    tagVariants({
      variant: props.variant,
      size: props.size,
    }),
    props.class
  )
)

// 计算关闭按钮样式
const closeButtonClasses = computed(() => {
  const base = 'rounded-full transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-1'
  const size = 'flex items-center justify-center p-0.5'
  return cn(base, size)
})

// 点击处理
const handleClick = (e: MouseEvent) => {
  if (props.onClick) {
    emit('click', e)
  }
}

// 关闭处理
const handleClose = (e: MouseEvent) => {
  e.stopPropagation() // 防止触发 Tag 的点击事件
  emit('close')
}
</script>

<template>
  <span :class="classes" @click="handleClick">
    <!-- 前缀图标 -->
    <Icon
      v-if="icon"
      :name="icon"
      :size="size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'sm'"
      class="flex-shrink-0"
    />

    <!-- 标签内容 -->
    <span class="truncate">
      <slot />
    </span>

    <!-- 关闭按钮 -->
    <button
      v-if="removable"
      type="button"
      :class="closeButtonClasses"
      :aria-label="`关闭标签`"
      @click="handleClose"
    >
      <svg
        :class="closeIconSizes[size]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </span>
</template>
