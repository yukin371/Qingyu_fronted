<script setup lang="ts">
/**
 * DropdownDivider 下拉菜单分割线组件
 *
 * 用于分隔菜单项的分割线
 */

import { computed } from 'vue'
import { cn } from '../../utils/cn'
import type { DropdownDividerProps } from './types'

// 组件 Props
interface DropdownDividerProps {
  /**
   * 自定义类名
   */
  class?: any
}

const props = defineProps<DropdownDividerProps>()

// 计算分割线类名
const dividerClasses = computed(() =>
  cn(
    'my-1 h-px bg-border',
    'list-none', // 确保不在列表中显示
    props.class
  )
)
</script>

<template>
  <li
    :class="dividerClasses"
    role="separator"
    aria-orientation="horizontal"
  />
</template>
