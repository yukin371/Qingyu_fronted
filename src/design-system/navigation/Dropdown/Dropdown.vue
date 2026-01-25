<script setup lang="ts">
/**
 * Dropdown 下拉菜单组件
 *
 * 通用的下拉菜单组件，支持多种触发方式和位置
 */

import { computed, ref, watch, nextTick, onMounted, onUnmounted, provide, type Ref } from 'vue'
import { cn } from '../../utils/cn'
import type { DropdownProps, DropdownEmits, DropdownSlots } from './types'

// 定义注入的 key
const DROPDOWN_KEY = Symbol('dropdown')

// 组件 Props
const props = withDefaults(defineProps<DropdownProps>(), {
  trigger: 'click',
  placement: 'bottom',
  disabled: false,
  hideOnClick: true,
  size: 'medium',
  maxWidth: 240,
  disableScroll: false,
  showTimeout: 150,
  hideTimeout: 150,
  offset: 8,
  showArrow: false,
})

// 组件 Emits
const emit = defineEmits<DropdownEmits>()

// 组件 Slots
const slots = defineSlots<DropdownSlots>()

// 状态管理
const isVisible = ref(false)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

// 计算触发器类名
const triggerClasses = computed(() =>
  cn(
    'inline-flex items-center',
    {
      'cursor-not-allowed opacity-50': props.disabled,
      'cursor-pointer': !props.disabled,
    },
    props.triggerClass
  )
)

// 计算下拉菜单位置样式
const dropdownStyle = computed(() => {
  const placementMap: Record<string, string> = {
    top: 'bottom: 100%; left: 50%; transform: translateX(-50%);',
    'top-start': 'bottom: 100%; left: 0;',
    'top-end': 'bottom: 100%; right: 0;',
    bottom: 'top: 100%; left: 50%; transform: translateX(-50%);',
    'bottom-start': 'top: 100%; left: 0;',
    'bottom-end': 'top: 100%; right: 0;',
    left: 'right: 100%; top: 50%; transform: translateY(-50%);',
    'left-start': 'right: 100%; top: 0;',
    'left-end': 'right: 100%; bottom: 0;',
    right: 'left: 100%; top: 50%; transform: translateY(-50%);',
    'right-start': 'left: 100%; top: 0;',
    'right-end': 'left: 100%; bottom: 0;',
  }

  const baseStyle = placementMap[props.placement] || placementMap.bottom

  return {
    ...getComputedStyle(baseStyle, props.offset),
    maxWidth: `${props.maxWidth}px`,
  }
})

// 获取计算样式
function getComputedStyle(placementStyle: string, offset: number) {
  const style: Record<string, string> = {}
  const styles = placementStyle.split(';').filter(s => s.trim())

  styles.forEach(s => {
    const [property, value] = s.split(':').map(p => p.trim())
    if (property && value) {
      // 添加偏移量
      if (property.includes('bottom') && value.includes('100%')) {
        style[property] = `calc(${value} + ${offset}px)`
      } else if (property.includes('top') && value.includes('100%')) {
        style[property] = `calc(${value} + ${offset}px)`
      } else if (property.includes('right') && value.includes('100%')) {
        style[property] = `calc(${value} + ${offset}px)`
      } else if (property.includes('left') && value.includes('100%')) {
        style[property] = `calc(${value} + ${offset}px)`
      } else {
        style[property] = value
      }
    }
  })

  return style
}

// 判断是否为数组触发器
const triggerArray = computed(() => {
  return Array.isArray(props.trigger) ? props.trigger : [props.trigger]
})

// 处理显示
const handleShow = () => {
  if (props.disabled) return

  // 清除隐藏定时器
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  // 使用显示定时器
  if (triggerArray.value.includes('hover')) {
    showTimer = setTimeout(() => {
      isVisible.value = true
      emit('visibleChange', true)

      if (props.disableScroll) {
        document.body.style.overflow = 'hidden'
      }

      // 添加点击外部监听
      nextTick(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('contextmenu', handleContextMenuOutside)
      })
    }, props.showTimeout)
  } else {
    isVisible.value = true
    emit('visibleChange', true)

    if (props.disableScroll) {
      document.body.style.overflow = 'hidden'
    }

    // 添加点击外部监听
    nextTick(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('contextmenu', handleContextMenuOutside)
    })
  }
}

// 处理隐藏
const handleHide = () => {
  // 清除显示定时器
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }

  // 使用隐藏定时器
  if (triggerArray.value.includes('hover')) {
    hideTimer = setTimeout(() => {
      isVisible.value = false
      emit('visibleChange', false)

      if (props.disableScroll) {
        document.body.style.overflow = ''
      }

      // 移除点击外部监听
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('contextmenu', handleContextMenuOutside)
    }, props.hideTimeout)
  } else {
    // 非 hover 模式不自动隐藏，需要点击外部或选择菜单项
    if (!triggerArray.value.includes('click')) {
      isVisible.value = false
      emit('visibleChange', false)

      if (props.disableScroll) {
        document.body.style.overflow = ''
      }

      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('contextmenu', handleContextMenuOutside)
    }
  }
}

