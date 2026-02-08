<script setup lang="ts">
/**
 * Card 组件
 *
 * 基础卡片组件，用于内容分组展示
 * 支持 header, default, footer 插槽
 * 支持多种变体和 hover 效果
 */

import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { CardProps } from './types'

// 使用 CVA 定义卡片变体
const cardVariants = cva(
  // 基础样式
  'bg-white rounded-lg transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'p-6',
        bordered: 'p-6 border border-slate-200',
        elevated: 'p-6 shadow-md',
      },
      hoverable: {
        true: 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hoverable: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  hoverable: false,
})

// 计算样式类名
const cardClasses = computed(() =>
  cn(
    cardVariants({
      variant: props.variant,
      hoverable: props.hoverable,
    }),
    props.class
  )
)
</script>

<template>
  <div :class="cardClasses">
    <!-- Header 插槽 -->
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>

    <!-- 默认内容插槽 -->
    <slot />

    <!-- Footer 插槽 -->
    <div v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>
