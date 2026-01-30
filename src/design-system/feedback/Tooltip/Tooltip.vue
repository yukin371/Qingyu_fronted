<script setup lang="ts">
/**
 * Tooltip 组件
 *
 * 用于显示鼠标悬停时的提示信息
 */

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, useSlots } from 'vue'
 import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TooltipProps, TooltipPlacement, TooltipTrigger } from './types'

// 使用 CVA 定义 Tooltip 变体
const tooltipVariants = cva(
  // 基础样式
  'relative inline-flex',
  {
    variants: {},
  }
)

// 组件 Props
const props = withDefaults(defineProps<TooltipProps>(), {
  trigger: 'hover',
  placement: 'bottom',
  disabled: false,
  effect: 'dark',
  showArrow: true,
  offset: 12,
  transition: 'tooltip-fade',
  openDelay: 0,
  closeDelay: 200,
  destroyOnClose: false,
})

// 组件 Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  beforeShow: []
  afterShow: []
  beforeHide: []
  afterHide: []
}>()

// 插槽
const slots = useSlots()

// 状态
const visible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popperRef = ref<HTMLElement | null>(null)
const popperId = `qy-tooltip-${Math.random().toString(36).substring(2, 9)}`
let showTimer: number | null = null
let hideTimer: number | null = null

// 计算样式类名
const classes = computed(() =>
  cn(
    tooltipVariants(),
    props.class
  )
)

// 计算 Popper 位置样式
const popperStyle = computed(() => {
  if (!triggerRef.value || !popperRef.value) return {}

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popperRect = popperRef.value.getBoundingClientRect()
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  let top = 0
  let left: number | undefined = undefined
  let right: number | undefined = undefined
  const offset = props.offset

  switch (props.placement) {
    case 'top':
      top = triggerRect.top + scrollTop - popperRect.height - offset
      left = triggerRect.left + scrollLeft + (triggerRect.width - popperRect.width) / 2
      break
    case 'top-start':
      top = triggerRect.top + scrollTop - popperRect.height - offset
      left = triggerRect.left + scrollLeft
      break
    case 'top-end':
      top = triggerRect.top + scrollTop - popperRect.height - offset
      left = triggerRect.right + scrollLeft - popperRect.width
      break
    case 'bottom':
      top = triggerRect.bottom + scrollTop + offset
      left = triggerRect.left + scrollLeft + (triggerRect.width - popperRect.width) / 2
      break
    case 'bottom-start':
      top = triggerRect.bottom + scrollTop + offset
      left = triggerRect.left + scrollLeft
      break
    case 'bottom-end':
      top = triggerRect.bottom + scrollTop + offset
      left = triggerRect.right + scrollLeft - popperRect.width
      break
    case 'left':
      top = triggerRect.top + scrollTop + (triggerRect.height - popperRect.height) / 2
      // 使用 right 定位，让 tooltip 右边缘对齐到按钮左边缘左侧 offset 处
      right = document.body.clientWidth - triggerRect.left + offset
      break
    case 'left-start':
      top = triggerRect.top + scrollTop
      right = document.body.clientWidth - triggerRect.left + offset
      break
    case 'left-end':
      top = triggerRect.bottom + scrollTop - popperRect.height
      right = document.body.clientWidth - triggerRect.left + offset
      break
    case 'right':
      top = triggerRect.top + scrollTop + (triggerRect.height - popperRect.height) / 2
      left = triggerRect.right + scrollLeft + offset
      break
    case 'right-start':
      top = triggerRect.top + scrollTop
      left = triggerRect.right + scrollLeft + offset
      break
    case 'right-end':
      top = triggerRect.bottom + scrollTop - popperRect.height
      left = triggerRect.right + scrollLeft + offset
      break
  }

  return {
    top: `${top}px`,
    ...(left !== undefined && { left: `${left}px` }),
    ...(right !== undefined && { right: `${right}px` }),
  }
})

