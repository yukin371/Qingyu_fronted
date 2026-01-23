<script setup lang="ts">
/**
 * Empty 组件
 *
 * 空状态展示组件，支持自定义图标、描述和尺寸
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import Icon from '../Icon/Icon.vue'
import type { EmptyProps } from './types'

// 组件 Props
const props = withDefaults(defineProps<EmptyProps>(), {
  description: '暂无数据',
  size: 'md',
})

// 组件 Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 尺寸样式映射
const sizeClasses: Record<string, { icon: string; title: string; description: string; container: string }> = {
  sm: { 
    icon: 'h-8 w-8', 
    title: 'text-sm font-medium', 
    description: 'text-xs',
    container: 'min-h-[120px] gap-3'
  },
  md: { 
    icon: 'h-12 w-12', 
    title: 'text-base font-medium', 
    description: 'text-sm',
    container: 'min-h-[200px] gap-4'
  },
  lg: { 
    icon: 'h-16 w-16', 
    title: 'text-lg font-medium', 
    description: 'text-base',
    container: 'min-h-[280px] gap-5'
  },
  xl: { 
    icon: 'h-20 w-20', 
    title: 'text-xl font-medium', 
    description: 'text-lg',
    container: 'min-h-[360px] gap-6'
  },
}

// 计算容器样式类名
const containerClasses = computed(() => {
  return cn(
    'flex flex-col items-center justify-center w-full',
    sizeClasses[props.size].container,
    props.class
  )
})

// 计算图标样式类名
const iconClasses = computed(() => {
  return cn(
    sizeClasses[props.size].icon,
    'text-slate-400'
  )
})

// 计算标题样式类名
const titleClasses = computed(() => {
  return cn(
    sizeClasses[props.size].title,
    'text-slate-700 dark:text-slate-300'
  )
})

// 计算描述样式类名
const descriptionClasses = computed(() => {
  return cn(
    sizeClasses[props.size].description,
    'text-slate-500 dark:text-slate-400 text-center max-w-md'
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
    role="status"
    aria-live="polite"
    @click="handleClick"
  >
    <!-- 图标 -->
    <Icon
      v-if="icon"
      :name="icon"
      :class="iconClasses"
    />
    
    <!-- 标题 -->
    <p v-if="title" :class="titleClasses">
      {{ title }}
    </p>
    
    <!-- 描述 -->
    <p :class="descriptionClasses">
      {{ description }}
    </p>
    
    <!-- Action 按钮插槽 -->
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
    
    <!-- 默认内容插槽 -->
    <slot />
  </div>
</template>
