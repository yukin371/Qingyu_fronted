<template>
  <div
    ref="dragHandleRef"
    class="drag-handle"
    :class="[
      'drag-handle--' + position,
      isActive ? 'drag-handle--active' : ''
    ]"
    :style="handleStyle"
    :data-testid="`drag-handle-${position}`"
    role="separator"
    :aria-label="`Resize ${position} panel`"
    aria-orientation="vertical"
    tabindex="0"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @keydown="handleKeyDown"
  />
</template>

<script setup lang="ts">
/**
 * DragHandle 拖拽手柄组件
 * 
 * 用于编辑器面板的可拖拽分隔条
 * 
 * @features
 * - mousedown 触发 drag-start 事件
 * - hover 和拖拽状态视觉反馈
 * - 使用 VSCode 主题样式变量
 * - 4px 宽分隔条
 * - 无障碍支持
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============================================
// Props 定义
// ============================================

interface Props {
  /** 手柄位置 */
  position?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'left'
})

// ============================================
// Emits 定义
// ============================================

interface DragStartEvent {
  position: 'left' | 'right'
  startX: number
  startY: number
}

const emit = defineEmits<{
  'drag-start': [event: DragStartEvent]
}>()

// ============================================
// 响应式状态
// ============================================

const dragHandleRef = ref<HTMLElement | null>(null)
const isActive = ref(false)

// ============================================
// 计算属性
// ============================================

/**
 * 手柄样式
 */
const handleStyle = computed(() => {
  const baseStyle = {
    cursor: 'col-resize',
    transition: 'background-color 150ms ease-out, opacity 150ms ease-out',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const
  }

  // 激活状态样式
  if (isActive.value) {
    return {
      ...baseStyle,
      backgroundColor: 'var(--drag-handle-hover-bg, #007fd4)',
      opacity: '1'
    }
  }

  return baseStyle
})

// ============================================
// 事件处理
// ============================================

/**
 * 处理鼠标按下事件
 */
const handleMouseDown = (event: MouseEvent) => {
  // 只响应左键点击
  if (event.button !== 0) {
    return
  }

  // 阻止默认行为和事件冒泡
  event.preventDefault()
  event.stopPropagation()

  // 设置激活状态
  isActive.value = true

  // 触发 drag-start 事件
  const dragEvent: DragStartEvent = {
    position: props.position,
    startX: event.clientX,
    startY: event.clientY
  }

  emit('drag-start', dragEvent)

  // 添加全局鼠标事件监听器
  document.addEventListener('mousemove', handleMouseMove, { passive: false })
  document.addEventListener('mouseup', handleGlobalMouseUp, { once: true })
}

/**
 * 处理鼠标移动事件
 */
const handleMouseMove = (event: MouseEvent) => {
  if (!isActive.value) return
  
  // 阻止默认行为
  event.preventDefault()
}

/**
 * 处理全局鼠标松开事件
 */
const handleGlobalMouseUp = () => {
  if (!isActive.value) return

  // 移除激活状态
  isActive.value = false

  // 移除全局事件监听器
  document.removeEventListener('mousemove', handleMouseMove)
}

/**
 * 处理鼠标松开事件
 */
const handleMouseUp = () => {
  isActive.value = false
}

/**
 * 处理键盘事件（无障碍支持）
 */
const handleKeyDown = (event: KeyboardEvent) => {
  // 支持 Enter 和 Space 键触发拖拽
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    
    // 获取手柄的位置
    const rect = dragHandleRef.value?.getBoundingClientRect()
    if (rect) {
      const dragEvent: DragStartEvent = {
        position: props.position,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2
      }

      emit('drag-start', dragEvent)
      
      isActive.value = true
    }
  }
  
  // ESC 键取消拖拽
  if (event.key === 'Escape') {
    isActive.value = false
  }
}

// ============================================
// 生命周期
// ============================================

onMounted(() => {
  // 确保组件卸载时清理事件监听器
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleGlobalMouseUp)
  })
})
</script>

<style scoped>
/**
 * 拖拽手柄样式
 * 
 * 使用 VSCode 主题 CSS 变量
 * 参见: src/design-system/themes/vscode-dark.scss
 */

.drag-handle {
  /* 基础样式 */
  position: relative;
  flex-shrink: 0;
  height: 100%;
  
  /* VSCode 主题变量 */
  width: var(--drag-handle-width, 4px);
  background-color: var(--color-border, #3c3c3c);
  
  /* 交互样式 */
  cursor: col-resize;
  transition: background-color var(--transition-fast, 100ms) ease-out,
              opacity var(--transition-fast, 100ms) ease-out;
  
  /* 防止文本选择 */
  user-select: none;
  -webkit-user-select: none;
  
  /* 焦点样式（无障碍） */
  outline: none;
}

.drag-handle:hover {
  /* Hover 状态 */
  background-color: var(--drag-handle-hover-bg, #007fd4);
  opacity: 0.8;
}

.drag-handle--active {
  /* 激活/拖拽状态 */
  background-color: var(--drag-handle-hover-bg, #007fd4);
  opacity: 1;
}

.drag-handle:focus-visible {
  /* 焦点可见状态（键盘导航） */
  box-shadow: 0 0 0 2px var(--color-border-focus, #007fd4);
}

/* 不同位置的特殊样式 */
.drag-handle--left {
  order: 1;
}

.drag-handle--right {
  order: 3;
}

/* 过渡动画 */
.hover\:bg-\[var\(--drag-handle-hover-bg\)\] {
  transition: background-color var(--transition-fast, 100ms) ease-out;
}

.transition-colors {
  transition-property: background-color, border-color, color;
}

.duration-150 {
  transition-duration: 150ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}
</style>
