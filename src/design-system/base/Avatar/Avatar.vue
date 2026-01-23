<script setup lang="ts">
/**
 * Avatar 组件
 *
 * 用于用户头像展示，支持图片、fallback 文字和在线状态指示器
 */

import { computed, ref } from 'vue'
import { cn } from '../../utils/cn'
import type { AvatarProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  variant: 'circle',
  disableStatus: false,
})

// 组件 Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 图片加载状态
const imageLoaded = ref(true)
const imageError = ref(false)

// 处理图片加载错误
const handleImageError = () => {
  imageLoaded.value = false
  imageError.value = true
}

// 处理图片加载成功
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

// 计算是否显示 fallback
const showFallback = computed(() => {
  return !props.src || imageError.value
})

// 获取 fallback 文字（取首字母，最多两个字符）
const fallbackText = computed(() => {
  if (!props.alt) return '?'
  
  // 如果是中文字符，取第一个字
  const chineseRegex = /^[\u4e00-\u9fa5]/
  if (chineseRegex.test(props.alt)) {
    return props.alt.charAt(0).toUpperCase()
  }
  
  // 英文取首字母，最多两个
  const words = props.alt.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return props.alt.charAt(0).toUpperCase()
})

// 尺寸样式映射
const sizeClasses: Record<string, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl',
}

// 形状样式映射
const variantClasses: Record<string, string> = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-lg',
}

// 状态指示器颜色映射
const statusColorClasses: Record<string, string> = {
  online: 'bg-success-DEFAULT',
  offline: 'bg-neutral-400',
  away: 'bg-warning-DEFAULT',
  busy: 'bg-danger-DEFAULT',
}

// 状态指示器尺寸映射
const statusSizeClasses: Record<string, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
}

// 状态指示器位置映射
const statusPositionClasses: Record<string, string> = {
  xs: '-bottom-0 -right-0',
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-0.5 -right-0.5',
  lg: '-bottom-1 -right-1',
  xl: '-bottom-1 -right-1',
  '2xl': '-bottom-1.5 -right-1.5',
}

// 计算容器样式类名
const containerClasses = computed(() => {
  return cn(
    'relative inline-flex items-center justify-center overflow-hidden bg-neutral-100 font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
    sizeClasses[props.size],
    variantClasses[props.variant],
    props.class
  )
})

// 计算状态指示器样式类名
const statusClasses = computed(() => {
  if (props.disableStatus || !props.status) return ''
  
  return cn(
    'absolute rounded-full border-2 border-white dark:border-neutral-800',
    statusColorClasses[props.status],
    statusSizeClasses[props.size],
    statusPositionClasses[props.size]
  )
})

// 点击处理
const handleClick = (e: MouseEvent) => {
  emit('click', e)
}
</script>

<template>
  <div
    :class="containerClasses"
    role="img"
    :aria-label="alt"
    @click="handleClick"
  >
    <!-- 图片模式 -->
    <img
      v-if="src && !showFallback"
      :src="src"
      :alt="alt"
      :class="cn('h-full w-full object-cover', variantClasses[variant])"
      @error="handleImageError"
      @load="handleImageLoad"
    />

    <!-- Fallback 模式 -->
    <span v-else class="flex items-center justify-center">
      {{ fallbackText }}
    </span>

    <!-- 状态指示器 -->
    <span v-if="status && !disableStatus" :class="statusClasses" aria-hidden="true" />
  </div>
</template>
