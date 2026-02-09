<script setup lang="ts">
/**
 * Tabs 组件
 *
 * 标签页容器组件，支持多种类型和位置的标签页
 */

import { provide, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TabsProps, TabsEmits, TabsContext, TabPaneInstance } from './types'

// 组件 Props
const props = withDefaults(defineProps<TabsProps>(), {
  modelValue: '',
  type: 'line',
  tabPosition: 'top',
  stretch: false,
  closable: false,
})

// 组件 Emits
const emit = defineEmits<TabsEmits>()

// 当前激活的标签名称
const currentName = ref<string | number>(props.modelValue || '')

// 标签面板列表
const panes = ref<TabPaneInstance[]>([])

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined && newVal !== currentName.value) {
      currentName.value = newVal
    }
  }
)

// 监听 currentName 变化
watch(currentName, (newVal) => {
  emit('update:modelValue', newVal)
  emit('tabChange', newVal)
})

// 使用 CVA 定义容器变体
const containerVariants = cva(
  'tabs-container',
  {
    variants: {
      position: {
        top: 'flex-col',
        right: 'flex-row',
        bottom: 'flex-col-reverse',
        left: 'flex-row-reverse',
      },
    },
    defaultVariants: {
      position: 'top',
    },
  }
)

// 使用 CVA 定义导航栏变体
const navVariants = cva(
  'flex',
  {
    variants: {
      position: {
        top: 'flex-row border-b',
        right: 'flex-col border-l',
        bottom: 'flex-row border-t',
        left: 'flex-col border-r',
      },
      type: {
        line: 'bg-transparent',
        card: 'bg-slate-100 dark:bg-slate-800 gap-2 p-2 rounded-lg',
        'border-card': 'bg-white dark:bg-slate-800',
      },
    },
    defaultVariants: {
      position: 'top',
      type: 'line',
    },
  }
)

// 计算容器类名
const containerClasses = computed(() => {
  return cn(
    'w-full flex',
    containerVariants({ position: props.tabPosition }),
    props.class
  )
})

// 计算导航栏类名
const navClasses = computed(() => {
  return cn(
    navVariants({ position: props.tabPosition, type: props.type }),
    props.type === 'line' && 'border-slate-200 dark:border-slate-700',
    props.type === 'border-card' && 'border border-slate-200 dark:border-slate-700 rounded-t-lg',
    props.stretch && props.tabPosition === 'top' && 'w-full',
    props.stretch && props.tabPosition === 'bottom' && 'w-full',
    props.stretch && props.tabPosition === 'left' && 'h-full',
    props.stretch && props.tabPosition === 'right' && 'h-full'
  )
})

// 计算内容区域类名
const contentClasses = computed(() => {
  return cn(
    'flex-1',
    props.type === 'border-card' && 'border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-lg p-4'
  )
})

// 添加标签面板
const addPane = (pane: TabPaneInstance) => {
  const index = panes.value.findIndex((p) => p.uid === pane.uid)
  if (index === -1) {
    panes.value.push(pane)
  }
}

// 移除标签面板
const removePane = (pane: TabPaneInstance) => {
  const index = panes.value.findIndex((p) => p.uid === pane.uid)
  if (index > -1) {
    panes.value.splice(index, 1)
  }
}

// 处理标签点击
const handleTabClick = (pane: TabPaneInstance, event: MouseEvent) => {
  if (pane.props.disabled) return

  emit('tabClick', pane, event)

  if (currentName.value !== pane.paneName) {
    currentName.value = pane.paneName
  }
}

// 处理标签移除
const handleTabRemove = (pane: TabPaneInstance, event: MouseEvent) => {
  event.stopPropagation()

  if (pane.props.disabled) return

  emit('tabRemove', pane.paneName, event)

  // 如果移除的是当前激活的标签，则激活前一个标签
  if (currentName.value === pane.paneName) {
    const index = panes.value.findIndex((p) => p.uid === pane.uid)
    if (index > 0) {
      currentName.value = panes.value[index - 1].paneName
    } else if (panes.value.length > 1) {
      currentName.value = panes.value[index + 1].paneName
    } else {
      currentName.value = ''
    }
  }
}

// 提供上下文给 TabPane
provide<TabsContext>('tabs', {
  props,
  currentName,
  panes,
  addPane,
  removePane,
  handleTabClick,
  handleTabRemove,
})

// 组件挂载时设置初始值
onMounted(() => {
  if (props.modelValue !== undefined) {
    currentName.value = props.modelValue
  } else if (panes.value.length > 0) {
    // 如果没有默认值，使用第一个标签
    currentName.value = panes.value[0].paneName
  }
})

// 组件卸载前清理
onBeforeUnmount(() => {
  panes.value = []
})
</script>

<template>
  <div :class="containerClasses">
    <!-- 导航栏 -->
    <div :class="navClasses" role="tablist">
      <slot></slot>
    </div>

    <!-- 内容区域 -->
    <div :class="contentClasses">
      <slot name="content"></slot>
    </div>
  </div>
</template>
