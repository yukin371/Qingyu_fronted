<script setup lang="ts">
/**
 * DialogFooter 对话框底部组件
 *
 * 提供对话框底部按钮区域的布局
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'

interface DialogFooterProps {
  /**
   * 对齐方式
   * @default 'end'
   */
  justify?: 'start' | 'center' | 'end' | 'between'

  /**
   * 自定义类名
   */
  class?: any
}

const props = withDefaults(defineProps<DialogFooterProps>(), {
  justify: 'end',
})

// 计算对齐方式类名
const justifyClasses = computed(() => {
  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }
  return justifyMap[props.justify]
})

// 计算样式类名
const classes = computed(() =>
  cn(
    'flex items-center gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700',
    justifyClasses.value,
    props.class
  )
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
