<script setup lang="ts">
/**
 * TimelineItem 组件
 *
 * 时间线中的单个节点，支持左侧/右侧/交替居中布局
 * 交替模式下：节点居中，内容在两侧，箭头指向中心
 */

import { computed, inject, onMounted, ref } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TimelineItemProps } from './types'

// 模块级别的计数器，用于在交替模式下自动分配顺序
let itemCounter = 0

const props = withDefaults(defineProps<TimelineItemProps>(), {
  type: 'primary',
  hollow: false,
  hideLine: false,
  pending: false,
  disabled: false,
  size: 'default',
})

const timelinePlacement = inject<string>('timelinePlacement', 'left')

// 获取当前item的索引
const itemIndex = ref(-1)
onMounted(() => {
  itemIndex.value = itemCounter++
})

// 判断是否为交替模式
const isAlternate = computed(() => timelinePlacement === 'alternate')

// 交替模式下，判断当前item是否在左侧（奇数索引=左侧，偶数索引=右侧）
const isAlternateLeft = computed(() => {
  if (!isAlternate.value || itemIndex.value < 0) return true
  return itemIndex.value % 2 === 0
})

// 节点颜色变体 - 支持 default 和 big 尺寸
const nodeVariants = cva(
  'relative z-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ring-4 ring-slate-50 dark:ring-slate-900 transition-all duration-200',
  {
    variants: {
      size: {
        default: 'w-5 h-5 ring-4',
        big: 'w-6 h-6 ring-6',
      },
      type: {
        primary: 'bg-blue-500 dark:bg-blue-400',
        success: 'bg-emerald-500 dark:bg-emerald-400',
        warning: 'bg-amber-500 dark:bg-amber-400',
        danger: 'bg-red-500 dark:bg-red-400',
        info: 'bg-slate-400 dark:bg-slate-500',
      },
      hollow: {
        true: 'bg-white dark:bg-slate-800',
        false: '',
      },
    },
    compoundVariants: [
      { size: 'default', type: 'primary', hollow: true, class: 'border-blue-500 dark:border-blue-400' },
      { size: 'default', type: 'success', hollow: true, class: 'border-emerald-500 dark:border-emerald-400' },
      { size: 'default', type: 'warning', hollow: true, class: 'border-amber-500 dark:border-amber-400' },
      { size: 'default', type: 'danger', hollow: true, class: 'border-red-500 dark:border-red-400' },
      { size: 'default', type: 'info', hollow: true, class: 'border-slate-400 dark:border-slate-500' },
      { size: 'big', type: 'primary', hollow: true, class: 'border-blue-500 dark:border-blue-400' },
      { size: 'big', type: 'success', hollow: true, class: 'border-emerald-500 dark:border-emerald-400' },
      { size: 'big', type: 'warning', hollow: true, class: 'border-amber-500 dark:border-amber-400' },
      { size: 'big', type: 'danger', hollow: true, class: 'border-red-500 dark:border-red-400' },
      { size: 'big', type: 'info', hollow: true, class: 'border-slate-400 dark:border-slate-500' },
    ],
    defaultVariants: {
      size: 'default',
      type: 'primary',
      hollow: false,
    },
  }
)

// 内容区颜色 - 小圆点
const dotVariants = cva('rounded-full', {
  variants: {
    size: {
      default: 'w-2 h-2',
      big: 'w-3 h-3',
    },
    type: {
      primary: 'bg-blue-600 dark:bg-blue-300',
      success: 'bg-emerald-600 dark:bg-emerald-300',
      warning: 'bg-amber-600 dark:bg-amber-300',
      danger: 'bg-red-600 dark:bg-red-300',
      info: 'bg-slate-500 dark:bg-slate-400',
    },
  },
  defaultVariants: {
    size: 'default',
    type: 'primary',
  },
})

// Pending 闪烁动画
const pendingVariants = cva('animate-pulse', {
  variants: {
    pending: {
      true: '',
      false: '',
    },
  },
})

// 计算节点样式
const nodeClasses = computed(() =>
  cn(
    nodeVariants({
      size: props.size,
      type: props.type,
      hollow: props.hollow,
    }),
    pendingVariants({ pending: props.pending }),
    props.class
  )
)

const dotClasses = computed(() =>
  cn(
    dotVariants({ size: props.size, type: props.type }),
    props.hollow ? 'opacity-0' : 'opacity-100'
  )
)

// 左侧模式
const isLeft = computed(() => timelinePlacement === 'left')

// ========== 交替模式布局 ==========
// 容器类 - 交替模式下使用相对定位
const alternateContainerClasses = computed(() => {
  if (!isAlternate.value) return ''
  return 'relative mb-12 last:mb-0'
})

