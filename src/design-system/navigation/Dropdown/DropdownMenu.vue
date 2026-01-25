<script setup lang="ts">
/**
 * DropdownMenu 下拉菜单容器组件
 *
 * 用于包裹 DropdownItem 的容器组件
 */

import { provide, inject, type Ref, computed } from 'vue'
import { cn } from '../../utils/cn'
import type { DropdownSize } from './types'

// 定义注入的 key
const DROPDOWN_KEY = Symbol('dropdown')

// 组件 Props
interface DropdownMenuProps {
  /**
   * 自定义类名
   */
  class?: any
}

const props = defineProps<DropdownMenuProps>()

// 从父组件注入上下文
const dropdownContext = inject<{
  isVisible: Ref<boolean>
  handleItemClick: (command: any) => void
  size: Ref<DropdownSize>
} | null>(DROPDOWN_KEY, null)

// 计算菜单容器样式
const menuClasses = computed(() => {
  const sizeClasses: Record<DropdownSize, string> = {
    small: 'min-w-[120px]',
    medium: 'min-w-[160px]',
    large: 'min-w-[200px]',
  }

  return cn(
    'dropdown-menu',
    sizeClasses[dropdownContext?.size.value || 'medium'],
    props.class
  )
})

// 暴露上下文给子组件
provide(DROPDOWN_KEY, dropdownContext)
</script>

<template>
  <ul :class="menuClasses" role="menu">
    <slot />
  </ul>
</template>
