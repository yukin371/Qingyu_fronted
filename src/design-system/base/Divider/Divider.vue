<script setup lang="ts">
/**
 * Divider 组件
 *
 * 用于内容分割的分隔线组件
 * 支持水平/垂直方向、标签文字和多种线型
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { DividerProps } from './types'

// 使用 CVA 定义 Divider 变体
const dividerVariants = cva(
  // 基础样式
  '',
  {
    variants: {
      direction: {
        horizontal: 'h-px w-full border-t',
        vertical: 'h-full w-px border-l',
      },
      variant: {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
      },
    },
    defaultVariants: {
      direction: 'horizontal',
      variant: 'solid',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<DividerProps>(), {
  direction: 'horizontal',
  variant: 'solid',
  label: undefined,
})

// 计算基础容器类名
const containerClasses = computed(() => {
  return cn(
    'flex items-center',
    props.direction === 'vertical' ? 'h-full' : 'w-full',
    props.class
  )
})

// 计算线条样式
const lineClasses = computed(() => {
  return cn(
    dividerVariants({
      direction: props.direction,
      variant: props.variant,
    }),
    'border-slate-200 dark:border-slate-700'
  )
})

// 计算第一个线条的样式（有标签时）
const firstLineClasses = computed(() => {
  if (!props.label) return lineClasses.value

  return cn(
    lineClasses.value,
    props.direction === 'horizontal' ? 'flex-1' : 'h-1/2'
  )
})

// 计算第二个线条的样式（有标签时）
const secondLineClasses = computed(() => {
  if (!props.label) return ''

  return cn(
    lineClasses.value,
    props.direction === 'horizontal' ? 'flex-1' : 'h-1/2'
  )
})

// 计算标签容器样式
const labelContainerClasses = computed(() => {
  if (!props.label) return ''

  return cn(
    'px-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap',
    props.direction === 'horizontal' ? '' : 'py-3'
  )
})
</script>

<template>
  <div :class="containerClasses">
    <!-- 有标签时的布局 -->
    <template v-if="label">
      <!-- 第一条线 -->
      <div :class="firstLineClasses"></div>

      <!-- 标签 -->
      <span :class="labelContainerClasses">
        {{ label }}
      </span>

      <!-- 第二条线 -->
      <div :class="secondLineClasses"></div>
    </template>

    <!-- 无标签时的布局 -->
    <template v-else>
      <div :class="lineClasses"></div>
    </template>
  </div>
</template>