// 节点容器 - 居中定位
const alternateNodeClasses = computed(() => {
  if (!isAlternate.value) return ''
  const sizeClass = props.size === 'big' ? 'w-6 h-6' : 'w-5 h-5'
  return cn(
    'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center',
    sizeClass
  )
})

// 内容区容器 - 宽度 45%，根据左右侧调整位置
const alternateContentClasses = computed(() => {
  if (!isAlternate.value) return ''
  return cn(
    'w-[45%] p-5 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-100 dark:border-slate-700',
    isAlternateLeft.value
      ? 'mr-auto text-left'
      : 'ml-auto text-right'
  )
})

// 箭头颜色
const arrowColorClassRight = computed(() => {
  const colorMap: Record<string, string> = {
    primary: 'border-r-blue-500 dark:border-r-blue-400',
    success: 'border-r-emerald-500 dark:border-r-emerald-400',
    warning: 'border-r-amber-500 dark:border-r-amber-400',
    danger: 'border-r-red-500 dark:border-r-red-400',
    info: 'border-r-slate-400 dark:border-r-slate-500',
  }
  return colorMap[props.type] || colorMap.primary
})

// 箭头类
const arrowClasses = computed(() => {
  if (!isAlternate.value) return ''
  if (isAlternateLeft.value) {
    // 内容在左侧，箭头在右侧边缘，指右
    return cn(
      'absolute top-7 -right-5 border-l-8 border-r-0 border-t-8 border-b-8 border-t-transparent border-b-transparent border-l-slate-300 dark:border-l-slate-600'
    )
  } else {
    // 内容在右侧，箭头在左侧边缘，指左
    return cn(
      'absolute top-7 -left-5 border-r-8 border-l-0 border-t-8 border-b-8 border-t-transparent border-b-transparent',
      arrowColorClassRight.value
    )
  }
})

// ========== 左侧/右侧模式布局 ==========
const basicContainerClasses = computed(() => {
  if (isAlternate.value) return ''
  return cn(
    'relative flex items-start gap-4 py-3',
    isLeft.value ? 'flex-row' : 'flex-row-reverse'
  )
})

const basicNodeClasses = computed(() => {
  if (isAlternate.value) return ''
  return cn(
    'flex-shrink-0 flex items-center',
    isLeft.value ? 'ml-[10px]' : 'mr-[10px]'
  )
})

const basicContentClasses = computed(() => {
  if (isAlternate.value) return ''
  return cn(
    'flex-1 min-w-0 pt-0.5',
    isLeft.value ? 'text-left' : 'text-right'
  )
})
</script>

<template>
  <!-- 交替模式 -->
  <div v-if="isAlternate" :class="alternateContainerClasses">
    <!-- 节点 - 居中定位 -->
    <div :class="alternateNodeClasses">
      <div :class="nodeClasses">
        <div v-if="!hollow" :class="dotClasses" />
        <slot name="icon" />
      </div>
    </div>

    <!-- 内容区 -->
    <div :class="alternateContentClasses">
      <!-- 箭头 -->
      <div :class="arrowClasses" />

      <!-- 时间戳 -->
      <div v-if="timestamp" class="text-xs text-slate-400 dark:text-slate-500 mb-1 font-mono">
        {{ timestamp }}
      </div>
      <!-- 标题 -->
      <div v-if="title" class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {{ title }}
      </div>
      <!-- 描述 -->
      <div v-if="description" class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {{ description }}
      </div>
      <!-- 默认插槽 -->
      <slot />
    </div>
  </div>

  <!-- 左侧/右侧模式 -->
  <div v-else :class="basicContainerClasses">
    <!-- 节点 -->
    <div :class="basicNodeClasses">
      <div :class="nodeClasses">
        <div v-if="!hollow" :class="dotClasses" />
        <slot name="icon" />
      </div>
    </div>

    <!-- 内容区 -->
    <div :class="basicContentClasses">
      <!-- 时间戳 -->
      <div v-if="timestamp" class="text-xs text-slate-400 dark:text-slate-500 mb-1 font-mono">
        {{ timestamp }}
      </div>
      <!-- 标题 -->
      <div v-if="title" class="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {{ title }}
      </div>
      <!-- 描述 -->
      <div v-if="description" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
        {{ description }}
      </div>
      <!-- 默认插槽 -->
      <slot />
    </div>

    <!-- Pending 指示器 -->
    <div
      v-if="pending"
      :class="['flex-shrink-0 flex items-center', isLeft ? 'order-3' : 'order-1']"
    >
      <div class="w-5 h-5 flex items-center justify-center">
        <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
</template>
