<script setup lang="ts">
/**
 * Spinner 加载中组件
 *
 * 用于显示加载状态和进度反馈的组件
 * 支持多种动画类型和尺寸
 */

import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { SpinnerProps } from './types'

// 使用 CVA 定义 Spinner 容器变体
const spinnerContainerVariants = cva(
  // 基础样式
  'inline-flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-2.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 使用 CVA 定义 Spinner 元素变体
const spinnerVariants = cva(
  // 基础样式
  'animate-spin rounded-full border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-3',
        lg: 'w-8 h-8 border-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<SpinnerProps>(), {
  type: 'default',
  size: 'md',
  strokeWidth: 3,
})

// 计算容器样式类名
const containerClasses = computed(() =>
  cn(
    spinnerContainerVariants({
      size: props.size,
    }),
    props.class
  )
)

// 计算颜色样式
const colorStyle = computed(() => {
  if (!props.color) return {}
  return {
    color: props.color,
  }
})

// 计算默认 Spinner 样式
const defaultSpinnerClasses = computed(() => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }
  const borderWidth = props.strokeWidth || 3
  return cn(
    'animate-spin rounded-full border-current border-t-transparent',
    sizeClasses[props.size],
    `border-[${borderWidth}px]`
  )
})

// 计算点动画延迟
const getDotDelay = (index: number) => {
  const baseDelays = {
    sm: '0ms',
    md: '0ms',
    lg: '0ms',
  }
  const delays = {
    0: '0ms',
    1: '-200ms',
    2: '-400ms',
  }
  return delays[index as keyof typeof delays] || '0ms'
}

// 计算条动画延迟
const getBarDelay = (index: number) => {
  const delays = {
    0: '0.2s',
    1: '0.3s',
    2: '0.4s',
    3: '0.5s',
    4: '0.6s',
  }
  return delays[index as keyof typeof delays] || '0.2s'
}
</script>

<template>
  <div
    :class="containerClasses"
    :style="colorStyle"
    role="status"
    :aria-label="label || '加载中'"
  >
    <!-- Default 类型: 旋转圆圈 -->
    <template v-if="type === 'default'">
      <svg
        :class="cn(
          'animate-spin',
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
        )"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        :style="{
          ...colorStyle,
          strokeWidth: `${strokeWidth}px`
        }"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          :stroke-width="strokeWidth"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </template>

    <!-- Dots 类型: 点动画 -->
    <template v-else-if="type === 'dots'">
      <div :class="cn('flex items-center', size === 'sm' ? 'gap-1' : size === 'md' ? 'gap-1.5' : 'gap-2')">
        <div
          v-for="i in 3"
          :key="i"
          :class="cn(
            'rounded-full bg-current animate-bounce',
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          )"
          :style="{
            ...colorStyle,
            animationDelay: getDotDelay(i - 1)
          }"
        />
      </div>
    </template>

    <!-- Bars 类型: 条形动画 -->
    <template v-else-if="type === 'bars'">
      <div :class="cn('flex items-center gap-1', size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : 'h-8')">
        <div
          v-for="i in 5"
          :key="i"
          :class="cn(
            'w-1 rounded-full bg-current animate-pulse',
            size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4'
          )"
          :style="{
            ...colorStyle,
            animationDelay: getBarDelay(i - 1)
          }"
        />
      </div>
    </template>

    <!-- Wave 类型: 波浪动画 -->
    <template v-else-if="type === 'wave'">
      <div :class="cn('flex items-end', size === 'sm' ? 'gap-0.5' : size === 'md' ? 'gap-1' : 'gap-1.5')">
        <div
          v-for="i in 4"
          :key="i"
          :class="cn(
            'rounded-full bg-current animate-[wave_1.2s_ease-in-out_infinite]',
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          )"
          :style="{
            ...colorStyle,
            animationDelay: `${i * 0.15}s`
          }"
        />
      </div>
    </template>

    <!-- 加载文字说明 -->
    <span
      v-if="label || $slots.default"
      :class="cn(
        'ml-2 text-current',
        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
      )"
    >
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<style scoped>
/* 波浪动画 */
@keyframes wave {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(2);
  }
}
</style>
