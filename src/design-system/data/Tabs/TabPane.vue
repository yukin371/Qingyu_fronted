<script setup lang="ts">
/**
 * TabPane 组件
 *
 * 标签页面板组件，包含标签头和面板内容
 */

import { inject, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import Icon from '../../base/Icon/Icon.vue'
import type { TabPaneProps, TabsContext } from './types'

// 注入 Tabs 上下文
const tabs = inject<TabsContext>('tabs')

// 获取当前实例
const instance = getCurrentInstance()

// 组件 Props
const props = withDefaults(defineProps<TabPaneProps>(), {
  label: '',
  name: undefined,
  disabled: false,
  closable: undefined,
})

// 标签名称（如果没有提供 name，使用 uid）
const paneName = computed(() => {
  return props.name !== undefined ? props.name : instance?.uid || 0
})

// 是否激活
const isActive = computed(() => {
  return tabs?.currentName.value === paneName.value
})

// 是否可关闭（优先使用自身的 closable，其次使用 tabs 的 closable）
const isClosable = computed(() => {
  // 如果自身显式设置了 closable（不是 undefined），使用自身的值
  if (props.closable !== undefined) {
    return props.closable
  }
  // 否则继承父组件的 closable
  return tabs?.props.closable || false
})

// 使用 CVA 定义标签变体
const tabVariants = cva(
  'relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200',
  {
    variants: {
      type: {
        line: '',
        card: 'rounded-md flex-1',
        'border-card': '',
      },
      position: {
        top: 'border-b-2',
        right: 'border-l-2',
        bottom: 'border-t-2',
        left: 'border-r-2',
      },
      active: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: 'cursor-pointer',
      },
    },
    compoundVariants: [
      // Line 类型激活状态
      {
        type: 'line',
        active: true,
        class: 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400',
      },
      {
        type: 'line',
        active: false,
        class: 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600',
      },
      // Card 类型激活状态
      {
        type: 'card',
        active: true,
        class: 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm',
      },
      {
        type: 'card',
        active: false,
        class: 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200',
      },
      // Border-card 类型激活状态
      {
        type: 'border-card',
        active: true,
        class: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-slate-700',
      },
      {
        type: 'border-card',
        active: false,
        class: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750',
      },
      // 禁用状态
      {
        disabled: true,
        class: 'text-slate-400 dark:text-slate-500',
      },
    ],
    defaultVariants: {
      type: 'line',
      position: 'top',
      active: false,
      disabled: false,
    },
  }
)

// 计算标签容器类名
const tabClasses = computed(() => {
  return cn(
    tabVariants({
      type: tabs?.props.type,
      position: tabs?.props.tabPosition,
      active: isActive.value,
      disabled: props.disabled,
    }),
    tabs?.props.stretch && tabs?.props.tabPosition === 'top' && 'flex-1',
    tabs?.props.stretch && tabs?.props.tabPosition === 'bottom' && 'flex-1',
    props.class
  )
})

// 计算标签文本类名
const labelClasses = computed(() => {
  return cn('whitespace-nowrap')
})

// 计算关闭按钮类名
const closeClasses = computed(() => {
  return cn(
    'ml-1 flex items-center justify-center rounded-sm transition-colors',
    'hover:bg-slate-200 dark:hover:bg-slate-600',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    props.disabled && 'opacity-50 cursor-not-allowed'
  )
})

// 计算面板内容类名
const paneClasses = computed(() => {
  return cn(
    'tab-pane',
    !isActive.value && 'hidden',
    'p-4 text-slate-700 dark:text-slate-300'
  )
})

// 处理点击
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && tabs) {
    tabs.handleTabClick(
      {
        uid: instance?.uid || 0,
        props,
        paneName: paneName.value,
        active: isActive.value,
        isClosable: isClosable.value,
      },
      event
    )
  }
}

// 处理关闭
const handleClose = (event: MouseEvent) => {
  if (!props.disabled && tabs) {
    tabs.handleTabRemove(
      {
        uid: instance?.uid || 0,
        props,
        paneName: paneName.value,
        active: isActive.value,
        isClosable: isClosable.value,
      },
      event
    )
  }
}

// 创建 TabPane 实例
const paneInstance = {
  uid: instance?.uid || 0,
  props,
  paneName,
  active: isActive,
  isClosable,
}

// 组件挂载时注册到 Tabs
onMounted(() => {
  tabs?.addPane(paneInstance)
})

// 组件卸载时从 Tabs 移除
onBeforeUnmount(() => {
  tabs?.removePane(paneInstance)
})
</script>

<template>
  <!-- 标签头 -->
  <div
    :class="tabClasses"
    role="tab"
    :aria-selected="isActive"
    :aria-disabled="props.disabled"
    @click="handleClick"
  >
    <!-- 标签内容 -->
    <slot name="label">
      <span :class="labelClasses">{{ label }}</span>
    </slot>

    <!-- 关闭按钮 -->
    <button
      v-if="isClosable"
      type="button"
      :class="closeClasses"
      :aria-label="`Close ${label || 'tab'}`"
      :disabled="props.disabled"
      @click="handleClose"
    >
      <Icon name="x-mark" size="sm" />
    </button>
  </div>

  <!-- 面板内容 -->
  <div
    v-if="isActive"
    :class="paneClasses"
    role="tabpanel"
    :aria-labelledby="`tab-${paneName}`"
  >
    <slot></slot>
  </div>
</template>
