<script setup lang="ts">
/**
 * DropdownItem 下拉菜单项组件
 *
 * 单个菜单项，支持图标、禁用、分割线等特性
 */

import { computed, inject } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { DropdownItemProps, DropdownItemEmits, DropdownItemSlots, DropdownCommand } from './types'

// 定义注入的 key
const DROPDOWN_KEY = Symbol('dropdown')

// 使用 CVA 定义菜单项变体
const itemVariants = cva(
  // 基础样式
  'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
  {
    variants: {
      size: {
        small: 'text-xs py-1.5 px-2',
        medium: 'text-sm py-2 px-3',
        large: 'text-base py-2.5 px-4',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
        false: 'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground',
      },
    },
    defaultVariants: {
      size: 'medium',
      disabled: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<DropdownItemProps>(), {
  disabled: false,
  divided: false,
})

// 组件 Emits
const emit = defineEmits<DropdownItemEmits>()

// 组件 Slots
const slots = defineSlots<DropdownItemSlots>()

// 从父组件注入上下文
const dropdownContext = inject<{
  isVisible: import('vue').Ref<boolean>
  handleItemClick: (command: DropdownCommand) => void
  size: import('vue').Ref<'small' | 'medium' | 'large'>
} | null>(DROPDOWN_KEY, null)

// 计算菜单项类名
const itemClasses = computed(() =>
  cn(
    itemVariants({
      size: dropdownContext?.size.value || 'medium',
      disabled: props.disabled,
    }),
    {
      'mt-1 border-t border-border': props.divided,
    },
    props.class
  )
)

// 处理点击
const handleClick = (event: MouseEvent) => {
  if (props.disabled) return

  // 触发点击事件
  emit('click', event, props.command)

  // 调用父组件的处理方法
  if (dropdownContext) {
    dropdownContext.handleItemClick(props.command)
  }
}
</script>

<template>
  <li
    :class="itemClasses"
    role="menuitem"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 图标插槽或图标类名 -->
    <span v-if="icon || $slots.icon" :class="cn('mr-2 h-4 w-4', icon)">
      <slot name="icon" />
    </span>

    <!-- 默认插槽 - 菜单项内容 -->
    <span class="flex-1">
      <slot />
    </span>
  </li>
</template>