// 处理触发器点击
const handleTriggerClick = (event: MouseEvent) => {
  if (props.disabled) return

  emit('click', event)

  if (triggerArray.value.includes('click')) {
    if (isVisible.value) {
      handleHide()
    } else {
      handleShow()
    }
  }
}

// 处理触发器悬停
const handleTriggerHover = () => {
  if (triggerArray.value.includes('hover')) {
    handleShow()
  }
}

const handleTriggerLeave = () => {
  if (triggerArray.value.includes('hover')) {
    handleHide()
  }
}

// 处理触发器焦点
const handleTriggerFocus = () => {
  if (triggerArray.value.includes('focus')) {
    handleShow()
  }
}

const handleTriggerBlur = () => {
  if (triggerArray.value.includes('focus')) {
    handleHide()
  }
}

// 处理右键菜单
const handleContextMenu = (event: MouseEvent) => {
  if (triggerArray.value.includes('contextmenu')) {
    event.preventDefault()
    handleShow()
  }
}

// 点击外部处理
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    handleHide()
  }
}

// 右键菜单外部处理
const handleContextMenuOutside = (event: MouseEvent) => {
  if (triggerArray.value.includes('contextmenu')) {
    const target = event.target as Node
    if (
      triggerRef.value &&
      !triggerRef.value.contains(target) &&
      dropdownRef.value &&
      !dropdownRef.value.contains(target)
    ) {
      handleHide()
    }
  }
}

// 处理菜单项点击
const handleItemClick = (command: any) => {
  emit('command', command)

  if (props.hideOnClick) {
    handleHide()
  }
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isVisible.value) {
    handleHide()
  } else if (event.key === 'Enter' || event.key === ' ') {
    if (triggerArray.value.includes('click') && !isVisible.value) {
      event.preventDefault()
      handleShow()
    }
  }
}

// 注入上下文供子组件使用
provide(DROPDOWN_KEY, {
  isVisible,
  handleItemClick,
  size: computed(() => props.size),
})

// 监听可见性变化
watch(isVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (dropdownRef.value) {
        // 确保下拉菜单在视口内
        adjustPosition()
      }
    })
  }
})

// 调整位置以确保在视口内
const adjustPosition = () => {
  if (!dropdownRef.value || !triggerRef.value) return

  const dropdownRect = dropdownRef.value.getBoundingClientRect()
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 简单的边界检查
  if (dropdownRect.right > viewportWidth) {
    const overflow = dropdownRect.right - viewportWidth
    dropdownRef.value.style.left = `${parseInt(dropdownRef.value.style.left || '0') - overflow}px`
  }

  if (dropdownRect.bottom > viewportHeight) {
    const overflow = dropdownRect.bottom - viewportHeight
    const currentTop = parseInt(dropdownRef.value.style.top || '0')
    dropdownRef.value.style.top = `${currentTop - overflow}px`
  }
}

// 清理定时器
onUnmounted(() => {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', handleContextMenuOutside)
  if (props.disableScroll) {
    document.body.style.overflow = ''
  }
})

// 暴露方法
defineExpose({
  show: handleShow,
  hide: handleHide,
  toggle: () => (isVisible.value ? handleHide() : handleShow()),
})
</script>

<template>
  <div
    ref="triggerRef"
    :class="triggerClasses"
    @click="handleTriggerClick"
    @mouseenter="handleTriggerHover"
    @mouseleave="handleTriggerLeave"
    @focus="handleTriggerFocus"
    @blur="handleTriggerBlur"
    @contextmenu="handleContextMenu"
    @keydown="handleKeydown"
    :tabindex="disabled ? -1 : 0"
    role="button"
    :aria-haspopup="true"
    :aria-expanded="isVisible"
    :aria-disabled="disabled"
  >
    <!-- 触发器插槽 -->
    <slot name="trigger" />

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isVisible"
          ref="dropdownRef"
          :class="cn(
            'absolute z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            'focus:outline-none',
            props.class
          )"
          :style="dropdownStyle"
          role="menu"
          :aria-orientation="'vertical'"
          tabindex="-1"
          @mouseenter="triggerArray.includes('hover') ? (showTimer && clearTimeout(showTimer)) : undefined"
          @mouseleave="triggerArray.includes('hover') ? handleHide : undefined"
        >
          <!-- 箭头 -->
          <div
            v-if="showArrow"
            :class="cn(
              'absolute z-[-1] h-2 w-2 rotate-45 border bg-popover',
              {
                '-bottom-1 left-1/2 -translate-x-1/2 border-b-0 border-r-0': placement === 'bottom' || placement === 'bottom-start' || placement === 'bottom-end',
                '-top-1 left-1/2 -translate-x-1/2 border-t-0 border-l-0': placement === 'top' || placement === 'top-start' || placement === 'top-end',
                '-right-1 top-1/2 -translate-y-1/2 border-r-0 border-t-0': placement === 'left' || placement === 'left-start' || placement === 'left-end',
                '-left-1 top-1/2 -translate-y-1/2 border-l-0 border-b-0': placement === 'right' || placement === 'right-start' || placement === 'right-end',
              }
            )"
          />

          <!-- 默认插槽 - 菜单内容 -->
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
:deep(.overflow-y-auto)::-webkit-scrollbar {
  width: 6px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
