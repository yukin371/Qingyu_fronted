<script setup lang="ts">
/**
 * Skeleton 组件
 *
 * 骨架屏组件，用于加载时展示占位内容
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { SkeletonProps, skeletonSizeMap } from './types'

// 使用 CVA 定义骨架变体
const skeletonVariants = cva(
  // 基础样式
  'bg-slate-200 dark:bg-slate-700 rounded',
  {
    variants: {
      type: {
        text: 'rounded-sm',
        circle: 'rounded-full',
        rect: 'rounded-md',
        avatar: 'rounded-full',
        image: 'rounded-md',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      type: 'text',
      animated: true,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<SkeletonProps>(), {
  type: 'text',
  size: 'md',
  animated: true,
})

// 动态导入尺寸映射
import { skeletonSizeMap as sizeMap } from './types'

// 计算尺寸类名
const sizeClasses = computed(() => {
  if (props.width || props.height) {
    return []
  }
  const sizeInfo = sizeMap[props.type || 'text'][props.size || 'md']
  return [sizeInfo.width, sizeInfo.height]
})

// 计算自定义尺寸
const customStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = props.width
  }
  if (props.height) {
    style.height = props.height
  }
  return style
})

// 计算样式类名
const classes = computed(() =>
  cn(
    skeletonVariants({
      type: props.type,
      animated: props.animated,
    }),
    sizeClasses.value,
    props.class
  )
)
</script>

<template>
  <div :class="classes" :style="customStyle" aria-hidden="true" />
</template>