// 箭头样式
const arrowStyle = computed(() => {
  const size = 8
  const color = props.effect === 'dark' ? '#1f2937' : '#ffffff'

  let rotation = 0
  switch (props.placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      rotation = 180
      break
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      rotation = 0
      break
    case 'left':
    case 'left-start':
    case 'left-end':
      rotation = 90
      break
    case 'right':
    case 'right-start':
    case 'right-end':
      rotation = -90
      break
  }

  const placementMap: Record<TooltipPlacement, { top: string; left: string; transform: string }> = {
    'top': { top: '100%', left: '50%', transform: 'translate(-50%, 0)' },
    'top-start': { top: '100%', left: `${size}px`, transform: 'translate(0, 0)' },
    'top-end': { top: '100%', left: `calc(100% - ${size}px)`, transform: 'translate(0, 0)' },
    'bottom': { top: `-${size}px`, left: '50%', transform: 'translate(-50%, 0)' },
    'bottom-start': { top: `-${size}px`, left: `${size}px`, transform: 'translate(0, 0)' },
    'bottom-end': { top: `-${size}px`, left: `calc(100% - ${size}px)`, transform: 'translate(0, 0)' },
    'left': { top: '50%', left: '100%', transform: 'translate(0, -50%)' },
    'left-start': { top: `${size}px`, left: '100%', transform: 'translate(0, 0)' },
    'left-end': { top: `calc(100% - ${size}px)`, left: '100%', transform: 'translate(0, 0)' },
    'right': { top: '50%', left: `-${size}px`, transform: 'translate(0, -50%)' },
    'right-start': { top: `${size}px`, left: `-${size}px`, transform: 'translate(0, 0)' },
    'right-end': { top: `calc(100% - ${size}px)`, left: `-${size}px`, transform: 'translate(0, 0)' },
  }

  const pos = placementMap[props.placement]

  return {
    width: `${size}px`,
    height: `${size}px`,
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: color,
    borderLeftColor: color,
    transform: `rotate(${rotation}deg) ${pos.transform}`,
    ...pos,
  }
})

// 清除定时器
const clearTimers = () => {
  if (showTimer !== null) {
    clearTimeout(showTimer)
    showTimer = null
  }
  if (hideTimer !== null) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

// 显示 Tooltip
const show = async () => {
  if (props.disabled) return

  clearTimers()

  if (props.openDelay > 0) {
    showTimer = window.setTimeout(async () => {
      await doShow()
    }, props.openDelay)
  } else {
    await doShow()
  }
}

// 执行显示
const doShow = async () => {
  // 触发 beforeShow 回调
  if (props.onBeforeShow) {
    emit('beforeShow')
    const canShow = await props.onBeforeShow()
    if (canShow === false) return
  } else {
    emit('beforeShow')
  }

  visible.value = true

  await nextTick()

  // 触发 afterShow 回调
  if (props.onAfterShow) {
    props.onAfterShow()
  }
  emit('afterShow')
}

// 隐藏 Tooltip
const hide = async () => {
  if (props.trigger === 'manual') return

  clearTimers()

  if (props.closeDelay > 0) {
    hideTimer = window.setTimeout(async () => {
      await doHide()
    }, props.closeDelay)
  } else {
    await doHide()
  }
}

// 执行隐藏
const doHide = async () => {
  // 触发 beforeHide 回调
  if (props.onBeforeHide) {
    emit('beforeHide')
    const canHide = await props.onBeforeHide()
    if (canHide === false) return
  } else {
    emit('beforeHide')
  }

  visible.value = false

  // 触发 afterHide 回调
  if (props.onAfterHide) {
    props.onAfterHide()
  }
  emit('afterHide')
}

// 切换显示状态
const toggle = async () => {
  if (visible.value) {
    await hide()
  } else {
    await show()
  }
}

// 事件处理器
const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    show()
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    hide()
  }
}

const handleClick = () => {
  if (props.trigger === 'click') {
    toggle()
  }
}

const handleFocus = () => {
  if (props.trigger === 'focus') {
    show()
  }
}

const handleBlur = () => {
  if (props.trigger === 'focus') {
    hide()
  }
}

// 监听 modelValue 变化（manual 模式）
watch(
  () => props.modelValue,
  (val) => {
    if (props.trigger === 'manual') {
      if (val) {
        show()
      } else {
        hide()
      }
    }
  }
)

// 同步 visible 到 modelValue
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (
    props.trigger === 'click' &&
    visible.value &&
    triggerRef.value &&
    !triggerRef.value.contains(e.target as Node) &&
    popperRef.value &&
    !popperRef.value.contains(e.target as Node) &&
    !(e.target as Node)?.contains?.(triggerRef.value)
  ) {
    hide()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  clearTimers()
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法
defineExpose({
  show,
  hide,
  toggle,
})
</script>

<template>
  <div
    ref="triggerRef"
    :class="classes"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 触发元素 -->
    <slot />

    <!-- Tooltip Popper -->
    <Teleport to="body">
      <Transition :name="transition">
        <div
          v-if="visible || !destroyOnClose"
          v-show="visible"
          :id="popperId"
          ref="popperRef"
          role="tooltip"
          :class="cn(
            'qy-tooltip',
            'absolute z-50 max-w-xs px-3 py-2 text-sm rounded-lg shadow-lg',
            'pointer-events-none',
            effect === 'dark'
              ? 'bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100'
              : 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
            popperClass
          )"
          :style="popperStyle"
        >
          <!-- 内容 -->
          <div v-if="content || slots.content">
            <slot name="content">
              {{ content }}
            </slot>
          </div>

          <!-- 箭头 -->
          <span
            v-if="showArrow"
            :class="cn(
              'qy-tooltip__arrow',
              'absolute border-[6px] border-transparent'
            )"
            :style="arrowStyle"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Tooltip 过渡动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.tooltip-fade-enter-to,
.tooltip-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
