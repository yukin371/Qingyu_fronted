<script setup lang="ts">
/**
 * Timeline 组件
 *
 * 时间线容器组件，支持左侧布局、右侧布局和交替居中布局
 */

import { computed, provide } from 'vue'
import { cn } from '../../utils/cn'
import type { TimelineProps } from './types'

const props = withDefaults(defineProps<TimelineProps>(), {
  placement: 'left',
})

// 向子组件注入布局方式
provide('timelinePlacement', props.placement)

// alternate 模式下内容区宽度占比（左 50% - 节点区域，右 50% - 节点区域）
const isAlternate = computed(() => props.placement === 'alternate')

const containerClasses = computed(() =>
  cn(
    'relative',
    isAlternate.value ? '' : '',
    props.class
  )
)

// 中心连接线 - 仅 alternate 模式下显示
const lineClasses = computed(() =>
  cn(
    'absolute top-0 bottom-0 w-px bg-gradient-to-b from-blue-400 via-purple-400 to-amber-400 dark:from-blue-500 dark:via-purple-500 dark:to-amber-500',
    isAlternate.value ? 'left-1/2 -translate-x-1/2' : 'left-10 top-0'
  )
)
</script>

<template>
  <div :class="containerClasses">
    <!-- 连接线 -->
    <div :class="lineClasses" aria-hidden="true" />

    <!-- 插槽内容 -->
    <slot />
  </div>
</template>
